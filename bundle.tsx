// Consolidated Imports
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AtSign, Bot, Check, CheckCircle2, ChevronDown, ChevronRight, Circle, FileText, Filter, History, Image as ImageIcon, Loader2, MessageSquare, MoreHorizontal, Play, Plus, RefreshCw, Search, Send, Slash, Square, User, Users, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// --- src/types.ts ---
type Role = 'user' | 'ai';

type TaskStatus = 'wait' | 'loading' | 'done';

interface TaskItem {
  id: string;
  text: string;
  status: TaskStatus;
}

type CardData = 
  | { type: 'audience'; name: string; count: number; updateCycle: 'hour' | 'day' | 'once'; samples: string[]; confirmed?: boolean }
  | { type: 'config'; senders: string[]; blacklists: string[]; confirmed?: boolean }
  | { type: 'content_preview'; title: string; content: string; confirmed?: boolean }
  | { type: 'task_summary'; taskName: string; channel: string; pushTime: string; pushInterval: string; recipient: string; content: string; sender: string; confirmed?: boolean };

interface Message {
  id: string;
  role: Role;
  content?: string;
  taskPlan?: TaskItem[];
  card?: CardData;
  progress?: number;
  actionButton?: { label: string; tabName: string };
}

interface Bubble {
  id: string;
  type: 'audience' | 'task';
  text: string;
  items: { id: string; name: string; tabName: string }[];
}

interface Tab {
  id: string;
  title: string;
  content: string;
}


// --- src/components/ProfileField.tsx ---

function ProfileField({ label, value, type, time }: { label: string, value: string, type: string, time: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800/50 pb-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-500">{label}</span>
        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 rounded">{type}</span>
      </div>
      <div className="font-medium text-zinc-900 dark:text-zinc-100">{value}</div>
      <div className="text-[10px] text-zinc-400">{time}</div>
    </div>
  );
}

// --- src/components/Cards.tsx ---

