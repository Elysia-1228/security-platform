# v1.3.0 更新日志

> 更新日期: 2025-12-14  
> 版本类型: 功能更新 + UI升级 + 智能体集成

---

## 一、后端修改 (Backend)

### 1.1 异常处理器 (新增)
**文件**: `backend/src/main/java/com/yukasl/backcode/exception/GlobalExceptionHandler.java`

```java
// 新增全局异常处理器，统一处理API异常返回
@RestControllerAdvice
public class GlobalExceptionHandler {
    // 处理参数校验异常
    // 处理业务异常
    // 处理未知异常
}
```

### 1.2 监控Mapper修改
**文件**: `backend/src/main/java/com/yukasl/backcode/mapper/MonitorMapper.java`

- 修复字段映射问题

### 1.3 主机状态实体类 (修改)
**文件**: `backend/src/main/java/com/yukasl/backcode/pojo/entity/hostStatusMonitor.java`

- 新增字段支持HIDS真实硬件信息

### 1.4 AI智能报告相关接口

| 接口 | 方法 | 功能 | 状态 |
|------|------|------|------|
| `/api/report/generate` | POST | 调用LLM生成AI安全报告 | 已有 |
| `/api/report/history` | GET | 获取历史报告列表 | 已有 |
| `/api/report/history/{id}` | PUT | 重命名历史报告 | 已有 |
| `/api/report/history/{id}` | DELETE | 删除历史报告 | 已有 |
| `/api/analysis/ai-trace` | POST | AI威胁溯源分析 | 已有 |

---

## 二、数据库修改 (SQL)

### 2.1 主机状态监控表扩展
**文件**: `sql/alter_host_status_monitor.sql`

```sql
-- 新增HIDS真实硬件信息字段
ALTER TABLE host_status_monitor
ADD COLUMN cpu_model VARCHAR(255) COMMENT 'CPU型号',
ADD COLUMN cpu_cores INT COMMENT 'CPU核心数',
ADD COLUMN cpu_freq DOUBLE COMMENT 'CPU主频(GHz)',
ADD COLUMN memory_info VARCHAR(255) COMMENT '内存信息',
ADD COLUMN memory_total_gb DOUBLE COMMENT '内存总量(GB)',
ADD COLUMN memory_used_gb DOUBLE COMMENT '内存已用(GB)',
ADD COLUMN disk_total_gb BIGINT COMMENT '磁盘总量(GB)',
ADD COLUMN disk_used_gb BIGINT COMMENT '磁盘已用(GB)',
ADD COLUMN disk_free_gb BIGINT COMMENT '磁盘可用(GB)';
```

### 2.2 数据库表结构汇总 (net_safe-v2.sql)

| 表名 | 用途 | 相关功能 |
|------|------|----------|
| `sys_user` | 用户账户 | 登录认证 |
| `host_status_monitor` | 主机状态监控 | HIDS主机监控 |
| `network_threat_collection_api` | API采集配置 | 数据采集 |
| `network_threat_collection_host` | 主机采集配置 | 数据采集 |
| `network_threat_upload` | 威胁报告上传 | 报告管理 |
| `org_info` | 组织信息 | 多租户管理 |
| `potential_threat_alert` | 潜在威胁告警 | NIDS威胁检测 |
| `process_monitor` | 进程监控 | HIDS进程监控 |
| `report_share` | 报告共享记录 | 报告协作 |
| `threat_report_config` | 报告配置 | AI报告生成 |
| `tracing_result` | 溯源结果 | 攻击溯源 |

---

## 三、智能体功能 (AI Agent)

### 3.1 AI安全报告生成
**前端**: `FrontCode/src/pages/ReportGeneration.tsx`  
**后端**: 调用LLM API生成报告

**功能流程**:
1. 用户选择报告类型（日报/周报/专项）
2. 前端调用 `POST /api/report/generate`
3. 后端聚合最近威胁数据，调用LLM生成Markdown报告
4. 报告自动保存到历史记录
5. 支持预览、重命名、删除、导出PDF

