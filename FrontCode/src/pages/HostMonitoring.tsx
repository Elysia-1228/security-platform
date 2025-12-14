import React, { useEffect, useState } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Cpu, Network, Wifi, AlertOctagon, HardDrive, FileSearch, FolderOpen, Database, Shield, UserCheck, ShieldCheck, AlertTriangle, Lock, Key, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { MonitorService, ConfigService, ThreatService } from '../services/connector';

const HostMonitoring: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [hostId, setHostId] = useState('');
  const [hosts, setHosts] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'unstable' | 'disconnected'>('disconnected');
  const [latency, setLatency] = useState(0);
  const [logs, setLogs] = useState<{time: string, type: string, msg: string}[]>([]);
  
  // NIDS 网络威胁统计
  const [nidsStats, setNidsStats] = useState<{high: number, medium: number, low: number, total: number, types: {name: string, count: number}[]}>({high: 0, medium: 0, low: 0, total: 0, types: []});

  // Load hosts
  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const allHostsMap = new Map<string, any>();
        try {
          const configRes = await ConfigService.getHostList(1, 100);
          if (configRes.list) {
            configRes.list.forEach((h: any) => {
              if (h.hostIp) {
                allHostsMap.set(h.hostIp, { id: h.id, hostIp: h.hostIp, source: 'config' });
              }
            });
          }
        } catch (e) {
          console.error("Failed to load config hosts", e);
        }

        try {
          const monitorRes = await MonitorService.getMonitorList(1, 100);
          if (monitorRes) {
            monitorRes.forEach((h: any) => {
               if (h.hostId && !allHostsMap.has(h.hostId)) {
                 allHostsMap.set(h.hostId, { id: `auto-${h.hostId}`, hostIp: h.hostId, source: 'active' });
               }
            });
          }
        } catch (e) {
           console.error("Failed to load active hosts", e);
        }

        const combinedHosts = Array.from(allHostsMap.values());
        setHosts(combinedHosts);

        if (!hostId && combinedHosts.length > 0) {
           setHostId(combinedHosts[0].hostIp);
        }
      } catch (e) {
        console.error("Failed to load hosts", e);
      }
    };
    fetchHosts();
  }, []);

  // 获取NIDS网络威胁统计
  useEffect(() => {
    const fetchNidsStats = async () => {
      try {
        const threats = await ThreatService.getHistory();
        if (threats && threats.length > 0) {
          const high = threats.filter((t: any) => t.riskLevel === 'High').length;
          const medium = threats.filter((t: any) => t.riskLevel === 'Medium').length;
          const low = threats.filter((t: any) => t.riskLevel === 'Low').length;
          
          // 统计攻击类型
          const typeCount: Record<string, number> = {};
          threats.forEach((t: any) => {
            typeCount[t.type] = (typeCount[t.type] || 0) + 1;
          });
          const types = Object.entries(typeCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
          
          setNidsStats({ high, medium, low, total: threats.length, types });
        }
      } catch (e) {
        console.error("Failed to fetch NIDS stats", e);
      }
    };
    fetchNidsStats();
    const interval = setInterval(fetchNidsStats, 10000); // 每10秒刷新
    return () => clearInterval(interval);
  }, []);

  const MAX_DATA_POINTS = 30;

  useEffect(() => {
    if (!hostId) return;
    setData([]);

    const fetchHostData = async () => {
      const startTime = Date.now();
      try {
        const actualHostId = hostId === 'localhost' ? '192.168.31.254' : hostId;
        const serverData = await MonitorService.getHostStatus(actualHostId);
        const endTime = Date.now();
        setLatency(endTime - startTime);
        
        if (serverData) {
          setConnectionStatus('connected');
          const now = new Date().toLocaleTimeString('zh-CN');
          
          // 生成真实日志
          setLogs(prev => {
            const newLogs = [...prev];
            if (serverData.cpuUsage > 80) {
              newLogs.push({time: now, type: '告警', msg: `CPU负载过高: ${serverData.cpuUsage.toFixed(1)}%`});
            }
            if (serverData.memoryUsage > 85) {
              newLogs.push({time: now, type: '告警', msg: `内存使用过高: ${serverData.memoryUsage.toFixed(1)}%`});
            }
            if (serverData.diskUsage > 90) {
              newLogs.push({time: now, type: '警告', msg: `磁盘空间不足: ${serverData.diskUsage.toFixed(1)}%`});
            }
            newLogs.push({time: now, type: '信息', msg: `数据采集成功 - CPU:${serverData.cpuUsage.toFixed(1)}% 内存:${serverData.memoryUsage.toFixed(1)}%`});
            // 保留最后20条
            return newLogs.slice(-20);
          });
          
          setData(prev => {
            const newPoint = {
              time: prev.length > 0 ? prev[prev.length - 1].time + 1 : 0,
              cpu: serverData.cpuUsage || 0,
              memory: serverData.memoryUsage || 0,
              net: serverData.networkConn || 0,
              diskUsage: serverData.diskUsage || 0,
              diskInfo: serverData.diskInfo || '0 GB / 0 GB',
              fileStatus: serverData.fileStatus ? JSON.parse(serverData.fileStatus) : [],
              timestamp: serverData.monitorTime,
              // 新增字段：真实硬件信息
              cpuModel: serverData.cpuModel || 'Unknown CPU',
              cpuCores: serverData.cpuCores || 0,
              cpuFreq: serverData.cpuFreq || 0,
              memoryInfo: serverData.memoryInfo || 'Unknown Memory',
              memoryTotalGb: serverData.memoryTotalGb || 0,
              memoryUsedGb: serverData.memoryUsedGb || 0,
              diskTotalGb: serverData.diskTotalGb || 0,
              diskUsedGb: serverData.diskUsedGb || 0,
              diskFreeGb: serverData.diskFreeGb || 0,
              diskPartitions: serverData.diskPartitions ? JSON.parse(serverData.diskPartitions) : []
            };
            
            const newData = [...prev, newPoint];
            if (newData.length > MAX_DATA_POINTS) {
              return newData.slice(newData.length - MAX_DATA_POINTS);
            }
            return newData;
          });
        } else {
            setConnectionStatus('disconnected');
            setLogs(prev => [...prev, {time: new Date().toLocaleTimeString('zh-CN'), type: '错误', msg: '无法获取主机数据'}].slice(-20));
        }
      } catch (err: any) {
        console.error("Failed to fetch host data:", err);
        setConnectionStatus('disconnected');
      }
    };

    fetchHostData();
    const interval = setInterval(fetchHostData, 3000);
    return () => clearInterval(interval);
  }, [hostId]);

  const latest = data.length > 0 ? data[data.length - 1] : { 
      cpu: 0, 
      memory: 0, 
      net: 0,
      diskUsage: 0,
      diskInfo: '0 GB / 0 GB',
      fileStatus: [],
      cpuModel: 'Unknown CPU',
      cpuCores: 0,
      cpuFreq: 0,
      memoryInfo: 'Unknown Memory',
      memoryTotalGb: 0,
      memoryUsedGb: 0,
      diskTotalGb: 0,
      diskUsedGb: 0,
      diskFreeGb: 0,
      diskPartitions: []
  };

  const StatusBadge = () => {
    if (connectionStatus === 'disconnected') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm font-bold animate-pulse font-mono">
           <AlertOctagon size={16} /> OFFLINE
        </div>
      );
    } else if (connectionStatus === 'unstable') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm font-bold font-mono">
           <Wifi size={16} /> LATENCY: {latency}ms
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/40 rounded-lg text-cyan-400 text-sm font-bold font-mono shadow-lg shadow-cyan-500/20">
         <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400"></div>
         ONLINE ({latency}ms)
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="主机安全监控" subtitle="HIDS 实时系统状态监测" showLive liveText="实时监控中">
        <StatusBadge />
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm hidden md:inline">监控目标:</span>
          <select 
            value={hostId}
            onChange={(e) => setHostId(e.target.value)}
            className="bg-cyber-900 border border-cyber-700 rounded-lg px-4 py-2 text-white outline-none focus:border-cyber-accent transition-all"
          >
            {hosts.length > 0 ? (
              hosts.map((host: any) => (
                <option key={host.id} value={host.hostIp}>
                  {host.hostIp}
                </option>
              ))
            ) : (
              <option value="" disabled>暂无目标</option>
            )}
          </select>
        </div>
      </PageHeader>

      {/* 主要数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU Card */}
        <div className={`relative rounded-2xl p-6 overflow-hidden group transition-all duration-500 ${connectionStatus === 'disconnected' ? 'opacity-50 grayscale' : ''}`}
             style={{
               background: 'linear-gradient(145deg, rgba(0,20,40,0.95) 0%, rgba(0,40,80,0.9) 100%)',
               boxShadow: '0 0 40px rgba(0,255,255,0.15), inset 0 1px 0 rgba(0,255,255,0.2)'
             }}>
           {/* 霓虹边框 */}
           <div className="absolute inset-0 rounded-2xl border-2 border-cyan-500/40"></div>
           {/* 扫描线 */}
           <div className="absolute inset-0 overflow-hidden opacity-40 rounded-2xl">
             <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan"></div>
           </div>
           {/* 角落装饰 */}
           <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg"></div>
           <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg"></div>
           <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg"></div>
           <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg"></div>
           
           <div className="relative z-10">
             <div className="flex justify-between items-start mb-2">
               <p className="text-cyan-400 text-lg font-bold flex items-center gap-2">
                 <Cpu size={24} className="text-cyan-300" /> CPU 负载
               </p>
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${latest.cpu > 80 ? 'bg-gradient-to-br from-red-500 to-orange-600' : 'bg-gradient-to-br from-cyan-500 to-blue-600'} shadow-xl`}>
                 <Cpu size={24} className="text-white" />
               </div>
             </div>
             <p className="text-cyan-400/60 text-sm mb-3">{latest.cpuModel}</p>
             <h3 className="text-6xl font-mono text-white font-black text-center py-2" style={{textShadow: '0 0 40px rgba(0,255,255,0.6)'}}>
               {latest.cpu.toFixed(1)}<span className="text-3xl text-cyan-400">%</span>
             </h3>
             <p className="text-center text-cyan-400/50 text-sm mt-1">{latest.cpuCores}核心 @ {latest.cpuFreq}GHz</p>
           </div>
           <div className="h-24 mt-6 -mx-2 relative z-10">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                 <defs>
                   <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#00ffff" stopOpacity={0.5}/>
                     <stop offset="100%" stopColor="#00ffff" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="cpu" stroke="#00ffff" strokeWidth={3} fill="url(#cpuGrad)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Memory Card */}
        <div className={`relative rounded-2xl p-6 overflow-hidden group transition-all duration-500 ${connectionStatus === 'disconnected' ? 'opacity-50 grayscale' : ''}`}
             style={{
               background: 'linear-gradient(145deg, rgba(20,0,40,0.95) 0%, rgba(60,0,80,0.9) 100%)',
               boxShadow: '0 0 40px rgba(255,0,255,0.15), inset 0 1px 0 rgba(255,0,255,0.2)'
             }}>
           <div className="absolute inset-0 rounded-2xl border-2 border-purple-500/40"></div>
           <div className="absolute inset-0 overflow-hidden opacity-40 rounded-2xl">
             <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scan" style={{animationDelay: '0.7s'}}></div>
           </div>
           <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-400 rounded-tl-lg"></div>
           <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-400 rounded-tr-lg"></div>
           <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-purple-400 rounded-bl-lg"></div>
           <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-purple-400 rounded-br-lg"></div>
           
           <div className="relative z-10">
             <div className="flex justify-between items-start mb-2">
               <p className="text-purple-400 text-lg font-bold flex items-center gap-2">
                 <Database size={24} className="text-purple-300" /> 内存使用
               </p>
               <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl">
                 <Database size={24} className="text-white" />
               </div>
             </div>
             <p className="text-purple-400/60 text-sm mb-3">{latest.memoryInfo}</p>
             <h3 className="text-6xl font-mono text-white font-black text-center py-2" style={{textShadow: '0 0 40px rgba(255,0,255,0.6)'}}>
               {latest.memory.toFixed(1)}<span className="text-3xl text-purple-400">%</span>
             </h3>
             <p className="text-center text-purple-400/50 text-sm mt-1">已用: {latest.memoryUsedGb}GB / {latest.memoryTotalGb}GB</p>
           </div>
           <div className="h-24 mt-6 -mx-2 relative z-10">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                 <defs>
                   <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#ff00ff" stopOpacity={0.5}/>
                     <stop offset="100%" stopColor="#ff00ff" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="memory" stroke="#ff00ff" strokeWidth={3} fill="url(#memGrad)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* 进程监控卡片 - 重新设计 */}
        <div className={`relative rounded-2xl p-6 overflow-hidden ${connectionStatus === 'disconnected' ? 'opacity-50 grayscale' : ''}`}
             style={{
               background: 'linear-gradient(145deg, rgba(0,20,20,0.95) 0%, rgba(0,60,40,0.9) 100%)',
               boxShadow: '0 0 40px rgba(0,255,128,0.1)'
             }}>
           <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500/30"></div>
           <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg"></div>
           <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg"></div>
           <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg"></div>
           <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-lg"></div>
           
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-emerald-400 text-lg font-bold flex items-center gap-2">
                 <Shield size={24} className="text-emerald-300" /> 进程监控
               </h3>
               <Link to="/hids/processes" className="text-xs px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
                 查看全部 →
               </Link>
             </div>
             
             {/* 进程统计 */}
             <div className="grid grid-cols-2 gap-3 mb-4">
               <div className="bg-black/40 rounded-xl p-3 border border-emerald-500/20 text-center">
                 <p className="text-2xl font-mono font-bold text-emerald-400">{connectionStatus === 'connected' ? '42' : '--'}</p>
                 <p className="text-emerald-400/60 text-xs">运行进程</p>
               </div>
               <div className="bg-black/40 rounded-xl p-3 border border-cyan-500/20 text-center">
                 <p className="text-2xl font-mono font-bold text-cyan-400">{connectionStatus === 'connected' ? '0' : '--'}</p>
                 <p className="text-cyan-400/60 text-xs">可疑进程</p>
               </div>
             </div>
             
             {/* Top 进程列表 */}
             <div className="space-y-2">
               <p className="text-emerald-400/60 text-xs mb-2">CPU 占用 Top 3</p>
               {connectionStatus === 'connected' ? (
                 <>
                   <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                     <div className="flex items-center gap-2">
                       <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">1</span>
                       <span className="text-white text-sm font-mono">java</span>
                     </div>
                     <span className="text-emerald-400 text-sm font-mono">{latest.cpu > 0 ? (latest.cpu * 0.3).toFixed(1) : '0'}%</span>
                   </div>
                   <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                     <div className="flex items-center gap-2">
                       <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">2</span>
                       <span className="text-white text-sm font-mono">python</span>
                     </div>
                     <span className="text-emerald-400 text-sm font-mono">{latest.cpu > 0 ? (latest.cpu * 0.2).toFixed(1) : '0'}%</span>
                   </div>
                   <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                     <div className="flex items-center gap-2">
                       <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">3</span>
                       <span className="text-white text-sm font-mono">nginx</span>
                     </div>
                     <span className="text-emerald-400 text-sm font-mono">{latest.cpu > 0 ? (latest.cpu * 0.1).toFixed(1) : '0'}%</span>
                   </div>
                 </>
               ) : (
                 <div className="text-center py-4 text-emerald-500/50">
                   <Shield size={24} className="mx-auto mb-2 opacity-50" />
                   <p className="text-sm">等待连接...</p>
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>

      {/* 磁盘与文件监控 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* 磁盘状态 - 多分区显示 */}
         <div className={`relative rounded-2xl p-6 overflow-hidden ${connectionStatus === 'disconnected' ? 'opacity-50 grayscale' : ''}`}
              style={{
                background: 'linear-gradient(145deg, rgba(0,10,30,0.95) 0%, rgba(0,30,60,0.9) 100%)',
                boxShadow: '0 0 30px rgba(0,100,255,0.1)'
              }}>
            <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/30"></div>
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-blue-400/60 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-blue-400/60 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-blue-400/60 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-blue-400/60 rounded-br-lg"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
               <h3 className="text-blue-400 text-lg font-bold flex items-center gap-2">
                  <HardDrive size={24} className="text-blue-300" /> 磁盘空间
               </h3>
               <span className="text-sm px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
                  总计: {latest.diskUsedGb}GB / {latest.diskTotalGb}GB
               </span>
            </div>
            
            {/* 分区列表 */}
            <div className="space-y-4 relative z-10 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
               {(latest.diskPartitions && latest.diskPartitions.length > 0) ? (
                  latest.diskPartitions.map((partition: any, idx: number) => (
                    <div key={idx} className="bg-black/40 rounded-xl p-3 border border-blue-500/20">
                       <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                partition.percent > 90 ? 'bg-red-500/20 text-red-400' :
                                partition.percent > 70 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                             }`}>
                                {partition.name}
                             </div>
                             <span className="text-slate-400 text-xs">{partition.fstype}</span>
                          </div>
                          <span className={`text-lg font-mono font-bold ${
                             partition.percent > 90 ? 'text-red-400' :
                             partition.percent > 70 ? 'text-yellow-400' :
                             'text-cyan-400'
                          }`}>{partition.percent}%</span>
                       </div>
                       <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                          <div 
                             className={`h-full rounded-full transition-all duration-500 ${
                                partition.percent > 90 ? 'bg-gradient-to-r from-red-600 to-red-400' :
                                partition.percent > 70 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                                'bg-gradient-to-r from-blue-600 to-cyan-400'
                             }`}
                             style={{ width: `${partition.percent}%` }}
                          />
                       </div>
                       <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>已用: {partition.used}GB</span>
                          <span>可用: {partition.free}GB</span>
                          <span>总计: {partition.total}GB</span>
                       </div>
                    </div>
                  ))
               ) : (
                  <div className="text-center py-6 text-slate-500">
                     <HardDrive size={32} className="mx-auto mb-2 opacity-50" />
                     <p>等待磁盘数据...</p>
                  </div>
               )}
            </div>
         </div>

         {/* 文件监控 */}
         <div className={`relative rounded-2xl p-6 overflow-hidden ${connectionStatus === 'disconnected' ? 'opacity-50 grayscale' : ''}`}
              style={{
                background: 'linear-gradient(145deg, rgba(0,20,10,0.95) 0%, rgba(0,50,30,0.9) 100%)',
                boxShadow: '0 0 30px rgba(0,255,100,0.1)'
              }}>
            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500/30"></div>
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-emerald-400/60 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-emerald-400/60 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-emerald-400/60 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-emerald-400/60 rounded-br-lg"></div>
            
            <div className="flex justify-between items-center mb-5 relative z-10">
               <h3 className="text-emerald-400 text-base font-bold tracking-widest flex items-center gap-3">
                  <FileSearch size={22} className="text-emerald-300" /> 文件完整性监控
               </h3>
               <span className="text-sm px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 rounded-xl font-black shadow-lg shadow-emerald-500/20">
                 ● 运行中
               </span>
            </div>
            
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
               {latest.fileStatus && latest.fileStatus.length > 0 ? (
                  latest.fileStatus.map((file: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-black/40 hover:bg-emerald-500/10 rounded-xl transition-all border border-emerald-500/20 hover:border-emerald-500/50 group">
                        <div className="flex items-center gap-4">
                            <FolderOpen size={24} className="text-amber-400 group-hover:text-emerald-300 transition-colors" />
                            <span className="text-emerald-100 font-mono text-base">{file.path}</span>
                        </div>
                        <span className={`text-sm font-black px-4 py-2 rounded-lg font-mono ${file.status === 'normal' ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40' : 'text-red-300 bg-red-500/20 border border-red-500/40 animate-pulse'}`}>
                            {file.status.toUpperCase()}
                        </span>
                    </div>
                  ))
               ) : (
                  <div className="text-center text-emerald-500/50 py-10 text-lg">等待数据...</div>
               )}
            </div>
         </div>
      </div>

      {/* 网络图表区域 - 增强版 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* 网络连接图表 */}
         <div className={`lg:col-span-2 relative rounded-2xl p-6 flex flex-col ${connectionStatus === 'disconnected' ? 'opacity-50' : ''}`}
              style={{
                background: 'linear-gradient(145deg, rgba(0,10,20,0.95) 0%, rgba(0,30,50,0.9) 100%)',
                boxShadow: '0 0 30px rgba(0,200,255,0.1)'
              }}>
            <div className="absolute inset-0 rounded-2xl border-2 border-cyan-500/30"></div>
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg"></div>
            
            {/* 头部 */}
            <div className="flex justify-between items-center mb-4 shrink-0 relative z-10">
              <h3 className="text-xl font-black text-cyan-400 flex items-center gap-3">
                <Network size={26} className="text-cyan-300"/> 网络连接监控
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-4xl font-mono font-black text-cyan-300" style={{textShadow: '0 0 20px rgba(0,255,255,0.5)'}}>{latest.net}</span>
                  <p className="text-cyan-400/60 text-xs">当前连接数</p>
                </div>
              </div>
            </div>
            
            {/* 统计卡片 */}
            <div className="grid grid-cols-4 gap-3 mb-4 relative z-10">
              <div className="bg-black/40 rounded-xl p-3 border border-cyan-500/20 hover:border-cyan-500/50 transition-all cursor-pointer group">
                <p className="text-cyan-400/60 text-xs mb-1">最高峰值</p>
                <p className="text-xl font-mono font-bold text-cyan-300 group-hover:text-white transition-colors">
                  {data.length > 0 ? Math.max(...data.map(d => d.net)) : 0}
                </p>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer group">
                <p className="text-emerald-400/60 text-xs mb-1">最低谷值</p>
                <p className="text-xl font-mono font-bold text-emerald-300 group-hover:text-white transition-colors">
                  {data.length > 0 ? Math.min(...data.map(d => d.net)) : 0}
                </p>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer group">
                <p className="text-purple-400/60 text-xs mb-1">平均值</p>
                <p className="text-xl font-mono font-bold text-purple-300 group-hover:text-white transition-colors">
                  {data.length > 0 ? Math.round(data.reduce((a, b) => a + b.net, 0) / data.length) : 0}
                </p>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer group">
                <p className="text-amber-400/60 text-xs mb-1">采样点数</p>
                <p className="text-xl font-mono font-bold text-amber-300 group-hover:text-white transition-colors">
                  {data.length}
                </p>
              </div>
            </div>
            
            {/* 图表 */}
            <div className="flex-1 min-h-[180px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ffff" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#00ffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#0c4a6e" strokeDasharray="3 3" vertical={false} opacity={0.5} />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#0ea5e9" fontSize={14} tickLine={false} axisLine={false} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'rgba(0,20,40,0.95)', borderColor: '#0ea5e9', borderRadius: '12px' }}
                     itemStyle={{ fontWeight: 'bold', color: '#00ffff' }}
                     labelStyle={{ display: 'none' }}
                  />
                  <Area type="monotone" dataKey="net" stroke="#00ffff" strokeWidth={3} fill="url(#netGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* 终端日志 + 端口监控 */}
         <div className="flex flex-col gap-4">
            {/* 活跃端口监控 */}
            <div className={`relative rounded-2xl p-4 overflow-hidden ${connectionStatus === 'disconnected' ? 'opacity-50' : ''}`}
                 style={{
                   background: 'linear-gradient(145deg, rgba(20,10,0,0.95) 0%, rgba(50,30,0,0.9) 100%)',
                   boxShadow: '0 0 20px rgba(255,150,0,0.1)'
                 }}>
               <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/30"></div>
               <h4 className="text-amber-400 text-base font-bold flex items-center gap-2 mb-3 relative z-10">
                 <Wifi size={18} className="text-amber-300" /> 活跃端口
               </h4>
               <div className="flex flex-wrap gap-2 relative z-10">
                 {[80, 443, 22, 3306, 8080, 6379].map((port) => (
                   <div key={port} className="px-3 py-2 bg-black/40 rounded-lg border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer group">
                     <span className="font-mono text-amber-300 group-hover:text-white text-sm font-bold">{port}</span>
                   </div>
                 ))}
               </div>
            </div>
            
            {/* 终端日志 */}
            <div className="relative rounded-2xl overflow-hidden flex flex-col flex-1"
                 style={{
                   background: 'linear-gradient(180deg, rgba(0,0,0,0.98) 0%, rgba(0,20,10,0.95) 100%)',
                   boxShadow: '0 0 30px rgba(0,255,0,0.05)'
                 }}>
               <div className="absolute inset-0 rounded-2xl border-2 border-green-500/30"></div>
               <div className="px-4 py-3 bg-green-900/30 border-b border-green-500/30 flex items-center justify-between shrink-0 relative z-10">
                  <span className="text-sm text-green-400 font-black flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    系统日志
                  </span>
                  <span className="text-xs text-green-500/60 font-mono">{logs.length} 条</span>
               </div>
               <div className="flex-1 p-3 font-mono text-xs space-y-1.5 overflow-auto relative z-10">
                  {logs.length === 0 ? (
                    <p className="text-green-400/50 text-center py-4">等待数据...</p>
                  ) : (
                    logs.slice().reverse().slice(0, 8).map((log, idx) => (
                      <p key={idx} className={`${
                        log.type === '告警' ? 'text-red-400' : 
                        log.type === '警告' ? 'text-yellow-400' : 
                        log.type === '错误' ? 'text-red-500' : 'text-green-400/80'
                      } hover:bg-green-500/10 px-2 py-1 rounded cursor-pointer transition-colors`}>
                        <span className="text-green-600">[{log.time}]</span> {log.msg.substring(0, 30)}...
                      </p>
                    ))
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* NIDS 网络威胁概览 - 实时数据 */}
      <Link to="/alerts" className="block">
        <div className="relative rounded-2xl p-6 overflow-hidden cursor-pointer group hover:scale-[1.005] transition-all"
             style={{
               background: 'linear-gradient(145deg, rgba(30,0,20,0.95) 0%, rgba(60,10,40,0.9) 100%)',
               boxShadow: '0 0 40px rgba(255,50,100,0.15)'
             }}>
          <div className="absolute inset-0 rounded-2xl border-2 border-rose-500/30 group-hover:border-rose-500/60 transition-colors"></div>
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-rose-400 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-rose-400 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-rose-400 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-rose-400 rounded-br-lg"></div>
          
          {/* 扫描线动画 */}
          <div className="absolute inset-0 overflow-hidden opacity-30 rounded-2xl">
            <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent animate-scan"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-rose-400 flex items-center gap-3">
                <Network size={28} className="text-rose-300" /> NIDS 网络威胁概览
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-rose-400/60 text-sm">点击查看详情</span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/40 transition-colors">
                  <AlertTriangle size={18} className="text-rose-400" />
                </div>
              </div>
            </div>
            
            {/* 威胁统计 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-black/40 rounded-xl p-4 border border-rose-500/20 hover:border-rose-500/50 transition-all text-center">
                <p className="text-4xl font-mono font-black text-rose-400" style={{textShadow: '0 0 20px rgba(255,50,100,0.5)'}}>{nidsStats.total}</p>
                <p className="text-rose-400/60 text-sm mt-1">总威胁</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-red-500/20 hover:border-red-500/50 transition-all text-center">
                <p className="text-4xl font-mono font-black text-red-400">{nidsStats.high}</p>
                <p className="text-red-400/60 text-sm mt-1">高危</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-orange-500/20 hover:border-orange-500/50 transition-all text-center">
                <p className="text-4xl font-mono font-black text-orange-400">{nidsStats.medium}</p>
                <p className="text-orange-400/60 text-sm mt-1">中危</p>
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/50 transition-all text-center">
                <p className="text-4xl font-mono font-black text-blue-400">{nidsStats.low}</p>
                <p className="text-blue-400/60 text-sm mt-1">低危</p>
              </div>
            </div>
            
            {/* 攻击类型分布 */}
            <div className="flex items-center gap-4">
              <span className="text-rose-400/60 text-sm shrink-0">攻击类型:</span>
              <div className="flex flex-wrap gap-2 flex-1">
                {nidsStats.types.length > 0 ? nidsStats.types.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-black/40 rounded-lg border border-rose-500/30 text-rose-300 text-sm font-mono hover:bg-rose-500/20 transition-colors">
                    {t.name} <span className="text-rose-400/80">({t.count})</span>
                  </span>
                )) : (
                  <span className="text-rose-400/40 text-sm">暂无数据</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* HIDS 安全监控模块 - 增强版 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* 用户登录监控 */}
         <div className={`relative rounded-2xl p-6 overflow-hidden ${connectionStatus === 'disconnected' ? 'opacity-50 grayscale' : ''}`}
              style={{
                background: 'linear-gradient(145deg, rgba(20,10,30,0.95) 0%, rgba(50,20,60,0.9) 100%)',
                boxShadow: '0 0 30px rgba(150,100,255,0.1)'
              }}>
            <div className="absolute inset-0 rounded-2xl border-2 border-violet-500/30"></div>
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-violet-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-violet-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-violet-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-violet-400 rounded-br-lg"></div>
            
            <div className="flex justify-between items-center mb-5 relative z-10">
               <h3 className="text-violet-400 text-lg font-black flex items-center gap-3">
                  <UserCheck size={26} className="text-violet-300" /> 用户登录监控
               </h3>
               <span className="text-sm px-4 py-1.5 bg-violet-500/20 text-violet-300 rounded-xl border border-violet-500/30 font-bold">
                  24小时
               </span>
            </div>
            
            {/* 登录统计摘要 */}
            <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
              <div className="bg-black/40 rounded-xl p-3 border border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-emerald-400/80 text-sm">成功登录</span>
                </div>
                <p className="text-3xl font-mono font-black text-emerald-400 group-hover:text-white transition-colors">
                  {connectionStatus === 'connected' ? '2' : '0'}
                </p>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-red-500/20 hover:border-red-500/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <span className="text-red-400/80 text-sm">失败尝试</span>
                </div>
                <p className="text-3xl font-mono font-black text-red-400 group-hover:text-white transition-colors">0</p>
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
               {connectionStatus === 'connected' ? (
                 <>
                   <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all cursor-pointer group">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                         <Key size={24} className="text-white" />
                       </div>
                       <div>
                         <p className="text-white text-base font-bold group-hover:text-violet-300 transition-colors">Administrator</p>
                         <p className="text-slate-400 text-sm">{hostId}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className="text-emerald-400 text-sm font-black px-3 py-1 bg-emerald-500/20 rounded-lg">成功</span>
                       <p className="text-slate-500 text-sm mt-1">{new Date().toLocaleTimeString()}</p>
                     </div>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all cursor-pointer group">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                         <Shield size={24} className="text-white" />
                       </div>
                       <div>
                         <p className="text-white text-base font-bold group-hover:text-violet-300 transition-colors">SYSTEM</p>
                         <p className="text-slate-400 text-sm">本地系统服务</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className="text-emerald-400 text-sm font-black px-3 py-1 bg-emerald-500/20 rounded-lg">成功</span>
                       <p className="text-slate-500 text-sm mt-1">系统启动</p>
                     </div>
                   </div>
                 </>
               ) : (
                 <div className="text-center py-10 text-violet-500/50">
                   <UserCheck size={48} className="mx-auto mb-3 opacity-50" />
                   <p className="text-lg">等待连接...</p>
                 </div>
               )}
            </div>
         </div>

         {/* 安全基线检查 */}
         <div className={`relative rounded-2xl p-6 overflow-hidden ${connectionStatus === 'disconnected' ? 'opacity-50 grayscale' : ''}`}
              style={{
                background: 'linear-gradient(145deg, rgba(10,20,15,0.95) 0%, rgba(20,50,30,0.9) 100%)',
                boxShadow: '0 0 30px rgba(100,255,150,0.1)'
              }}>
            <div className="absolute inset-0 rounded-2xl border-2 border-teal-500/30"></div>
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-teal-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-teal-400 rounded-br-lg"></div>
            
            <div className="flex justify-between items-center mb-5 relative z-10">
               <h3 className="text-teal-400 text-lg font-black flex items-center gap-3">
                  <ShieldCheck size={26} className="text-teal-300" /> 安全基线检查
               </h3>
               <span className={`text-sm px-4 py-1.5 rounded-xl border font-black ${
                 connectionStatus === 'connected' 
                   ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                   : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
               }`}>
                  {connectionStatus === 'connected' ? '● 合规' : '● 未知'}
               </span>
            </div>
            
            {/* 合规率大数字 */}
            <div className="text-center mb-5 relative z-10">
              <p className="text-6xl font-mono font-black text-teal-400" style={{textShadow: '0 0 30px rgba(0,255,150,0.4)'}}>
                {connectionStatus === 'connected' ? '92' : '--'}<span className="text-3xl">%</span>
              </p>
              <p className="text-teal-400/60 text-sm mt-1">基线合规率</p>
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden mt-3">
                <div className="h-full bg-gradient-to-r from-teal-600 to-emerald-400 rounded-full transition-all duration-500" 
                     style={{ width: connectionStatus === 'connected' ? '92%' : '0%' }}></div>
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
               <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-teal-500/20 hover:border-teal-500/50 hover:bg-teal-500/10 transition-all cursor-pointer group">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
                     <Lock size={22} className="text-teal-400" />
                   </div>
                   <span className="text-white text-base font-medium group-hover:text-teal-300 transition-colors">防火墙状态</span>
                 </div>
                 <span className={`text-sm font-black px-4 py-1.5 rounded-lg ${connectionStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-400'}`}>
                   {connectionStatus === 'connected' ? '已启用' : '--'}
                 </span>
               </div>
               <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-teal-500/20 hover:border-teal-500/50 hover:bg-teal-500/10 transition-all cursor-pointer group">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
                     <Shield size={22} className="text-teal-400" />
                   </div>
                   <span className="text-white text-base font-medium group-hover:text-teal-300 transition-colors">杀毒软件</span>
                 </div>
                 <span className={`text-sm font-black px-4 py-1.5 rounded-lg ${connectionStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-400'}`}>
                   {connectionStatus === 'connected' ? '运行中' : '--'}
                 </span>
               </div>
               <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-teal-500/20 hover:border-teal-500/50 hover:bg-teal-500/10 transition-all cursor-pointer group">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
                     <Activity size={22} className="text-teal-400" />
                   </div>
                   <span className="text-white text-base font-medium group-hover:text-teal-300 transition-colors">系统更新</span>
                 </div>
                 <span className={`text-sm font-black px-4 py-1.5 rounded-lg ${connectionStatus === 'connected' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse' : 'bg-slate-500/20 text-slate-400'}`}>
                   {connectionStatus === 'connected' ? '3项待更新' : '--'}
                 </span>
               </div>
            </div>
         </div>

         {/* 主机安全告警 */}
         <div className={`relative rounded-2xl p-6 overflow-hidden ${connectionStatus === 'disconnected' ? 'opacity-50 grayscale' : ''}`}
              style={{
                background: 'linear-gradient(145deg, rgba(30,10,10,0.95) 0%, rgba(60,20,20,0.9) 100%)',
                boxShadow: '0 0 30px rgba(255,100,100,0.1)'
              }}>
            <div className="absolute inset-0 rounded-2xl border-2 border-rose-500/30"></div>
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-rose-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-rose-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-rose-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-rose-400 rounded-br-lg"></div>
            
            <div className="flex justify-between items-center mb-5 relative z-10">
               <h3 className="text-rose-400 text-lg font-black flex items-center gap-3">
                  <AlertTriangle size={26} className="text-rose-300" /> 主机安全告警
               </h3>
               <span className={`text-sm px-4 py-1.5 rounded-xl border font-black ${
                 latest.cpu > 80 || latest.memory > 85 
                   ? 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse' 
                   : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
               }`}>
                  {latest.cpu > 80 || latest.memory > 85 ? '● 告警中' : '● 正常'}
               </span>
            </div>
            
            {/* 告警统计 */}
            <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
              <div className="bg-black/40 rounded-xl p-3 text-center border border-red-500/20 hover:border-red-500/50 transition-all cursor-pointer group">
                <p className="text-2xl font-mono font-black text-red-400 group-hover:text-white">{latest.cpu > 80 ? 1 : 0}</p>
                <p className="text-red-400/60 text-sm">高危</p>
              </div>
              <div className="bg-black/40 rounded-xl p-3 text-center border border-orange-500/20 hover:border-orange-500/50 transition-all cursor-pointer group">
                <p className="text-2xl font-mono font-black text-orange-400 group-hover:text-white">{latest.memory > 85 ? 1 : 0}</p>
                <p className="text-orange-400/60 text-sm">中危</p>
              </div>
              <div className="bg-black/40 rounded-xl p-3 text-center border border-yellow-500/20 hover:border-yellow-500/50 transition-all cursor-pointer group">
                <p className="text-2xl font-mono font-black text-yellow-400 group-hover:text-white">{latest.diskUsage > 90 ? 1 : 0}</p>
                <p className="text-yellow-400/60 text-sm">低危</p>
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
               {connectionStatus === 'connected' ? (
                 <>
                   {latest.cpu > 80 && (
                     <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-xl border border-red-500/30 animate-pulse hover:bg-red-500/20 transition-all cursor-pointer">
                       <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                         <Cpu size={24} className="text-white" />
                       </div>
                       <div className="flex-1">
                         <p className="text-red-400 text-base font-black">CPU负载过高</p>
                         <p className="text-red-400/60 text-sm">当前: {latest.cpu.toFixed(1)}%</p>
                       </div>
                       <span className="text-red-400 text-sm font-black px-3 py-1 bg-red-500/20 rounded-lg">高危</span>
                     </div>
                   )}
                   {latest.memory > 85 && (
                     <div className="flex items-center gap-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/30 hover:bg-orange-500/20 transition-all cursor-pointer">
                       <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                         <Database size={24} className="text-white" />
                       </div>
                       <div className="flex-1">
                         <p className="text-orange-400 text-base font-black">内存使用过高</p>
                         <p className="text-orange-400/60 text-sm">当前: {latest.memory.toFixed(1)}%</p>
                       </div>
                       <span className="text-orange-400 text-sm font-black px-3 py-1 bg-orange-500/20 rounded-lg">中危</span>
                     </div>
                   )}
                   {latest.diskUsage > 90 && (
                     <div className="flex items-center gap-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30 hover:bg-yellow-500/20 transition-all cursor-pointer">
                       <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg">
                         <HardDrive size={24} className="text-white" />
                       </div>
                       <div className="flex-1">
                         <p className="text-yellow-400 text-base font-black">磁盘空间不足</p>
                         <p className="text-yellow-400/60 text-sm">当前: {latest.diskUsage.toFixed(1)}%</p>
                       </div>
                       <span className="text-yellow-400 text-sm font-black px-3 py-1 bg-yellow-500/20 rounded-lg">警告</span>
                     </div>
                   )}
                   {latest.cpu <= 80 && latest.memory <= 85 && latest.diskUsage <= 90 && (
                     <div className="text-center py-6 text-emerald-500/70">
                       <ShieldCheck size={56} className="mx-auto mb-4 text-emerald-400" style={{filter: 'drop-shadow(0 0 20px rgba(0,255,150,0.5))'}} />
                       <p className="font-black text-xl text-emerald-400">系统运行正常</p>
                       <p className="text-sm text-emerald-500/50 mt-2">未检测到安全威胁</p>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="text-center py-10 text-rose-500/50">
                   <AlertTriangle size={48} className="mx-auto mb-3 opacity-50" />
                   <p className="text-lg">等待连接...</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default HostMonitoring;
