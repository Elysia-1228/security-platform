import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, Info } from 'lucide-react';
import { AuthService } from '../services/connector';

const noiseBg = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123'); 
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await AuthService.login(username, password);
      onLogin();
    } catch (err: any) {
      console.error("Login failed", err);
      // 显示错误信息，不强制登录
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-950 flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyber-accent/5 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute inset-0 opacity-20 mix-blend-soft-light" style={{ backgroundImage: `url("${noiseBg}")` }}></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-1">
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-accent to-blue-600 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-cyber-900/80 backdrop-blur-xl border border-cyber-700/50 p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            {/* 六边形网络 Logo */}
            <div className="w-24 h-24 relative flex items-center justify-center mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="loginHexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <polygon 
                  points="50,2 93,25 93,75 50,98 7,75 7,25" 
                  fill="rgba(6,182,212,0.1)" 
                  stroke="url(#loginHexGradient)" 
                  strokeWidth="2"
                />
                {/* 内部网络节点 */}
                <circle cx="50" cy="20" r="6" fill="#06b6d4" />
                <circle cx="80" cy="35" r="6" fill="#3b82f6" />
                <circle cx="80" cy="65" r="6" fill="#8b5cf6" />
                <circle cx="50" cy="80" r="6" fill="#ec4899" />
                <circle cx="20" cy="65" r="6" fill="#f43f5e" />
                <circle cx="20" cy="35" r="6" fill="#06b6d4" />
                <circle cx="50" cy="50" r="8" fill="#3b82f6" />
                {/* 连接线 */}
                <line x1="50" y1="20" x2="80" y2="35" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" />
                <line x1="80" y1="35" x2="80" y2="65" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />
                <line x1="80" y1="65" x2="50" y2="80" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.6" />
                <line x1="50" y1="80" x2="20" y2="65" stroke="#ec4899" strokeWidth="1.5" opacity="0.6" />
                <line x1="20" y1="65" x2="20" y2="35" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" />
                <line x1="20" y1="35" x2="50" y2="20" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" />
                {/* 中心连接 */}
                <line x1="50" y1="50" x2="50" y2="20" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
                <line x1="50" y1="50" x2="80" y2="35" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
                <line x1="50" y1="50" x2="80" y2="65" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
                <line x1="50" y1="50" x2="50" y2="80" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
                <line x1="50" y1="50" x2="20" y2="65" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
                <line x1="50" y1="50" x2="20" y2="35" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mt-4">御链天鉴</h1>
            <p className="text-slate-400 text-sm mt-2">网络安全智能分析及溯源系统</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">{error}</div>}
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyber-accent uppercase tracking-wider ml-1">Account</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-accent transition-colors" size={18} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-cyber-950/50 border border-cyber-700 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:border-cyber-accent outline-none transition-all" placeholder="admin" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyber-accent uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-accent transition-colors" size={18} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-cyber-950/50 border border-cyber-700 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:border-cyber-accent outline-none transition-all" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyber-accent to-blue-600 hover:to-blue-500 text-white font-bold py-3.5 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2">
              {loading ? 'Connecting...' : <>Login System <ArrowRight size={18}/></>}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-cyber-800 text-center">
            <p className="text-xs text-slate-500 font-mono flex items-center justify-center gap-2"><Info size={12} /> SYSTEM SECURE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;