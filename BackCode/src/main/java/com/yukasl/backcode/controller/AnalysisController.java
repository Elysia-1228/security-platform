package com.yukasl.backcode.controller;

import com.yukasl.backcode.pojo.DTO.alertPageDTO;
import com.yukasl.backcode.pojo.DTO.pageTrafficDateDTO;
import com.yukasl.backcode.pojo.entity.potentialThreatAlert;
import com.yukasl.backcode.result.PageResult;
import com.yukasl.backcode.result.Result;
import com.yukasl.backcode.service.AnalysisService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yukasl.backcode.websocket.WebSocketServer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yukasl.backcode.service.CommandQueueService;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 威胁数据分析预测模块
 */
@RestController
@RequestMapping("/api/analysis")
@Slf4j
public class AnalysisController {
    @Autowired
    private AnalysisService analysisService;

    @Autowired
    private CommandQueueService commandQueueService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * 查询威胁流量统计数据
     */
    @GetMapping("/traffic")
    public Result<PageResult> pageTrafficDate(pageTrafficDateDTO pageTrafficDateDTO) {
        log.info("查询威胁流量统计数据,请求参数为 -> {}", pageTrafficDateDTO);
        PageResult pageResult = analysisService.pageTrafficDate(pageTrafficDateDTO);
        return Result.success(pageResult);

    }

    /**
     * 查询潜在威胁预警列表
     *
     * @param alertPageDTO
     * @return
     */
    @GetMapping("/alert")
    public Result<PageResult> queryAlertPage(alertPageDTO alertPageDTO) {
        log.info("查询潜在威胁预警列表,请求参数为 -> {}", alertPageDTO);
        PageResult pageResult = analysisService.queryAlert(alertPageDTO);
        return Result.success(pageResult);
    }

    /**
     * 查看潜在威胁预警详情
     *
     * @return
     */
    @GetMapping("/alert/{id}")
    public Result<potentialThreatAlert> queryAlertById(@PathVariable Integer id) {
        log.info("查看潜在威胁预警详情,请求参数Id为 -> {}", id);
        potentialThreatAlert threatAlert = analysisService.queryAlertById(id);
        return Result.success(threatAlert);
    }

    /**
     * 接收 IDS 实时告警 (新增)
     * 支持两种格式：
     * 1. 标准格式：threatId, threatLevel, impactScope, occurTime, createTime
     * 2. Python IDS 格式：engine, timestamp, attack_type, severity, message, confidence
     */
    @PostMapping("/alert")
    public Result<String> receiveAlert(@RequestBody Map<String, Object> rawAlert) {
        log.info("接收到 IDS 实时告警: {}", rawAlert);
        
        try {
            potentialThreatAlert alert = convertToAlert(rawAlert);
            analysisService.saveAlert(alert);

            // 推送 WebSocket 消息
            try {
                String json = objectMapper.writeValueAsString(alert);
                WebSocketServer.sendInfo(json);
            } catch (Exception e) {
                log.error("WebSocket 推送失败", e);
            }

            return Result.success("Alert received and processed");
        } catch (Exception e) {
            log.error("告警处理失败", e);
            return Result.error("Failed to process alert: " + e.getMessage());
        }
    }
    
