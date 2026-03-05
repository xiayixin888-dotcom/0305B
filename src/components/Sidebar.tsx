import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Play, Square, ChevronRight, User, History, Plus } from 'lucide-react';
import { Message, Bubble, TaskItem, CardData } from '../types';
import { SmartInput } from './SmartInput';
import { TaskPlan } from './TaskPlan';
import { AudienceCard, ConfigCard, ContentPreviewCard, TaskSummaryCard } from './Cards';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  onClose: () => void;
  onOpenTab: (tabName: string) => void;
}

export function Sidebar({ onClose, onOpenTab }: SidebarProps) {
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
