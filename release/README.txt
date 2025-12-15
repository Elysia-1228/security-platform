========================================
  网络安全智能分析及溯源系统 - 发布包
========================================

目录结构：
├── backend/                    # 后端服务
│   ├── BackCode-0.0.1-SNAPSHOT.jar    # 主后端服务 (端口8080)
│   └── backend-0.0.1-SNAPSHOT.jar     # 区块链网关服务
├── frontend/                   # 前端静态文件
│   └── index.html             # 入口页面
├── python/                     # Python相关模块
│   ├── alert_gateway/         # 告警网关
│   ├── anomaly_based_ids/     # 异常检测IDS
│   ├── Snort/                 # Snort相关
│   └── RuleBasedIDS/          # 规则IDS
├── redis/                      # Redis服务
├── sql/                        # 数据库脚本
│   └── net_safe-v2.sql        # 数据库初始化脚本
├── start_all.bat              # 一键启动脚本
└── README.txt                 # 本文件

部署步骤：
1. 安装MySQL数据库，执行 sql/net_safe-v2.sql 初始化数据库
2. 安装JDK 17+
3. 安装Python 3.8+ (如需使用IDS功能)
4. 修改后端配置文件中的数据库连接信息
5. 运行 start_all.bat 启动服务
6. 部署frontend目录到Web服务器或直接用浏览器打开

Python依赖安装：
cd python
pip install -r requirements.txt

端口说明：
- 后端服务: 8080
- Redis: 6379
- MySQL: 3306

注意事项：
- 确保MySQL和Redis服务已正确配置
- 前端需要部署到Web服务器以支持路由
- Python IDS模块需要单独启动
