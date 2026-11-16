'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Bot, ArrowUp, ArrowRight, RotateCcw, Layers, Sparkles, CheckCircle2, Scale, MapPin } from 'lucide-react';
import { ModelId, CityId } from '@/types';
import { CAR_CATALOG, VINFAST_FACILITIES } from '@/lib/catalog';

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
  const setCity = useAppStore((state) => state.setCity);

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
    }, 500);
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
      let recModelId: ModelId | undefined = undefined;
      let recModelName: string | undefined = undefined;
      let recTag: string | undefined = undefined;

      // Location auto-detection and dynamic showroom switching
      let locationNotice = '';
      if (lower.includes('hà nội') || lower.includes('hanoi')) {
        setCity('hanoi');
        const fac = VINFAST_FACILITIES.hanoi;
        locationNotice = `Em đã chuyển cơ sở phục vụ về <strong>${fac.showroomName}</strong> (${fac.cityName}). `;
      } else if (
        lower.includes('hồ chí minh') ||
        lower.includes('tphcm') ||
        lower.includes('tp.hcm') ||
        lower.includes('sài gòn') ||
        lower.includes('saigon')
      ) {
        setCity('hcm');
        const fac = VINFAST_FACILITIES.hcm;
        locationNotice = `Em đã chuyển cơ sở phục vụ về <strong>${fac.showroomName}</strong> (${fac.cityName}). `;
      } else if (lower.includes('đà nẵng') || lower.includes('da nang')) {
        setCity('danang');
        const fac = VINFAST_FACILITIES.danang;
        locationNotice = `Em đã chuyển cơ sở phục vụ về <strong>${fac.showroomName}</strong> (${fac.cityName}). `;
      } else if (lower.includes('hải phòng') || lower.includes('hai phong')) {
        setCity('haiphong');
        const fac = VINFAST_FACILITIES.haiphong;
        locationNotice = `Em đã chuyển cơ sở phục vụ về <strong>${fac.showroomName}</strong> (${fac.cityName}). `;
      } else if (lower.includes('cần thơ') || lower.includes('can tho')) {
        setCity('cantho');
        const fac = VINFAST_FACILITIES.cantho;
        locationNotice = `Em đã chuyển cơ sở phục vụ về <strong>${fac.showroomName}</strong> (${fac.cityName}). `;
      } else if (lower.includes('toàn quốc')) {
        setCity('national');
        locationNotice = 'Em đã chuyển về chế độ tư vấn VinFast Toàn quốc. ';
      }

      if (
        lower.includes('so sánh') ||
        lower.includes('phân vân') ||
        lower.includes('khác nhau') ||
        lower.includes('đối chiếu')
      ) {
        replyText =
          locationNotice +
          'Để đối chiếu trực quan các dòng xe, em đã hỗ trợ <strong>Bảng So sánh Đa mẫu xe</strong> dạng pop-up. Anh/chị có thể tùy chọn 2 hoặc 3 mẫu xe bất kỳ để đối chiếu chi tiết thông số kích thước, tầm chạy và tiền sạc hàng tháng.';
        recModelId = 'VF6';
        recModelName = 'So sánh Đa mẫu xe';
        recTag = 'So sánh 2-3 xe';
      } else if (
        lower.includes('sạc') ||
        lower.includes('chung cư') ||
        lower.includes('nhà riêng') ||
        lower.includes('trạm sạc')
      ) {
        replyText =
          locationNotice +
          `VinFast và V-GREEN đã triển khai hệ thống trạm sạc công cộng rộng khắp tại ${currentFacility.cityName} (trung tâm thương mại, chung cư, cây xăng PVOIL...). Với nhu cầu đi lại phổ biến 30-40 km/ngày, trung bình <strong>10 đến 12 ngày anh/chị mới cần cắm sạc một lần</strong> (theo chu kỳ an toàn 85% DoD). Cả ở chung cư lẫn nhà phố đều sử dụng rất an tâm.`;
        updateInputs({ charging_facility: 'vgreen' });
      } else if (
        lower.includes('vf3') ||
        lower.includes('vf 3') ||
        lower.includes('300') ||
        lower.includes('dưới 400') ||
        lower.includes('mini') ||
        lower.includes('nhỏ gọn nhất')
      ) {
        replyText =
          locationNotice +
          'Với tầm tài chính từ hơn 300 triệu và nhu cầu xe mini đô thị nhỏ gọn dễ lái, mẫu <strong>VinFast VF 3</strong> (322 triệu) là lựa chọn quốc dân số 1. Xe sạc cực tiện, luồn lách phố hẹp linh hoạt. Mời anh/chị nhấn nút xem đề xuất bên dưới.';
        recModelId = 'VF3';
        recModelName = 'VinFast VF 3';
        recTag = 'Mini Đô thị ~322 tr';
      } else if (
        lower.includes('vf5') ||
        lower.includes('vf 5') ||
        lower.includes('500') ||
        lower.includes('dưới 600') ||
        lower.includes('tiết kiệm')
      ) {
        replyText =
          locationNotice +
          'Với ngân sách dưới 600 triệu lăn bánh, mẫu xe phù hợp nhất là <strong>VinFast VF 5 Plus</strong> (496 triệu). Chi phí nhận xe chỉ từ ~150 triệu (vay 70%), tiền sạc điện chỉ khoảng ~500.000 đ/tháng. Em đã soạn sẵn hồ sơ đề xuất cho anh/chị.';
        recModelId = 'VF5';
        recModelName = 'VinFast VF 5 Plus';
        recTag = 'Ngân sách <600 triệu';
      } else if (
        lower.includes('vf7') ||
        lower.includes('vf 7') ||
        lower.includes('800') ||
        (lower.includes('1 tỷ') && (lower.includes('dưới') || lower.includes('tầm') || lower.includes('khoảng'))) ||
        lower.includes('hạng c')
      ) {
        replyText =
          locationNotice +
          'Với ngân sách từ 800 triệu đến 1 tỷ và nhu cầu SUV hạng C rộng rãi, tiện nghi vượt trội, em đề xuất chiếc <strong>VinFast VF 7 Eco</strong> (740 triệu) trang bị gói trợ lái thông minh ADAS Level 2 và thiết kế thể thao dẫn đầu phân khúc.';
        recModelId = 'VF7';
        recModelName = 'VinFast VF 7 Eco';
        recTag = 'C-SUV Cao cấp';
      } else if (
        lower.includes('vf8') ||
        lower.includes('vf 8') ||
        lower.includes('hạng d') ||
        lower.includes('1 tỷ 1') ||
        lower.includes('1 tỷ 2') ||
        lower.includes('doanh nhân')
      ) {
        replyText =
          locationNotice +
          'Trong phân khúc SUV hạng D cao cấp quanh mốc 1 tỷ đồng, <strong>VinFast VF 8 Eco</strong> (1.079 tỷ) là mẫu xe điện toàn cầu với khả năng vận hành mạnh mẽ, công nghệ thông minh vượt bậc và không gian đẳng cấp.';
        recModelId = 'VF8';
        recModelName = 'VinFast VF 8 Eco';
        recTag = 'D-SUV Đẳng cấp';
      } else if (
        lower.includes('vf9') ||
        lower.includes('vf 9') ||
        lower.includes('7 chỗ') ||
        lower.includes('bảy chỗ') ||
        lower.includes('chủ tịch') ||
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
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs shrink-0">
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">Trợ lý Tư vấn AI</h2>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Trực tuyến
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Hỗ trợ tìm xe, tính ngân sách & lập hồ sơ 24/7
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          title="Làm mới hội thoại"
          className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition flex items-center gap-1 text-[11px] font-medium border border-transparent hover:border-slate-200"
          aria-label="Làm mới đoạn chat"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
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
                  ? 'bg-slate-800 text-white'
                  : 'bg-brand-blue text-white shadow-xs'
              }`}
            >
              {m.sender === 'user' ? 'Tôi' : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed space-y-1.5 ${
                m.sender === 'user'
                  ? 'bg-brand-blue text-white rounded-tr-xs'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: m.text }}
                className="prose prose-xs max-w-none text-current"
              />

              {/* Requirement 2: Dedicated Recommendation Action Button inside Agent */}
              {m.recommendedModelId && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">
                      Gợi ý: <strong>{m.recommendedModelName}</strong>
                    </span>
                    <span className="text-[10px] text-brand-blue font-bold px-1.5 py-0.5 rounded bg-blue-100/70">
                      {m.recommendedTag}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (m.recommendedTag === 'So sánh 2-3 xe') {
                        openComparisonModal([]);
                      } else {
                        selectModel(m.recommendedModelId!, false);
                        setCanvasMode('recommendations');
                        setJourneyStep(2);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-brand-blue hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs group"
                  >
                    <span>
                      {m.recommendedTag === 'So sánh 2-3 xe' ? 'Mở bảng so sánh 2-3 xe' : 'Xem đề xuất xe phù hợp trên Sảnh'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
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
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        {/* Executive Quick Scenario Pills - Zero Emojis */}
        <div className="pt-3 space-y-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-0.5">
            <span>Kịch bản tư vấn nhanh:</span>
            <button
              onClick={handleReset}
              title="Làm mới hội thoại"
              className="text-slate-400 hover:text-slate-700 transition"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() =>
                handleSelectScenario(
                  'VF5',
                  'VinFast VF 5 Plus',
                  'Dưới 600 triệu',
                  'Tôi có ngân sách dưới 600 triệu, đi làm nội thành hàng ngày, ưu tiên chi phí tiết kiệm nhất.',
                  'Với ngân sách dưới 600 triệu, mẫu <strong>VinFast VF 5 Plus</strong> là lựa chọn tiết kiệm nhất phân khúc. Xe nhỏ gọn, sạc tại nhà chỉ ~500k/tháng. Anh/chị có thể nhấn nút bên dưới để xem chi tiết đề xuất trên Sảnh.'
                )
              }
              className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-medium transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-brand-blue">
                  VF 5 Plus
                </span>
                <span>Ngân sách dưới 600 triệu · Đô thị linh hoạt</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() =>
                handleSelectScenario(
                  'VF6',
                  'VinFast VF 6 Comfort',
                  'Gia đình 600 - 800 triệu',
                  'Tôi có ngân sách khoảng 700 triệu, phục vụ gia đình 4 người, thỉnh thoảng đi ngoại tỉnh.',
                  'Trong tầm ngân sách 700 triệu cho gia đình 4 người, <strong>VinFast VF 6 Comfort</strong> là lựa chọn lý tưởng. Khoang lái rộng rãi, tầm chạy 510 km. Anh/chị có thể nhấn nút bên dưới để xem chi tiết đề xuất trên Sảnh.'
                )
              }
              className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-medium transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-brand-blue">
                  VF 6
                </span>
                <span>Gia đình 4-5 người (600 - 800 triệu)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-transform" />
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
              className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-medium transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-brand-blue">
                  VF 7 Eco
                </span>
                <span>Crossover hạng C cao cấp (trên 800 triệu)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-transform" />
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
              className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-200 text-brand-blue text-xs font-semibold transition flex items-center justify-between group"
            >
              <span className="flex items-center gap-2">
                <Scale className="w-3.5 h-3.5" />
                <span>So sánh đối chiếu đa mẫu xe (chọn 2-3 xe)</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-blue group-hover:translate-x-0.5 transition-transform" />
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
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-7 h-7 rounded-lg bg-brand-blue text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition shrink-0"
            aria-label="Gửi yêu cầu"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