function AudienceCard({ data, onUserClick, onConfirm }: { data: Extract<CardData, { type: 'audience' }>, onUserClick: (name: string) => void, onConfirm: () => void }) {
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

function ConfigCard({ data, onConfirm }: { data: Extract<CardData, { type: 'config' }>, onConfirm: () => void }) {
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

function ContentPreviewCard({ data }: { data: Extract<CardData, { type: 'content_preview' }> }) {
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

function TaskSummaryCard({ data, onConfirm }: { data: Extract<CardData, { type: 'task_summary' }>, onConfirm: () => void }) {
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

// --- src/components/SmartInput.tsx ---

interface SmartInputProps {
  mode: '圈选模式' | '执行模式';
  setMode: (mode: '圈选模式' | '执行模式') => void;
  value: string;
  onChange: (val: string) => void;
  onSubmit: (val: string) => void;
  bubbles: Bubble[];
  onBubbleClick: (tabName: string) => void;
  activeBubbleId?: string | null;
  onBubbleToggle?: (id: string | null) => void;
  locked?: boolean;
}

function SmartInput({ mode, setMode, value, onChange, onSubmit, bubbles, onBubbleClick, activeBubbleId: propActiveBubbleId, onBubbleToggle, locked }: SmartInputProps) {
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [internalActiveBubbleId, setInternalActiveBubbleId] = useState<string | null>(null);
  const [atCategory, setAtCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeBubbleId = propActiveBubbleId !== undefined ? propActiveBubbleId : internalActiveBubbleId;
  const setActiveBubbleId = onBubbleToggle || setInternalActiveBubbleId;

  const lastAtIndex = value.lastIndexOf('@');
  const lastSlashIndex = value.lastIndexOf('/');

  const activeAtQuery = lastAtIndex !== -1 && !value.slice(lastAtIndex).includes(' ') ? value.slice(lastAtIndex + 1) : null;
  const activeSlashQuery = lastSlashIndex !== -1 && !value.slice(lastSlashIndex).includes(' ') ? value.slice(lastSlashIndex + 1) : null;

  const isAtActive = activeAtQuery !== null && (lastSlashIndex === -1 || lastAtIndex > lastSlashIndex);
  const isSlashActive = activeSlashQuery !== null && (lastAtIndex === -1 || lastSlashIndex > lastAtIndex);

  useEffect(() => {
    if (!isAtActive) {
      setAtCategory(null);
    }
  }, [isAtActive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isAtActive || isSlashActive) return; // Let menu handle enter if open
      if (!locked) {
        onSubmit(value);
      }
    }
  };

  const handleCategorySelect = (category: string) => {
    setAtCategory(category);
    inputRef.current?.focus();
  };

  const insertItem = (itemName: string) => {
    if (isAtActive) {
      const newVal = value.slice(0, lastAtIndex) + '@' + itemName + ' ';
      onChange(newVal);
      setAtCategory(null);
    } else if (isSlashActive) {
      const newVal = value.slice(0, lastSlashIndex) + '/' + itemName + ' ';
      onChange(newVal);
    }
    inputRef.current?.focus();
  };

  const getAllMockResults = (query: string) => {
    const allItems = [
      { category: '人群包', name: '南京100万客户' },
      { category: '人群包', name: '合肥政务区高意向人群' },
      { category: '人群包', name: '近30天活跃用户' },
      { category: '人群包', name: '未复购流失预警人群' },
      { category: '话术', name: '活动话术1' },
      { category: '话术', name: '春季上新问候' },
      { category: '话术', name: '催单话术' },
      { category: '话术', name: '流失挽回话术' },
      { category: '图片', name: '春季上新海报.png' },
      { category: '图片', name: '双十一大促.jpg' },
      { category: '图片', name: '产品介绍图.png' },
      { category: '小程序卡片', name: '商品详情页' },
      { category: '小程序卡片', name: '活动主会场' },
      { category: '小程序卡片', name: '会员中心' }
    ];
    return allItems.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  };

  const getMockResults = (category: string, query: string) => {
    let items: string[] = [];
    if (category === '人群包') items = ['南京100万客户', '合肥政务区高意向人群', '近30天活跃用户', '未复购流失预警人群'];
    if (category === '话术') items = ['活动话术1', '春季上新问候', '催单话术', '流失挽回话术'];
    if (category === '图片') items = ['春季上新海报.png', '双十一大促.jpg', '产品介绍图.png'];
    if (category === '小程序卡片') items = ['商品详情页', '活动主会场', '会员中心'];
    
    return items.filter(item => item.toLowerCase().includes(query.toLowerCase()));
  };

  const getCategoryIcon = (category: string) => {
    if (category === '人群包') return <Users size={14} />;
    if (category === '话术') return <MessageSquare size={14} />;
    if (category === '图片') return <ImageIcon size={14} />;
    if (category === '小程序卡片') return <FileText size={14} />;
    return <FileText size={14} />;
  };

  return (
    <div className={`relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm transition-all ${locked ? 'opacity-80' : 'focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500'}`}>
      
      {/* Bubbles Area */}
      {bubbles.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 pt-3 pb-1 relative">
          <AnimatePresence>
            {bubbles.map(bubble => (
              <div key={bubble.id} className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer border transition-colors ${
                    activeBubbleId === bubble.id 
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700'
                      : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-indigo-100 dark:border-indigo-800/50'
                  }`}
                  onClick={() => setActiveBubbleId(activeBubbleId === bubble.id ? null : bubble.id)}
                >
                  {bubble.type === 'audience' ? <Users size={12} /> : <Zap size={12} />}
                  {bubble.text}
                </motion.div>

                {/* Bubble List Popup */}
                <AnimatePresence>
                  {activeBubbleId === bubble.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-3 py-2 text-xs font-medium text-zinc-500 border-b border-zinc-100 dark:border-zinc-700">
                        {bubble.type === 'audience' ? '人群包列表' : '任务列表'}
                      </div>
                      <div className="p-1">
                        {bubble.items.map(item => (
                          <div 
                            key={item.id}
                            className="flex items-center gap-2 px-2 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md cursor-pointer transition-colors"
                            onClick={() => {
                              setActiveBubbleId(null);
                              onBubbleClick(item.tabName);
                            }}
                          >
                            <span className="text-zinc-400">
                              {bubble.type === 'audience' ? <Users size={14} /> : <Zap size={14} />}
                            </span>
                            <span className="truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Top Bar: Mode Selector */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 relative">
        <div>
          <button 
            onClick={() => !locked && setShowModeDropdown(!showModeDropdown)}
            disabled={locked}
            className="flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
          >
            {mode}
            <ChevronDown size={12} />
          </button>
          
          <AnimatePresence>
            {showModeDropdown && !locked && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-3 mt-1 w-32 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden z-50"
              >
                <div 
                  className="px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer text-zinc-700 dark:text-zinc-300"
                  onClick={() => { setMode('圈选模式'); setShowModeDropdown(false); }}
                >
                  圈选模式
                </div>
                <div 
                  className="px-3 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer text-zinc-700 dark:text-zinc-300"
                  onClick={() => { setMode('执行模式'); setShowModeDropdown(false); }}
                >
                  执行模式
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Textarea Wrapper */}
      <div className="relative w-full">
        {/* Mirror div for @ placeholder */}
        {isAtActive && atCategory && activeAtQuery === '' && (
          <div className="absolute inset-0 px-3 py-2 text-sm font-sans leading-normal pointer-events-none whitespace-pre-wrap break-words overflow-hidden" aria-hidden="true">
            <span className="text-transparent">{value}</span>
            <span className="text-zinc-400 dark:text-zinc-500">请输入要引用的{atCategory}名称</span>
          </div>
        )}
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={locked ? "任务执行中，无法中止..." : "输入指令，或输入 @ 引用素材，/ 调用技能..."}
          disabled={locked}
          className="relative z-10 w-full bg-transparent border-none focus:ring-0 resize-none px-3 py-2 text-sm font-sans leading-normal text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 min-h-[60px] max-h-[200px] outline-none disabled:opacity-50"
          rows={2}
        />
      </div>

      {/* Bottom Toolbar */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              if (!locked) {
                onChange(value + '@');
                inputRef.current?.focus();
              }
            }}
            disabled={locked}
            className="p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors disabled:opacity-50"
            title="引用素材"
          >
            <AtSign size={16} />
          </button>
          <button 
            onClick={() => {
              if (!locked) {
                onChange(value + '/');
                inputRef.current?.focus();
              }
            }}
            disabled={locked}
            className="p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors disabled:opacity-50"
            title="调用技能"
          >
            <Slash size={16} />
          </button>
        </div>
        
        <button 
          onClick={() => !locked && onSubmit(value)}
          disabled={!value.trim() || locked}
          className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 text-white rounded-md transition-colors"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Popup Menus */}
      <AnimatePresence>
        {isAtActive && !locked && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50"
          >
            {!atCategory ? (
              activeAtQuery === '' ? (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-zinc-500 border-b border-zinc-100 dark:border-zinc-700">选择素材类型</div>
                  <div className="p-1">
                    <MenuItem icon={<Users size={14} />} label="人群包" onClick={() => handleCategorySelect('人群包')} />
                    <MenuItem icon={<MessageSquare size={14} />} label="话术" onClick={() => handleCategorySelect('话术')} />
                    <MenuItem icon={<ImageIcon size={14} />} label="图片" onClick={() => handleCategorySelect('图片')} />
                    <MenuItem icon={<FileText size={14} />} label="小程序卡片" onClick={() => handleCategorySelect('小程序卡片')} />
                  </div>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-zinc-500 border-b border-zinc-100 dark:border-zinc-700">搜索素材</div>
                  <div className="p-1 max-h-48 overflow-y-auto">
                    {getAllMockResults(activeAtQuery).map(res => (
                      <MenuItem 
                        key={res.name} 
                        icon={getCategoryIcon(res.category)} 
                        label={`[${res.category}] ${res.name}`} 
                        onClick={() => insertItem(res.name)} 
                      />
                    ))}
                    {getAllMockResults(activeAtQuery).length === 0 && (
                      <div className="px-3 py-4 text-center text-xs text-zinc-500">无匹配结果</div>
                    )}
                  </div>
                </>
              )
            ) : (
              <>
                <div className="px-3 py-2 text-xs font-medium text-zinc-500 border-b border-zinc-100 dark:border-zinc-700">搜索{atCategory}</div>
                <div className="p-1 max-h-48 overflow-y-auto">
                  {getMockResults(atCategory, activeAtQuery || '').map(res => (
                    <MenuItem key={res} icon={getCategoryIcon(atCategory)} label={res} onClick={() => insertItem(res)} />
                  ))}
                  {getMockResults(atCategory, activeAtQuery || '').length === 0 && (
                    <div className="px-3 py-4 text-center text-xs text-zinc-500">无匹配结果</div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
        
        {isSlashActive && !locked && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="px-3 py-2 text-xs font-medium text-zinc-500 border-b border-zinc-100 dark:border-zinc-700">调用技能</div>
            <div className="p-1">
              {mode === '圈选模式' ? (
                <MenuItem icon={<Users size={14} />} label="人群圈选" onClick={() => insertItem('人群圈选')} />
              ) : (
                <>
                  <MenuItem icon={<MessageSquare size={14} />} label="私聊推送" onClick={() => insertItem('私聊推送')} />
                  <MenuItem icon={<ImageIcon size={14} />} label="朋友圈推送" onClick={() => insertItem('朋友圈推送')} />
                  <MenuItem icon={<FileText size={14} />} label="内容生成" onClick={() => insertItem('内容生成')} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { key?: string | number, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <div 
      className="flex items-center gap-2 px-2 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md cursor-pointer transition-colors"
      onClick={onClick}
    >
      <span className="text-zinc-400">{icon}</span>
      {label}
    </div>
  );
}

// --- src/components/TaskPlan.tsx ---

function TaskPlan({ tasks }: { tasks: TaskItem[] }) {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
        执行计划
      </div>
      <div className="p-3 flex flex-col gap-3">
        {tasks.map((task, index) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-2 text-sm"
          >
            <div className="mt-0.5 shrink-0">
              {task.status === 'done' && <CheckCircle2 size={16} className="text-emerald-500" />}
              {task.status === 'loading' && <Loader2 size={16} className="text-indigo-500 animate-spin" />}
              {task.status === 'wait' && <Circle size={16} className="text-zinc-300 dark:text-zinc-600" />}
            </div>
            <span className={`${task.status === 'done' ? 'text-zinc-500 dark:text-zinc-400 line-through decoration-zinc-300 dark:decoration-zinc-600' : 'text-zinc-800 dark:text-zinc-200'}`}>
              {task.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- src/components/Workspace.tsx ---

const sessionList = [
  { name: '余接', time: '13:39', msg: '你好，昨天未收到你的回复...', tag: '小B', unread: false },
  { name: 'ABC', time: '13:39', msg: '您好，市区近的四代住宅确实稀缺...', tag: 'AI', unread: false },
  { name: 'Eric Li', time: '13:39', msg: '芜湖路近新出了一些捡漏房，优惠...', tag: '', unread: false },
  { name: '何建军', time: '13:39', msg: '好的收到，我查下哈', tag: 'AI', unread: false },
  { name: '李玉祥', time: '13:39', msg: '看到您在关注庐阳区北部附近200...', tag: '', unread: false },
  { name: '饭团 awu', time: '13:39', msg: '最近滨湖新区新出了几套捡漏房...', tag: '', unread: false },
  { name: '萍🙏平安安🙏', time: '13:36', msg: '您关注我朋友圈标备元面谦次新房...', tag: 'AI', unread: false },
  { name: '我的梦想', time: '13:38', msg: '您这边关注我朋友圈发的元面谦次...', tag: '', unread: false },
  { name: '微笑', time: '13:39', msg: '电话18994020257', tag: '小B', unread: true },
];

const chatTabs = [
  { name: '杜小明精品大平层17...', active: false },
  { name: '磐云石业', active: false },
  { name: '灰太狼', active: false },
  { name: '升学规划王老师189...', active: false },
  { name: '圈子不同别硬入', active: false },
  { name: '10-16佰', active: false },
  { name: '春天', active: false },
  { name: '鹏', active: true },
];

function Workspace() {
  return (
    <div className="flex h-full w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden text-sm">
      {/* Left Panel: Session List */}
      <div className="w-[280px] border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">全部会话</span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="搜索客户名称" 
              className="w-full pl-3 pr-8 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs focus:outline-none focus:border-indigo-500"
            />
            <Search size={14} className="absolute right-2.5 top-2 text-zinc-400" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center justify-between px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs cursor-pointer">
              <span className="text-zinc-500">城市</span>
              <span className="flex items-center gap-1">全国 <ChevronDown size={12}/></span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center justify-between px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs cursor-pointer">
              <span className="text-zinc-500">客服名称</span>
              <span className="flex items-center gap-1">请选择 <ChevronDown size={12}/></span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <div className="flex gap-3 text-zinc-500">
              <span className="cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">只看我约</span>
              <span className="cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">未读</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              <Filter size={12} /> 最新消息
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessionList.map((session, i) => (
            <div key={i} className={`flex gap-3 p-3 border-b border-zinc-100 dark:border-zinc-800/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 ${i === 0 ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 shrink-0 overflow-hidden">
                <img src={`https://picsum.photos/seed/${session.name}/40/40`} alt="avatar" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{session.name}</span>
                  <span className="text-xs text-zinc-400 shrink-0">{session.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 truncate flex-1">{session.msg}</span>
                  {session.tag && (
                    <span className={`text-[10px] px-1 rounded border shrink-0 ${session.tag === 'AI' ? 'text-pink-500 border-pink-200 bg-pink-50 dark:bg-pink-950/30 dark:border-pink-900' : 'text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900'}`}>
                      {session.tag}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Panel: Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950">
        {/* Chat Tabs */}
        <div className="flex items-center gap-1 px-2 pt-2 pb-0 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto shrink-0 bg-zinc-50 dark:bg-zinc-900/30">
          {chatTabs.map((tab, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs cursor-pointer whitespace-nowrap border border-b-0 ${
                tab.active 
                  ? 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400 font-medium z-10 relative top-[1px]' 
                  : 'bg-zinc-100 dark:bg-zinc-900 border-transparent text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="truncate max-w-[120px]">{tab.name}</span>
              <X size={12} className="text-zinc-400 hover:text-red-500 shrink-0" />
            </div>
          ))}
        </div>

        {/* Chat Header */}
        <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-lg">鹏</span>
            <span className="text-emerald-500 text-xs bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">微信</span>
            <span className="text-xs text-zinc-500 ml-2">合肥 | AI找房</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800">
              有效会话线索
            </button>
            <button className="px-3 py-1.5 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
              切换AI
            </button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 bg-zinc-50/30 dark:bg-zinc-900/10">
          <div className="text-center text-xs text-zinc-400 my-2">2026-03-04 09:56:19 转AI接待</div>
          
          <ChatMessage 
            role="ai" 
            time="2026-03-04 09:56:46" 
            name="AI找房" 
            content="您好！我是您的选房师，扎根合肥13年了。全市房源我都很熟悉，很高兴能为您服务。" 
          />
          <ChatMessage 
            role="ai" 
            time="2026-03-04 09:57:10" 
            name="AI找房" 
            content="合肥楼市小阳春回暖明显，最近高新和柏堰湖板块关注度很高。您是看120平左右的三居室吗？这类优质房源卖得快，我可以为您筛选对比下。" 
          />
          <ChatMessage 
            role="user" 
            time="2026-03-04 10:03:11" 
            name="鹏 | AI找房" 
            content="筛选下" 
          />
          <ChatMessage 
            role="user" 
            time="2026-03-04 10:05:28" 
            name="鹏 | AI找房" 
            content="200万以内" 
          />
          <ChatMessage 
            role="ai" 
            time="2026-03-04 10:05:07" 
            name="AI找房" 
            content="好的，没问题。这两个板块目前有不少高性价比的急售房源。为了帮您精准匹配，咱们总价预算大概是控制在200万左右，还是300万以上呢？" 
          />
          
          <div className="text-center text-xs text-zinc-400 my-2">2026-03-04 10:06:22 AI转运营</div>
          
          <ChatMessage 
            role="ai" 
            time="2026-03-04 10:06:22" 
            name="运营-查妍碧" 
            isHumanOp 
            content="咱们想看多大面积的，青龙岗附近有新房可考虑看看？" 
          />
          <ChatMessage 
            role="ai" 
            time="2026-03-04 10:06:20" 
            name="运营-查妍碧" 
            isHumanOp 
            content="好的，您的需求已了解。我这就为您筛选近期调价的优质房源，重点对比下高性价比的户型，整理好后发您，请稍候。" 
          />
          <ChatMessage 
            role="user" 
            time="2026-03-04 10:07:54" 
            name="鹏 | AI找房" 
            content="120左右 不考虑 主要考虑柏堰湖区域" 
          />
        </div>
      </div>

      {/* Right Panel: Customer Profile */}
      <div className="w-[280px] border-l border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 bg-white dark:bg-zinc-950">
        <div className="flex flex-wrap gap-x-4 gap-y-2 p-3 border-b border-zinc-200 dark:border-zinc-800 text-xs">
          <span className="font-medium text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 pb-1">客户档案</span>
          <span className="text-zinc-500 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">客户画像</span>
          <span className="text-zinc-500 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">客户行为</span>
          <span className="text-zinc-500 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">快捷话术</span>
          <span className="text-zinc-500 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">流转记录</span>
          <span className="text-zinc-500 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">聊天记录</span>
        </div>
        <div className="p-3 flex justify-end">
          <button className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
            <RefreshCw size={12} /> 刷新
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <ProfileField label="意向价格" value="200万以内" type="固定" time="2026-03-04 10:18:35" />
          <ProfileField label="意向购房面积/户型" value="120平左右" type="固定" time="2026-03-04 10:18:35" />
          <ProfileField label="用户交易偏好" value="买房" type="固定" time="2026-03-04 10:18:35" />
          <ProfileField label="用户所在城市" value="合肥" type="固定" time="2026-03-04 10:18:35" />
          <ProfileField label="意向区域" value="柏堰湖区域" type="固定" time="2026-03-04 10:18:35" />
          <ProfileField label="订阅行为" value="是" type="动态" time="2026-03-04 10:18:35" />
          <ProfileField label="价格敏感度" value="高敏感度" type="动态" time="2026-03-04 10:18:35" />
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ role, time, name, content, isHumanOp }: { role: 'user' | 'ai', time: string, name: string, content: string, isHumanOp?: boolean }) {
  const isAI = role === 'ai';
  return (
    <div className={`flex flex-col gap-1 ${isAI ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        {isAI ? (
          <>
            <span>{time}</span>
            <span>{name}</span>
            {isHumanOp && <span className="bg-orange-500 text-white px-1 rounded text-[10px]">运营</span>}
          </>
        ) : (
          <>
            <User size={12} />
            <span>{time}</span>
          </>
        )}
      </div>
      <div className="flex gap-2 max-w-[70%]">
        {!isAI && (
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 shrink-0 mt-1 overflow-hidden">
             <img src="https://picsum.photos/seed/user/32/32" alt="user" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
          </div>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm ${isAI ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded-tr-sm' : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'}`}>
          {content}
        </div>
        {isAI && (
          <div className="w-8 h-8 rounded-full bg-blue-500 shrink-0 mt-1 flex items-center justify-center text-white">
            <User size={16} />
          </div>
        )}
      </div>
    </div>
  );
}



// --- src/components/Sidebar.tsx ---

interface SidebarProps {
  onClose: () => void;
  onOpenTab: (tabName: string) => void;
}

function Sidebar({ onClose, onOpenTab }: SidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'ai', content: '你好！我是你的 AI 私域助手。你可以让我帮你圈选人群，或者创建推送任务。' }
  ]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [mode, setMode] = useState<'圈选模式' | '执行模式'>('圈选模式');
  const [inputValue, setInputValue] = useState('');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [currentScenario, setCurrentScenario] = useState<1 | 2 | null>(null);
  const [slideOverUser, setSlideOverUser] = useState<string | null>(null);
  const [activeBubbleId, setActiveBubbleId] = useState<string | null>(null);
  const [inputLocked, setInputLocked] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputValueRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, bubbles, slideOverUser]);

  // Sync ref with state for manual typing
  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  // Demo Runner Logic
  useEffect(() => {
    if (!isPlaying || currentScenario === null) return;

    const script1 = [
      { type: 'SET_MODE', payload: '圈选模式', delay: 500 },
      { type: 'TYPE_TEXT', payload: '帮我圈选合肥市有学区房需求的用户，预算在 100 万左右。', delay: 800 },
      { type: 'SEND_MESSAGE', delay: 500 },
      { type: 'ADD_TASK_PLAN', payload: [{id: '1', text: '意图解析：合肥市+学区房需求', status: 'loading'}], delay: 800 },
      { type: 'UPDATE_TASK_PLAN', payload: [{id: '1', text: '意图解析：合肥市+学区房需求', status: 'done'}, {id: '2', text: '计划拆解：提取城市、需求标签', status: 'loading'}], delay: 800 },
      { type: 'UPDATE_TASK_PLAN', payload: [{id: '1', text: '意图解析：合肥市+学区房需求', status: 'done'}, {id: '2', text: '计划拆解：提取城市、需求标签', status: 'done'}], delay: 800 },
      { type: 'ADD_AI_MESSAGE_STREAM', payload: '已锁定合肥市学区房需求群体，请问预算范围是？', delay: 500 },
      { type: 'TYPE_TEXT', payload: '100 万以内', delay: 1500 },
      { type: 'SEND_MESSAGE', delay: 500 },
      { type: 'ADD_AI_MESSAGE_STREAM', payload: '收到。为您确认圈选条件：\n\n城市：合肥市\n需求：学区房\n预算：100万以内\n\n是否确认生成人群包？', delay: 500 },
      { type: 'TYPE_TEXT', payload: '确认', delay: 1500 },
      { type: 'SEND_MESSAGE', delay: 500 },
      { type: 'ADD_CARD', payload: { type: 'audience', name: '合肥100w学区房', count: 1285, updateCycle: 'once', samples: ['张三', '李四', '王五'] }, delay: 1000 },
      { type: 'OPEN_SLIDE_OVER', payload: '张三', delay: 1500 },
      { type: 'CLOSE_SLIDE_OVER', delay: 2500 },
      { type: 'CLICK_CARD_CONFIRM', delay: 1000 },
      { type: 'SEND_MESSAGE_DIRECT', payload: '确认创建', delay: 500 },
      { type: 'LOCK_INPUT', delay: 0 },
      { type: 'ADD_PROGRESS', payload: 0, delay: 500 },
      { type: 'UPDATE_PROGRESS', payload: 50, delay: 800 },
      { type: 'UPDATE_PROGRESS', payload: 100, delay: 800 },
      { type: 'ADD_AI_MESSAGE_STREAM', payload: '人群包‘合肥100w学区房’已创建完成。', actionButton: { label: '查看详情', tabName: '[AI] 合肥100w学区房' }, delay: 500 },
      { type: 'ADD_BUBBLE', payload: { id: 'b1', type: 'audience', text: '关联人群包(1)', items: [{ id: 'i1', name: '合肥100w学区房', tabName: '[AI] 合肥100w学区房' }] }, delay: 1000 },
      { type: 'TOGGLE_BUBBLE', payload: 'b1', delay: 1500 },
      { type: 'CLICK_BUBBLE_ITEM', payload: '[AI] 合肥100w学区房', delay: 1500 },
      { type: 'END', delay: 0 }
    ];

    const script2 = [
      { type: 'SET_MODE', payload: '执行模式', delay: 500 },
      { type: 'TYPE_TEXT', payload: '每天中午 11:30，私聊发送 @活动话术1，发送人选择 C 端客服。', delay: 800 },
      { type: 'SEND_MESSAGE', delay: 500 },
      { type: 'ADD_AI_MESSAGE_STREAM', payload: '已为您提取 @活动话术1 的具体内容，请确认内容是否正确？', delay: 1000 },
      { type: 'ADD_CARD', payload: { type: 'content_preview', title: '素材预览 (@活动话术1)', content: '【限时特惠】合肥政务区学区房最新名单已出，点击查看...' }, delay: 500 },
      { type: 'TYPE_TEXT', payload: '没问题', delay: 2000 },
      { type: 'SEND_MESSAGE', delay: 500 },
      { type: 'ADD_CARD', payload: { type: 'config', senders: ['C端客服'], blacklists: [] }, delay: 1000 },
      { type: 'CLICK_CARD_CONFIRM', delay: 1500 },
      { type: 'SEND_MESSAGE_DIRECT', payload: '确认配置', delay: 500 },
      { type: 'ADD_AI_MESSAGE_STREAM', payload: '请确认最终任务信息：', delay: 500 },
      { type: 'ADD_CARD', payload: { 
        type: 'task_summary', 
        taskName: '每日私聊推送_活动话术1',
        channel: '企微私聊',
        pushTime: '每日 11:30',
        pushInterval: '每天',
        recipient: '合肥100w学区房 (1,285人)',
        sender: 'C端客服',
        content: '【限时特惠】合肥政务区学区房最新名单已出，点击查看...'
      }, delay: 1000 },
      { type: 'CLICK_CARD_CONFIRM', delay: 1500 },
      { type: 'SEND_MESSAGE_DIRECT', payload: '确认执行任务', delay: 500 },
      { type: 'ADD_PROGRESS', payload: 0, delay: 500 },
      { type: 'UPDATE_PROGRESS', payload: 30, delay: 800 },
      { type: 'TYPE_TEXT', payload: '停一下', delay: 500 },
      { type: 'SEND_MESSAGE', delay: 500 },
      { type: 'ADD_AI_MESSAGE_STREAM', payload: '任务已锁定，无法中止。', delay: 500 },
      { type: 'UPDATE_PROGRESS', payload: 100, delay: 1000 },
      { type: 'ADD_AI_MESSAGE_STREAM', payload: '推送任务已排期成功！\n\n任务名称：每日私聊推送_活动话术1\n预估覆盖：1,285 人\n发送内容：【限时特惠】合肥政务区学区房最新名单已出...\n发送人：C端客服\n黑名单过滤：未设置\n执行时间：每日 11:30', actionButton: { label: '查看详情', tabName: '[AI] 每日私聊推送_活动话术1' }, delay: 500 },
      { type: 'ADD_BUBBLE', payload: { id: 'b2', type: 'task', text: '关联推送任务(1)', items: [{ id: 'i2', name: '每日私聊推送_活动话术1', tabName: '[AI] 每日私聊推送_活动话术1' }] }, delay: 1000 },
      { type: 'TOGGLE_BUBBLE', payload: 'b2', delay: 1500 },
      { type: 'CLICK_BUBBLE_ITEM', payload: '[AI] 每日私聊推送_活动话术1', delay: 1500 },
      { type: 'END', delay: 0 }
    ];

    const currentScript = currentScenario === 1 ? script1 : script2;
    const step = currentScript[demoStep];

    if (!step) {
      setIsPlaying(false);
      return;
    }

    demoTimeoutRef.current = setTimeout(() => {
      switch (step.type) {
        case 'SET_MODE':
          setMode(step.payload as any);
          setDemoStep(s => s + 1);
          break;
        case 'TYPE_TEXT':
          let i = 0;
          inputValueRef.current = '';
          const text = step.payload as string;
          const typeChar = () => {
            if (i < text.length) {
              inputValueRef.current += text.charAt(i);
              setInputValue(inputValueRef.current);
              i++;
              demoTimeoutRef.current = setTimeout(typeChar, 30);
            } else {
              setDemoStep(s => s + 1);
            }
          };
          typeChar();
          return;
        case 'SEND_MESSAGE': {
          const text = inputValueRef.current;
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
          setInputValue('');
          inputValueRef.current = '';
          setDemoStep(s => s + 1);
          break;
        }
        case 'SEND_MESSAGE_DIRECT':
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: step.payload as string }]);
          setDemoStep(s => s + 1);
          break;
        case 'ADD_TASK_PLAN':
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', taskPlan: step.payload as TaskItem[] }]);
          setDemoStep(s => s + 1);
          break;
        case 'UPDATE_TASK_PLAN':
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg && lastMsg.role === 'ai') {
              lastMsg.taskPlan = step.payload as TaskItem[];
            }
            return newMsgs;
          });
          setDemoStep(s => s + 1);
          break;
        case 'ADD_AI_MESSAGE_STREAM':
          const msgId = Date.now().toString();
          setMessages(prev => [...prev, { id: msgId, role: 'ai', content: '', actionButton: step.actionButton as any }]);
          let streamI = 0;
          const streamText = step.payload as string;
          const streamChar = () => {
            if (streamI < streamText.length) {
              setMessages(prev => {
                const newMsgs = [...prev];
                const target = newMsgs.find(m => m.id === msgId);
                if (target) {
                  target.content = streamText.substring(0, streamI + 1);
                }
                return newMsgs;
              });
              streamI++;
              demoTimeoutRef.current = setTimeout(streamChar, 30);
            } else {
              setDemoStep(s => s + 1);
            }
          };
          streamChar();
          return;
        case 'ADD_CARD':
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            // If the last message is AI and doesn't have a card, attach it.
            // BUT, if the last message is AI and HAS content, maybe we want to attach to it?
            // Or create a new message?
            // In script2, we have ADD_AI_MESSAGE_STREAM then ADD_CARD.
            // We should probably attach to the last message if it's AI and has no card.
            if (lastMsg && lastMsg.role === 'ai' && !lastMsg.card) {
                lastMsg.card = step.payload as CardData;
            } else {
                newMsgs.push({ id: Date.now().toString(), role: 'ai', card: step.payload as CardData });
            }
            return newMsgs;
          });
          setDemoStep(s => s + 1);
          break;
        case 'OPEN_SLIDE_OVER':
          setSlideOverUser(step.payload as string);
          setDemoStep(s => s + 1);
          break;
        case 'CLOSE_SLIDE_OVER':
          setSlideOverUser(null);
          setDemoStep(s => s + 1);
          break;
        case 'CLICK_CARD_CONFIRM':
          setMessages(prev => {
            const newMsgs = [...prev];
            // Find the last card and mark confirmed
            for (let i = newMsgs.length - 1; i >= 0; i--) {
                if (newMsgs[i].card) {
                    newMsgs[i].card!.confirmed = true;
                    break;
                }
            }
            return newMsgs;
          });
          setDemoStep(s => s + 1);
          break;
        case 'LOCK_INPUT':
          setInputLocked(true);
          setDemoStep(s => s + 1);
          break;
        case 'ADD_PROGRESS':
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', progress: step.payload as number }]);
          setDemoStep(s => s + 1);
          break;
        case 'UPDATE_PROGRESS':
           setMessages(prev => {
            const newMsgs = [...prev];
            for (let i = newMsgs.length - 1; i >= 0; i--) {
                if (newMsgs[i].progress !== undefined) {
                    newMsgs[i].progress = step.payload as number;
                    break;
                }
            }
            return newMsgs;
          });
          setDemoStep(s => s + 1);
          break;
        case 'ADD_BUBBLE':
          setBubbles(prev => [...prev, step.payload as Bubble]);
          setDemoStep(s => s + 1);
          break;
        case 'TOGGLE_BUBBLE':
          setActiveBubbleId(step.payload as string);
          setDemoStep(s => s + 1);
          break;
        case 'CLICK_BUBBLE_ITEM':
          onOpenTab(step.payload as string);
          onClose();
          setDemoStep(s => s + 1);
          break;
        case 'END':
          setIsPlaying(false);
          setCurrentScenario(null);
          setInputLocked(false);
          setDemoStep(s => s + 1);
          break;
      }
    }, step.delay);

    return () => {
      if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    };
  }, [isPlaying, demoStep, currentScenario]);

  const startDemo = (scenario: 1 | 2) => {
    setInputValue('');
    inputValueRef.current = '';
    setSlideOverUser(null);
    setActiveBubbleId(null);
    setInputLocked(false);
    setDemoStep(0);
    setCurrentScenario(scenario);
    setIsPlaying(true);
  };

  const stopDemo = () => {
    setIsPlaying(false);
    setInputLocked(false);
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim() || inputLocked) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setInputValue('');
    inputValueRef.current = '';
    setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: '收到您的指令，正在处理中...' }]);
    }, 500);
  };

  const handleNewChat = () => {
    setMessages([{ id: Date.now().toString(), role: 'ai', content: '你好！我是你的 AI 私域助手。有什么我可以帮你的？' }]);
    setBubbles([]);
    setInputValue('');
    inputValueRef.current = '';
    setSlideOverUser(null);
    setActiveBubbleId(null);
    setInputLocked(false);
    stopDemo();
  };

  const loadHistoryDemo = () => {
    setMessages([
      { id: 'init', role: 'ai', content: '你好！我是你的 AI 私域助手。你可以让我帮你圈选人群，或者创建推送任务。' },
      { id: 'u1', role: 'user', content: '帮我圈选合肥市有学区房需求的用户，预算在 100 万左右。' },
      { id: 'a1', role: 'ai', taskPlan: [{id: '1', text: '意图解析：合肥市+学区房需求', status: 'done'}, {id: '2', text: '计划拆解：提取城市、需求标签', status: 'done'}] },
      { id: 'a2', role: 'ai', content: '已锁定合肥市学区房需求群体，请问预算范围是？' },
      { id: 'u2', role: 'user', content: '100 万以内' },
      { id: 'a2_confirm', role: 'ai', content: '收到。为您确认圈选条件：\n- 城市：合肥市\n- 需求：学区房\n- 预算：100万以内\n\n是否确认生成人群包？' },
      { id: 'u2_confirm', role: 'user', content: '确认' },
      { id: 'a3', role: 'ai', card: { type: 'audience', name: '合肥100w学区房', count: 1285, updateCycle: 'once', samples: ['张三', '李四', '王五'], confirmed: true } },
      { id: 'u3', role: 'user', content: '确认创建' },
      { id: 'a4', role: 'ai', progress: 100 },
      { id: 'a5', role: 'ai', content: '人群包‘合肥100w学区房’已创建完成。', actionButton: { label: '查看详情', tabName: '[AI] 合肥100w学区房' } },
      { id: 'u4', role: 'user', content: '每天中午 11:30，私聊发送 @活动话术1，发送人选择 C 端客服。' },
      { id: 'a6', role: 'ai', content: '已为您提取 @活动话术1 的具体内容，请确认内容是否正确？', card: { type: 'content_preview', title: '素材预览 (@活动话术1)', content: '【限时特惠】合肥政务区学区房最新名单已出，点击查看...' } },
      { id: 'u5', role: 'user', content: '没问题' },
      { id: 'a7', role: 'ai', card: { type: 'config', senders: ['C端客服'], blacklists: [], confirmed: true } },
      { id: 'u6', role: 'user', content: '确认配置' },
      { id: 'a7_summary_msg', role: 'ai', content: '请确认最终任务信息：' },
      { id: 'a7_summary', role: 'ai', card: { 
        type: 'task_summary', 
        taskName: '每日私聊推送_活动话术1',
        channel: '企微私聊',
        pushTime: '每日 11:30',
        pushInterval: '每天',
        recipient: '合肥100w学区房 (1,285人)',
        sender: 'C端客服',
        content: '【限时特惠】合肥政务区学区房最新名单已出，点击查看...',
        confirmed: true
      } },
      { id: 'u6_exec', role: 'user', content: '确认执行任务' },
      { id: 'a8', role: 'ai', progress: 30 },
      { id: 'u7', role: 'user', content: '停一下' },
      { id: 'a9', role: 'ai', content: '任务已锁定，无法中止。' },
      { id: 'a10', role: 'ai', progress: 100 },
      { id: 'a11', role: 'ai', content: '推送任务已排期成功！\n\n任务名称：每日私聊推送_活动话术1\n预估覆盖：1,285 人\n发送内容：【限时特惠】合肥政务区学区房最新名单已出...\n发送人：C端客服\n黑名单过滤：未设置\n执行时间：每日 11:30', actionButton: { label: '查看详情', tabName: '[AI] 每日私聊推送_活动话术1' } }
    ]);
    setBubbles([
      { id: 'b1', type: 'audience', text: '关联人群包(1)', items: [{ id: 'i1', name: '合肥100w学区房', tabName: '[AI] 合肥100w学区房' }] },
      { id: 'b2', type: 'task', text: '关联推送任务(1)', items: [{ id: 'i2', name: '每日私聊推送_活动话术1', tabName: '[AI] 每日私聊推送_活动话术1' }] }
    ]);
    setMode('执行模式');
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
          <Bot size={18} className="text-indigo-500" />
          <span>365AI私域助手</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleNewChat} className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500" title="新建对话">
            <Plus size={16} />
          </button>
          <button onClick={() => setShowHistory(true)} className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500" title="历史对话">
            <History size={16} />
          </button>
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500" title="关闭">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0 flex flex-col gap-2">
        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Demo Scenarios</div>
        <div className="flex gap-2">
          <button 
            onClick={() => isPlaying && currentScenario === 1 ? stopDemo() : startDemo(1)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${isPlaying && currentScenario === 1 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'}`}
          >
            {isPlaying && currentScenario === 1 ? <Square size={12} /> : <Play size={12} />}
            场景1: 圈选
          </button>
          <button 
            onClick={() => isPlaying && currentScenario === 2 ? stopDemo() : startDemo(2)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${isPlaying && currentScenario === 2 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'}`}
          >
            {isPlaying && currentScenario === 2 ? <Square size={12} /> : <Play size={12} />}
            场景2: 执行
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.content && (
                <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              )}
              {msg.taskPlan && <TaskPlan tasks={msg.taskPlan} />}
              {msg.card && msg.card.type === 'audience' && <AudienceCard data={msg.card} onUserClick={setSlideOverUser} onConfirm={() => {}} />}
              {msg.card && msg.card.type === 'config' && <ConfigCard data={msg.card} onConfirm={() => {}} />}
              {msg.card && msg.card.type === 'content_preview' && <ContentPreviewCard data={msg.card} />}
              {msg.card && msg.card.type === 'task_summary' && <TaskSummaryCard data={msg.card} onConfirm={() => {}} />}
              {msg.progress !== undefined && (
                <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                    <span>执行进度</span>
                    <span>{msg.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${msg.progress}%` }}
                      transition={{ ease: "linear", duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
              {msg.actionButton && (
                <button 
                  onClick={() => {
                    onOpenTab(msg.actionButton!.tabName);
                    onClose();
                  }}
                  className="mt-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  {msg.actionButton.label}
                </button>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 pt-0 shrink-0">
        <SmartInput 
          mode={mode} 
          setMode={setMode} 
          value={inputValue} 
          onChange={setInputValue} 
          onSubmit={handleSendMessage}
          bubbles={bubbles}
          onBubbleClick={(tabName) => {
            onOpenTab(tabName);
            onClose();
          }}
          activeBubbleId={activeBubbleId}
          onBubbleToggle={setActiveBubbleId}
          locked={inputLocked}
        />
      </div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 left-0 right-0 bottom-0 bg-white dark:bg-zinc-900 z-30 flex flex-col"
          >
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-medium text-sm text-zinc-800 dark:text-zinc-200 flex justify-between items-center">
              历史对话
              <button onClick={() => setShowHistory(false)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {[
                { title: '圈选合肥学区房用户并推送活动', date: '今天 10:30', crowdPackCount: 1, pushTaskCount: 1, onClick: loadHistoryDemo },
                { title: '生成朋友圈文案', date: '昨天 15:20', crowdPackCount: 0, pushTaskCount: 0, onClick: () => setShowHistory(false) },
                { title: '分析近期客户流失原因', date: '3月1日 09:15', crowdPackCount: 1, pushTaskCount: 0, onClick: () => setShowHistory(false) }
              ].map((item, i) => (
                <div key={i} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors border-b border-zinc-100 dark:border-zinc-800/50 last:border-0" onClick={item.onClick}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.title}</div>
                    <div className="text-xs text-zinc-500">{item.date}</div>
                  </div>
                  <div className="flex gap-2">
                    {item.crowdPackCount > 0 && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">人群包({item.crowdPackCount})</span>
                    )}
                    {item.pushTaskCount > 0 && (
                        <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">推送任务({item.pushTaskCount})</span>
                    )}
                    {item.crowdPackCount === 0 && item.pushTaskCount === 0 && (
                         <span className="text-xs text-zinc-400">无关联数据</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over Profile */}
      <AnimatePresence>
        {slideOverUser && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-white dark:bg-zinc-900 z-50 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.1)] dark:shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 shrink-0">
              <button onClick={() => setSlideOverUser(null)} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                <ChevronRight size={16} className="rotate-180" />
                返回
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0">
                  <img src={`https://picsum.photos/seed/${slideOverUser}/64/64`} alt="avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{slideOverUser}</h2>
                  <p className="text-sm text-zinc-500 mt-1">ID: WX_{Math.floor(Math.random() * 1000000)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">用户标签</h3>
                <div className="flex flex-wrap gap-2">
                  {['合肥市', '政务区', '学区房需求', '高意向', '100万预算'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md text-xs border border-indigo-100 dark:border-indigo-800/50">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">最近沟通记录</h3>
                <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
                  {[
                    { date: '今天 10:30', text: '咨询了政务区五十中附近的二手房。' },
                    { date: '昨天 15:20', text: '发送了春季购房指南，用户已读。' },
                    { date: '3月1日 09:15', text: '首次添加微信，标记为学区房需求。' }
                  ].map((record, i) => (
                    <div key={i} className="relative pl-8">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border-2 border-indigo-500 flex items-center justify-center z-10">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      </div>
                      <div className="text-xs text-zinc-500 mb-1">{record.date}</div>
                      <div className="text-sm text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        {record.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- src/App.tsx ---
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


function App() {
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


// --- main.tsx entry point ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
