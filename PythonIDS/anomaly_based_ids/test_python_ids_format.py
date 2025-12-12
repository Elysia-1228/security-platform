#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试 Python IDS 格式的告警推送
"""

import requests
import json
from datetime import datetime

# 配置
ALERT_API_URL = "http://127.0.0.1:8081/api/analysis/alert"

def test_python_ids_format():
    """测试 Python IDS 格式的告警"""
    
    # 构造 Python IDS 格式的告警数据
    test_alert = {
        "engine": "anomaly",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "attack_type": "DDoS",
        "confidence": 0.85,
        "severity": 5,
        "message": "High confidence DDoS attack detected",
        "real_score": 0.234,
        "session": "192.168.31.41:59000 -> 192.168.109.151:80",
        "src_ip": "192.168.31.41",
        "dst_ip": "192.168.109.151",
        "src_port": 59000,
        "dst_port": 80,
        "protocol": "UDP"
    }
    
    print("=" * 80)
    print("🧪 测试 Python IDS 格式告警推送")
    print("=" * 80)
    print(f"\n📡 目标 API: {ALERT_API_URL}")
    print(f"\n📦 Python IDS 格式数据:")
    print(json.dumps(test_alert, indent=2, ensure_ascii=False))
    
    try:
        # 发送 POST 请求
        print(f"\n🚀 正在发送请求...")
        response = requests.post(
            ALERT_API_URL,
            json=test_alert,
            timeout=5
        )
        
        # 检查响应
        print(f"\n✅ 响应状态码: {response.status_code}")
        print(f"📄 响应内容: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("code") == 1:
                print(f"\n🎉 测试成功！Python IDS 格式告警已成功推送并转换")
                print(f"   返回消息: {result.get('data', 'N/A')}")
                return True
            else:
                print(f"\n⚠️ 后端返回错误: {result.get('msg', 'Unknown error')}")
                return False
        else:
            print(f"\n❌ HTTP 错误: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError as e:
        print(f"\n❌ 连接失败: 无法连接到后端服务")
        print(f"   请确保后端服务运行在 http://127.0.0.1:8081")
        print(f"   错误详情: {e}")
        return False
        
    except requests.exceptions.Timeout:
        print(f"\n❌ 请求超时")
        return False
        
    except Exception as e:
        print(f"\n❌ 未知错误: {e}")
        return False
    
    finally:
        print("\n" + "=" * 80)

if __name__ == "__main__":
    success = test_python_ids_format()
    exit(0 if success else 1)
