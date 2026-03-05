import React, { useState } from 'react';
import { Users, Filter, Send, Check, ChevronDown } from 'lucide-react';
import { CardData } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export function AudienceCard({ data, onUserClick, onConfirm }: { data: Extract<CardData, { type: 'audience' }>, onUserClick: (name: string) => void, onConfirm: () => void }) {
  const cycleMap = {
    'hour': '每小时更新',
    'day': '每日更新',
    'once': '一次性'
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm relative">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users size={16} />
            </div>
            人群预览
          </div>
          <div className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400">
            预估 {data.count.toLocaleString()} 人
          </div>
        </div>
        
        <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">人群包名称</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{data.name}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">更新周期</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{cycleMap[data.updateCycle]}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs text-zinc-500">抽样客户 (点击查看档案)</div>
          <div className="flex flex-wrap gap-2">
            {data.samples.map((sample, i) => (
              <button 
                key={i}
                onClick={() => onUserClick(sample)}
                className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-full text-xs text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onConfirm}
          disabled={data.confirmed}
          className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors mt-2 ${
            data.confirmed 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800/50' 
              : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100'
          }`}
        >
          {data.confirmed ? (
            <><Check size={16} /> 已确认创建</>
          ) : (
            '确认创建人群包'
          )}
        </button>
      </div>
    </div>
  );
}

export function ConfigCard({ data, onConfirm }: { data: Extract<CardData, { type: 'config' }>, onConfirm: () => void }) {
  const [sender, setSender] = useState(data.senders[0] || 'C端客服');
  const [blacklist, setBlacklist] = useState<string[]>(data.blacklists || []);
  
  const blacklistOptions = ['中介同行', '无购房需求', '频繁转派用户', '同事'];

  const toggleBlacklist = (option: string) => {
    if (data.confirmed) return;
    setBlacklist(prev => 
      prev.includes(option) ? prev.filter(i => i !== option) : [...prev, option]
    );
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Send size={16} />
          </div>
          推送任务配置
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500">发送人选择</label>
            <div className="relative">
                <select 
                    value={sender} 
                    onChange={(e) => setSender(e.target.value)}
                    disabled={data.confirmed}
                    className="w-full appearance-none px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-700 dark:text-zinc-300"
                >
                    <option value="C端客服">C端客服</option>
                    <option value="B端客服">B端客服</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-zinc-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500">黑名单过滤</label>
            <div className="flex flex-wrap gap-2">
                {blacklistOptions.map(opt => (
                    <button
                        key={opt}
                        onClick={() => toggleBlacklist(opt)}
                        disabled={data.confirmed}
                        className={`px-2 py-1 text-xs rounded border transition-colors ${
                            blacklist.includes(opt)
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 hover:bg-zinc-100'
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
          </div>
        </div>

        <button 
          onClick={onConfirm}
          disabled={data.confirmed}
          className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            data.confirmed 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800/50' 
              : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100'
          }`}
        >
          {data.confirmed ? (
            <><Check size={16} /> 已确认推送</>
          ) : (
            '确认推送'
          )}
        </button>
      </div>
    </div>
  );
}

export function ContentPreviewCard({ data }: { data: Extract<CardData, { type: 'content_preview' }> }) {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm mt-2">
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
           <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Send size={16} />
          </div>
          {data.title}
        </div>
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800">
          {data.content}
        </div>
      </div>
    </div>
  );
}

export function TaskSummaryCard({ data, onConfirm }: { data: Extract<CardData, { type: 'task_summary' }>, onConfirm: () => void }) {
  const fields = [
    { label: '任务名称', value: data.taskName },
    { label: '通道', value: data.channel },
    { label: '推送时间', value: data.pushTime },
    { label: '推送间隔', value: data.pushInterval },
    { label: '接收对象', value: data.recipient },
    { label: '发送人', value: data.sender },
  ];

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm mt-2">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Send size={16} />
          </div>
          任务信息确认
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          {fields.map((field, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-zinc-500">{field.label}</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate" title={field.value}>{field.value}</span>
            </div>
          ))}
          <div className="col-span-2 flex flex-col gap-1">
            <span className="text-zinc-500">发送内容</span>
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 break-all">
              {data.content}
            </div>
          </div>
        </div>

        <button 
          onClick={onConfirm}
          disabled={data.confirmed}
          className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors mt-2 ${
            data.confirmed 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800/50' 
              : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100'
          }`}
        >
          {data.confirmed ? (
            <><Check size={16} /> 已确认执行</>
          ) : (
            '确认执行任务'
          )}
        </button>
      </div>
    </div>
  );
}
