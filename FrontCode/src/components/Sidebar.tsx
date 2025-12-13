import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  Map, 
  FileText, 
  Server, 
  Users, 
  LogOut,
  LayoutDashboard,
  Zap
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: '首页' },
    { to: '/collection', icon: Server, label: '数据采集配置' },
    { to: '/analysis', icon: Activity, label: '威胁分析中心' },
    { to: '/alerts', icon: ShieldAlert, label: '实时威胁预警' },
    { to: '/tracing', icon: Map, label: '攻击溯源图谱' },
    { to: '/hids', icon: Server, label: 'HIDS 主机监控' },
    { to: '/reports', icon: FileText, label: '智能报告生成' },
    { to: '/organization', icon: Users, label: '组织与共享' },
  ];

  return (
    <aside className="w-72 bg-cyber-950 border-r border-cyber-800 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl shadow-cyber-900">
      {/* Brand Logo */}
      <div className="h-20 border-b border-cyber-800 flex items-center px-6 gap-3 bg-gradient-to-r from-cyber-900 to-cyber-950">
        {/* 六边形网络 Logo */}
        <div className="w-12 h-12 relative flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* 六边形外框 - 渐变边框 */}
            <defs>
              <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <polygon 
              points="50,2 93,25 93,75 50,98 7,75 7,25" 
              fill="transparent" 
              stroke="url(#hexGradient)" 
              strokeWidth="2"
            />
            {/* 内部网络节点 */}
            <circle cx="50" cy="20" r="5" fill="#06b6d4" />
            <circle cx="80" cy="35" r="5" fill="#3b82f6" />
            <circle cx="80" cy="65" r="5" fill="#8b5cf6" />
            <circle cx="50" cy="80" r="5" fill="#ec4899" />
            <circle cx="20" cy="65" r="5" fill="#f43f5e" />
            <circle cx="20" cy="35" r="5" fill="#06b6d4" />
            <circle cx="50" cy="50" r="6" fill="#3b82f6" />
            {/* 连接线 */}
            <line x1="50" y1="20" x2="80" y2="35" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />
            <line x1="80" y1="35" x2="80" y2="65" stroke="#3b82f6" strokeWidth="1" opacity="0.6" />
            <line x1="80" y1="65" x2="50" y2="80" stroke="#8b5cf6" strokeWidth="1" opacity="0.6" />
            <line x1="50" y1="80" x2="20" y2="65" stroke="#ec4899" strokeWidth="1" opacity="0.6" />
            <line x1="20" y1="65" x2="20" y2="35" stroke="#f43f5e" strokeWidth="1" opacity="0.6" />
            <line x1="20" y1="35" x2="50" y2="20" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />
            {/* 中心连接 */}
            <line x1="50" y1="50" x2="50" y2="20" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
            <line x1="50" y1="50" x2="80" y2="35" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
            <line x1="50" y1="50" x2="80" y2="65" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
            <line x1="50" y1="50" x2="50" y2="80" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
            <line x1="50" y1="50" x2="20" y2="65" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
            <line x1="50" y1="50" x2="20" y2="35" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">御链天鉴</h1>
          <p className="text-[10px] text-slate-500 tracking-widest">网络安全智能分析平台</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2">主要模块</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'bg-cyber-accent/10 text-cyber-accent shadow-[0_0_15px_rgba(6,182,212,0.15)] border border-cyber-accent/20'
                  : 'text-slate-400 hover:bg-cyber-800 hover:text-slate-200 hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyber-accent rounded-l-full"></div>}
                <item.icon size={20} className={isActive ? "animate-pulse" : "group-hover:text-cyber-accent transition-colors"} />
                <span className="font-medium text-sm tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile / Logout */}
      <div className="p-4 border-t border-cyber-800 bg-gradient-to-t from-cyber-950 to-cyber-900/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyber-800/50 to-cyber-800/30 border border-cyber-700/50 mb-3">
          {/* 头像 - 渐变边框 */}
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-xl bg-cyber-900 flex items-center justify-center">
                <span className="font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">管理</span>
              </div>
            </div>
            {/* 在线状态指示器 */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-cyber-900 rounded-full flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">系统管理员</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              在线
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-slate-400 bg-cyber-800/50 hover:bg-red-500/20 hover:text-red-400 border border-cyber-700/50 hover:border-red-500/30 rounded-xl transition-all duration-300 group"
        >
          <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
          <span className="font-medium text-sm">安全退出</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;