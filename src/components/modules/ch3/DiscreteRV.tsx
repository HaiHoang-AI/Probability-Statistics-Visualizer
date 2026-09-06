import React, { useState } from 'react';
import { ClayCard } from '../../common/ClayCard';
import { ClaySlider } from '../../common/ClaySlider';
import { MathView } from '../../common/MathView';
import { fmt, binomialPmf, poissonPmf } from '../../../utils/math';
import { DesmosStageHeader } from '../../common/DesmosStageHeader';
import { LabBriefing } from '../../common/LabBriefing';
import { ParticleHistogram } from '../../canvas/ParticleHistogram';

type DiscreteDistType = 'bernoulli' | 'uniform' | 'binomial' | 'geometric' | 'poisson';

export const DiscreteRV: React.FC = () => {
  const [dist, setDist] = useState<DiscreteDistType>('bernoulli');
  const [displayMode, setDisplayMode] = useState<'chart' | 'particle'>('chart');

  // Bernoulli state
  const [bernP, setBernP] = useState<number>(0.6);
  const [bernTrials, setBernTrials] = useState<{ total: number; n0: number; n1: number }>({
    total: 0,
    n0: 0,
    n1: 0,
  });
  const [bernLastBatch, setBernLastBatch] = useState<{
    count: number;
    n0: number;
    n1: number;
    last: number;
  } | null>(null);

  // Uniform state
  const [unifA, setUnifA] = useState<number>(1);
  const [unifB, setUnifB] = useState<number>(6);
  const [unifTrials, setUnifTrials] = useState<{ total: number; counts: Record<number, number> }>({
    total: 0,
    counts: {},
  });
  const [unifLastBatch, setUnifLastBatch] = useState<{ count: number; lastRoll: number } | null>(null);

  // Binomial state
  const [binN, setBinN] = useState<number>(10);
  const [binP, setBinP] = useState<number>(0.5);

  // Poisson state
  const [poiLambda, setPoiLambda] = useState<number>(4.0);

  // Geometric state
  const [geomP, setGeomP] = useState<number>(0.3);

  // Bernoulli simulation helpers
  const runBernoulliTrials = (count: number) => {
    let add0 = 0;
    let add1 = 0;
    let last = 0;
    for (let i = 0; i < count; i++) {
      const outcome = Math.random() < bernP ? 1 : 0;
      if (outcome === 1) add1++;
      else add0++;
      last = outcome;
    }
    setBernLastBatch({ count, n0: add0, n1: add1, last });
    setBernTrials((prev) => ({
      total: prev.total + count,
      n0: prev.n0 + add0,
      n1: prev.n1 + add1,
    }));
  };

  const resetBernoulli = () => {
    setBernTrials({ total: 0, n0: 0, n1: 0 });
    setBernLastBatch(null);
  };

  // Uniform simulation helpers
  const safeUnifB = Math.max(unifA + 1, unifB);
  const runUniformTrials = (count: number) => {
    const range = safeUnifB - unifA + 1;
    if (range <= 0) return;
    const addCounts: Record<number, number> = {};
    let last = unifA;
    for (let i = 0; i < count; i++) {
      const val = unifA + Math.floor(Math.random() * range);
      addCounts[val] = (addCounts[val] || 0) + 1;
      last = val;
    }
    setUnifLastBatch({ count, lastRoll: last });
    setUnifTrials((prev) => {
      const newCounts = { ...prev.counts };
      for (const k in addCounts) {
        newCounts[k] = (newCounts[k] || 0) + addCounts[k];
      }
      return {
        total: prev.total + count,
        counts: newCounts,
      };
    });
  };

  const resetUniform = () => {
    setUnifTrials({ total: 0, counts: {} });
    setUnifLastBatch(null);
  };

  // Compute PMF points & statistics
  const bars: Array<{ k: number; p: number; empCount?: number; empP?: number }> = [];
  let mean = 0;
  let variance = 0;
  let pmfFormula = '';
  let interpretation = '';
  let empiricalMean: number | null = null;

  if (dist === 'bernoulli') {
    mean = bernP;
    variance = bernP * (1 - bernP);
    pmfFormula = `P(X=k) = (${fmt(bernP, 2)})^k (1 - ${fmt(bernP, 2)})^{1-k}, \\quad k \\in \\{0, 1\\}`;
    interpretation = `Phân bố Bernoulli mô tả một phép thử nhị phân: X = 1 (Thành công, p = ${fmt(bernP, 2)}) và X = 0 (Thất bại, q = ${fmt(1 - bernP, 2)}).`;

    const emp0 = bernTrials.total > 0 ? bernTrials.n0 / bernTrials.total : undefined;
    const emp1 = bernTrials.total > 0 ? bernTrials.n1 / bernTrials.total : undefined;
    if (bernTrials.total > 0) {
      empiricalMean = bernTrials.n1 / bernTrials.total;
    }

    bars.push({ k: 0, p: 1 - bernP, empCount: bernTrials.n0, empP: emp0 });
    bars.push({ k: 1, p: bernP, empCount: bernTrials.n1, empP: emp1 });
  } else if (dist === 'uniform') {
    const N = safeUnifB - unifA + 1;
    mean = (unifA + safeUnifB) / 2;
    variance = (N * N - 1) / 12;
    pmfFormula = `P(X=k) = \\frac{1}{${N}} = ${fmt(1 / N, 3)}, \\quad k \\in \\{${unifA}, \\dots, ${safeUnifB}\\}`;
    interpretation = `Phân bố Đều rời rạc gán xác suất bằng nhau tuyệt đối 1/${N} cho mỗi giá trị nguyên từ ${unifA} đến ${safeUnifB}.`;

    let sumEmp = 0;
    for (let k = unifA; k <= safeUnifB; k++) {
      const cnt = unifTrials.counts[k] || 0;
      const emp = unifTrials.total > 0 ? cnt / unifTrials.total : undefined;
      if (unifTrials.total > 0) sumEmp += k * cnt;
      bars.push({ k, p: 1 / N, empCount: cnt, empP: emp });
    }
    if (unifTrials.total > 0) {
      empiricalMean = sumEmp / unifTrials.total;
    }
  } else if (dist === 'binomial') {
    mean = binN * binP;
    variance = binN * binP * (1 - binP);
    pmfFormula = `P(X=k) = \\binom{${binN}}{k} (${fmt(binP, 2)})^k (1 - ${fmt(binP, 2)})^{${binN}-k}`;
    interpretation = `Phân bố Nhị thức đếm tổng số lần thành công trong ${binN} phép thử Bernoulli độc lập có cùng xác suất p = ${fmt(binP, 2)}.`;
    for (let k = 0; k <= binN; k++) {
      bars.push({ k, p: binomialPmf(k, binN, binP) });
    }
  } else if (dist === 'poisson') {
    mean = poiLambda;
    variance = poiLambda;
    pmfFormula = `P(X=k) = \\frac{${poiLambda}^k e^{-${poiLambda}}}{k!}`;
    interpretation = `Phân bố Poisson mô hình hóa số biến cố xảy ra trong một khoảng thời gian hoặc không gian cố định với tần suất trung bình λ = ${poiLambda}.`;
    const maxK = Math.max(15, Math.ceil(poiLambda + 4 * Math.sqrt(poiLambda)));
    for (let k = 0; k <= maxK; k++) {
      bars.push({ k, p: poissonPmf(k, poiLambda) });
    }
  } else {
    mean = 1 / geomP;
    variance = (1 - geomP) / (geomP * geomP);
    pmfFormula = `P(X=k) = (1 - ${fmt(geomP, 2)})^{k-1} (${fmt(geomP, 2)})`;
    interpretation = `Phân bố Hình học đếm số phép thử cần thực hiện cho đến khi xuất hiện lần thành công đầu tiên (với xác suất p = ${fmt(geomP, 2)}).`;
    for (let k = 1; k <= 12; k++) {
      const prob = Math.pow(1 - geomP, k - 1) * geomP;
      bars.push({ k, p: prob });
    }
  }

  const sigma = Math.sqrt(variance);

  // SVG Fixed Coordinate System & Unit Divisions (Fixed Ox and Oy)
  const isBernoulli = dist === 'bernoulli';
  const axisOyX = isBernoulli ? 110 : 80;
  const axisOxY = 330;
  const axisHeight = 250; // from y=330 to y=80

  // 1. Ox Axis Configuration (Fixed domain & fixed ticks per distribution)
  let oxTicks: number[] = [];
  let mapKtoX: (k: number) => number;
  let barWidth = 32;

  if (dist === 'bernoulli') {
    oxTicks = [0, 1];
    barWidth = 64;
    mapKtoX = (k: number) => 260 + k * 280;
  } else if (dist === 'uniform') {
    // Fixed scale for Uniform: k in [0, 12]. All ticks 0..12 are permanently displayed on Ox!
    oxTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const leftX = 125;
    const rightX = 715;
    const stepX = (rightX - leftX) / 12; // ~49.17px
    barWidth = 32;
    mapKtoX = (k: number) => leftX + k * stepX;
  } else if (dist === 'binomial') {
    // Fixed scale for Binomial: k in [0, 20]. All ticks 0..20 are permanently displayed on Ox!
    oxTicks = Array.from({ length: 21 }, (_, i) => i);
    const leftX = 115;
    const rightX = 725;
    const stepX = (rightX - leftX) / 20; // 30.5px
    barWidth = 18;
    mapKtoX = (k: number) => leftX + k * stepX;
  } else if (dist === 'poisson') {
    // Fixed scale for Poisson: k in [0, 20]. All ticks 0..20 are permanently displayed on Ox!
    oxTicks = Array.from({ length: 21 }, (_, i) => i);
    const leftX = 115;
    const rightX = 725;
    const stepX = (rightX - leftX) / 20; // 30.5px
    barWidth = 18;
    mapKtoX = (k: number) => leftX + k * stepX;
  } else {
    // Geometric: k in [1, 12]. All ticks 1..12 are permanently displayed on Ox!
    oxTicks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const leftX = 135;
    const rightX = 715;
    const stepX = (rightX - leftX) / 11; // ~52.73px
    barWidth = 32;
    mapKtoX = (k: number) => leftX + (k - 1) * stepX;
  }

  // 2. Oy Axis Configuration (Fixed unit tick divisions)
  let yMax = 1.0;
  let yTicks: number[] = [];

  if (dist === 'bernoulli') {
    yMax = 1.0;
    yTicks = [0.2, 0.4, 0.6, 0.8, 1.0];
  } else if (dist === 'uniform') {
    yMax = 0.5;
    yTicks = [0.1, 0.2, 0.3, 0.4, 0.5];
  } else if (dist === 'binomial') {
    if (binN <= 2) {
      yMax = 1.0;
      yTicks = [0.2, 0.4, 0.6, 0.8, 1.0];
    } else {
      yMax = 0.5;
      yTicks = [0.1, 0.2, 0.3, 0.4, 0.5];
    }
  } else if (dist === 'poisson') {
    if (poiLambda <= 1.0) {
      yMax = 0.7;
      yTicks = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
    } else {
      yMax = 0.4;
      yTicks = [0.1, 0.2, 0.3, 0.4];
    }
  } else {
    yMax = 1.0;
    yTicks = [0.2, 0.4, 0.6, 0.8, 1.0];
  }

  const mapPtoY = (p: number) => axisOxY - (p / yMax) * axisHeight;

  // Dynamic LabBriefing content per distribution
  const getBriefing = () => {
    switch (dist) {
      case 'bernoulli':
        return {
          title: 'Bản chất Phân bố Bernoulli & Thử nghiệm Nhị phân',
          question: 'Phân bố Bernoulli mô tả điều gì, và tại sao nó được xem là hạt nhân cơ bản của toàn bộ lý thuyết xác suất rời rạc?',
          formula: 'P(X = 1) = p, \\quad P(X = 0) = 1 - p, \\quad \\mathbb{E}[X] = p, \\quad \\text{Var}(X) = p(1 - p)',
          mathExplanation: 'Biến ngẫu nhiên Bernoulli $X \\sim \\text{Bernoulli}(p)$ chỉ nhận đúng 2 giá trị duy nhất: $X = 1$ (Thành công với xác suất $p$) và $X = 0$ (Thất bại với xác suất $1 - p$). Mọi biến cố nhị phân Đúng/Sai, Trúng/Trượt trong đời sống đều có thể mô hình hóa dưới dạng một phép thử Bernoulli.',
          howToInteract: [
            'Kéo thanh trượt Xác suất thành công p từ 0.01 đến 0.99 để quan sát hai cột xác suất thay đổi độ cao đối nghịch nhau.',
            'Bấm các nút Tung 1 lần, Tung 10 lần, Tung 100 lần để chạy mô phỏng thực nghiệm và theo dõi số lần thành công/thất bại tích lũy.',
            'Quan sát tam giác đỏ trọng tâm $\\mathbb{E}[X] = p$ luôn di chuyển mượt mà trên đoạn [0, 1].',
          ],
          whatToObserve: 'Dù biến ngẫu nhiên chỉ nhận giá trị 0 hoặc 1, nhưng kỳ vọng $\\mathbb{E}[X] = p$ lại là một số thực nằm giữa 0 và 1. Điều này chứng minh trực quan rằng Kỳ vọng không nhất thiết phải là một giá trị mà biến ngẫu nhiên có thể nhận được trong thực tế.',
          takeaway: 'Tổng của n biến Bernoulli độc lập cùng tham số p chính là phân bố Nhị thức $B(n, p)$. Bernoulli là viên gạch nguyên tử cấu thành nên toàn bộ thế giới xác suất rời rạc.',
        };
      case 'uniform':
        return {
          title: 'Bản chất Phân bố Đều Rời rạc U{a, b} & Trọng Tâm Đối Xứng',
          question: 'Phân bố Đều rời rạc mô hình hóa hiện tượng gì, và vì sao các cột xác suất lại có độ cao bằng nhau chằn chặn?',
          formula: 'P(X = k) = \\frac{1}{b - a + 1}, \\quad \\mathbb{E}[X] = \\frac{a + b}{2}, \\quad \\text{Var}(X) = \\frac{(b - a + 1)^2 - 1}{12}',
          mathExplanation: 'Phân bố Đều rời rạc gán xác suất đồng đều $1/N$ (với $N = b - a + 1$) cho mọi giá trị nguyên từ $a$ đến $b$. Đây là biểu hiện toán học của Nguyên lý Bất khả Phân biệt: khi không có lý do gì để một kết quả có xác suất cao hơn kết quả khác, ta gán cho tất cả cùng mức xác suất như nhau.',
          howToInteract: [
            'Kéo cận dưới a và cận trên b để thay đổi không gian mẫu.',
            'Bấm các nút chọn nhanh tình huống: Xúc xắc 6 mặt, Xúc xắc 12 mặt, Bốc thăm 10 số để khám phá các mô hình thực tế.',
            'Bấm các nút Gieo thử nghiệm để quan sát số lần xuất hiện thực tế tích lũy.',
          ],
          whatToObserve: 'Đồ thị PMF hoàn toàn phẳng lặng hình chữ nhật nằm ngang. Trọng tâm $\\mathbb{E}[X]$ luôn nằm chính xác ở trung điểm $(a + b)/2$ do tính đối xứng tuyệt đối của các giá trị.',
          takeaway: 'Phân bố Đều là cơ sở cho các trò chơi may rủi (gieo xúc xắc, bốc thăm) và là trạng thái có độ bất định lớn nhất trên một tập hữu hạn.',
        };
      case 'binomial':
        return {
          title: 'Bản chất Phân bố Nhị thức B(n, p) & Hình Dạng Đối Xứng/Lệch',
          question: 'Phân bố Nhị thức đếm đại lượng nào, và hình dạng của nó biến đổi ra sao khi xác suất p dịch chuyển từ 0 đến 1?',
          formula: 'P(X = k) = \\binom{n}{k} p^k (1 - p)^{n - k}, \\quad \\mathbb{E}[X] = n p, \\quad \\text{Var}(X) = n p (1 - p)',
          mathExplanation: 'Biến ngẫu nhiên Nhị thức $X \\sim B(n, p)$ đếm tổng số lần thành công trong $n$ phép thử Bernoulli độc lập có cùng xác suất thành công $p$. Đại lượng $\\binom{n}{k}$ là số tổ hợp cách chọn ra $k$ lần thành công trong $n$ lần thử.',
          howToInteract: [
            'Kéo thanh trượt n (số phép thử) và p (xác suất thành công) để quan sát hình dạng chuông rời rạc biến đổi.',
            'Khi p = 0.5, đồ thị hoàn toàn đối xứng hình chuông quanh tâm $n p = n/2$.',
            'Khi p < 0.5, đồ thị lệch phải; khi p > 0.5, đồ thị lệch trái.',
          ],
          whatToObserve: 'Khi tăng số phép thử n lên lớn ($n \\ge 20$), hình dạng các cột phân bố Nhị thức ngày càng giống với đường cong hình chuông Gauss liên tục (Định lý De Moivre - Laplace).',
          takeaway: 'Phân bố Nhị thức là mô hình đếm số lần thành công cơ bản nhất trong thống kê, ứng dụng rộng rãi từ kiểm tra chất lượng sản phẩm đến điều tra thăm dò dư luận.',
        };
      case 'geometric':
        return {
          title: 'Bản chất Phân bố Hình học Geom(p) & Đuôi Xác Suất Giảm Dần',
          question: 'Phân bố Hình học đo lường cái gì, và tại sao xác suất lại suy giảm theo cấp số nhân?',
          formula: 'P(X = k) = (1 - p)^{k - 1} p, \\quad \\mathbb{E}[X] = \\frac{1}{p}, \\quad \\text{Var}(X) = \\frac{1 - p}{p^2}',
          mathExplanation: 'Biến ngẫu nhiên Hình học $X \\sim \\text{Geom}(p)$ đếm số phép thử cần thực hiện cho đến khi xuất hiện lần thành công ĐẦU TIÊN. Để thành công ở lần thứ $k$, bắt buộc phải có đúng $k - 1$ lần thất bại liên tiếp trước đó (mỗi lần với xác suất $1 - p$) rồi mới tới 1 lần thành công (xác suất $p$).',
          howToInteract: [
            'Kéo slider p: xác suất thành công càng nhỏ thì cần thử nghiệm trung bình càng nhiều lần $\\mathbb{E}[X] = 1/p$.',
            'Quan sát các cột xác suất: cột đầu tiên tại k = 1 luôn cao nhất và các cột sau suy giảm dần theo tỷ lệ $(1 - p)$.',
          ],
          whatToObserve: 'Đồ thị luôn có dạng dốc xuống dạng hàm mũ rời rạc (cấp số nhân). Phân bố Hình học là phân bố rời rạc duy nhất có tính chất không nhớ: $P(X > s + t \\mid X > s) = P(X > t)$.',
          takeaway: 'Phân bố Hình học mô tả thời gian chờ đợi thành công đầu tiên, ví dụ: gieo xúc xắc bao nhiêu lần thì được mặt 6, hoặc phỏng vấn bao nhiêu ứng viên thì tìm được người phù hợp.',
        };
      case 'poisson':
        return {
          title: 'Bản chất Phân bố Poisson(λ) & Quy Luật Biến Cố Hiếm',
          question: 'Phân bố Poisson bắt nguồn từ đâu, và mối liên hệ kỳ lạ giữa kỳ vọng và phương sai của nó là gì?',
          formula: 'P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}, \\quad \\mathbb{E}[X] = \\lambda, \\quad \\text{Var}(X) = \\lambda',
          mathExplanation: 'Phân bố Poisson $\\text{Pois}(\\lambda)$ đếm số biến cố xảy ra trong một khoảng thời gian hoặc không gian cố định, khi các biến cố xảy ra độc lập với nhau với tần suất trung bình $\\lambda$. Đây là xấp xỉ hoàn hảo của phân bố Nhị thức $B(n, p)$ khi $n$ rất lớn và $p$ rất nhỏ sao cho $n p = \\lambda$ không đổi (Luật số hiếm Poisson).',
          howToInteract: [
            'Kéo slider λ từ 0.5 đến 10 để quan sát đỉnh của phân bố dịch chuyển về phía λ.',
            'Khi λ nhỏ (dưới 1), đồ thị dốc đứng tại k = 0; khi λ lớn (trên 5), đồ thị dần trở nên tròn trịa và đối xứng gần giống phân bố Chuẩn.',
          ],
          whatToObserve: 'Đặc điểm nhận dạng độc nhất vô nhị của Poisson: Kỳ vọng và Phương sai luôn bằng nhau chằn chặn $\\mathbb{E}[X] = \\text{Var}(X) = \\lambda$.',
          takeaway: 'Phân bố Poisson mô hình hóa lưu lượng cuộc gọi tới tổng đài, số lỗi phần mềm trên 1000 dòng lệnh, số tai nạn giao thông trong một tháng, hay số lượt truy cập máy chủ.',
        };
    }
  };

  const currentBriefing = getBriefing();

  return (
    <div className="space-y-6">
      {/* Chapter Subtitle & Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            MAT1101 Bài 3 & 4 — Biến ngẫu nhiên Rời rạc
          </span>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-0.5">
            Hàm khối xác suất (PMF) & Trọng tâm Kỳ vọng <MathView math="\mathbb{E}[X]" />
          </h2>
        </div>

        {/* 5 Distribution Selector Tabs (Standard Naming) */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'bernoulli', label: 'Bernoulli' },
              { id: 'uniform', label: 'Đều (Uniform)' },
              { id: 'binomial', label: 'Nhị thức (Binomial)' },
              { id: 'geometric', label: 'Hình học (Geometric)' },
              { id: 'poisson', label: 'Poisson' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setDist(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                dist === t.id
                  ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7]'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT COLUMN: 3 CONTROLS & INFO CARDS */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 space-y-4 order-2 lg:order-1">
          {/* Card 1: Điều khiển tham số */}
          <ClayCard glowColor="amber" className="p-5">
            <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              {dist === 'bernoulli' && 'Tham số Bernoulli (p)'}
              {dist === 'uniform' && 'Tham số Phân bố Đều U{a, b}'}
              {dist === 'binomial' && 'Tham số Nhị thức B(n, p)'}
              {dist === 'poisson' && 'Tham số Poisson (λ)'}
              {dist === 'geometric' && 'Tham số Hình học Geom(p)'}
            </h4>

            {dist === 'bernoulli' && (
              <div className="space-y-4">
                <ClaySlider
                  label="Xác suất thành công p"
                  value={bernP}
                  min={0.01}
                  max={0.99}
                  step={0.01}
                  color="emerald"
                  formatValue={(v) => fmt(v, 2)}
                  onChange={(val) => {
                    setBernP(val);
                    resetBernoulli();
                  }}
                />

                {/* Bernoulli Trials Box */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Mô phỏng Thử nghiệm Bernoulli
                    </span>
                    {bernTrials.total > 0 && (
                      <button
                        type="button"
                        onClick={resetBernoulli}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold underline cursor-pointer"
                      >
                        Đặt lại đếm
                      </button>
                    )}
                  </div>

                  {/* Action Buttons: Tung 1 lần, 10 lần, 100 lần */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => runBernoulliTrials(1)}
                      className="py-2 px-2 text-xs font-heading font-bold rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] hover:bg-sky-500 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer text-center"
                    >
                      Tung 1 lần
                    </button>
                    <button
                      type="button"
                      onClick={() => runBernoulliTrials(10)}
                      className="py-2 px-2 text-xs font-heading font-bold rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] hover:bg-sky-500 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer text-center"
                    >
                      Tung 10 lần
                    </button>
                    <button
                      type="button"
                      onClick={() => runBernoulliTrials(100)}
                      className="py-2 px-2 text-xs font-heading font-bold rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] hover:bg-sky-500 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer text-center"
                    >
                      Tung 100 lần
                    </button>
                  </div>

                  {/* Latest Batch Result Banner */}
                  {bernLastBatch && (
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs">
                      {bernLastBatch.count === 1 ? (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">Lần tung vừa rồi:</span>
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                              bernLastBatch.last === 1
                                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            X = {bernLastBatch.last === 1 ? '1 (Thành công)' : '0 (Thất bại)'}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-slate-500 dark:text-slate-400 font-semibold">
                            Kết quả đợt vừa tung (+{bernLastBatch.count} lần):
                          </div>
                          <div className="flex justify-between font-mono font-bold">
                            <span className="text-emerald-600 dark:text-emerald-400">
                              X = 1: {bernLastBatch.n1} lần
                            </span>
                            <span className="text-rose-600 dark:text-rose-400">
                              X = 0: {bernLastBatch.n0} lần
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cumulative Simulation Statistics */}
                  {bernTrials.total > 0 && (
                    <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold">
                        <span>Tổng số lần đã thử:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{bernTrials.total} lần</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
                        <span>Số lần X = 1:</span>
                        <span>
                          <strong>{bernTrials.n1}</strong> ({fmt((bernTrials.n1 / bernTrials.total) * 100, 1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Số lần X = 0:</span>
                        <span>
                          <strong>{bernTrials.n0}</strong> ({fmt((bernTrials.n0 / bernTrials.total) * 100, 1)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {dist === 'uniform' && (
              <div className="space-y-4">
                {/* Quick Presets (NO EMOJIS) */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                    Tình huống mô hình thực tế:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUnifA(1);
                        setUnifB(6);
                        resetUniform();
                      }}
                      className="px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      Xúc xắc 6 mặt (1-6)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUnifA(1);
                        setUnifB(12);
                        resetUniform();
                      }}
                      className="px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      Xúc xắc 12 mặt (D12)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUnifA(1);
                        setUnifB(10);
                        resetUniform();
                      }}
                      className="px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      Bốc thăm 10 số (1-10)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUnifA(0);
                        setUnifB(1);
                        resetUniform();
                      }}
                      className="px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-700 dark:text-slate-200 transition-colors text-left cursor-pointer"
                    >
                      Đồng xu nhị phân {'{0, 1}'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ClaySlider
                    label="Cận dưới a"
                    value={unifA}
                    min={0}
                    max={5}
                    step={1}
                    color="amber"
                    onChange={(val) => {
                      setUnifA(val);
                      if (unifB <= val) setUnifB(val + 1);
                      resetUniform();
                    }}
                  />
                  <ClaySlider
                    label="Cận trên b"
                    value={unifB}
                    min={unifA + 1}
                    max={12}
                    step={1}
                    color="amber"
                    onChange={(val) => {
                      setUnifB(val);
                      resetUniform();
                    }}
                  />
                </div>

                {/* Uniform Roll Simulation */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Mô phỏng Gieo ngẫu nhiên
                    </span>
                    {unifTrials.total > 0 && (
                      <button
                        type="button"
                        onClick={resetUniform}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold underline cursor-pointer"
                      >
                        Đặt lại đếm
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => runUniformTrials(1)}
                      className="py-2 px-2 text-xs font-heading font-bold rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] hover:bg-sky-500 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer text-center"
                    >
                      Gieo 1 lần
                    </button>
                    <button
                      type="button"
                      onClick={() => runUniformTrials(20)}
                      className="py-2 px-2 text-xs font-heading font-bold rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] hover:bg-sky-500 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer text-center"
                    >
                      Gieo 20 lần
                    </button>
                    <button
                      type="button"
                      onClick={() => runUniformTrials(100)}
                      className="py-2 px-2 text-xs font-heading font-bold rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] hover:bg-sky-500 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer text-center"
                    >
                      Gieo 100 lần
                    </button>
                  </div>

                  {unifLastBatch && (
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs flex items-center justify-between font-mono">
                      <span className="text-slate-600 dark:text-slate-300">
                        {unifLastBatch.count === 1 ? 'Lần gieo vừa rồi:' : `Đã gieo +${unifLastBatch.count} lần (lần cuối):`}
                      </span>
                      <span className="font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                        Kết quả: {unifLastBatch.lastRoll}
                      </span>
                    </div>
                  )}

                  {unifTrials.total > 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono text-center">
                      Tổng số lượt gieo: <strong className="text-slate-800 dark:text-slate-200">{unifTrials.total}</strong> lần
                    </div>
                  )}
                </div>
              </div>
            )}

            {dist === 'binomial' && (
              <div className="space-y-3">
                <ClaySlider
                  label="Số phép thử n"
                  value={binN}
                  min={1}
                  max={20}
                  step={1}
                  color="orange"
                  onChange={setBinN}
                />
                <ClaySlider
                  label="Xác suất thành công p"
                  value={binP}
                  min={0.05}
                  max={0.95}
                  step={0.05}
                  color="orange"
                  formatValue={(v) => fmt(v, 2)}
                  onChange={setBinP}
                />
              </div>
            )}

            {dist === 'poisson' && (
              <ClaySlider
                label="Tần suất trung bình lambda"
                value={poiLambda}
                min={0.5}
                max={10}
                step={0.5}
                color="amber"
                onChange={setPoiLambda}
              />
            )}

            {dist === 'geometric' && (
              <ClaySlider
                label="Xác suất thành công p"
                value={geomP}
                min={0.1}
                max={0.9}
                step={0.05}
                color="emerald"
                formatValue={(v) => fmt(v, 2)}
                onChange={setGeomP}
              />
            )}
          </ClayCard>

          {/* Card 2: Công thức Toán học */}
          <ClayCard glowColor="blue" className="p-5">
            <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Công thức Khối Xác suất PMF
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 font-medium">
              {interpretation}
            </p>
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-center font-mono font-bold text-sky-700 dark:text-sky-300 text-sm sm:text-base overflow-x-auto">
              <MathView math={pmfFormula} />
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Điều kiện chuẩn hóa:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                <MathView math="\sum_k P(X = k) = 1" />
              </span>
            </div>
          </ClayCard>

          {/* Card 3: Thống kê Moment */}
          <ClayCard glowColor="emerald" className="p-5">
            <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Đặc trưng Số của Phân bố
            </h4>
            <div className="space-y-2.5 text-sm sm:text-[15px]">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Kỳ vọng E[X]:</span>
                <span className="font-mono font-black text-red-600 dark:text-red-400 text-base sm:text-lg">
                  {fmt(mean, 2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Phương sai Var(X):</span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  {fmt(variance, 2)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Độ lệch chuẩn sigma:</span>
                <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-base sm:text-lg">
                  {fmt(sigma, 2)}
                </span>
              </div>
              {empiricalMean !== null && (
                <div className="flex justify-between items-center py-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2 rounded-lg">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                    Trung bình thực nghiệm:
                  </span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                    {fmt(empiricalMean, 3)}
                  </span>
                </div>
              )}
            </div>
          </ClayCard>
        </div>

        {/* RIGHT COLUMN: GRAPH STAGE */}
        <div className="w-full lg:flex-1 min-w-0 order-1 lg:order-2">
          <ClayCard className="p-0 overflow-hidden border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#0284c7]">
            <DesmosStageHeader
              title={
                dist === 'bernoulli'
                  ? 'Mô hình Phân bố Bernoulli & Tần suất Thực nghiệm'
                  : dist === 'uniform'
                  ? 'Hàm Khối Xác Suất Phân bố Đều Rời Rạc U{a, b}'
                  : dist === 'binomial'
                  ? 'Hàm Khối Xác Suất Phân bố Nhị thức B(n, p)'
                  : dist === 'poisson'
                  ? 'Hàm Khối Xác Suất Phân bố Poisson(λ)'
                  : 'Hàm Khối Xác Suất Phân bố Hình học Geom(p)'
              }
              formula={`\\mathbb{E}[X] = ${fmt(mean, 2)}`}
              badge={`Var(X) = ${fmt(variance, 2)}`}
              onReset={() => {
                if (dist === 'bernoulli') {
                  setBernP(0.6);
                  resetBernoulli();
                } else if (dist === 'uniform') {
                  setUnifA(1);
                  setUnifB(6);
                  resetUniform();
                } else if (dist === 'binomial') {
                  setBinN(10);
                  setBinP(0.5);
                } else if (dist === 'poisson') {
                  setPoiLambda(4.0);
                } else {
                  setGeomP(0.3);
                }
              }}
            />

            {/* Mode Switcher: Chart vs Particle Simulation */}
            <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Chế độ trực quan:</span>
              <button
                onClick={() => setDisplayMode('chart')}
                className={`px-3 py-1 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                  displayMode === 'chart'
                    ? 'bg-sky-600 text-white shadow-[2px_2px_0px_#0f172a]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Đồ thị Cột Cố định
              </button>
              <button
                onClick={() => setDisplayMode('particle')}
                className={`px-3 py-1 rounded-xl text-xs font-heading font-bold border-2 border-slate-900 dark:border-slate-700 transition-all cursor-pointer ${
                  displayMode === 'particle'
                    ? 'bg-amber-400 text-slate-950 shadow-[2px_2px_0px_#0f172a]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Mô phỏng Hạt rơi (Particle Mode)
              </button>
            </div>

            {displayMode === 'particle' ? (
              <div className="p-4 sm:p-6">
                <ParticleHistogram
                  dist={dist}
                  bars={bars}
                  oxTicks={oxTicks}
                  yTicks={yTicks}
                  yMax={yMax}
                  axisOyX={axisOyX}
                  axisOxY={axisOxY}
                  mapKtoX={mapKtoX}
                  mapPtoY={mapPtoY}
                  barWidth={barWidth}
                  theoreticalMean={mean}
                  theoreticalVar={variance}
                />
              </div>
            ) : (
            <div className="desmos-viewport w-full p-4 sm:p-6 flex flex-col justify-between min-h-[460px]">
              <svg viewBox="0 0 800 380" className="w-full h-auto select-none">
                <defs>
                  <marker id="arrow-pmf-x" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-pmf-y" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
                  </marker>
                </defs>

                {/* Desmos Cartesian Axes */}
                <line
                  x1={axisOyX - 20}
                  y1={axisOxY}
                  x2="760"
                  y2={axisOxY}
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-pmf-x)"
                />
                <line
                  x1={axisOyX}
                  y1="350"
                  x2={axisOyX}
                  y2="30"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-pmf-y)"
                />
                <text x="770" y="334" fill="#EF4444" fontSize="13" fontWeight="bold" fontFamily="monospace">
                  k
                </text>
                <text
                  x={axisOyX}
                  y="20"
                  fill="#10B981"
                  fontSize="13"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  P(X=k)
                </text>

                {/* Oy Fixed Unit Ticks, Numbers and Horizontal Grid Lines */}
                {yTicks.map((val) => {
                  const py = mapPtoY(val);
                  return (
                    <g key={val}>
                      {/* Light horizontal grid line */}
                      <line
                        x1={axisOyX}
                        y1={py}
                        x2="745"
                        y2={py}
                        stroke="#94A3B8"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        strokeOpacity="0.25"
                      />
                      {/* Tick mark on Oy */}
                      <line
                        x1={axisOyX - 4}
                        y1={py}
                        x2={axisOyX + 4}
                        y2={py}
                        stroke="#10B981"
                        strokeWidth="1.5"
                      />
                      {/* Number on Oy */}
                      <text
                        x={axisOyX - 8}
                        y={py + 3.5}
                        fill="#64748B"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {val.toFixed(1)}
                      </text>
                    </g>
                  );
                })}
                {/* Oy Origin 0.0 */}
                <text
                  x={axisOyX - 8}
                  y="333.5"
                  fill="#64748B"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  0.0
                </text>

                {/* Ox Fixed Unit Ticks and Numbers (Permanently fixed, never hidden) */}
                {oxTicks.map((kVal) => {
                  const cx = mapKtoX(kVal);
                  return (
                    <g key={kVal}>
                      {/* Tick mark on Ox */}
                      <line
                        x1={cx}
                        y1="326"
                        x2={cx}
                        y2="334"
                        stroke="#EF4444"
                        strokeWidth="1.5"
                      />
                      {/* Number on Ox */}
                      <text
                        x={cx}
                        y="350"
                        fill="#64748B"
                        fontSize={dist === 'binomial' || dist === 'poisson' ? '10' : '11'}
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {isBernoulli ? (kVal === 0 ? '0 (Thất bại)' : '1 (Thành công)') : kVal}
                      </text>
                    </g>
                  );
                })}

                {/* PMF Bars */}
                {bars.map((b) => {
                  const cx = mapKtoX(b.k);
                  const topY = Math.max(30, mapPtoY(b.p));
                  const h = Math.max(0, axisOxY - topY);

                  const hasEmp = b.empP !== undefined;
                  const empTopY = hasEmp ? Math.max(30, mapPtoY(b.empP!)) : axisOxY;
                  const empH = Math.max(0, axisOxY - empTopY);

                  const singleBarW = hasEmp ? barWidth * 0.45 : barWidth;

                  return (
                    <g key={b.k}>
                      {/* Theoretical PMF Bar */}
                      <rect
                        x={hasEmp ? cx - singleBarW - 3 : cx - singleBarW / 2}
                        y={topY}
                        width={singleBarW}
                        height={h}
                        rx="4"
                        fill="#0284C7"
                        stroke="#0F172A"
                        strokeWidth="1.5"
                        className="hover:fill-sky-400 transition-colors"
                      />

                      {/* Theoretical Value Label */}
                      {b.p >= yMax * 0.04 && (
                        <text
                          x={hasEmp ? cx - singleBarW / 2 - 3 : cx}
                          y={topY - 6}
                          fill="#0284C7"
                          className="dark:fill-sky-400"
                          fontSize={dist === 'binomial' || dist === 'poisson' ? '9' : '10'}
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {fmt(b.p, 3)}
                        </text>
                      )}

                      {/* Empirical Simulation Bar (if simulated) */}
                      {hasEmp && (
                        <>
                          <rect
                            x={cx + 3}
                            y={empTopY}
                            width={singleBarW}
                            height={empH}
                            rx="4"
                            fill="#10B981"
                            stroke="#0F172A"
                            strokeWidth="1.5"
                            className="hover:fill-emerald-400 transition-colors"
                          />
                          <text
                            x={cx + singleBarW / 2 + 3}
                            y={empTopY - 6}
                            fill="#10B981"
                            className="dark:fill-emerald-400"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {fmt(b.empP!, 3)}
                          </text>
                        </>
                      )}

                      {/* Outcome count under k if empirical */}
                      {hasEmp && (
                        <text
                          x={cx}
                          y="364"
                          fill="#10B981"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          n={b.empCount}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 1-Sigma Band [E[X]-sigma, E[X]+sigma] */}
                {(() => {
                  const xLeft = Math.max(axisOyX + 10, mapKtoX(mean - sigma));
                  const xRight = Math.min(740, mapKtoX(mean + sigma));
                  if (xRight <= xLeft) return null;
                  return (
                    <g>
                      <line x1={xLeft} y1="50" x2={xRight} y2="50" stroke="#F59E0B" strokeWidth="2.5" />
                      <line x1={xLeft} y1="44" x2={xLeft} y2="56" stroke="#F59E0B" strokeWidth="2" />
                      <line x1={xRight} y1="44" x2={xRight} y2="56" stroke="#F59E0B" strokeWidth="2" />
                      <text
                        x={(xLeft + xRight) / 2}
                        y="42"
                        fill="#F59E0B"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        Dải ±1σ = [{fmt(mean - sigma, 1)}, {fmt(mean + sigma, 1)}]
                      </text>
                    </g>
                  );
                })()}

                {/* Mean E[X] Fulcrum (Trọng tâm) Indicator */}
                {(() => {
                  const meanX = mapKtoX(mean);
                  return (
                    <g>
                      <line
                        x1={meanX}
                        y1="65"
                        x2={meanX}
                        y2={axisOxY}
                        stroke="#EF4444"
                        strokeWidth="2.5"
                        strokeDasharray="5 3"
                      />
                      <polygon
                        points={`${meanX - 8},342 ${meanX + 8},342 ${meanX},${axisOxY}`}
                        fill="#EF4444"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      <text
                        x={meanX}
                        y="60"
                        fill="#EF4444"
                        fontSize="12"
                        fontWeight="black"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        E[X] = {fmt(mean, 2)}
                      </text>
                    </g>
                  );
                })()}
              </svg>

              {/* Bottom Stage Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
                    <span className="w-3 h-3 bg-sky-500 rounded-sm"></span> Cột xác suất lý thuyết P(X = k)
                  </span>
                  {(dist === 'bernoulli' || dist === 'uniform') && (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Tần suất thực nghiệm
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
                    <span className="w-3.5 h-0.5 bg-red-500 border-dashed"></span> Trọng tâm vật lý E[X] = {fmt(mean, 2)}
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <span className="w-3.5 h-0.5 bg-amber-500"></span> Dải độ lệch chuẩn ±1σ
                  </span>
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  Độ lệch chuẩn σ = {fmt(sigma, 2)}
                </span>
              </div>
            </div>
            )}
          </ClayCard>
        </div>
      </div>

      {/* FULL-WIDTH DYNAMIC LAB BRIEFING AT BOTTOM */}
      <LabBriefing
        key={dist}
        title={currentBriefing.title}
        question={currentBriefing.question}
        formula={currentBriefing.formula}
        mathExplanation={currentBriefing.mathExplanation}
        howToInteract={currentBriefing.howToInteract}
        whatToObserve={currentBriefing.whatToObserve}
        takeaway={currentBriefing.takeaway}
      />
    </div>
  );
};
