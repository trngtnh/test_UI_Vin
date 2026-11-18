'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Bot, ArrowUp, RotateCcw } from 'lucide-react';
import { ModelId } from '@/types';
import { CAR_CATALOG, VINFAST_FACILITIES } from '@/lib/catalog';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  recommendedModelId?: ModelId;
  recommendedModelName?: string;
  recommendedTag?: string;
}

export const AgentCopilotPane: React.FC = () => {
  const selectModel = useAppStore((state) => state.selectModel);
  const setCanvasMode = useAppStore((state) => state.setCanvasMode);
  const setJourneyStep = useAppStore((state) => state.setJourneyStep);
  const updateInputs = useAppStore((state) => state.updateInputs);
  const canvasMode = useAppStore((state) => state.canvasMode);
  const openComparisonModal = useAppStore((state) => state.openComparisonModal);
  const selectedCity = useAppStore((state) => state.selectedCity) || 'national';

  const currentFacility = VINFAST_FACILITIES[selectedCity] || VINFAST_FACILITIES.national;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Chào anh/chị. Em là Trợ lý AI VinFast O2O Tư vấn Toàn quốc. Bên phải là <strong>Sảnh chính trưng bày toàn bộ dải xe điện VinFast</strong> (VF 3 đến VF 9). Anh/chị có thể lướt xem tự do hoặc trao đổi cùng em về ngân sách, số chỗ ngồi và khu vực sinh sống để tìm chiếc xe ưng ý nhất.<br/><br/>Để bắt đầu, anh/chị dự kiến <strong>ngân sách lăn bánh khoảng bao nhiêu</strong> và <strong>nhu cầu di chuyển gia đình</strong> thế nào ạ?',
      timestamp: 'Vừa xong',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking]);

  const handleSelectScenario = (
    modelId: ModelId,
    modelName: string,
    modelTag: string,
    userText: string,
    aiReply: string
  ) => {
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
      selectModel(modelId, false);
      setCanvasMode('recommendations');
      setJourneyStep(2);

      if (modelId === 'VF3') {
        updateInputs({ daily_km: 25, charging_facility: 'vgreen' });
      } else if (modelId === 'VF5') {
        updateInputs({ daily_km: 35, charging_facility: 'home' });
      } else if (modelId === 'VF6') {
        updateInputs({ daily_km: 40, charging_facility: 'home' });
      } else if (modelId === 'VF7') {
        updateInputs({ daily_km: 50, charging_facility: 'home' });
      } else if (modelId === 'VF8') {
        updateInputs({ daily_km: 60, charging_facility: 'home' });
      } else if (modelId === 'VF9') {
        updateInputs({ daily_km: 70, charging_facility: 'home' });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          recommendedModelId: modelId,
          recommendedModelName: modelName,
          recommendedTag: modelTag,
        },
      ]);
    }, 600);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText('');

    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: userMsg,
        timestamp: now,
      },
    ]);

    setIsAiThinking(true);

    setTimeout(() => {
      setIsAiThinking(false);
      const lower = userMsg.toLowerCase();
      let replyText = '';
      let recModelId: ModelId = 'VF6';
      let recModelName = 'VinFast VF 6 Comfort';
      let recTag = 'Gia đình 600 - 800 triệu';

      const locationNotice = selectedCity !== 'national'
        ? `<em>Đã áp dụng chính sách ưu đãi và cơ sở lái thử tại ${currentFacility.cityName}.</em><br/><br/>`
        : '';

      if (
        lower.includes('so sánh') ||
        lower.includes('đối chiếu') ||
        lower.includes('khác nhau')
      ) {
        replyText =
          locationNotice +
          'Em đã mở <strong>Bảng So sánh Đa mẫu xe</strong> trên màn hình. Anh/chị có thể tích chọn 2 đến 3 mẫu xe bất kỳ để đối chiếu trực tiếp thông số kích thước, dung lượng pin, công nghệ ADAS và chi phí nuôi xe 5 năm.';
        openComparisonModal([]);
        recTag = 'So sánh 2-3 xe';
      } else if (
        lower.includes('300') ||
        lower.includes('350') ||
        lower.includes('vf 3') ||
        lower.includes('vf3') ||
        lower.includes('mini') ||
        lower.includes('nhỏ nhất')
      ) {
        replyText =
          locationNotice +
          'Với ngân sách quanh 300 - 350 triệu và nhu cầu xe đô thị nhỏ gọn dễ luồn lách, chiếc <strong>VinFast VF 3</strong> (322 triệu) là lựa chọn tiết kiệm nhất. Xe có tầm chạy 215 km/lần sạc, chi phí sử dụng chỉ khoảng 350đ/km.';
        recModelId = 'VF3';
        recModelName = 'VinFast VF 3';
        recTag = 'Đô thị Mini tiết kiệm';
      } else if (
        lower.includes('500') ||
        lower.includes('450') ||
        lower.includes('vf 5') ||
        lower.includes('vf5') ||
        lower.includes('dịch vụ') ||
        lower.includes('kinh doanh')
      ) {
        replyText =
          locationNotice +
          'Với tầm tiền dưới 500 triệu hoặc chạy dịch vụ kinh doanh, chiếc <strong>VinFast VF 5 Plus</strong> (496 triệu kèm pin) là lựa chọn kinh tế hàng đầu. Chi phí nuôi xe siêu rẻ, thu hồi vốn nhanh và không gian 5 chỗ đủ rộng rãi.';
        recModelId = 'VF5';
        recModelName = 'VinFast VF 5 Plus';
        recTag = 'Kinh tế & Dịch vụ';
      } else if (
        lower.includes('700') ||
        lower.includes('800') ||
        lower.includes('vf 7') ||
        lower.includes('vf7') ||
        lower.includes('thể thao') ||
        lower.includes('hạng c')
      ) {
        replyText =
          locationNotice +
          'Với phân khúc 700 triệu - 1 tỷ, chiếc C-SUV thể thao <strong>VinFast VF 7 Eco</strong> (850 triệu) là lựa chọn vượt trội với thiết kế cá tính, công suất mạnh mẽ 174 HP và hệ thống trợ lái ADAS thông minh.';
        recModelId = 'VF7';
        recModelName = 'VinFast VF 7 Eco';
        recTag = 'C-SUV Thể thao Công nghệ';
      } else if (
        lower.includes('1 tỷ') ||
        lower.includes('1.1') ||
        lower.includes('1.2') ||
        lower.includes('vf 8') ||
        lower.includes('vf8') ||
        lower.includes('hạng d')
      ) {
        replyText =
          locationNotice +
          'Với ngân sách từ 1 tỷ đến 1.3 tỷ cho dòng D-SUV gia đình cao cấp, chiếc <strong>VinFast VF 8 Eco</strong> (1.079 tỷ) mang lại không gian rộng rãi, công suất 349 HP 2 cầu AWD và hệ thống an toàn 5 sao tiêu chuẩn toàn cầu.';
        recModelId = 'VF8';
        recModelName = 'VinFast VF 8 Eco';
        recTag = 'D-SUV Toàn cầu 5 sao';
      } else if (
        lower.includes('7 chỗ') ||
        lower.includes('vf 9') ||
        lower.includes('vf9') ||
        lower.includes('hạng sang') ||
        lower.includes('hạng e') ||
        lower.includes('1.5 tỷ')
      ) {
        replyText =
          locationNotice +
          'Với nhu cầu SUV 7 chỗ cỡ lớn hạng E sang trọng hàng đầu, chiếc <strong>VinFast VF 9 Eco</strong> (1.589 tỷ) mang lại trải nghiệm thương gia, hệ thống treo êm ái cùng tiêu chuẩn an toàn tối đa cho gia đình hoặc công vụ cấp cao.';
        recModelId = 'VF9';
        recModelName = 'VinFast VF 9 Eco';
        recTag = 'E-SUV 7 chỗ Hạng sang';
      } else if (
        lower.includes('lãi suất') ||
        lower.includes('vay') ||
        lower.includes('trả góp') ||
        lower.includes('ngân hàng')
      ) {
        replyText =
          locationNotice +
          'Về chính sách trả góp, các ngân hàng đối tác hỗ trợ <strong>vay tối đa 80% giá trị xe trong 5-8 năm</strong>. Anh/chị có thể chọn phương thức <em>Gốc đều lãi giảm dần</em> (tiết kiệm tổng lãi) hoặc <em>Niên kim cố định</em> (tiền đóng hàng tháng bằng nhau dễ quản lý chi tiêu).';
      } else {
        replyText =
          locationNotice +
          'Em đã ghi nhận nhu cầu của anh/chị. Dựa trên trần ngân sách gia đình 600 - 800 triệu, chiếc <strong>VinFast VF 6 Comfort</strong> (phân khúc B-SUV, 5 chỗ rộng rãi, tầm chạy 510 km) là phương án cân bằng hoàn hảo nhất.';
        recModelId = 'VF6';
        recModelName = 'VinFast VF 6 Comfort';
        recTag = 'Gia đình 600 - 800 triệu';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          recommendedModelId: recModelId,
          recommendedModelName: recModelName,
          recommendedTag: recTag,
        },
      ]);
    }, 550);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'm-1',
        sender: 'ai',
        text: `Chào anh/chị. Em là Trợ lý AI VinFast O2O ${selectedCity === 'national' ? 'Tư vấn Toàn quốc' : currentFacility.cityName}. Bên phải là <strong>Sảnh chính trưng bày toàn bộ dải xe điện VinFast</strong> (VF 3 đến VF 9). Anh/chị có thể lướt xem tự do hoặc trao đổi cùng em về ngân sách, số chỗ ngồi và khu vực sinh sống để tìm chiếc xe ưng ý nhất.<br/><br/>Để bắt đầu, anh/chị dự kiến <strong>ngân sách lăn bánh khoảng bao nhiêu</strong> và <strong>nhu cầu di chuyển gia đình</strong> thế nào ạ?`,
        timestamp: 'Vừa xong',
      },
    ]);
    setJourneyStep(1);
    setCanvasMode('hall');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Executive AI Copilot Header */}
      <div className="h-12 px-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-slate-700" />
          <h2 className="text-xs font-bold text-slate-900 tracking-tight">Trợ lý Tư vấn AI</h2>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Trực tuyến" />
        </div>

        <Button
          variant="ghost"
          size="xs"
          onClick={handleReset}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          title="Làm mới hội thoại"
        >
          <span className="hidden sm:inline">Làm mới</span>
        </Button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              m.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                m.sender === 'user'
                  ? 'bg-brand-blue text-white shadow-2xs'
                  : 'bg-slate-900 text-white shadow-2xs'
              }`}
            >
              {m.sender === 'user' ? 'KH' : <Bot className="w-3.5 h-3.5 text-blue-400" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 shadow-2xs ${
                m.sender === 'user'
                  ? 'bg-brand-blue text-white rounded-tr-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
              }`}
            >
              <div
                className="leading-relaxed text-[11px]"
                dangerouslySetInnerHTML={{ __html: m.text }}
              />

              {/* Action Card inside AI Message */}
              {m.recommendedModelId && m.sender === 'ai' && (
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="brand">{m.recommendedTag}</Badge>
                    <span className="text-[10px] text-slate-500 font-medium">VinFast Chính hãng</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">{m.recommendedModelName}</h4>
                    <span className="text-[11px] font-bold text-brand-blue tabular-nums whitespace-nowrap">
                      {CAR_CATALOG[m.recommendedModelId]?.price.toLocaleString('vi-VN')}&nbsp;đ (kèm pin)
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      if (m.recommendedTag === 'So sánh 2-3 xe') {
                        openComparisonModal([]);
                      } else {
                        selectModel(m.recommendedModelId!, false);
                        setCanvasMode('recommendations');
                        setJourneyStep(2);
                      }
                    }}
                  >
                    {m.recommendedTag === 'So sánh 2-3 xe' ? 'Mở bảng so sánh 2-3 xe ➔' : 'Xem đề xuất xe phù hợp ➔'}
                  </Button>
                </div>
              )}

              <span
                className={`text-[9px] block text-right pt-0.5 tabular-nums ${
                  m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* AI Thinking Animation */}
        {isAiThinking && (
          <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 rounded-tl-xs flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-500">
                AI đang phân tích nhu cầu và khớp danh mục xe
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Quick Scenario Recommendation Chips (Origin UI Style) */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
            Gợi ý tình huống nhanh
          </span>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() =>
                handleSelectScenario(
                  'VF3',
                  'VinFast VF 3',
                  'Đô thị Mini ~300 triệu',
                  'Ngân sách tôi khoảng 300 - 350 triệu, cần xe mini nhỏ gọn đi làm nội thành hàng ngày.',
                  'Dạ với ngân sách khoảng 300 triệu, <strong>VinFast VF 3</strong> (322 triệu) là chiếc xe đô thị hoàn hảo nhất. Chi phí lăn bánh tiết kiệm, tầm chạy 215 km đủ cho cả tuần đi làm nội đô.'
                )
              }
              className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-medium transition-[background-color,border-color] duration-150 ease-out flex items-center gap-2 group active:scale-[0.98]"
            >
              <Badge variant="outline" className="group-hover:bg-blue-50 group-hover:text-brand-blue group-hover:border-blue-200 shrink-0">
                VF 3
              </Badge>
              <span className="truncate">Xe Mini đô thị tiết kiệm (ngân sách ~300 triệu)</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleSelectScenario(
                  'VF6',
                  'VinFast VF 6 Comfort',
                  'Gia đình 600 - 800 triệu',
                  'Tôi cần tìm xe SUV cho gia đình 4-5 người, ngân sách khoảng 600 - 800 triệu, đi làm và cuối tuần về quê.',
                  'Dạ với nhu cầu gia đình và ngân sách 600 - 800 triệu, chiếc <strong>VinFast VF 6 Comfort</strong> (675 triệu) là phương án tối ưu nhất. Mời anh/chị xem chi tiết đề xuất bên dưới.'
                )
              }
              className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-medium transition-[background-color,border-color] duration-150 ease-out flex items-center gap-2 group active:scale-[0.98]"
            >
              <Badge variant="outline" className="group-hover:bg-blue-50 group-hover:text-brand-blue group-hover:border-blue-200 shrink-0">
                VF 6 Comfort
              </Badge>
              <span className="truncate">SUV Gia đình đô thị (ngân sách 600 - 800 triệu)</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleSelectScenario(
                  'VF7',
                  'VinFast VF 7 Eco',
                  'C-SUV >800 triệu',
                  'Tôi có ngân sách từ 800 triệu đến 1 tỷ, cần xe Crossover hạng C mạnh mẽ, nhiều công nghệ ADAS.',
                  'Trong phân khúc trên 800 triệu, em đề xuất chiếc <strong>VinFast VF 7 Eco</strong>. Mẫu C-SUV thiết kế thời thượng và hệ thống ADAS thông minh. Mời anh/chị nhấn nút xem đề xuất bên dưới.'
                )
              }
              className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-medium transition-[background-color,border-color] duration-150 ease-out flex items-center gap-2 group active:scale-[0.98]"
            >
              <Badge variant="outline" className="group-hover:bg-blue-50 group-hover:text-brand-blue group-hover:border-blue-200 shrink-0">
                VF 7 Eco
              </Badge>
              <span className="truncate">Crossover hạng C cao cấp (trên 800 triệu)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                openComparisonModal([]);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `u-${Date.now()}`,
                    sender: 'user',
                    text: 'Tôi muốn so sánh trực tiếp các mẫu xe với nhau.',
                    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  },
                  {
                    id: `ai-${Date.now()}`,
                    sender: 'ai',
                    text: 'Em đã mở <strong>Bảng So sánh Đa mẫu xe</strong> dạng pop-up. Anh/chị có thể tích chọn 2 hoặc 3 mẫu xe bất kỳ để đối chiếu trực tiếp.',
                    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              className="w-full text-left px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-brand-blue text-xs font-semibold transition-[background-color,border-color] duration-150 ease-out flex items-center gap-2 group active:scale-[0.98]"
            >
              <Badge variant="brand" className="shrink-0">
                So sánh
              </Badge>
              <span className="truncate">So sánh đối chiếu đa mẫu xe (chọn 2-3 xe)</span>
            </button>
          </div>
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-slate-50/70 shrink-0">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-brand-accent focus-within:ring-2 focus-within:ring-blue-100 transition shadow-2xs">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập câu hỏi (ngân sách, lãi suất vay, trạm sạc...)"
            className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden py-1"
          />
          <Button
            type="submit"
            variant="primary"
            size="icon-sm"
            disabled={!inputText.trim()}
            aria-label="Gửi yêu cầu"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
