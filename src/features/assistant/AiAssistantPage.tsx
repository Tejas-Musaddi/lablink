import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { BookingRequestModal } from '../discovery/BookingRequestModal';
import { Equipment } from '../../types';
import {
  Bot,
  Send,
  Sparkles,
  User as UserIcon,
  Cpu,
  Layers,
  ArrowRight,
  Clock,
  Terminal,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { processAssistantQuery, AssistantMessage } from '../../engine/assistantService';

export const AiAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const store = useAppStore();

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      content:
        `Welcome to the **LabLink AI Assistant**. I query live campus equipment inventories, lab schedules, and the deterministic Fair Allocation Engine.\n\n` +
        `How can I assist your laboratory research today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dataCards: {
        type: 'help',
        payload: null,
      },
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [equipmentToBook, setEquipmentToBook] = useState<Equipment | null>(null);

  const suggestedPrompts = [
    'Which lab is free right now?',
    'Which lab should I go to for my robotics project?',
    'Why was the DGX Station allocated to Aarav?',
    'Which GPU workstations or drone kits are available now?',
    'Recommend apparatus for training a vision-language foundation model',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim()) return;

    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    setTimeout(() => {
      const result = processAssistantQuery(text, store);
      const assistantMsg: AssistantMessage = {
        id: `msg-${Date.now()}-a`,
        sender: 'assistant',
        content: result.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalled: result.toolCalled,
        dataCards: result.dataCards,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-xs font-semibold text-primary-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            <span>Offline-First Grounded AI Assistant</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            LabLink AI Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Grounded directly on real store data. Queries live apparatus status, calculates recommendations, and explains allocation decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live State Connected
          </span>
        </div>
      </div>

      {/* Chat Container Card */}
      <Card className="flex flex-col h-[650px] shadow-card overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="h-8 w-8 rounded-xl bg-navy-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4 text-primary-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm space-y-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-slate-50 text-navy-900 border border-slate-200/80 shadow-2xs'
                }`}
              >
                {/* Tool Call Pill */}
                {msg.toolCalled && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold bg-white text-navy-800 px-2 py-1 rounded border border-slate-200">
                    <Terminal className="w-3 h-3 text-purple-600" />
                    <span>{msg.toolCalled}</span>
                  </div>
                )}

                <div className="whitespace-pre-line leading-relaxed">
                  {msg.content}
                </div>

                {/* Data Cards Render */}
                {msg.dataCards && msg.dataCards.type === 'equipment_list' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {(msg.dataCards.payload as Equipment[]).map((eq) => (
                      <div
                        key={eq.id}
                        className="rounded-xl border border-surface-border bg-white p-3 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-primary-600">
                            {eq.code}
                          </span>
                          <StatusChip status={eq.availability} size="sm" />
                        </div>
                        <h5 className="font-bold text-xs text-navy-900 line-clamp-1">
                          {eq.name}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {eq.categoryId}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/discovery?equipment=${eq.id}`)}
                            className="text-[10px] h-6 px-2"
                          >
                            Details
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setEquipmentToBook(eq);
                              setBookingModalOpen(true);
                            }}
                            className="text-[10px] h-6 px-2"
                          >
                            Book Slot
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.dataCards && msg.dataCards.type === 'lab_info' && Array.isArray(msg.dataCards.payload) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {msg.dataCards.payload.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-surface-border shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                            Room {item.lab.roomNumber}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            {item.availableEquipment} Free Units
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-navy-900 line-clamp-1">{item.lab.name}</h5>
                        <p className="text-[11px] text-slate-500">{item.lab.building || 'Campus Facility'}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                          <span>Hours: {item.lab.operatingHours.open} - {item.lab.operatingHours.close}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/labs')}
                            className="text-[10px] h-6 px-1.5 text-primary-600"
                            rightIcon={<ArrowRight className="w-3 h-3" />}
                          >
                            Explore Lab
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.dataCards && msg.dataCards.type === 'conflict_card' && (
                  <div className="p-3 bg-white rounded-xl border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Resolved Schedule
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/conflicts')}
                        className="text-[11px] h-6 text-primary-600"
                        rightIcon={<ArrowRight className="w-3 h-3" />}
                      >
                        Open Engine View
                      </Button>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Primary Slot: <strong>Aarav Sharma</strong> (Autonomous Drone Swarm) — 14:00 to 18:00 UTC.
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Shifted Equivalent: <strong>Elena Rostova</strong> (Vision LLM) — NVIDIA H100 SuperServer at 15:00 UTC.
                    </p>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right ${
                    msg.sender === 'user' ? 'text-primary-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="h-8 w-8 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center text-xs text-slate-500">
              <div className="h-8 w-8 rounded-xl bg-navy-900 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary-400 animate-spin" />
              </div>
              <span className="animate-pulse">
                Assistant is querying inventory and evaluating allocation rules...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Pills */}
        <div className="p-3 bg-slate-50 border-t border-surface-border overflow-x-auto no-scrollbar flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
            Suggested:
          </span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p)}
              className="text-xs bg-white text-navy-800 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 transition-colors px-3 py-1 rounded-full border border-surface-border whitespace-nowrap shadow-2xs font-medium focus:outline-none"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-surface-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask anything about equipment availability, allocation explanations, or project requirements..."
              className="flex-1 rounded-xl border border-surface-border bg-slate-50/50 px-4 py-2.5 text-sm text-navy-900 placeholder:text-slate-400 focus:bg-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={!inputPrompt.trim() || isTyping}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Ask
            </Button>
          </form>
        </div>
      </Card>

      {/* Booking Modal */}
      <BookingRequestModal
        equipment={equipmentToBook}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
};
