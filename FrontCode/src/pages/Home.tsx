import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Activity, 
  Map, 
  FileText, 
  Server, 
  AlertTriangle, 
  Cpu, 
  Globe, 
  Clock,
  ArrowRight,
  Database
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { DashBoardService, AnalysisService } from '../services/connector';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [safetyScore, setSafetyScore] = useState(0);
  const [stats, setStats] = useState({
    todayAttacks: 0,
    activeThreats: 0,
    protectedAssets: 0
  });
  const [trafficData, setTrafficData] = useState<any[]>([]);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboard = await DashBoardService.getSummary();
        if (dashboard) {
          setSafetyScore(dashboard.securityScore || 0);
          setStats({
            todayAttacks: dashboard.totalAttacksToday || 0,
            activeThreats: dashboard.activeThreats || 0,
            protectedAssets: dashboard.protectedAssets || 0
          });
        }

        const traffic = await AnalysisService.getTraffic(1, 20);
        if (traffic && traffic.length > 0) {
          // Transform backend traffic data for chart
          const chartData = traffic.map((t: any) => ({
            v: t.attackCount || 0
          })).reverse(); // Assuming recent first, we want chronological
          setTrafficData(chartData);
        } else {
            // Empty placeholder if no data
            setTrafficData([{v:0}, {v:0}, {v:0}, {v:0}, {v:0}]);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // 快捷导航卡片配置
  const quickActions = [
    { 
      title: '采集节点配置', 
      desc: '管理分布式的日志采集探针与心跳状态', 
      path: '/collection', 
      icon: Database, // 使用 Database 图标
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/10',
      border: 'hover:border-cyan-500/50'
    },
    { 
      title: '威胁态势分析', 
      desc: '查看全网攻击流量趋势与类型分布', 
      path: '/analysis', 
      icon: Activity, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10',
      border: 'hover:border-blue-500/50'
    },
    { 
      title: '攻击溯源图谱', 
      desc: '基于地理位置追踪高危攻击源头', 
      path: '/tracing', 
      icon: Map, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10',
      border: 'hover:border-purple-500/50'
    },
    { 
      title: '实时威胁预警', 
      desc: 'IDS 入侵检测系统实时日志流', 
      path: '/alerts', 
      icon: AlertTriangle, 
      color: 'text-red-400', 
      bg: 'bg-red-500/10',
      border: 'hover:border-red-500/50'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* 顶部欢迎区 & 状态概览 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-4">
          {/* 小型六边形 Logo */}
          <div className="w-14 h-14 relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <linearGradient id="homeHexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <polygon points="50,5 90,27 90,73 50,95 10,73 10,27" fill="rgba(6,182,212,0.1)" stroke="url(#homeHexGradient)" strokeWidth="2" />
              <circle cx="50" cy="22" r="5" fill="#06b6d4" />
              <circle cx="78" cy="38" r="5" fill="#3b82f6" />
              <circle cx="78" cy="62" r="5" fill="#8b5cf6" />
              <circle cx="50" cy="78" r="5" fill="#ec4899" />
              <circle cx="22" cy="62" r="5" fill="#f43f5e" />
              <circle cx="22" cy="38" r="5" fill="#06b6d4" />
              <circle cx="50" cy="50" r="6" fill="#3b82f6" />
              <line x1="50" y1="22" x2="78" y2="38" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />
              <line x1="78" y1="38" x2="78" y2="62" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
              <line x1="78" y1="62" x2="50" y2="78" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
              <line x1="50" y1="78" x2="22" y2="62" stroke="#ec4899" strokeWidth="1" opacity="0.5" />
              <line x1="22" y1="62" x2="22" y2="38" stroke="#f43f5e" strokeWidth="1" opacity="0.5" />
              <line x1="22" y1="38" x2="50" y2="22" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />
              <line x1="50" y1="50" x2="50" y2="22" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
              <line x1="50" y1="50" x2="78" y2="38" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
              <line x1="50" y1="50" x2="78" y2="62" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
              <line x1="50" y1="50" x2="50" y2="78" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
              <line x1="50" y1="50" x2="22" y2="62" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
              <line x1="50" y1="50" x2="22" y2="38" stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">安全态势总览</span>
              <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                实时监控中
              </span>
            </h1>
            <p className="text-slate-400 mt-1.5 flex items-center gap-2">
              <span className="text-slate-500">欢迎回来，</span>
              <span className="text-cyan-400 font-medium">管理员</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                全网节点运行正常
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-cyber-900/50 p-3 rounded-xl border border-cyber-800 backdrop-blur-sm">
           <Clock size={20} className="text-cyber-accent" />
           <span className="font-mono text-xl text-white font-bold">
             {currentTime.toLocaleTimeString()}
           </span>
           <span className="text-xs text-slate-500 border-l border-slate-700 pl-4">
             {currentTime.toLocaleDateString()}
           </span>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Widget 1: 安全评分 - 大型圆环 */}
        <div className="relative bg-gradient-to-br from-cyber-900/80 to-cyber-950/80 p-6 rounded-2xl border border-emerald-500/20 overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="relative z-10 flex items-center gap-4">
            {/* 圆环进度 */}
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#scoreGradient)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${safetyScore * 2.51} 251`} className="transition-all duration-1000" />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-400">{safetyScore}</span>
              </div>
            </div>
            <div>
              <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">安全评分</h3>
              <p className="text-emerald-400 text-sm font-medium mt-1">状态良好</p>
              <div className="flex items-center gap-1 mt-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-xs text-slate-500">防护已启用</span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: 今日拦截 */}
        <div className="relative bg-gradient-to-br from-cyber-900/80 to-cyber-950/80 p-6 rounded-2xl border border-cyan-500/20 overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">今日拦截</h3>
              <div className="w-20 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <Area type="monotone" dataKey="v" stroke="#06b6d4" fill="url(#chartGradient)" strokeWidth={2} />
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mt-2">{stats.todayAttacks}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-xs text-cyan-400">实时防御中</span>
            </div>
          </div>
        </div>

        {/* Widget 3: 受保护资产 */}
        <div 
          onClick={() => navigate('/collection')}
          className="relative bg-gradient-to-br from-cyber-900/80 to-cyber-950/80 p-6 rounded-2xl border border-purple-500/20 overflow-hidden group hover:border-purple-500/40 cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider group-hover:text-purple-400 transition-colors">受保护资产</h3>
              <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                <Globe size={20} />
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">{stats.protectedAssets}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 group-hover:text-purple-300 transition-colors">
              全网覆盖 <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </div>

        {/* Widget 4: 活跃威胁 */}
        <div 
          onClick={() => navigate('/alerts')}
          className="relative bg-gradient-to-br from-red-950/50 to-cyber-950/80 p-6 rounded-2xl border border-red-500/30 overflow-hidden group hover:border-red-500/60 cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/30 transition-all animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-red-300/70 text-xs font-medium uppercase tracking-wider group-hover:text-red-300 transition-colors">活跃威胁</h3>
              <div className="p-2.5 bg-red-500/20 rounded-xl text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all animate-pulse">
                <AlertTriangle size={20} />
              </div>
            </div>
            <p className="text-4xl font-bold text-red-400 mt-2">{stats.activeThreats}</p>
            <p className="text-xs text-red-400/70 mt-2 flex items-center gap-1 group-hover:text-red-300 transition-colors">
              点击立即处理 <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </div>
      </div>

      {/* 功能导航 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 左侧：快捷功能入口 */}
        <div className="lg:col-span-2 space-y-5">
           <h2 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
             <div className="p-1.5 bg-cyan-500/10 rounded-lg">
               <Activity size={16} className="text-cyan-400"/>
             </div>
             快速访问
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => (
                <div 
                  key={idx}
                  onClick={() => navigate(action.path)}
                  className="relative bg-gradient-to-br from-cyber-900/60 to-cyber-950/60 p-5 rounded-2xl border border-cyber-700/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5 group overflow-hidden"
                >
                  {/* 悬停光效 */}
                  <div className={`absolute -right-10 -top-10 w-24 h-24 ${action.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                       <div className={`p-3 rounded-xl ${action.bg} ${action.color} border border-current/20`}>
                         <action.icon size={22} />
                       </div>
                       <ArrowRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="mt-4">
                      <h3 className={`text-base font-bold text-white group-hover:${action.color} transition-colors`}>{action.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1 group-hover:text-slate-400 transition-colors">{action.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
           </div>

           {/* AI 报告横幅 */}
           <div 
             className="relative overflow-hidden rounded-2xl group cursor-pointer" 
             onClick={() => navigate('/reports')}
           >
             {/* 动态渐变背景 */}
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20"></div>
             <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%2306b6d4%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
             
             {/* 边框 */}
             <div className="absolute inset-0 rounded-2xl border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors"></div>
             
             <div className="relative z-10 p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                    <FileText size={24} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      AI 智能报告生成
                      <span className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 rounded-full border border-cyan-500/30">NEW</span>
                    </h3>
                    <p className="text-slate-400 text-sm mt-0.5">基于 AI 引擎自动分析，一键导出 PDF/Markdown 报告</p>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white shadow-lg shadow-cyan-500/30 group-hover:scale-110 group-hover:shadow-cyan-500/50 transition-all">
                   <ArrowRight size={20} />
                </div>
             </div>
           </div>
        </div>

        {/* 右侧：实时动态 */}
        <div className="lg:col-span-1">
           <div className="bg-gradient-to-br from-cyber-900/60 to-cyber-950/60 rounded-2xl h-full flex flex-col border border-cyber-700/50 overflow-hidden">
             <div className="p-4 border-b border-cyber-700/50 flex justify-between items-center bg-gradient-to-r from-cyber-800/50 to-transparent">
               <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                 <div className="p-1.5 bg-slate-500/10 rounded-lg">
                   <Cpu size={14} className="text-slate-400"/>
                 </div>
                 系统审计日志
               </h3>
               <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
             </div>
             <div className="flex-1 p-3 overflow-y-auto max-h-[350px] custom-scrollbar space-y-1">
                {[
                  { time: '10:42:05', msg: '系统完整性检查通过', type: 'info', icon: '✓' },
                  { time: '10:41:12', msg: '管理员登录 192.168.1.5', type: 'info', icon: '→' },
                  { time: '10:38:55', msg: '封禁恶意IP 45.33.22.11', type: 'success', icon: '🛡' },
                  { time: '10:35:20', msg: 'Node-03 CPU使用率过高', type: 'warning', icon: '⚠' },
                  { time: '10:30:00', msg: '数据库备份完成', type: 'info', icon: '✓' },
                  { time: '10:15:42', msg: '新增防火墙规则', type: 'info', icon: '+' },
                ].map((log, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-3 text-xs font-mono p-2.5 rounded-xl transition-all hover:bg-cyber-800/50 ${
                      log.type === 'warning' ? 'bg-yellow-500/5' : 
                      log.type === 'success' ? 'bg-emerald-500/5' : 
                      'bg-transparent'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${
                      log.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 
                      log.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {log.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`truncate ${
                        log.type === 'warning' ? 'text-yellow-300' : 
                        log.type === 'success' ? 'text-emerald-300' : 
                        'text-slate-300'
                      }`}>
                        {log.msg}
                      </p>
                      <p className="text-slate-600 text-[10px]">{log.time}</p>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Home;