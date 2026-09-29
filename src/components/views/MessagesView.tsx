import React, { useState } from 'react';
import { MessageSquare, Send, User, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ChatThread {
  id: string;
  studentName: string;
  itemTitle: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  avatar: string;
  messages: { sender: 'me' | 'them'; text: string; time: string }[];
}

const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'c1',
    studentName: 'Priya Sharma',
    itemTitle: 'University Student ID Card',
    lastMessage: 'Hey! I left the card at the Engineering Cafe front register.',
    time: '25m ago',
    unread: true,
    avatar: 'PS',
    messages: [
      { sender: 'them', text: 'Hi Divyansh! Did you lose your student ID near Engineering Block C?', time: '2:40 PM' },
      { sender: 'me', text: 'Yes! I was studying there right before lecture.', time: '2:42 PM' },
      { sender: 'them', text: 'Awesome. I left the card at the Engineering Cafe front register under your name!', time: '2:45 PM' }
    ]
  },
  {
    id: 'c2',
    studentName: 'Alex Rivera',
    itemTitle: 'AirPods Pro (2nd Gen)',
    lastMessage: 'Does your charging case have the small scratch near the connector?',
    time: '2h ago',
    unread: false,
    avatar: 'AR',
    messages: [
      { sender: 'them', text: 'Hey, I saw your post about lost AirPods at the gym locker.', time: '12:15 PM' },
      { sender: 'them', text: 'Does your charging case have the small scratch near the connector?', time: '12:16 PM' },
      { sender: 'me', text: 'Yes exactly! It has a tiny blue scratch on the bottom left.', time: '1:05 PM' }
    ]
  }
];

export const MessagesView: React.FC = () => {
  const [chats, setChats] = useState<ChatThread[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>('c1');
  const [inputText, setInputText] = useState('');

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      sender: 'me' as const,
      text: inputText.trim(),
      time: 'Just now'
    };

    setChats(
      chats.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              lastMessage: inputText.trim(),
              time: 'Just now',
              messages: [...c.messages, newMsg]
            }
          : c
      )
    );
    setInputText('');
  };

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Student Messaging
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Coordinate handoffs, verify ownership, and confirm safe item recovery
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
        {/* Thread List */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col">
          <div className="p-3 border-b border-slate-100 bg-slate-50/60 font-semibold text-xs text-slate-700">
            Active Conversations
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-xs ${
                  chat.id === activeChatId ? 'bg-indigo-50/40 border-l-2 border-indigo-600' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                    {chat.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 truncate">
                        {chat.studentName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {chat.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-600 font-medium truncate mt-0.5">
                      {chat.itemTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Body */}
        <div className="md:col-span-8 flex flex-col justify-between bg-slate-50/30">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center">
                {activeChat.avatar}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  {activeChat.studentName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Regarding: <span className="font-medium text-slate-800">{activeChat.itemTitle}</span>
                </p>
              </div>
            </div>

            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3" /> Campus Verified
            </span>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
            {activeChat.messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    m.sender === 'me'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                  {m.time}
                </span>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder={`Message ${activeChat.studentName}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
