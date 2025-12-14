#!/usr/bin/env python3
"""
HIDS Agent - 主机入侵检测系统代理
采集本机真实的 CPU、内存、磁盘、网络信息并上报给后端
"""

import os
import sys
import psutil
import requests
import socket
import time
import json
import platform
import subprocess
from datetime import datetime

# 配置
BACKEND_URL = "http://127.0.0.1:8081/api/host/monitor/report"
REPORT_INTERVAL = 3  # 上报间隔（秒）

def get_local_ip():
    """获取本机IP地址"""
    # 直接使用你的真实局域网IP
    return "192.168.31.254"

def get_cpu_model():
    """获取真实的CPU型号"""
    try:
        if platform.system() == "Windows":
            # Windows: 使用wmic命令获取CPU名称 (使用/value格式更容易解析)
            result = subprocess.run(
                ["wmic", "cpu", "get", "name", "/value"],
                capture_output=True, text=True, timeout=5
            )
            # 解析 Name=xxx 格式
            for line in result.stdout.split('\n'):
                if line.strip().startswith('Name='):
                    return line.strip().split('=', 1)[1]
        else:
            # Linux: 从/proc/cpuinfo读取
            with open('/proc/cpuinfo', 'r') as f:
                for line in f:
                    if 'model name' in line:
                        return line.split(':')[1].strip()
    except Exception as e:
        print(f"[WARN] 获取CPU型号失败: {e}")
    return "Unknown CPU"

def get_memory_info():
    """获取真实的内存信息"""
    try:
        mem = psutil.virtual_memory()
        total_gb = round(mem.total / (1024**3), 1)
        
        if platform.system() == "Windows":
            # Windows: 尝试获取内存速度 (使用/value格式)
            result = subprocess.run(
                ["wmic", "memorychip", "get", "speed", "/value"],
                capture_output=True, text=True, timeout=5
            )
            speed = "Unknown"
            for line in result.stdout.split('\n'):
                if line.strip().startswith('Speed='):
                    speed = line.strip().split('=', 1)[1]
                    break
            return f"DDR5 {total_gb}GB @ {speed}MHz"
        
        return f"{total_gb}GB RAM"
    except Exception as e:
        print(f"[WARN] 获取内存信息失败: {e}")
        return f"{round(psutil.virtual_memory().total / (1024**3), 1)}GB RAM"

def collect_system_info():
    """采集系统信息"""
    # CPU 使用率和型号
    cpu_usage = psutil.cpu_percent(interval=1)
    cpu_model = get_cpu_model()
    cpu_cores = psutil.cpu_count(logical=True)
    cpu_freq = psutil.cpu_freq()
    cpu_freq_ghz = round(cpu_freq.current / 1000, 2) if cpu_freq else 0
    
    # 内存使用率和信息
    memory = psutil.virtual_memory()
    memory_usage = memory.percent
    memory_info = get_memory_info()
    memory_total_gb = round(memory.total / (1024**3), 1)
    memory_used_gb = round(memory.used / (1024**3), 1)
    
    # 磁盘信息 - 收集每个分区的详细信息
    total_disk = 0
    used_disk = 0
    disk_partitions = []  # 存储每个分区的详细信息
    
    if platform.system() == "Windows":
        # 遍历所有磁盘分区
        for partition in psutil.disk_partitions():
            if 'cdrom' in partition.opts or partition.fstype == '':
                continue
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                total_disk += usage.total
                used_disk += usage.used
                
                # 收集分区详情
                partition_info = {
                    "name": partition.mountpoint.replace("\\", ""),  # C: D: E:
                    "total": round(usage.total / (1024**3), 1),      # GB
                    "used": round(usage.used / (1024**3), 1),        # GB
                    "free": round(usage.free / (1024**3), 1),        # GB
                    "percent": round(usage.percent, 1),              # 使用率%
                    "fstype": partition.fstype                       # NTFS等
                }
                disk_partitions.append(partition_info)
            except:
                continue
    else:
        disk = psutil.disk_usage('/')
        total_disk = disk.total
        used_disk = disk.used
        disk_partitions.append({
            "name": "/",
            "total": round(disk.total / (1024**3), 1),
            "used": round(disk.used / (1024**3), 1),
            "free": round(disk.free / (1024**3), 1),
            "percent": round(disk.percent, 1),
            "fstype": "ext4"
        })
    
    disk_usage = round((used_disk / total_disk) * 100, 1) if total_disk > 0 else 0
    disk_total_gb = total_disk // (1024**3)
    disk_used_gb = used_disk // (1024**3)
    disk_free_gb = (total_disk - used_disk) // (1024**3)
    disk_info = f"{disk_used_gb}GB / {disk_total_gb}GB"
    disk_partitions_json = json.dumps(disk_partitions, ensure_ascii=False)
    
    # 网络连接数
    try:
        network_conn = len(psutil.net_connections())
    except:
        network_conn = 0
    
    # 核心文件监控（示例）
    file_status = json.dumps([
        {"path": "C:\\Windows\\System32", "status": "normal"},
        {"path": "C:\\Windows\\System32\\drivers\\etc\\hosts", "status": "normal"}
    ])
    
    return {
        "hostId": get_local_ip(),
        "cpuUsage": round(cpu_usage, 1),
        "cpuModel": cpu_model,
        "cpuCores": cpu_cores,
        "cpuFreq": cpu_freq_ghz,
        "memoryUsage": round(memory_usage, 1),
        "memoryInfo": memory_info,
        "memoryTotalGb": memory_total_gb,
        "memoryUsedGb": memory_used_gb,
        "networkConn": network_conn,
        "diskUsage": round(disk_usage, 1),
        "diskInfo": disk_info,
        "diskTotalGb": disk_total_gb,
        "diskUsedGb": disk_used_gb,
        "diskFreeGb": disk_free_gb,
        "diskPartitions": disk_partitions_json,
        "fileStatus": file_status
    }

