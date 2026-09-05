import React, { useState, useEffect } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt, randomNormal } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

export const DerivedConvolution: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'convolution' | 'correlation' | 'totalvar' | 'transform' | 'extremes'>('convolution');

  // Tab 1: Convolution State
  const [zValue, setZValue] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let animationId: number;
    if (isPlaying) {
      animationId = requestAnimationFrame(() => {
        setZValue((prev) => {
          if (prev >= 2.0) return 0.0;
          return Math.min(2.0, prev + 0.01);
        });
      });
    }
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, zValue]);

  // Tab 2: Correlation State
  const [rho, setRho] = useState<number>(0.75);
  const [scatterPoints, setScatterPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [showParabola, setShowParabola] = useState<boolean>(false);

  useEffect(() => {
    const pts = [];
    if (showParabola) {
      for (let i = 0; i < 220; i++) {
        const x = (Math.random() - 0.5) * 4;
        const noise = (Math.random() - 0.5) * 0.4;
        pts.push({ x, y: x * x * 0.5 - 1.5 + noise });
      }
    } else {
      for (let i = 0; i < 250; i++) {
        const z1 = randomNormal(0, 1);
        const z2 = randomNormal(0, 1);
        const x = z1;
        const y = rho * z1 + Math.sqrt(Math.max(0, 1 - rho * rho)) * z2;
        pts.push({ x, y });
      }
    }
    setScatterPoints(pts);
  }, [rho, showParabola]);

  // Tab 3: Total Variance Decomposition State
  const [groupGap, setGroupGap] = useState<number>(3.0);
  const [withinVar, setWithinVar] = useState<number>(1.0);

  const betweenVar = (groupGap * groupGap) / 2;
  const totalVariance = betweenVar + withinVar;
  const betweenPct = Math.round((betweenVar / totalVariance) * 100);
  const withinPct = 100 - betweenPct;

  // Tab 4: Transformation Y = g(X) State
  const [transformType, setTransformType] = useState<'square' | 'linear' | 'exp'>('square');
  const [xSlider, setXSlider] = useState<number>(1.0);

  // Tab 5: Extremes Min / Max State
  const [extremeType, setExtremeType] = useState<'max' | 'min'>('max');
  const [compN, setCompN] = useState<number>(3);

  // Helpers for SVG projection in Tab 2
  const mapX = (x: number) => 400 + x * 95;
  const mapY = (y: number) => 210 - y * 65;

  return (
    <div className="space-y-6">
      {/* Chapter Subtitle & Context Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 7.1 — Biến ngẫu nhiên dẫn xuất
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Tích chập (Convolution), Đổi biến hàm mật độ & Biến cực trị
          </h2>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('convolution')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'convolution'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Tích chập (Z = X + Y)
          </button>
          <button
            onClick={() => setActiveTab('transform')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'transform'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Đổi biến Y = g(X)
          </button>
          <button
            onClick={() => setActiveTab('extremes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'extremes'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. Biến Cực trị Max/Min
          </button>
          <button
            onClick={() => setActiveTab('correlation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'correlation'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            4. Tương quan & Trực giao
          </button>
          <button
            onClick={() => setActiveTab('totalvar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'totalvar'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            5. Phân tích Phương sai
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: TÍCH CHẬP CONVOLUTION (Z = X + Y)
         ========================================================================= */}
      {activeTab === 'convolution' && (
        <div className="space-y-6">
          <LabBriefing
            question="Nếu ta có 2 biến ngẫu nhiên độc lập X và Y (ví dụ thời gian chờ ở 2 chặng xe bus), làm thế nào để tìm hàm phân phối xác suất của tổng thời gian Z = X + Y?"
            formula="f_Z(z) = (f_X * f_Y)(z) = \int_{-\infty}^{\infty} f_X(x) f_Y(z - x) \, dx"
            mathExplanation="Tích chập là phép toán 'lật ngược' hàm f_Y, sau đó trượt nó qua f_X một khoảng z. Giá trị mật độ f_Z(z) tại mỗi điểm chính là diện tích phần giao nhau giữa hai hàm tại vị trí trượt đó."
            howToInteract={[
              "Kéo slider 'Giá trị tổng z' từ 0.0 đến 2.0 (hoặc bấm nút Tự động trượt).",
              "Quan sát đường cắt chéo x + y = z quét qua hình vuông xác suất [0,1] x [0,1].",
              "Nhìn đồ thị bên phải: Điểm chấm đỏ biểu diễn giá trị mật độ f_Z(z) được tạo ra từ độ dài đoạn cắt chéo."
            ]}
            whatToObserve="Khi z = 1.0 (ở chính giữa), đoạn giao nhau dài nhất (đạt độ dài 1.0), làm cho hàm mật độ f_Z đạt đỉnh cao nhất. Đồ thị chuyển từ 2 hình chữ nhật phẳng thành 1 hình tam giác cân hoàn hảo!"
            takeaway="Tổng của hai biến phân phối Đều (Uniform) độc lập KHÔNG CÒN LÀ hình chữ nhật nữa, mà biến thành phân phối Tam giác (Triangular). Đây là bước đầu tiên chứng kiến định lý CLT hoạt động!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mô phỏng Trực quan Tích chập Hình học: X, Y ~ U(0,1) -> Z = X + Y"
              formula="f_Z(z) = \begin{cases} z & 0 \le z \le 1 \\ 2 - z & 1 < z \le 2 \end{cases}"
              badge={`z = ${fmt(zValue, 2)}`}
              onReset={() => { setZValue(1.0); setIsPlaying(false); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[440px]">
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Visual 1: Miền 2D (X, Y) */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-heading font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Miền Không gian mẫu (X, Y) & Đường cắt x + y = z
                  </span>
                  <div className="relative w-64 h-64 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                    <svg viewBox="-0.2 -0.2 1.4 1.4" className="w-full h-full">
                      <rect x="0" y="0" width="1" height="1" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.02" />
                      <line x1="-0.1" y1="0" x2="1.2" y2="0" stroke="#64748b" strokeWidth="0.02" />
                      <line x1="0" y1="-0.1" x2="0" y2="1.2" stroke="#64748b" strokeWidth="0.02" />
                      {zValue <= 1 ? (
                        <polygon
                          points={`0,0 ${zValue},0 0,${zValue}`}
                          fill="#38bdf8"
                          fillOpacity="0.6"
                          stroke="#0369a1"
                          strokeWidth="0.02"
                        />
                      ) : (
                        <polygon
                          points={`0,0 1,0 1,${zValue - 1} ${zValue - 1},1 0,1`}
                          fill="#38bdf8"
                          fillOpacity="0.6"
                          stroke="#0369a1"
                          strokeWidth="0.02"
                        />
                      )}
                      <line
                        x1={Math.max(0, zValue - 1)}
                        y1={Math.min(1, zValue)}
                        x2={Math.min(1, zValue)}
                        y2={Math.max(0, zValue - 1)}
                        stroke="#e11d48"
                        strokeWidth="0.04"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute bottom-1 right-2 text-[10px] font-mono text-slate-500">X ~ U(0,1)</div>
                    <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-500">Y ~ U(0,1)</div>
                  </div>
                </div>

                {/* Visual 2: Hàm mật độ tích chập f_Z(z) */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-heading font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Mật độ kết quả f_Z(z) (Phân phối Tam giác)
                  </span>
                  <div className="relative w-72 h-64 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                    <svg viewBox="-0.2 -0.2 2.4 1.4" className="w-full h-full">
                      <line x1="-0.1" y1="0" x2="2.2" y2="0" stroke="#64748b" strokeWidth="0.03" />
                      <line x1="0" y1="-0.1" x2="0" y2="1.2" stroke="#64748b" strokeWidth="0.03" />
                      <polygon points="0,0 1,1 2,0" fill="#bae6fd" stroke="#0284c7" strokeWidth="0.03" fillOpacity="0.5" />
                      {/* Vạch quét hiện tại */}
                      <line x1={zValue} y1="0" x2={zValue} y2={zValue <= 1 ? zValue : 2 - zValue} stroke="#e11d48" strokeWidth="0.05" />
                      <circle cx={zValue} cy={zValue <= 1 ? zValue : 2 - zValue} r="0.07" fill="#e11d48" />
                    </svg>
                    <div className="absolute top-2 right-3 text-xs font-mono font-bold text-rose-600">
                      f_Z({fmt(zValue, 2)}) = {fmt(zValue <= 1 ? zValue : 2 - zValue, 2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <ClaySlider
                    label="Giá trị tổng z"
                    sublabel="Trượt từ 0 đến 2"
                    value={zValue}
                    min={0}
                    max={2}
                    step={0.02}
                    color="blue"
                    onChange={setZValue}
                  />
                </div>
                <ClayButton
                  variant={isPlaying ? 'secondary' : 'primary'}
                  size="md"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? 'Tạm dừng ❚❚' : 'Tự động trượt ▶'}
                </ClayButton>
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ĐỔI BIẾN HÀM MẬT ĐỘ LIÊN TỤC Y = g(X)
         ========================================================================= */}
      {activeTab === 'transform' && (
        <div className="space-y-6">
          <LabBriefing
            question="Cho biến ngẫu nhiên liên tục X có hàm mật độ f_X(x). Khi biến đổi Y = g(X) (ví dụ Y = X^2 hoặc Y = e^X), tại sao ta không được thay trực tiếp x vào mà phải chia cho đạo hàm |g'(x)|?"
            formula="f_Y(y) = f_X(g^{-1}(y)) \cdot \left| \frac{d}{dy} g^{-1}(y) \right| = \frac{f_X(x)}{|g'(x)|}"
            mathExplanation="Bản chất là bảo toàn khối lượng xác suất: P(x \le X \le x + \Delta x) \approx f_X(x)\Delta x = f_Y(y)\Delta y. Vì \Delta y \approx |g'(x)| \Delta x, nên khi đoạn g(x) càng dốc (|g'(x)| lớn), dải xác suất bị kéo giãn ra làm f_Y(y) giảm xuống; ngược lại khi g(x) là phẳng (|g'(x)| nhỏ), xác suất bị nén dồn cục khiến f_Y(y) vọt lên cực đại!"
            howToInteract={[
              "Chọn 1 trong 3 phép biến đổi: Parabol Y = X^2, Tuyến tính Y = 2X + 1, hoặc Hàm mũ Y = e^X.",
              "Kéo slider x từ 0.2 đến 2.0 để di chuyển điểm kiểm tra vi phân.",
              "Quan sát độ dốc tiếp tuyến g'(x) trên đồ thị trái và độ cao tương ứng của f_Y(y) trên đồ thị phải."
            ]}
            whatToObserve="Với Y = X^2, khi x tiến dần về 0, đạo hàm g'(x) = 2x tiến về 0 $\implies$ mẫu số tiến về 0 khiến mật độ f_Y(y) vọt lên vô cùng tiệm cận trục tung! Đây chính là nguồn gốc phân phối Chi-Square!"
            takeaway="Quy tắc vàng khi thi: Đổi biến rời rạc thì chỉ cần gộp xác suất, nhưng đổi biến liên tục BẮT BUỘC phải nhân thêm đạo hàm vi phân nghịch đảo (định thức Jacobi)!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mô phỏng Đổi biến Hàm Mật độ: Y = g(X)"
              formula={
                transformType === 'square'
                  ? "Y = X^2 \\implies f_Y(y) = \\frac{f_X(\\sqrt{y})}{2\\sqrt{y}}"
                  : transformType === 'linear'
                  ? "Y = 2X + 1 \\implies f_Y(y) = \\frac{f_X((y-1)/2)}{2}"
                  : "Y = e^X \\implies f_Y(y) = \\frac{f_X(\\ln y)}{y}"
              }
              badge={`x = ${fmt(xSlider, 2)}`}
              onReset={() => setXSlider(1.0)}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[440px]">
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Đồ thị hàm biến đổi g(x) */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-heading font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    1. Hàm số chuyển đổi y = g(x) & Tiếp tuyến g'(x)
                  </span>
                  <div className="relative w-72 h-64 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                    <svg viewBox="-0.2 -0.5 2.5 4.5" className="w-full h-full">
                      {/* Trục tọa độ */}
                      <line x1="-0.1" y1="0" x2="2.3" y2="0" stroke="#64748b" strokeWidth="0.05" />
                      <line x1="0" y1="-0.2" x2="0" y2="4.2" stroke="#64748b" strokeWidth="0.05" />
                      
                      {/* Đường cong g(x) */}
                      {transformType === 'square' && (
                        <path d="M 0 0 Q 1 1 2 4" fill="none" stroke="#0284c7" strokeWidth="0.08" />
                      )}
                      {transformType === 'linear' && (
                        <line x1="0" y1="1" x2="1.5" y2="4" stroke="#0284c7" strokeWidth="0.08" />
                      )}
                      {transformType === 'exp' && (
                        <path d="M 0 1 Q 0.8 2 1.4 4.05" fill="none" stroke="#0284c7" strokeWidth="0.08" />
                      )}

                      {/* Điểm x hiện tại */}
                      {(() => {
                        const curY = transformType === 'square' ? xSlider * xSlider : transformType === 'linear' ? 2 * xSlider + 1 : Math.exp(xSlider);
                        return (
                          <>
                            <line x1={xSlider} y1="0" x2={xSlider} y2={curY} stroke="#e11d48" strokeDasharray="0.1 0.1" strokeWidth="0.04" />
                            <line x1="0" y1={curY} x2={xSlider} y2={curY} stroke="#e11d48" strokeDasharray="0.1 0.1" strokeWidth="0.04" />
                            <circle cx={xSlider} cy={curY} r="0.1" fill="#e11d48" />
                          </>
                        );
                      })()}
                    </svg>
                    <div className="absolute top-2 left-3 text-xs font-mono font-bold text-sky-600">
                      y = {fmt(transformType === 'square' ? xSlider * xSlider : transformType === 'linear' ? 2 * xSlider + 1 : Math.exp(xSlider), 2)}
                    </div>
                  </div>
                </div>

                {/* Đồ thị mật độ f_Y(y) */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-heading font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    2. Mật độ xác suất tương ứng f_Y(y)
                  </span>
                  <div className="relative w-72 h-64 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                    <svg viewBox="-0.5 -0.2 4.5 2.5" className="w-full h-full">
                      <line x1="-0.2" y1="0" x2="4.2" y2="0" stroke="#64748b" strokeWidth="0.05" />
                      <line x1="0" y1="-0.1" x2="0" y2="2.2" stroke="#64748b" strokeWidth="0.05" />
                      
                      {/* Vẽ hình dạng f_Y(y) giả định X ~ U(0, 2) */}
                      {transformType === 'square' && (
                        <path d="M 0.1 2.2 Q 0.5 0.7 4 0.25" fill="none" stroke="#7c3aed" strokeWidth="0.08" />
                      )}
                      {transformType === 'linear' && (
                        <line x1="1" y1="0.25" x2="5" y2="0.25" stroke="#7c3aed" strokeWidth="0.08" />
                      )}
                      {transformType === 'exp' && (
                        <path d="M 1 0.5 Q 2 0.25 4 0.12" fill="none" stroke="#7c3aed" strokeWidth="0.08" />
                      )}
                    </svg>
                    <div className="absolute bottom-2 right-3 text-xs font-mono text-purple-600 font-bold">
                      Độ nén = 1 / |g'(x)|
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex justify-center gap-3">
                  <ClayButton
                    variant={transformType === 'square' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTransformType('square')}
                  >
                    Y = X² (Parabol)
                  </ClayButton>
                  <ClayButton
                    variant={transformType === 'linear' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTransformType('linear')}
                  >
                    Y = 2X + 1 (Tuyến tính)
                  </ClayButton>
                  <ClayButton
                    variant={transformType === 'exp' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTransformType('exp')}
                  >
                    Y = e^X (Hàm mũ)
                  </ClayButton>
                </div>

                <ClaySlider
                  label="Điểm khảo sát x"
                  sublabel="Quan sát độ dốc g'(x) thay đổi"
                  value={xSlider}
                  min={0.2}
                  max={2.0}
                  step={0.05}
                  color="blue"
                  onChange={setXSlider}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BIẾN CỰC ĐẠI & CỰC TIỂU (MAX & MIN)
         ========================================================================= */}
      {activeTab === 'extremes' && (
        <div className="space-y-6">
          <LabBriefing
            question="Một hệ thống máy tính gồm n linh kiện độc lập. Hệ thống chỉ chạy được nếu TẤT CẢ linh kiện cùng chạy (hệ nối tiếp - Min), hoặc chỉ cần ÍT NHẤT 1 linh kiện chạy (hệ song song dự phòng - Max). Tuổi thọ của hệ thống thay đổi thế nào khi ta tăng số linh kiện n?"
            formula="F_{\max}(w) = [F_X(w)]^n, \quad F_{\min}(v) = 1 - [1 - F_X(v)]^n"
            mathExplanation="Để Max < w thì TẤT CẢ n linh kiện phải cùng < w (xác suất nhân n lần: [F(w)]^n). Ngược lại, để Min > v thì TẤT CẢ n linh kiện phải cùng sống sót qua thời điểm v (xác suất [1 - F(v)]^n)."
            howToInteract={[
              "Chuyển đổi giữa chế độ 'Hệ Song Song (Max)' và 'Hệ Nối Tiếp (Min)'.",
              "Kéo slider số linh kiện n từ 1 đến 15.",
              "Xem đồ thị hàm phân phối tích lũy CDF và hàm mật độ PDF di chuyển sang phải hay sang trái."
            ]}
            whatToObserve="Khi tăng n trong hệ song song (Max), đường cong bị đẩy mạnh về bên phải (tuổi thọ trung bình tăng vọt nhờ có linh kiện dự phòng). Còn hệ nối tiếp (Min) chỉ cần 1 linh kiện chết là sập cả hệ thống, nên đồ thị co rúm về sát 0!"
            takeaway="Quy tắc thi cử: Bài toán 'Linh kiện hỏng đầu tiên' $\implies$ tìm phân phối của $\min$. Bài toán 'Thời điểm linh kiện cuối cùng ngừng hoạt động' $\implies$ tìm phân phối của $\max$!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={`Mô phỏng Phân phối Cực trị: ${extremeType === 'max' ? 'Hệ Song Song W = max(X₁..Xₙ)' : 'Hệ Nối Tiếp V = min(X₁..Xₙ)'}`}
              formula={extremeType === 'max' ? `F_{\\max}(w) = [F(w)]^{${compN}}` : `F_{\\min}(v) = 1 - [1 - F(v)]^{${compN}}`}
              badge={`n = ${compN} linh kiện`}
              onReset={() => { setCompN(3); setExtremeType('max'); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full max-w-3xl flex flex-col items-center">
                <span className="text-xs font-heading font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Đồ thị Mật độ Xác suất f(t) (X_i ~ U(0, 10))
                </span>

                <div className="relative w-full max-w-lg h-64 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-4 shadow-inner">
                  <svg viewBox="-1 -0.1 12 1.2" className="w-full h-full">
                    {/* Trục */}
                    <line x1="0" y1="0" x2="10.5" y2="0" stroke="#64748b" strokeWidth="0.1" />
                    <line x1="0" y1="0" x2="0" y2="1.1" stroke="#64748b" strokeWidth="0.1" />
                    
                    {/* Đường cong PDF */}
                    {(() => {
                      const pts = [];
                      for (let t = 0; t <= 10; t += 0.2) {
                        const ft = extremeType === 'max'
                          ? (compN / 10) * Math.pow(t / 10, compN - 1)
                          : (compN / 10) * Math.pow(1 - t / 10, compN - 1);
                        pts.push(`${t},${Math.min(1.0, ft)}`);
                      }
                      return (
                        <polyline
                          points={pts.join(' ')}
                          fill="none"
                          stroke={extremeType === 'max' ? '#0284c7' : '#e11d48'}
                          strokeWidth="0.2"
                          strokeLinecap="round"
                        />
                      );
                    })()}
                  </svg>
                  <div className="absolute top-3 right-4 text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                    Tuổi thọ trung bình E ≈ {fmt(extremeType === 'max' ? (10 * compN) / (compN + 1) : 10 / (compN + 1), 2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex justify-center gap-3">
                  <ClayButton
                    variant={extremeType === 'max' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setExtremeType('max')}
                  >
                    Hệ Song Song (Max - Dự phòng)
                  </ClayButton>
                  <ClayButton
                    variant={extremeType === 'min' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setExtremeType('min')}
                  >
                    Hệ Nối Tiếp (Min - Chuỗi)
                  </ClayButton>
                </div>

                <ClaySlider
                  label="Số lượng linh kiện n"
                  sublabel="Kéo từ 1 đến 15 linh kiện"
                  value={compN}
                  min={1}
                  max={15}
                  step={1}
                  color="blue"
                  onChange={setCompN}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 4: TƯƠNG QUAN & TRỰC GIAO (CORRELATION)
         ========================================================================= */}
      {activeTab === 'correlation' && (
        <div className="space-y-6">
          <LabBriefing
            question="Hai biến ngẫu nhiên có hệ số tương quan Pearson rho = 0 thì có chắc chắn độc lập với nhau không?"
            formula="\rho_{X,Y} = \frac{Cov(X,Y)}{\sigma_X \sigma_Y} = \frac{E[(X - \mu_X)(Y - \mu_Y)]}{\sigma_X \sigma_Y}"
            mathExplanation="Hệ số tương quan rho chỉ phản ánh quan hệ TUYẾN TÍNH (đường thẳng). Nếu X và Y phụ thuộc nhau theo một hàm phi tuyến (như parabol Y = X^2 hoặc đường tròn X^2 + Y^2 = 1), hệ số tương quan rho vẫn bằng 0 tuyệt đối!"
            howToInteract={[
              "Kéo thanh trượt rho từ -1.0 (nghịch biến hoàn hảo) đến +1.0 (đồng biến hoàn hảo).",
              "Bấm nút 'Dữ liệu Phi tuyến Parabol (Y = X²)' để kích hoạt kịch bản bẫy kinh điển trong đề thi."
            ]}
            whatToObserve="Ở chế độ Parabol, Y hoàn toàn được xác định bởi X (không hề ngẫu nhiên độc lập), nhưng đám mây điểm đối xứng làm Cov(X,Y) triệt tiêu về 0 $\implies \rho = 0$!"
            takeaway="Ghi nhớ khắc sâu: Độc lập $\implies \rho = 0$, nhưng $\rho = 0$ KHÔNG HỀ suy ra độc lập!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={`Đám mây điểm Scatter Plot: ${showParabola ? 'Phi tuyến Parabol Y = X²' : `Tương quan Tuyến tính ρ = ${fmt(rho, 2)}`}`}
              formula={showParabola ? "\\rho_{X,Y} = 0 \\quad (\\text{Phụ thuộc phi tuyến})" : "\\rho_{X,Y} \\in [-1, 1]"}
              badge={showParabola ? "Bẫy phi tuyến!" : `ρ = ${fmt(rho, 2)}`}
              onReset={() => { setRho(0.75); setShowParabola(false); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[440px]">
              <div className="relative w-full max-w-2xl h-80 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                <svg viewBox="100 0 600 420" className="w-full h-full">
                  <line x1="100" y1="210" x2="700" y2="210" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="400" y1="20" x2="400" y2="400" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                  {scatterPoints.map((pt, i) => (
                    <circle
                      key={i}
                      cx={mapX(pt.x)}
                      cy={mapY(pt.y)}
                      r="3.5"
                      fill="#0284c7"
                      fillOpacity="0.75"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <div className="flex justify-center gap-3">
                  <ClayButton
                    variant={!showParabola ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setShowParabola(false)}
                  >
                    Dữ liệu Tuyến tính
                  </ClayButton>
                  <ClayButton
                    variant={showParabola ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setShowParabola(true)}
                  >
                    Bẫy Phi tuyến Y = X² (ρ = 0)
                  </ClayButton>
                </div>

                {!showParabola && (
                  <ClaySlider
                    label="Hệ số tương quan Pearson ρ"
                    sublabel="Kéo từ -1 đến +1"
                    value={rho}
                    min={-1}
                    max={1}
                    step={0.05}
                    color="blue"
                    onChange={setRho}
                  />
                )}
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 5: ĐỊNH LÝ PHÂN TÍCH PHƯƠNG SAI TOÀN PHẦN (TOTAL VARIANCE)
         ========================================================================= */}
      {activeTab === 'totalvar' && (
        <div className="space-y-6">
          <LabBriefing
            question="Khi chia dữ liệu thành nhiều nhóm (ví dụ điểm thi của các lớp khác nhau), phương sai của toàn bộ sinh viên được phân rã thành những thành phần nào?"
            formula="Var(X) = E[Var(X|Y)] + Var(E[X|Y])"
            mathExplanation="Tổng phương sai = Kỳ vọng phương sai trong nội bộ từng nhóm (Unexplained Within Variance) + Phương sai giữa các trung bình nhóm (Explained Between Variance). Đây chính là định lý Eve!"
            howToInteract={[
              "Kéo slider 'Khoảng cách giữa các nhóm' để tăng Var(E[X|Y]).",
              "Kéo slider 'Độ phân tán nội bộ' để tăng E[Var(X|Y)].",
              "Nhìn thanh tỷ lệ phần trăm phân rã phương sai thay đổi ngay lập tức."
            ]}
            whatToObserve="Nếu các nhóm cách nhau càng xa mà nội bộ từng nhóm rất đặc khít, thì tỷ lệ giải thích (Explained Variance) tiến sát 100%. Đây chính là nguyên lý của thuật toán phân lớp và ANOVA!"
            takeaway="Phương sai toàn phần luôn bằng tổng của phương sai nội bộ cộng với phương sai giữa các nhóm!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Mô phỏng Phân tích Phương sai Toàn phần (Định lý Eve)"
              formula="Var(X) = E[Var(X|Y)] + Var(E[X|Y])"
              badge={`Giải thích: ${betweenPct}%`}
              onReset={() => { setGroupGap(3.0); setWithinVar(1.0); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full max-w-xl space-y-6">
                {/* Thanh phân rã phần trăm */}
                <div>
                  <div className="flex justify-between text-xs font-mono font-bold mb-2">
                    <span className="text-sky-600">Giữa các nhóm (Explained): {betweenPct}%</span>
                    <span className="text-slate-500">Nội bộ nhóm (Unexplained): {withinPct}%</span>
                  </div>
                  <div className="w-full h-8 rounded-xl border-2 border-slate-900 overflow-hidden flex shadow-[2px_2px_0px_#0f172a]">
                    <div style={{ width: `${betweenPct}%` }} className="bg-sky-500 transition-all duration-200" />
                    <div style={{ width: `${withinPct}%` }} className="bg-slate-300 dark:bg-slate-700 transition-all duration-200" />
                  </div>
                </div>

                {/* Minh họa 2 cụm điểm */}
                <div className="relative w-full h-40 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-4 flex items-center justify-around shadow-inner">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-sky-200 dark:bg-sky-950/80 border-2 border-sky-600 flex items-center justify-center font-bold text-sky-800 dark:text-sky-200 text-xs">
                      Nhóm 1
                    </div>
                    <span className="text-[11px] font-mono mt-1 block">μ₁ = -{fmt(groupGap/2, 1)}</span>
                  </div>

                  <div className="h-0.5 bg-slate-400 flex-1 mx-4 border-dashed border-t-2" />

                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-200 dark:bg-emerald-950/80 border-2 border-emerald-600 flex items-center justify-center font-bold text-emerald-800 dark:text-emerald-200 text-xs">
                      Nhóm 2
                    </div>
                    <span className="text-[11px] font-mono mt-1 block">μ₂ = +{fmt(groupGap/2, 1)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto space-y-4">
                <ClaySlider
                  label="Khoảng cách giữa các nhóm"
                  sublabel="Tăng Var(E[X|Y])"
                  value={groupGap}
                  min={0.5}
                  max={6}
                  step={0.1}
                  color="blue"
                  onChange={setGroupGap}
                />
                <ClaySlider
                  label="Độ phân tán nội bộ nhóm"
                  sublabel="Tăng E[Var(X|Y)]"
                  value={withinVar}
                  min={0.5}
                  max={5}
                  step={0.1}
                  color="blue"
                  onChange={setWithinVar}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
};
