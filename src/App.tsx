/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, ChevronRight, Play, Square, Users, Send } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { Tab, Bubble } from './types';
import { ProfileField } from './components/ProfileField';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', title: '会话工作台', content: 'Main Content' }]);
  const [activeTabId, setActiveTabId] = useState('1');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const openTab = (tabName: string) => {
    const existing = tabs.find(t => t.title === tabName);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const newTab = { id: Date.now().toString(), title: tabName, content: `Content for ${tabName}` };
      setTabs([...tabs, newTab]);
      setActiveTabId(newTab.id);
    }
    setIsSidebarOpen(false);
  };

  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const renderTabContent = (tab: Tab) => {
    if (tab.id === '1') {
      return <Workspace />;
    }
    if (tab.title.includes('合肥100w学区房')) {
      return (
        <div className="w-full h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col gap-6 relative overflow-hidden">
          <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{tab.title}</h2>
              <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
                <span>预估人数: 1,285 人</span>
                <span>|</span>
                <span>圈选条件: 合肥市/意向价格100-200万/学区房</span>
                <span>|</span>
                <span>创建时间: 2026-03-05 10:00:00</span>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">客户昵称</th>
                  <th className="px-4 py-3 font-medium">城市/区域</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {['张三', '李四', '王五', '赵六', '钱七'].map((name, i) => (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/20">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{name}</td>
                    <td className="px-4 py-3 text-zinc-500">合肥市</td>
                    <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline" onClick={() => setSelectedUser(name)}>查看档案</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Profile Drawer */}
          <AnimatePresence>
            {selectedUser && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedUser(null)}
                  className="absolute inset-0 bg-black z-10"
                />
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="absolute right-0 top-0 bottom-0 w-[320px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 z-20 shadow-xl flex flex-col"
                >
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">客户档案</h3>
                    <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-500">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-lg font-bold">
                        {selectedUser[0]}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{selectedUser}</div>
                        <div className="text-xs text-zinc-500">合肥市 | 意向客户</div>
                      </div>
                    </div>
                    <ProfileField label="意向价格" value="100万左右" type="固定" time="2026-03-05 10:05:22" />
                    <ProfileField label="购房需求" value="学区房" type="固定" time="2026-03-05 10:05:22" />
                    <ProfileField label="预算范围" value="80-120万" type="动态" time="2026-03-05 10:06:15" />
                    <ProfileField label="关注区域" value="政务区、滨湖区" type="动态" time="2026-03-05 10:07:30" />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      );
    }
    if (tab.title.includes('每日私聊推送_活动话术1')) {
      return (
        <div className="w-full h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Send size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{tab.title}</h2>
              <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 状态: 待执行</span>
                 <span>|</span>
                 <span>创建时间: 2026-03-05 10:30:00</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4 bg-white dark:bg-zinc-900/50">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                基础信息
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">任务ID</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">TASK_20260305_001</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">任务名称</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{tab.title.replace('[AI] ', '')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">推送状态</span>
                    <span className="font-medium text-emerald-600">待执行</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">推送时间</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">11:30</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">推送间隔</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">每天</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">创建时间</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">2026-03-05 10:30:00</span>
                </div>
              </div>
            </div>

            {/* Config Info */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4 bg-white dark:bg-zinc-900/50">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                配置信息
              </h3>
              <div className="space-y-3 text-sm">
                 <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">通道</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">企微私聊</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">优先级</span>
                    <span className="font-medium text-orange-500">高</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">免打扰时段</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">22:00 - 08:00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">关联人群包</span>
                    <span className="font-medium text-indigo-600 cursor-pointer hover:underline">合肥100w学区房</span>
                </div>
                 <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">预估覆盖人数</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">1,285 人</span>
                </div>
              </div>
            </div>

            {/* Sender Config */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4 bg-white dark:bg-zinc-900/50">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                发送配置
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">发送人</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">C端客服</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-zinc-500">黑名单过滤</span>
                    <span className="font-medium text-zinc-400">无</span>
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4 bg-white dark:bg-zinc-900/50">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                推送内容
              </h3>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg text-sm text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 leading-relaxed">
                【限时特惠】合肥政务区学区房最新名单已出，点击查看...
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-6">
        <h2 className="text-xl font-bold mb-4 text-zinc-800 dark:text-zinc-200">{tab.title}</h2>
        <div className="space-y-4">
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
          <div className="h-32 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
          <div className="h-64 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden relative bg-gray-50 text-gray-900">
      {/* Mock Left Navigation */}
      <div className="w-16 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-4 gap-4 bg-white dark:bg-zinc-900 z-10 shrink-0">
         <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold">AI</div>
         <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800"></div>
         <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900 z-0">
        {/* Tabs Header */}
        <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-2 gap-1 overflow-x-auto shrink-0">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`px-4 py-1.5 rounded-md text-sm cursor-pointer whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTabId === tab.id 
                  ? 'bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100' 
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {tab.title}
              {tab.id !== '1' && (
                <X 
                  size={14} 
                  className="hover:text-red-500" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTabs(tabs.filter(t => t.id !== tab.id));
                    if (activeTabId === tab.id) setActiveTabId('1');
                  }}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {renderTabContent(tabs.find(t => t.id === activeTabId)!)}
        </div>
      </div>

      {/* Copilot Sidebar */}
      <motion.div 
        initial={false}
        animate={{ 
          x: isSidebarOpen ? 0 : 400,
          opacity: isSidebarOpen ? 1 : 0 
        }}
        transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.3 }}
        className="absolute right-0 top-0 bottom-0 w-[400px] border-l border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl flex flex-col z-40 shadow-2xl"
        style={{ pointerEvents: isSidebarOpen ? 'auto' : 'none' }}
      >
        <div className="w-full h-full flex flex-col">
          <Sidebar 
            onClose={toggleSidebar} 
            onOpenTab={openTab} 
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed right-6 bottom-6 z-50"
          >
            <button 
              onClick={toggleSidebar}
              className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
            >
              <Bot size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