### 3.2 AI威胁溯源
**前端**: `FrontCode/src/pages/ThreatTracing.tsx`  
**后端**: 调用 `POST /api/analysis/ai-trace`

**功能**:
- 输入威胁ID或IP地址
- AI分析攻击路径和关联威胁
- 返回溯源结果和处置建议

### 3.3 智能问答联想 (首页)
**前端**: `FrontCode/src/pages/Home.tsx`

**功能**:
- 快捷回答按钮（常见安全问题）
- 智能联想输入
- 实时对话交互

---

## 四、前端修改 (Frontend)

### 4.1 API连接器
**文件**: `FrontCode/src/services/connector.ts`

| 修改项 | 说明 |
|--------|------|
| `ThreatService.getHistory` | pageSize 100 → 1000，支持获取更多历史数据 |

### 4.2 页面组件修改

| 文件 | 修改内容 |
|------|----------|
| `ThreatAlerts.tsx` | 重命名为NIDS，新增多级导航（风险等级→攻击类型→详情），面包屑导航 |
| `HostMonitoring.tsx` | 新增NIDS威胁概览、用户登录监控、安全基线检查、主机安全告警、网络统计增强、进程监控重构 |
| `Sidebar.tsx` | 菜单名称: 实时威胁预警 → NIDS 网络入侵检测 |
| `Home.tsx` | 快捷入口名称更新 |
| `PageHeader.tsx` | 新增页面头部组件 |
| `HexLogo.tsx` | 新增六边形Logo组件 |
| `Login.tsx` | UI优化 |
| 其他页面 | 统一赛博朋克风格优化 |

### 4.3 样式修改
**文件**: `FrontCode/src/index.css`

- 新增扫描线动画 `@keyframes scan`
- 新增赛博朋克风格全局样式

---

## 五、Python IDS修改

### 5.1 实时检测脚本
**文件**: `PythonIDS/anomaly_based_ids/realtime_detection_fixed.py`

- 优化异常检测逻辑

### 5.2 HIDS代理 (新增)
**文件**: `hids_agent.py`

- 新增完整的HIDS代理脚本，支持主机监控数据采集

---

## 六、已使用的后端API接口汇总

以下是前端调用的后端接口（未修改接口定义，仅前端调用方式调整）：

| 接口 | 方法 | 用途 | 前端修改 |
|------|------|------|----------|
| `/api/analysis/alert` | GET | 获取威胁历史 | pageSize 100→1000 |
| `/api/host/monitor/realtime/{hostId}` | GET | 实时主机状态 | 无变化 |
| `/api/dashboard/summary` | GET | 仪表盘摘要 | 无变化 |
| `/api/collection/host` | GET | 主机列表 | 无变化 |

---

## 七、新增文件清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `FrontCode/src/assets/logo.png` | 资源 | 项目Logo |
| `FrontCode/src/components/HexLogo.tsx` | 组件 | 六边形Logo |
| `FrontCode/src/components/PageHeader.tsx` | 组件 | 页面头部 |
| `hids_agent.py` | 脚本 | HIDS代理主程序 |
| `start_hids_agent.bat` | 脚本 | HIDS启动脚本 |
| `stop_hids_agent.bat` | 脚本 | HIDS停止脚本 |
| `sql/alter_host_status_monitor.sql` | SQL | 数据库变更 |

---

## 八、删除文件清单

| 文件/文件夹 | 原因 |
|-------------|------|
| `BackCode/` | 旧版空白后端项目 |
| `package-lock.json` | 空的npm配置 |
| `start_project.sh` | Linux脚本(未使用) |
| `stop_project.sh` | Linux脚本(未使用) |
| `hybrid_attack_test.py` | 测试攻击脚本(未使用) |

---

## 九、部署注意事项

1. **数据库**: 需执行 `sql/alter_host_status_monitor.sql`
2. **前端**: 无需额外配置，直接 `npm run dev`
3. **HIDS代理**: 运行 `start_hids_agent.bat` 启动主机监控

---

*生成时间: 2025-12-14*