    /**
     * 转换告警数据格式
     * 将 Python IDS 格式转换为数据库格式
     */
    private potentialThreatAlert convertToAlert(Map<String, Object> rawAlert) {
        potentialThreatAlert alert = new potentialThreatAlert();
        
        // 检测数据格式
        if (rawAlert.containsKey("threatId")) {
            // 标准格式 - 直接映射
            alert.setThreatId((String) rawAlert.get("threatId"));
            alert.setThreatLevel((Integer) rawAlert.get("threatLevel"));
            alert.setImpactScope((String) rawAlert.get("impactScope"));
            
            // 处理时间字段
            if (rawAlert.get("occurTime") instanceof String) {
                alert.setOccurTime(LocalDateTime.parse((String) rawAlert.get("occurTime"), 
                    java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            }
            if (rawAlert.get("createTime") instanceof String) {
                alert.setCreateTime(LocalDateTime.parse((String) rawAlert.get("createTime"), 
                    java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            }
        } else {
            // Python IDS 格式 - 需要转换
            // 生成威胁ID
            String timestamp = (String) rawAlert.getOrDefault("timestamp", LocalDateTime.now().toString());
            String attackType = (String) rawAlert.getOrDefault("attack_type", "Unknown");
            alert.setThreatId(java.util.UUID.randomUUID().toString());
            
            // 映射威胁等级 (severity -> threatLevel)
            Object severityObj = rawAlert.get("severity");
            int severity = severityObj instanceof Number ? ((Number) severityObj).intValue() : 3;
            alert.setThreatLevel(severity);
            
            // 构造影响范围 (从 session, src_ip, dst_ip 等字段)
            String session = (String) rawAlert.getOrDefault("session", "");
            String srcIp = (String) rawAlert.getOrDefault("src_ip", "");
            String dstIp = (String) rawAlert.getOrDefault("dst_ip", "");
            String message = (String) rawAlert.getOrDefault("message", "");
            
            String impactScope;
            if (session != null && !session.isEmpty()) {
                impactScope = session + " | " + attackType;
            } else if (srcIp != null && !srcIp.isEmpty() && dstIp != null && !dstIp.isEmpty()) {
                impactScope = srcIp + " -> " + dstIp + " | " + attackType;
            } else {
                impactScope = attackType + " | " + message;
            }
            alert.setImpactScope(impactScope);
            
            // 解析时间
            try {
                alert.setOccurTime(LocalDateTime.parse(timestamp, 
                    java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            } catch (Exception e) {
                alert.setOccurTime(LocalDateTime.now());
            }
            alert.setCreateTime(LocalDateTime.now());
            
            log.info("转换 Python IDS 告警: {} -> threatId={}, level={}, scope={}", 
                attackType, alert.getThreatId(), alert.getThreatLevel(), alert.getImpactScope());
        }
        
        return alert;
    }
    
    /**
     * Adv-SecGPT 智能体代理接口
     * 解决前端跨域问题，通过后端转发请求
     */
    @PostMapping("/ai-trace")
    public Result<Object> aiTrace(@RequestBody Map<String, Object> request) {
        log.info("收到 AI 威胁溯源请求: {}", request);
        
        try {
            String question = (String) request.get("question");
            Integer topK = request.get("top_k") != null ? ((Number) request.get("top_k")).intValue() : 3;
            
            log.info("准备调用 AI 智能体，question: {}, top_k: {}", question, topK);
            
            // 构建请求到智能体，设置超时时间
            org.springframework.http.client.SimpleClientHttpRequestFactory factory = 
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(5000); // 连接超时 5 秒
            factory.setReadTimeout(30000);   // 读取超时 30 秒
            
            org.springframework.web.client.RestTemplate restTemplate = 
                new org.springframework.web.client.RestTemplate(factory);
            
            // 设置请求头
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            
            // 构建请求体
            Map<String, Object> body = new java.util.HashMap<>();
            body.put("question", question);
            body.put("top_k", topK);
            
            org.springframework.http.HttpEntity<Map<String, Object>> entity = 
                new org.springframework.http.HttpEntity<>(body, headers);
            
            // 发送请求到智能体服务器
            String aiUrl = "http://10.138.50.151:8000/api/chat";
            log.info("正在调用 AI 智能体: {}", aiUrl);
            
            org.springframework.http.ResponseEntity<Map> response = restTemplate.postForEntity(
                aiUrl, entity, Map.class);
            
            log.info("AI 智能体响应状态: {}, 响应体: {}", response.getStatusCode(), response.getBody());
            return Result.success(response.getBody());
            
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.error("AI 智能体连接失败（网络或超时）", e);
            return Result.error("无法连接到 AI 智能体服务，请检查网络或服务状态: " + e.getMessage());
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("AI 智能体返回客户端错误: {}", e.getStatusCode(), e);
            return Result.error("AI 智能体请求错误: " + e.getMessage());
        } catch (Exception e) {
            log.error("AI 威胁溯源请求失败", e);
            return Result.error("AI 分析请求失败: " + e.getMessage());
        }
    }
}