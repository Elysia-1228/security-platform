import React, { useState, useEffect } from 'react';
import { Plus, Trash2, PlayCircle, StopCircle, Loader2, X, Save, RefreshCw, Server, Activity, Pause, Wifi, Database, Clock } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { HostCollectionConfig } from '../types';
import { ConfigService } from '../services/connector';

const DataCollection: React.FC = () => {
  const [hosts, setHosts] = useState<HostCollectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{ hostIp: string; collectFreq: number }>({ hostIp: '', collectFreq: 5 });
  const [submitting, setSubmitting] = useState(false);

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const data = await ConfigService.getHostList();
      // 修复：防御性检查，确保 setHosts 永远接收数组
      setHosts(Array.isArray(data?.list) ? data.list : []);
    } catch (err) {
      console.error("Failed to fetch hosts", err);
      setHosts([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ConfigService.createHost({
        hostIp: formData.hostIp,
        collectFreq: formData.collectFreq,
        collectStatus: 0 
      });
      setIsModalOpen(false);
      setFormData({ hostIp: '', collectFreq: 5 });
      fetchHosts();
    } catch (err) {
      console.error("Failed to create host", err);
      alert("创建失败，请检查后端服务");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (host: HostCollectionConfig) => {
    const newStatus = host.collectStatus === 1 ? 2 : 1;
    try {
      await ConfigService.updateHost(host.id, { collectStatus: newStatus });
      setHosts(prev => prev.map(h => h.id === host.id ? { ...h, collectStatus: newStatus } : h));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("确定要删除此采集配置吗？")) return;
    try {
      await ConfigService.deleteHost(id);
      setHosts(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 统计数据
  const runningCount = hosts.filter(h => h.collectStatus === 1).length;
  const pausedCount = hosts.filter(h => h.collectStatus === 2).length;
  const totalCount = hosts.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 页面头部 */}
      <PageHeader title="采集节点配置" subtitle="分布式数据采集探针管理中心">
        <div className="flex gap-3">
          <button 
            onClick={fetchHosts} 
            className="p-2.5 bg-cyber-900/80 border border-cyan-500/30 rounded-lg hover:border-cyan-500/60 hover:text-cyan-400 text-slate-400 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all active:scale-95 hover:-translate-y-0.5"
          >
            <Plus size={18} /> 新增节点
          </button>
        </div>
      </PageHeader>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative bg-gradient-to-br from-cyber-900/80 to-cyber-950/80 p-6 rounded-2xl border border-cyan-500/20 overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">总节点数</p>
              <p className="text-4xl font-bold text-white mt-2">{totalCount}</p>
            </div>
            <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <Server size={28} className="text-cyan-400" />
            </div>
          </div>
        </div>
        
        <div className="relative bg-gradient-to-br from-cyber-900/80 to-cyber-950/80 p-6 rounded-2xl border border-emerald-500/20 overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">运行中</p>
              <p className="text-4xl font-bold text-emerald-400 mt-2">{runningCount}</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Activity size={28} className="text-emerald-400" />
            </div>
          </div>
        </div>
        
        <div className="relative bg-gradient-to-br from-cyber-900/80 to-cyber-950/80 p-6 rounded-2xl border border-amber-500/20 overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">已暂停</p>
              <p className="text-4xl font-bold text-amber-400 mt-2">{pausedCount}</p>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Pause size={28} className="text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 节点列表 */}
      <div className="relative bg-gradient-to-br from-cyber-900/60 to-cyber-950/60 rounded-2xl border border-cyan-500/20 overflow-hidden backdrop-blur-sm">
        {/* 表头发光条 */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        
        <div className="p-6 border-b border-cyan-500/10 flex items-center justify-between bg-gradient-to-r from-cyan-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <Database size={20} className="text-cyan-400" />
            <h3 className="text-lg font-bold text-white">节点列表</h3>
            <span className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
              共 {totalCount} 个
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-cyber-950/50 text-slate-400 uppercase text-xs font-bold border-b border-cyan-500/10">
              <tr>
                <th className="p-5 pl-6">
                  <span className="flex items-center gap-2"><Wifi size={14} className="text-cyan-500/50" /> 节点标识</span>
                </th>
                <th className="p-5">主机 IP 地址</th>
                <th className="p-5">
                  <span className="flex items-center gap-2"><Clock size={14} className="text-cyan-500/50" /> 采集周期</span>
                </th>
                <th className="p-5">运行状态</th>
                <th className="p-5">创建时间</th>
                <th className="p-5 text-right pr-6">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/5 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={40} className="animate-spin text-cyan-500/50"/>
                      <p className="text-slate-500">正在加载节点配置...</p>
                    </div>
                  </td>
                </tr>
              ) : (hosts || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-cyan-500/5 rounded-full border border-cyan-500/10">
                        <Server size={40} className="text-cyan-500/30"/>
                      </div>
                      <p className="text-slate-500">暂无采集节点</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <Plus size={16} /> 点击添加第一个节点
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                hosts.map((host, index) => (
                  <tr key={host.id} className="hover:bg-cyan-500/5 transition-all group">
                    <td className="p-5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                          host.collectStatus === 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          'bg-slate-800/50 text-slate-500 border border-slate-700'
                        }`}>
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <span className="font-mono text-xs text-slate-500">#{host.id}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="font-mono text-base text-white bg-cyber-950/50 px-3 py-1.5 rounded-lg border border-cyan-500/10">
                        {host.hostIp}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="text-cyan-400 font-medium">{host.collectFreq}</span>
                      <span className="text-slate-500 text-sm ml-1">分钟/次</span>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        host.collectStatus === 1 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 
                        host.collectStatus === 3 ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 
                        'bg-slate-800/50 text-slate-400 border border-slate-700'
                      }`}>
                        {host.collectStatus === 1 && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500"/>}
                        {host.collectStatus === 1 ? '运行中' : host.collectStatus === 2 ? '已暂停' : host.collectStatus === 3 ? '异常' : '已停止'}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-slate-500 font-mono">{host.createTime || '-'}</td>
                    <td className="p-5 text-right pr-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => toggleStatus(host)}
                          className={`p-2.5 rounded-lg border transition-all hover:scale-105 ${
                            host.collectStatus === 1 
                              ? 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10 hover:shadow-lg hover:shadow-amber-500/10' 
                              : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/10'
                          }`}
                          title={host.collectStatus === 1 ? "暂停采集" : "启动采集"}
                        >
                          {host.collectStatus === 1 ? <StopCircle size={18} /> : <PlayCircle size={18} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(host.id)}
                          className="p-2.5 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-500/10 transition-all hover:scale-105"
                          title="删除节点"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-cyber-900 border border-cyber-700 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-slide-up">
            <div className="flex justify-between items-center border-b border-cyber-800 pb-4">
              <h3 className="text-lg font-bold text-white">新建采集节点</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400 hover:text-white"/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">主机 IP 地址</label>
                <input 
                  required
                  className="w-full bg-cyber-950 border border-cyber-700 rounded-lg p-3 text-white outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent transition-all"
                  placeholder="例如: 192.168.1.100"
                  value={formData.hostIp}
                  onChange={e => setFormData({...formData, hostIp: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">采集频率 (分钟)</label>
                <input 
                  type="number"
                  min="1"
                  max="60"
                  required
                  className="w-full bg-cyber-950 border border-cyber-700 rounded-lg p-3 text-white outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent transition-all"
                  value={formData.collectFreq}
                  onChange={e => setFormData({...formData, collectFreq: parseInt(e.target.value)})}
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3 bg-cyber-accent text-cyber-900 font-bold rounded-lg hover:bg-cyan-400 transition-colors flex justify-center items-center gap-2 mt-2"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {submitting ? '保存中...' : '确认添加'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataCollection;