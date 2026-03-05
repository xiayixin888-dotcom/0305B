import React from 'react';
import { Search, ChevronDown, Filter, MoreHorizontal, User, RefreshCw, X } from 'lucide-react';
import { ProfileField } from './ProfileField';

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

export function Workspace() {
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