def report_to_backend(data):
    """上报数据到后端"""
    try:
        response = requests.post(BACKEND_URL, json=data, timeout=5)
        result = response.json()
        
        # 检查是否有下发的指令
        if result and result.get("data") and result["data"].get("commands"):
            commands = result["data"]["commands"]
            print(f"[INFO] 收到下发指令: {commands}")
            # 这里可以执行指令（如封禁IP等）
        
        return True
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] 网络错误: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] 上报失败: {e}")
        return False

def log_message(msg, level="INFO"):
    """记录日志到文件和控制台"""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_line = f"[{now}] [{level}] {msg}"
    print(log_line)
    
    # 同时写入日志文件
    try:
        log_dir = os.path.dirname(os.path.abspath(__file__))
        log_file = os.path.join(log_dir, "hids_agent.log")
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(log_line + "\n")
    except:
        pass

def main():
    host_ip = get_local_ip()
    print(f"""
╔══════════════════════════════════════════════════════╗
║           HIDS Agent - 主机监控代理                  ║
╠══════════════════════════════════════════════════════╣
║  本机IP: {host_ip:<43} ║
║  后端地址: {BACKEND_URL:<41} ║
║  上报间隔: {REPORT_INTERVAL}秒                                       ║
║  模式: 守护进程 (自动重启)                           ║
╚══════════════════════════════════════════════════════╝
    """)
    
    log_message("HIDS Agent 启动")
    log_message("开始采集并上报系统信息...")
    print("-" * 50)
    
    consecutive_failures = 0
    max_failures = 10  # 连续失败10次后等待更长时间
    
    while True:
        try:
            # 采集数据
            data = collect_system_info()
            
            # 显示采集的数据
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{now}] CPU: {data['cpuUsage']}% | 内存: {data['memoryUsage']}% | 磁盘: {data['diskUsage']}% | 连接数: {data['networkConn']}")
            
            # 上报到后端
            if report_to_backend(data):
                print("  └─ 上报成功 ✓")
                consecutive_failures = 0  # 重置失败计数
            else:
                consecutive_failures += 1
                print(f"  └─ 上报失败 ✗ (连续失败: {consecutive_failures}次)")
                
                if consecutive_failures >= max_failures:
                    log_message(f"连续失败{max_failures}次，等待30秒后重试...", "WARN")
                    time.sleep(30)
                    consecutive_failures = 0
            
            time.sleep(REPORT_INTERVAL)
            
        except KeyboardInterrupt:
            log_message("Agent 被用户手动停止")
            break
        except Exception as e:
            consecutive_failures += 1
            log_message(f"采集异常: {e} (连续失败: {consecutive_failures}次)", "ERROR")
            
            if consecutive_failures >= max_failures:
                log_message(f"连续异常{max_failures}次，等待60秒后重试...", "WARN")
                time.sleep(60)
                consecutive_failures = 0
            else:
                time.sleep(REPORT_INTERVAL)

def run_as_daemon():
    """守护进程模式 - 崩溃自动重启"""
    restart_count = 0
    while True:
        try:
            log_message(f"守护进程启动 (重启次数: {restart_count})")
            main()
        except KeyboardInterrupt:
            log_message("守护进程被用户终止")
            break
        except Exception as e:
            restart_count += 1
            log_message(f"主进程崩溃: {e}，5秒后自动重启...", "ERROR")
            time.sleep(5)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--daemon":
        run_as_daemon()
    else:
        # 默认以守护模式运行
        run_as_daemon()
