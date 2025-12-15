package com.yukasl.backcode.mapper;

import com.yukasl.backcode.pojo.DTO.HostMonitorDTO;
import com.yukasl.backcode.pojo.DTO.ProcessMonitorDTO;
import com.yukasl.backcode.pojo.entity.hostStatusMonitor;
import com.yukasl.backcode.pojo.entity.processMonitor;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface MonitorMapper {
    List<hostStatusMonitor> queryHostMonitor(HostMonitorDTO hostMonitorDTO);

    @Select("select * from host_status_monitor where host_id = #{hostId} order by monitor_time desc limit 1")
    hostStatusMonitor queryHostMonitorByHostId(String hostId);

    List<processMonitor> queryProcessMonitor(ProcessMonitorDTO hostMonitorDTO);

    void updateProcessMonitor(String id, ProcessMonitorDTO processMonitorDTO);

    @org.apache.ibatis.annotations.Insert("insert into host_status_monitor(host_id, cpu_usage, memory_usage, network_conn, disk_usage, disk_info, file_status, monitor_time, create_time, cpu_model, cpu_cores, cpu_freq, memory_info, memory_total_gb, memory_used_gb, disk_total_gb, disk_used_gb, disk_free_gb, disk_partitions) values(#{hostId}, #{cpuUsage}, #{memoryUsage}, #{networkConn}, #{diskUsage}, #{diskInfo}, #{fileStatus}, #{monitorTime}, #{createTime}, #{cpuModel}, #{cpuCores}, #{cpuFreq}, #{memoryInfo}, #{memoryTotalGb}, #{memoryUsedGb}, #{diskTotalGb}, #{diskUsedGb}, #{diskFreeGb}, #{diskPartitions})")
    void insertHostStatus(hostStatusMonitor status);
}