'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Bot, ArrowUp, ArrowRight, PanelRightClose, RotateCcw } from 'lucide-react';
import { ModelId } from '@/types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const ChatAssistant: React.FC = () => {
  const selectModel = useAppStore((state) => state.selectModel);
  const selectedModelId = useAppStore((state) => state.selectedModelId);
  const toggleChat = useAppStore((state) => state.toggleChat);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Chào anh/chị! Em là trợ lý số VinFast. Để tìm chiếc ô tô điện phù hợp nhất cho gia đình tại Hà Nội, anh/chị dự kiến <strong>ngân sách lăn bánh</strong> khoảng bao nhiêu và <strong>chỗ đỗ xe hàng ngày</strong> thế nào ạ?',
      timestamp: 'Vừa xong',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking]);

  const handleSelectScenario = (modelId: ModelId, userText: string, aiReply: string) => {
    setShowQuickOptions(false);
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: userText,
        timestamp: now,
      },
    ]);

    setIsAiThinking(true);

    setTimeout(() => {
      setIsAiThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      selectModel(modelId, true);
    }, 600);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        timestamp: now,
      },
    ]);
    setInputText('');
    setIsAiThinking(true);

    const lower = trimmed.toLowerCase();
    setTimeout(() => {
      setIsAiThinking(false);
      let replyText = '';
      let targetModel: ModelId = 'VF6';

      if (
        lower.includes('vf5') ||
        lower.includes('vf 5') ||
        lower.includes('500') ||
        lower.includes('dưới 600') ||
        lower.includes('tiết kiệm')
      ) {
        replyText =
          'Dạ với ngân sách tiết kiệm dưới 600 triệu lăn bánh, em đề xuất chiếc <strong>VinFast VF 5 Plus</strong>. Chi tiết xe & dự toán TCO đã tự động mở ra bên trái!';
        targetModel = 'VF5';
      } else if (
        lower.includes('vf7') ||
        lower.includes('vf 7') ||
        lower.includes('800') ||
        lower.includes('1 tỷ') ||
        lower.includes('tỷ') ||
        lower.includes('sang trọng')
      ) {
        replyText =
          'Dạ em nhận diện anh/chị cần mẫu SUV hạng C rộng rãi, tiện nghi cao cấp trên 800 triệu. Em đề xuất ngay chiếc <strong>VinFast VF 7 Eco</strong>!';
        targetModel = 'VF7';
      } else {
        replyText =
          'Dạ em ghi nhận nhu cầu của anh/chị. Dựa trên trần ngân sách 600 - 800 triệu và điều kiện đô thị Hà Nội, em mở đề xuất <strong>VinFast VF 6 Comfort</strong>!';
        targetModel = 'VF6';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      selectModel(targetModel, true);
    }, 700);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'm-1',
        sender: 'ai',
        text: 'Chào anh/chị! Em là trợ lý số VinFast. Để tìm chiếc ô tô điện phù hợp nhất cho gia đình tại Hà Nội, anh/chị dự kiến <strong>ngân sách lăn bánh</strong> khoảng bao nhiêu và <strong>chỗ đỗ xe hàng ngày</strong> thế nào ạ?',
        timestamp: 'Vừa xong',
      },
    ]);
    setShowQuickOptions(true);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden select-text">
      {/* Fixed Chat Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/90 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Trợ lý AI Tư vấn VinFast</span>
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500">Cố định hỗ trợ trực tuyến 24/7</span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleResetChat}
            title="Làm mới hội thoại"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            aria-label="Làm mới đoạn chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleChat}
            title="Thu gọn Trợ lý AI"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            aria-label="Đóng Trợ lý AI"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream - Independent Scrolling */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs" aria-live="polite">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              m.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                m.sender === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-brand-blue text-white shadow-xs'
              }`}
            >
              {m.sender === 'user' ? 'Tôi' : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3 rounded-2xl max-w-[85%] leading-relaxed space-y-1 shadow-2xs ${
                m.sender === 'user'
                  ? 'bg-brand-blue text-white rounded-tr-xs'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: m.text }}
                className="prose prose-xs max-w-none text-current"
              />
              <span
                className={`text-[9px] block text-right pt-0.5 ${
                  m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* AI Thinking Indicator */}
        {isAiThinking && (
          <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 rounded-tl-xs flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500">
                Đang tra cứu catalog & tính TCO
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Scenario Options */}
        {showQuickOptions && (
          <div className="pt-2 space-y-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500">
              Gợi ý nhu cầu phổ biến:
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleSelectScenario(
                    'VF5',
                    'Tôi có khoảng 500-600 triệu, đi làm trong phố, muốn tiết kiệm chi phí tối đa.',
                    'Dạ với ngân sách dưới 600 triệu và nhu cầu đi phố, em đề xuất <strong>VinFast VF 5 Plus</strong>. Xe nhỏ gọn, dễ luồn lách, chi phí sạc điện chỉ khoảng 500.000 đ/tháng!'
                  )
                }
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/70 hover:border-brand-accent/50 text-slate-700 hover:text-brand-blue text-xs transition flex items-center justify-between group shadow-2xs"
              >
                <span>Dưới 600 triệu · Đi phố (VF 5 Plus)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-accent group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectScenario(
                    'VF6',
                    'Tôi có ngân sách 700 triệu, gia đình 4 người, thỉnh thoảng về quê 150km.',
                    'Dạ với ngân sách 700 triệu và phục vụ gia đình 4 người, em đề xuất <strong>VinFast VF 6 Comfort</strong>. Xe rộng rãi, tầm chạy 510km (NEDC) thoải mái về quê cả tuần không lo hết pin!'
                  )
                }
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/70 hover:border-brand-accent/50 text-slate-700 hover:text-brand-blue text-xs transition flex items-center justify-between group shadow-2xs"
              >
                <span>600 - 800 triệu · Gia đình (VF 6 Comfort)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-accent group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectScenario(
                    'VF7',
                    'Tôi có tầm 850 triệu đến 1 tỷ, cần xe Crossover hạng C mạnh mẽ, công nghệ cao.',
                    'Dạ trong phân khúc trên 800 triệu, em đề xuất ngay <strong>VinFast VF 7 Eco</strong>. Mẫu C-SUV thiết kế thời thượng, nội thất sang trọng và hỗ trợ lái thông minh dẫn đầu phân khúc!'
                  )
                }
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/70 hover:border-brand-accent/50 text-slate-700 hover:text-brand-blue text-xs transition flex items-center justify-between group shadow-2xs"
              >
                <span>Trên 800 triệu · Sang trọng & ADAS (VF 7 Eco)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-accent group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form at Bottom */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-brand-accent focus-within:ring-2 focus-within:ring-blue-100 transition">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Hỏi về giá xe, pin, trạm sạc V-GREEN..."
            className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden py-1"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-7 h-7 rounded-lg bg-brand-blue text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition shrink-0"
            aria-label="Gửi tin nhắn"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-1.5">
          Dữ liệu kết nối biểu giá chính hãng VinFast & mạng lưới trạm sạc Hà Nội
        </p>
      </form>
    </div>
  );
};
