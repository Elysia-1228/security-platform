-- 添加新字段到 host_status_monitor 表
-- 用于存储真实的 CPU、内存、磁盘硬件信息

ALTER TABLE host_status_monitor
ADD COLUMN cpu_model VARCHAR(255) DEFAULT NULL COMMENT 'CPU型号',
ADD COLUMN cpu_cores INT DEFAULT NULL COMMENT 'CPU核心数',
ADD COLUMN cpu_freq DOUBLE DEFAULT NULL COMMENT 'CPU主频(GHz)',
ADD COLUMN memory_info VARCHAR(255) DEFAULT NULL COMMENT '内存信息',
ADD COLUMN memory_total_gb DOUBLE DEFAULT NULL COMMENT '内存总量(GB)',
ADD COLUMN memory_used_gb DOUBLE DEFAULT NULL COMMENT '内存已用(GB)',
ADD COLUMN disk_total_gb BIGINT DEFAULT NULL COMMENT '磁盘总量(GB)',
ADD COLUMN disk_used_gb BIGINT DEFAULT NULL COMMENT '磁盘已用(GB)',
ADD COLUMN disk_free_gb BIGINT DEFAULT NULL COMMENT '磁盘可用(GB)';

-- 执行此SQL后重启后端服务
