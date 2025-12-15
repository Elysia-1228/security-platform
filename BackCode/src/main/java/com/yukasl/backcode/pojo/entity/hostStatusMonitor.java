package com.yukasl.backcode.pojo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class hostStatusMonitor {
    private Integer id;
    private String hostId;
    private Double cpuUsage;
    private Double memoryUsage;
    private Integer networkConn;
    private Double diskUsage;    // 磁盘使用率
    private String diskInfo;     // 磁盘详细信息 (e.g., "100GB/500GB")
    private String fileStatus;   // 核心文件状态 (JSON)
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime monitorTime;
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
    
    // 新增：真实硬件信息字段
    private String cpuModel;        // CPU型号
    private Integer cpuCores;       // CPU核心数
    private Double cpuFreq;         // CPU主频(GHz)
    private String memoryInfo;      // 内存信息描述
    private Double memoryTotalGb;   // 内存总量(GB)
    private Double memoryUsedGb;    // 内存已用(GB)
    private Long diskTotalGb;       // 磁盘总量(GB)
    private Long diskUsedGb;        // 磁盘已用(GB)
    private Long diskFreeGb;        // 磁盘可用(GB)
    private String diskPartitions;  // 磁盘分区详情(JSON)
}