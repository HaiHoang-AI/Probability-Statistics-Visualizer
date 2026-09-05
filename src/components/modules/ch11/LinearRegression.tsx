import React, { useState, useMemo } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { ClayButton } from '../../common/ClayButton';
import { MathView } from '../../common/MathView';
import { fmt } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';

interface Point {
  id: number;
  x: number;
  y: number;
}

export const LinearRegression: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ols' | 'r2' | 'leverage' | 'residuals'>('ols');
  const [showSquares, setShowSquares] = useState<boolean>(true);

  // Initial data points for Tab 1 & 2
  const [points, setPoints] = useState<Point[]>([
    { id: 1, x: 1.0, y: 1.8 },
    { id: 2, x: 2.5, y: 3.8 },
    { id: 3, x: 4.0, y: 4.5 },
    { id: 4, x: 5.5, y: 6.8 },
    { id: 5, x: 7.0, y: 7.2 },
    { id: 6, x: 8.5, y: 9.0 },
  ]);

  const [manualSlope, setManualSlope] = useState<number>(0.8);
  const [manualIntercept, setManualIntercept] = useState<number>(1.0);

  // Tab 3: Outliers & Leverage State
  const [outlierX, setOutlierX] = useState<number>(8.5);
  const [outlierY, setOutlierY] = useState<number>(2.0);

  // Tab 4: Residual Diagnostics State
  const [diagPattern, setDiagPattern] = useState<'homoscedastic' | 'nonlinear' | 'heteroscedastic'>('homoscedastic');

  // Calculate Optimal OLS using closed-form formula
  const olsParams = useMemo(() => {
    const n = points.length;
    if (n === 0) return { slope: 0, intercept: 0, meanX: 0, meanY: 0 };
    const meanX = points.reduce((acc, p) => acc + p.x, 0) / n;
    const meanY = points.reduce((acc, p) => acc + p.y, 0) / n;

    let num = 0;
    let den = 0;
    for (const p of points) {
      num += (p.x - meanX) * (p.y - meanY);
      den += (p.x - meanX) ** 2;
    }

    const slope = den !== 0 ? num / den : 0;
    const intercept = meanY - slope * meanX;
    return { slope, intercept, meanX, meanY };
  }, [points]);

  // Calculate RSS, TSS, MSS, R2
  const { rss, tss, mss, rSquared, rmse } = useMemo(() => {
    const n = points.length;
    if (n === 0) return { rss: 0, tss: 0, mss: 0, rSquared: 0, rmse: 0 };

    const meanY = points.reduce((acc, p) => acc + p.y, 0) / n;
    let currentRss = 0;
    let currentTss = 0;

    for (const p of points) {
      const yHat = manualSlope * p.x + manualIntercept;
      currentRss += (p.y - yHat) ** 2;
      currentTss += (p.y - meanY) ** 2;
    }

    const currentMss = Math.max(0, currentTss - currentRss);
    const r2 = currentTss > 0 ? Math.max(0, 1 - currentRss / currentTss) : 0;
    const currentRmse = Math.sqrt(currentRss / n);

    return {
      rss: currentRss,
      tss: currentTss,
      mss: currentMss,
      rSquared: r2,
      rmse: currentRmse,
    };
  }, [points, manualSlope, manualIntercept]);

  const handleAutoFit = () => {
    setManualSlope(olsParams.slope);
    setManualIntercept(olsParams.intercept);
  };

  const handleReset = () => {
    setPoints([
      { id: 1, x: 1.0, y: 1.8 },
      { id: 2, x: 2.5, y: 3.8 },
      { id: 3, x: 4.0, y: 4.5 },
      { id: 4, x: 5.5, y: 6.8 },
      { id: 5, x: 7.0, y: 7.2 },
      { id: 6, x: 8.5, y: 9.0 },
    ]);
    setManualSlope(0.8);
    setManualIntercept(1.0);
  };

  // SVG coordinate transformation
  const toSvgX = (x: number) => 50 + x * 60;
  const toSvgY = (y: number) => 360 - y * 32;

  // Leverage calculation for Tab 3
  const leveragePoints = useMemo(() => {
    const basePts = [
      { id: 1, x: 2.0, y: 2.2 },
      { id: 2, x: 3.0, y: 3.5 },
      { id: 3, x: 4.0, y: 4.1 },
      { id: 4, x: 5.0, y: 5.2 },
      { id: 5, x: 6.0, y: 6.0 },
      { id: 6, x: outlierX, y: outlierY },
    ];
    const n = basePts.length;
    const mx = basePts.reduce((a, b) => a + b.x, 0) / n;
    const my = basePts.reduce((a, b) => a + b.y, 0) / n;
    let num = 0, den = 0;
    for (const p of basePts) {
      num += (p.x - mx) * (p.y - my);
      den += (p.x - mx) ** 2;
    }
    const sl = den !== 0 ? num / den : 0;
    const ic = my - sl * mx;

    // Cook's distance approximation
    const distFromMean = (outlierX - mx) ** 2 / den;
    const res = outlierY - (sl * outlierX + ic);
    const cookD = (res ** 2 * distFromMean) / (2 * 1.0);

    return { pts: basePts, slope: sl, intercept: ic, cookD };
  }, [outlierX, outlierY]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 11 — Hồi quy Tuyến tính (Linear Regression)
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Bình phương Cực tiểu OLS, Hệ số R² & Bắt bệnh Phần dư
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('ols')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'ols'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            1. Mô hình OLS & Hình vuông Sai số
          </button>
          <button
            onClick={() => setActiveTab('r2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'r2'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            2. Phân rã TSS = MSS + RSS (R²)
          </button>
          <button
            onClick={() => setActiveTab('leverage')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'leverage'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            3. Ngoại Lai & Đòn Bẩy (Cook's D)
          </button>
          <button
            onClick={() => setActiveTab('residuals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
              activeTab === 'residuals'
                ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            4. Bắt Bệnh Đồ Thị Phần Dư
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OLS RESIDUAL SQUARES
         ========================================================================= */}
      {activeTab === 'ols' && (
        <div className="space-y-6">
          <LabBriefing
            question="Tại sao phương pháp này lại có tên là 'Bình phương Cực tiểu Thông thường' (Ordinary Least Squares - OLS)? Các hình vuông màu xanh/đỏ trên đồ thị biểu diễn đại lượng vật lý gì?"
            formula="\min_{\beta_0, \beta_1} \sum_{i=1}^n e_i^2 = \min_{\beta_0, \beta_1} \sum_{i=1}^n (y_i - (\beta_0 + \beta_1 x_i))^2"
            mathExplanation="Sai số phần dư e_i là khoảng cách DỌC từ điểm dữ liệu thực tế đến đường thẳng dự báo. Khi ta vẽ hình vuông có cạnh bằng e_i, tổng diện tích của tất cả các hình vuông này chính là RSS! Đường OLS tối ưu là đường thẳng duy nhất làm cho TỔNG DIỆN TÍCH CÁC HÌNH VUÔNG ĐẠT CỰC TIỂU!"
            howToInteract={[
              "Kéo slider 'Hệ số góc β₁' và 'Hệ số chặn β₀' để xoay đường thẳng.",
              "Quan sát các hình vuông màu đỏ/xanh co giãn kích thước.",
              "Bấm nút 'Tự Động Fit OLS Tối Ưu' để xem nghiệm giải tích tức thì."
            ]}
            whatToObserve="Khi bạn xoay đường thẳng trượt xa khỏi đám mây điểm, các hình vuông phình to khổng lồ (RSS tăng vọt). Chỉ khi khớp đúng nghiệm OLS, tổng diện tích mới co về mức nhỏ nhất có thể!"
            takeaway="OLS chỉ cực tiểu hóa sai số theo phương DỌC (trục Y), chứ không phải khoảng cách vuông góc hình học tới đường thẳng!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Đồ Thị Khớp Tuyến Tính OLS: y = β₁x + β₀"
              formula={`\\hat{y} = ${fmt(manualSlope, 2)}x + ${fmt(manualIntercept, 2)} \\quad (\\text{RSS} = ${fmt(rss, 2)})`}
              badge={`OLS Tối ưu: y = ${fmt(olsParams.slope, 2)}x + ${fmt(olsParams.intercept, 2)}`}
              onReset={handleReset}
              extraActions={
                <ClayButton variant="primary" size="sm" onClick={handleAutoFit}>
                  🎯 Tự Động Fit OLS
                </ClayButton>
              }
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[460px]">
              <div className="relative w-full max-w-3xl h-80 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                <svg viewBox="0 0 700 400" className="w-full h-full">
                  {/* Trục tọa độ */}
                  <line x1="50" y1="360" x2="650" y2="360" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="50" y1="40" x2="50" y2="360" stroke="#94a3b8" strokeWidth="1.5" />

                  {/* Residual Squares */}
                  {showSquares &&
                    points.map((p) => {
                      const yHat = manualSlope * p.x + manualIntercept;
                      const py = toSvgY(p.y);
                      const pyHat = toSvgY(yHat);
                      const px = toSvgX(p.x);
                      const diff = Math.abs(py - pyHat);
                      const top = Math.min(py, pyHat);
                      return (
                        <rect
                          key={`sq-${p.id}`}
                          x={px}
                          y={top}
                          width={diff}
                          height={diff}
                          fill="#38bdf8"
                          fillOpacity="0.25"
                          stroke="#0284c7"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      );
                    })}

                  {/* Fitted Line */}
                  <line
                    x1={toSvgX(0)}
                    y1={toSvgY(manualIntercept)}
                    x2={toSvgX(10)}
                    y2={toSvgY(manualSlope * 10 + manualIntercept)}
                    stroke="#0284c7"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  {points.map((p) => (
                    <circle key={p.id} cx={toSvgX(p.x)} cy={toSvgY(p.y)} r="6" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
                  ))}
                </svg>

                <div className="absolute top-3 left-4 text-xs font-mono bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 space-y-1">
                  <div>Tổng diện tích hình vuông sai số <strong className="text-sky-600">RSS = {fmt(rss, 2)}</strong></div>
                  <div>Sai số chuẩn dự báo RMSE = {fmt(rmse, 2)}</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ClaySlider
                  label="Hệ số góc (Độ dốc) β₁"
                  value={manualSlope}
                  min={-1}
                  max={2}
                  step={0.05}
                  color="blue"
                  onChange={setManualSlope}
                />
                <ClaySlider
                  label="Hệ số chặn (Giao trục Y) β₀"
                  value={manualIntercept}
                  min={-2}
                  max={5}
                  step={0.1}
                  color="purple"
                  onChange={setManualIntercept}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 2: R-SQUARED & ANOVA DECOMPOSITION
         ========================================================================= */}
      {activeTab === 'r2' && (
        <div className="space-y-6">
          <LabBriefing
            question="Hệ số xác định R² (R-squared) đo lường điều gì? Tại sao người ta nói 'R² = 85% nghĩa là mô hình giải thích được 85% sự biến thiên của Y'?"
            formula="TSS = MSS + RSS \implies R^2 = \frac{MSS}{TSS} = 1 - \frac{RSS}{TSS} \in [0, 1]"
            mathExplanation="TSS là tổng độ phân tán của Y quanh trung bình mẫu. Khi kẻ đường hồi quy OLS, một phần biến thiên được đường thẳng giải thích (MSS = Model Sum of Squares), phần còn lại là sai số ngẫu nhiên không giải thích được (RSS = Residual Sum of Squares)."
            howToInteract={[
              "Bấm nút 'Tự động Fit OLS' để đưa mô hình về trạng thái tối ưu.",
              "Kéo lệch hệ số góc β₁ và hệ số chặn β₀ để xem R² tụt dốc.",
              "Nhìn thanh tỷ lệ phân rã TSS đổi màu trực quan."
            ]}
            whatToObserve="Khi đường thẳng khớp hoàn hảo qua các điểm, RSS = 0 $\implies$ R² = 1.0 (100%). Khi đường thẳng nằm ngang ở trung bình ȳ, R² = 0!"
            takeaway="R² luôn nằm trong đoạn [0, 1] đối với mô hình OLS có hệ số chặn: Càng gần 1, mô hình càng giải thích tốt biến phụ thuộc Y!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={`Phân Rã Biến Thiên & Hệ Số Xác Định: R² = ${fmt(rSquared * 100, 1)}%`}
              formula="TSS = MSS + RSS"
              badge={`R² = ${fmt(rSquared, 3)}`}
              onReset={handleAutoFit}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-full max-w-xl space-y-6">
                {/* R2 Metric Box */}
                <div className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-3xl shadow-[3px_3px_0px_#0f172a] text-center space-y-2">
                  <span className="text-xs font-heading font-black text-sky-600 uppercase tracking-wider">
                    Hệ số Xác định (Coefficient of Determination)
                  </span>
                  <div className="text-4xl sm:text-5xl font-heading font-black text-slate-900 dark:text-white">
                    R² = {fmt(rSquared * 100, 1)}%
                  </div>
                  <p className="text-xs text-slate-500">
                    Mô hình giải thích được <strong className="text-sky-600">{fmt(rSquared * 100, 1)}%</strong> biến động của dữ liệu Y.
                  </p>
                </div>

                {/* Thanh phân rã TSS */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-sky-600">Được giải thích MSS: {fmt(mss, 1)}</span>
                    <span className="text-rose-600">Sai số dư RSS: {fmt(rss, 1)}</span>
                  </div>
                  <div className="w-full h-8 rounded-xl border-2 border-slate-900 overflow-hidden flex shadow-[2px_2px_0px_#0f172a]">
                    <div style={{ width: `${Math.min(100, rSquared * 100)}%` }} className="bg-sky-500 transition-all duration-200" />
                    <div style={{ width: `${Math.max(0, 100 - rSquared * 100)}%` }} className="bg-rose-400 transition-all duration-200" />
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto flex justify-center gap-3">
                <ClayButton variant="primary" size="md" onClick={handleAutoFit}>
                  🎯 Khớp OLS tối ưu (Cực đại R²)
                </ClayButton>
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 3: OUTLIERS & HIGH LEVERAGE
         ========================================================================= */}
      {activeTab === 'leverage' && (
        <div className="space-y-6">
          <LabBriefing
            question="Có phải mọi điểm ngoại lai (Outlier) đều nguy hiểm như nhau không? Thế nào là điểm có Đòn bẩy cao (High Leverage) và tại sao nó có thể bẻ gãy hoàn toàn đường hồi quy OLS?"
            formula="D_i = \frac{e_i^2}{2 s^2} \frac{h_{ii}}{(1 - h_{ii})^2} \quad (\text{Khoảng cách Cook's Distance})"
            mathExplanation="Điểm nằm ở giữa trục X (gần tâm x̄) dù có lệch cao hay thấp cũng chỉ nhấc nhẹ đường thẳng lên xuống. Nhưng một điểm nằm xa tít ở mép ngoài trục X (hoành độ cực đoan) sở hữu cánh tay đòn khổng lồ (High Leverage). Chỉ cần nó lệch một chút, đường OLS sẽ bị bẻ gãy và quay ngoắt theo nó!"
            howToInteract={[
              "Kéo slider 'Hoành độ x của điểm ngoại lai' từ 4.0 (giữa) sang 9.5 (mép xa).",
              "Kéo slider 'Tung độ y của điểm ngoại lai' xuống 1.0 (nghịch đảo xu hướng).",
              "Quan sát đường hồi quy OLS quay ngoắt và chỉ số Cook's Distance cảnh báo nguy hiểm."
            ]}
            whatToObserve="Khi x = 4.0 (ở giữa), đường hồi quy hầu như không đổi độ dốc. Nhưng khi bạn kéo x ra mép xa (x = 9.0) và hạ thấp y, đường thẳng lập tức bị gập xuống từ đồng biến thành nghịch biến!"
            takeaway="Bài học đắt giá trong khoa học dữ liệu: Phải luôn kiểm tra các điểm High Leverage (Khoảng cách Cook D > 0.5) trước khi đưa ra kết luận hồi quy!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={`Khảo Sát Đòn Bẩy & Điểm Ngoại Lai: Cook's D = ${fmt(leveragePoints.cookD, 2)}`}
              formula={`\\hat{y} = ${fmt(leveragePoints.slope, 2)}x + ${fmt(leveragePoints.intercept, 2)}`}
              badge={leveragePoints.cookD > 0.5 ? 'NGUY HIỂM: BẺ GÃY MÔ HÌNH (D > 0.5)' : 'ẢNH HƯỞNG NHẸ (D ≤ 0.5)'}
              onReset={() => { setOutlierX(8.5); setOutlierY(2.0); }}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="relative w-full max-w-2xl h-80 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                <svg viewBox="0 0 600 380" className="w-full h-full">
                  <line x1="50" y1="340" x2="550" y2="340" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="50" y1="40" x2="50" y2="340" stroke="#94a3b8" strokeWidth="1.5" />

                  {/* Fitted Line */}
                  <line
                    x1={50}
                    y1={340 - leveragePoints.intercept * 30}
                    x2={550}
                    y2={340 - (leveragePoints.slope * 10 + leveragePoints.intercept) * 30}
                    stroke={leveragePoints.cookD > 0.5 ? '#e11d48' : '#0284c7'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Base Points */}
                  {leveragePoints.pts.slice(0, 5).map((p) => (
                    <circle key={p.id} cx={50 + p.x * 50} cy={340 - p.y * 30} r="5" fill="#0284c7" />
                  ))}

                  {/* Interactive Outlier Point */}
                  <circle
                    cx={50 + outlierX * 50}
                    cy={340 - outlierY * 30}
                    r="8"
                    fill="#e11d48"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </svg>

                <div className="absolute top-3 right-4 text-xs font-mono bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 space-y-1">
                  <div className="text-rose-600 font-bold">Điểm kiểm tra (Đỏ): ({fmt(outlierX, 1)}, {fmt(outlierY, 1)})</div>
                  <div className={`font-black ${leveragePoints.cookD > 0.5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    Cook's Distance D = {fmt(leveragePoints.cookD, 2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ClaySlider
                  label="Hoành độ X (Cánh tay đòn)"
                  sublabel="X càng xa tâm x̄ = 4.0, đòn bẩy càng khủng khiếp"
                  value={outlierX}
                  min={3.5}
                  max={9.5}
                  step={0.2}
                  color="rose"
                  onChange={setOutlierX}
                />
                <ClaySlider
                  label="Tung độ Y của điểm ngoại lai"
                  sublabel="Kéo lệch khỏi đám mây để xem OLS bị xoay"
                  value={outlierY}
                  min={0.5}
                  max={8.0}
                  step={0.2}
                  color="purple"
                  onChange={setOutlierY}
                />
              </div>
            </div>
          </ClayCard>
        </div>
      )}

      {/* =========================================================================
          TAB 4: RESIDUAL DIAGNOSTICS
         ========================================================================= */}
      {activeTab === 'residuals' && (
        <div className="space-y-6">
          <LabBriefing
            question="Làm sao để biết mô hình hồi quy tuyến tính của ta có đạt chuẩn hay đã vi phạm các giả thiết Gauss-Markov? Đồ thị phần dư (Residual Plot) tiết lộ những căn bệnh gì của dữ liệu?"
            formula="e_i = y_i - \hat{y}_i \quad \text{vẽ theo } \hat{y}_i"
            mathExplanation="Nếu mô hình tốt, các điểm phần dư e_i phải phân tán hoàn toàn NGẪU NHIÊN trong một dải ngang đồng đều quanh trục 0 (đồng phương sai Homoscedasticity). Nếu phần dư uốn hình chữ U (thiếu biến bậc 2) hoặc xòe hình loa kèn (phương sai thay đổi Heteroscedasticity), mô hình đã bị bệnh!"
            howToInteract={[
              "Chọn 1 trong 3 trạng thái: Chuẩn tắc (Tốt), Phi tuyến (Chữ U), hoặc Loa kèn (Heteroscedasticity).",
              "Nhìn đồ thị phần dư e_i ở bên dưới để học cách 'bắt bệnh'."
            ]}
            whatToObserve="Ở mô hình Loa kèn: Càng về bên phải, các chấm phần dư càng xòe rộng ra. Điều này làm cho khoảng tin cậy và kiểm định t-test không còn đáng tin cậy nữa!"
            takeaway="Kỹ năng làm bài thi và phân tích thực tế: Không bao giờ tin tưởng mù quáng vào R² cao mà phải luôn vẽ đồ thị phần dư để kiểm tra giả thiết đồng phương sai!"
          />

          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title="Bắt Bệnh Mô Hình Qua Đồ Thị Phần Dư (Residual Diagnostics Plot)"
              formula="e_i = y_i - \hat{y}_i"
              badge={diagPattern === 'homoscedastic' ? 'MÔ HÌNH CHUẨN TẮC (TỐT)' : diagPattern === 'nonlinear' ? 'BỆNH: QUAN HỆ PHI TUYẾN' : 'BỆNH: PHƯƠNG SAI THAY ĐỔI'}
              onReset={() => setDiagPattern('homoscedastic')}
            />

            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col items-center justify-center min-h-[420px]">
              <div className="relative w-full max-w-2xl h-80 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-2 shadow-inner">
                <svg viewBox="0 0 600 360" className="w-full h-full">
                  {/* Trục 0 phần dư */}
                  <line x1="50" y1="180" x2="550" y2="180" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="50" y1="40" x2="50" y2="320" stroke="#94a3b8" strokeWidth="1.5" />

                  {/* Scatter residuals */}
                  {(() => {
                    const pts = [];
                    for (let i = 1; i <= 35; i++) {
                      const x = 50 + (i / 36) * 500;
                      let err = (Math.random() - 0.5) * 60;
                      if (diagPattern === 'nonlinear') {
                        // U-shape parabola
                        const normX = (i - 18) / 10;
                        err = (normX * normX - 1.5) * 40 + (Math.random() - 0.5) * 20;
                      } else if (diagPattern === 'heteroscedastic') {
                        // Fan / funnel shape
                        const spread = (i / 36) * 120;
                        err = (Math.random() - 0.5) * spread;
                      }
                      pts.push({ x, y: 180 - err });
                    }
                    return pts.map((p, idx) => (
                      <circle key={idx} cx={p.x} cy={p.y} r="4" fill="#0284c7" fillOpacity="0.8" />
                    ));
                  })()}
                </svg>

                <div className="absolute bottom-3 right-4 text-xs font-mono bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700">
                  {diagPattern === 'homoscedastic' && <span className="text-emerald-600 font-bold">✓ Phân tán đồng đều quanh trục 0: Đạt chuẩn!</span>}
                  {diagPattern === 'nonlinear' && <span className="text-amber-600 font-bold">⚠ Uốn lượn chữ U: Thiếu biến bậc hai X²!</span>}
                  {diagPattern === 'heteroscedastic' && <span className="text-rose-600 font-bold">✗ Hình loa kèn: Phương sai sai số không đều!</span>}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="border-t-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <div className="max-w-xl mx-auto flex flex-wrap justify-center gap-3">
                <ClayButton
                  variant={diagPattern === 'homoscedastic' ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => setDiagPattern('homoscedastic')}
                >
                  1. Chuẩn Tắc (Đồng phương sai)
                </ClayButton>
                <ClayButton
                  variant={diagPattern === 'nonlinear' ? 'secondary' : 'outline'}
                  size="md"
                  onClick={() => setDiagPattern('nonlinear')}
                >
                  2. Bệnh Phi Tuyến (Chữ U)
                </ClayButton>
                <ClayButton
                  variant={diagPattern === 'heteroscedastic' ? 'outline' : 'outline'}
                  size="md"
                  onClick={() => setDiagPattern('heteroscedastic')}
                >
                  3. Bệnh Loa Kèn (Heteroscedasticity)
                </ClayButton>
              </div>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
};
