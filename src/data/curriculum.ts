import { ChapterInfo } from '../types';

export const CURRICULUM_DATA: ChapterInfo[] = [
  {
    id: 'ch7-1-derived',
    number: 'Bài 7.1',
    titleEn: 'Derived Distributions & Convolution',
    titleVi: 'Biến ngẫu nhiên Dẫn xuất & Phép Tích chập',
    subtitle: 'Biến đổi hàm Y = g(X), Tích chập tổng Z = X + Y, Hiệp phương sai & Hệ số tương quan rho',
    lecturePdf: 'MAT1101 Bài 7.1 -- Biến ngẫu nhiên dẫn xuất.pdf',
    iconName: 'Workflow',
    color: 'from-amber-400 to-orange-500',
    isPriority: true,
    modules: [
      {
        id: 'derived-convolution',
        titleEn: 'Convolution Animation (Z = X + Y)',
        titleVi: 'Mô phỏng Phép Tích chập trực quan',
        chapterId: 'ch7-1-derived',
        lectureRef: 'Slide 14 - 17',
        descriptionVi: 'Trực quan hóa hoạt ảnh lật ngược và trượt của f_Y(z-x) trên f_X(x) để tạo nên hàm mật độ tổng f_Z(z).',
        tag: 'Convolution',
        badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
        isPriority: true
      },
      {
        id: 'derived-transform',
        titleEn: 'Density Transformation Y = g(X)',
        titleVi: 'Đổi biến Hàm Mật độ Liên tục',
        chapterId: 'ch7-1-derived',
        lectureRef: 'Slide 6 - 13',
        descriptionVi: 'Trực quan hóa công thức f_Y(y) = f_X(x) / |g\'(x)|. Giải thích vì sao đoạn nào hàm g phẳng thì mật độ f_Y vọt lên cực đại.',
        tag: 'Jacobian',
        badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
        isPriority: true
      },
      {
        id: 'derived-extremes',
        titleEn: 'Order Statistics: Min & Max Distributions',
        titleVi: 'Phân phối Cực trị Hệ Song song & Nối tiếp',
        chapterId: 'ch7-1-derived',
        lectureRef: 'Slide 18 - 22',
        descriptionVi: 'Mô phỏng tuổi thọ hệ thống: W = max(X_1..X_n) dạt sang phải, V = min(X_1..X_n) co cụm về 0.',
        tag: 'Max/Min RVs',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        isPriority: true
      },
      {
        id: 'derived-correlation',
        titleEn: 'Covariance & Correlation Scatter (rho)',
        titleVi: 'Khám phá Tương quan & Trực giao',
        chapterId: 'ch7-1-derived',
        lectureRef: 'Slide 23 - 26',
        descriptionVi: 'Kéo slider rho từ -1 đến +1 xem đám mây điểm biến đổi. Bẫy kinh điển: rho = 0 nhưng Y = X^2 phụ thuộc hoàn toàn!',
        tag: 'Correlation',
        badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        isPriority: true
      },
      {
        id: 'derived-total-var',
        titleEn: "Total Variance Decomposition (Eve's Law)",
        titleVi: 'Phân rã Phương sai Toàn phần',
        chapterId: 'ch7-1-derived',
        lectureRef: 'Slide 27 - 31',
        descriptionVi: 'Trực quan hóa Var(X) = Var(E[X|Y]) + E[Var(X|Y)] qua các thanh xếp chồng màu sắc.',
        tag: 'Variance',
        badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
        isPriority: true
      }
    ]
  },
  {
    id: 'ch7-2-mgf',
    number: 'Bài 7.2',
    titleEn: 'Moment Generating Functions (MGF)',
    titleVi: 'Hàm sinh Moment & Phép cộng Độc lập',
    subtitle: 'Định nghĩa M_X(s) = E[e^{sX}], đạo hàm bậc cao tại 0 sinh ra Moment, biến tích chập thành phép nhân',
    lecturePdf: 'MAT1101 Bài 7.2 -- Hàm sinh moment.pdf',
    iconName: 'Sparkles',
    color: 'from-orange-500 to-rose-500',
    isPriority: true,
    modules: [
      {
        id: 'mgf-curvature',
        titleEn: 'MGF Tangent & Taylor Curvature at s = 0',
        titleVi: 'Độ dốc & Độ cong Hàm sinh Moment',
        chapterId: 'ch7-2-mgf',
        lectureRef: 'Slide 6 - 13',
        descriptionVi: 'Xem tiếp tuyến tại s=0 (kỳ vọng E[X]) và parabol xấp xỉ (moment bậc 2 E[X^2]) của các phân bố Poisson, Exponential, Normal.',
        tag: 'MGF',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        isPriority: true
      },
      {
        id: 'mgf-sum-product',
        titleEn: 'Sum of RVs: Convolution vs Product of MGFs',
        titleVi: 'Nhân đại số MGF thay cho Tích chập',
        chapterId: 'ch7-2-mgf',
        lectureRef: 'Slide 16 - 22',
        descriptionVi: 'Xem trực quan vì sao tổng biến Poisson độc lập lại là Poisson, và Gaussian + Gaussian = Gaussian nhờ tính chất nhân MGF.',
        tag: 'Algebraic MGF',
        badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
        isPriority: true
      },
      {
        id: 'wald-random-sum',
        titleEn: "Wald's Identity: Random Sum of RVs",
        titleVi: 'Tổng số Ngẫu nhiên các Biến & Định lý Wald',
        chapterId: 'ch7-2-mgf',
        lectureRef: 'Slide 23 - 28',
        descriptionVi: 'Mô phỏng Monte Carlo kiểm chứng công thức Wald: E[S] = E[N]E[X] và Var(S) khi cả số lượng phần tử N cũng là biến ngẫu nhiên.',
        tag: 'Wald Identity',
        badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        isPriority: true
      }
    ]
  },
  {
    id: 'ch8-limit-theorems',
    number: 'Bài 8',
    titleEn: 'Limit Theorems & Central Limit Theorem (CLT)',
    titleVi: 'Các Định lý Giới hạn & CLT',
    subtitle: 'Luật số lớn (WLLN & SLLN), Cận Markov / Chebyshev / Chernoff, Định lý Giới hạn Trung tâm',
    lecturePdf: 'MAT1101 Bài 8 -- Các định lý giới hạn.pdf',
    iconName: 'TrendingUp',
    color: 'from-emerald-400 to-teal-600',
    isPriority: true,
    modules: [
      {
        id: 'clt-lab',
        titleEn: 'Central Limit Theorem Interactive Lab',
        titleVi: 'Phòng thí nghiệm Định lý Giới hạn Trung tâm',
        chapterId: 'ch8-limit-theorems',
        lectureRef: 'Slide 35 - 55',
        descriptionVi: 'Chọn phân bố gốc bất kỳ (Uniform, Lệch Exponential, Bimodal, Xúc xắc), kéo n từ 1 đến 35 để thấy chuông Gauss xuất hiện kỳ diệu.',
        tag: 'CLT Miracle',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        isPriority: true
      },
      {
        id: 'lln-paths',
        titleEn: 'Law of Large Numbers: Sample Paths',
        titleVi: 'Mô phỏng Quỹ đạo Luật số lớn',
        chapterId: 'ch8-limit-theorems',
        lectureRef: 'Slide 16 - 34',
        descriptionVi: 'Tung 15 chuỗi mẫu X_bar_n theo n, quan sát chúng chui hết vào ống epsilon quanh mu khi n tiến ra vô cùng.',
        tag: 'LLN Convergence',
        badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
        isPriority: true
      },
      {
        id: 'inequality-bounds',
        titleEn: 'Inequality Comparator: Markov vs Chebyshev vs Chernoff',
        titleVi: 'So tài 3 Cận Xác suất Đuôi',
        chapterId: 'ch8-limit-theorems',
        lectureRef: 'Slide 6 - 15',
        descriptionVi: 'Đồ thị so sánh tốc độ siết cận của Markov, Chebyshev (1/k^2) và Chernoff (hàm mũ e^{-ck^2}).',
        tag: 'Tail Bounds',
        badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
        isPriority: true
      },
      {
        id: 'cauchy-clt-failure',
        titleEn: 'When CLT Breaks Down: Cauchy Counterexample',
        titleVi: 'Khi CLT Thất bại: Phân phối Cauchy & Đuôi dày',
        chapterId: 'ch8-limit-theorems',
        lectureRef: 'Slide 56 - 60',
        descriptionVi: 'Mô phỏng phân phối Cauchy có phương sai vô hạn. Tăng n nhưng trung bình mẫu vẫn giật tung tóe, không bao giờ hóa thành chuông Gauss!',
        tag: 'Fat Tails',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        isPriority: true
      }
    ]
  },
  {
    id: 'ch9-bayesian',
    number: 'Bài 9',
    titleEn: 'Bayesian Statistical Inference',
    titleVi: 'Suy luận Thống kê theo Trường phái Bayes',
    subtitle: 'Tiên nghiệm (Prior), Hàm hợp lý (Likelihood), Hậu nghiệm (Posterior), Mô hình Beta-Binomial, MAP vs LMS',
    lecturePdf: 'MAT1101 Bài 9 -- Suy luận thống kê theo trường phái Bayes.pdf',
    iconName: 'Network',
    color: 'from-violet-500 to-purple-600',
    isPriority: true,
    modules: [
      {
        id: 'beta-binomial-updater',
        titleEn: 'Beta-Binomial Bayesian Updating',
        titleVi: 'Cập nhật Niềm tin Beta-Binomial Real-time',
        chapterId: 'ch9-bayesian',
        lectureRef: 'Slide 10 - 26',
        descriptionVi: 'Nhập số lần ngửa k / tung n. Quan sát Prior, Likelihood và Posterior vẽ đồng thời, cùng điểm Mode (MAP) và Mean (LMS).',
        tag: 'Bayesian Coin',
        badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        isPriority: true
      },
      {
        id: 'sensor-fusion',
        titleEn: 'Gaussian Sensor Fusion (Normal-Normal)',
        titleVi: 'Hợp nhất Cảm biến Gauss Đa chiều',
        chapterId: 'ch9-bayesian',
        lectureRef: 'Slide 27 - 35',
        descriptionVi: 'Thêm các cảm biến đo với độ lệch chuẩn sigma khác nhau. Chuông hậu nghiệm tự động co hẹp và nghiêng về phía cảm biến chính xác nhất.',
        tag: 'Sensor Fusion',
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        isPriority: true
      },
      {
        id: 'bayesian-credible-interval',
        titleEn: 'Bayesian Credible Interval (HPD)',
        titleVi: 'Khoảng Tin Cậy Bayes (Highest Posterior Density)',
        chapterId: 'ch9-bayesian',
        lectureRef: 'Slide 36 - 42',
        descriptionVi: 'Tô vùng diện tích 95% dưới đường cong Posterior. Hiểu sự khác biệt triết học giữa quan điểm Bayes và quan điểm tần suất.',
        tag: 'Credible Interval',
        badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
        isPriority: true
      },
      {
        id: 'base-rate-fallacy',
        titleEn: 'Base Rate Fallacy: Medical Testing Paradox',
        titleVi: 'Ảo giác Tỷ lệ Nền & Test Dương tính Giả',
        chapterId: 'ch9-bayesian',
        lectureRef: 'Slide 43 - 48',
        descriptionVi: 'Khám phá nghịch lý: Test chính xác 98% nhưng người nhận kết quả (+) có tới 91% khả năng hoàn toàn khỏe mạnh vì bệnh quá hiếm!',
        tag: 'Base Rate',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        isPriority: true
      }
    ]
  },
  {
    id: 'ch10-1-estimation',
    number: 'Bài 10.1',
    titleEn: 'Classical Parameter Estimation',
    titleVi: 'Ước lượng Thống kê Cổ điển (Frequentist)',
    subtitle: 'Ước lượng Hợp lý Cực đại (MLE), 100 Khoảng tin cậy mẫu (Confidence Intervals), Phân bố Student t',
    lecturePdf: 'MAT1101 Bài 10.1 -- Ước lượng thống kê theo trường phái cổ điển.pdf',
    iconName: 'Target',
    color: 'from-blue-500 to-indigo-600',
    isPriority: true,
    modules: [
      {
        id: 'ci-coverage-sim',
        titleEn: '100 Confidence Intervals Coverage Simulator',
        titleVi: 'Mô phỏng Độ phủ 100 Khoảng tin cậy',
        chapterId: 'ch10-1-estimation',
        lectureRef: 'Slide 18 - 30',
        descriptionVi: 'Sinh 100 mẫu lặp lại. Khoảng nào cắt qua mu thật tô xanh lá, khoảng nào trượt tô đỏ. Hiểu sâu sắc bản chất tần suất!',
        tag: '95% Coverage',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        isPriority: true
      },
      {
        id: 'student-t-normal',
        titleEn: "Student's t vs Standard Normal Distribution",
        titleVi: 'Phân bố Student t tiệm cận Phân bố Chuẩn',
        chapterId: 'ch10-1-estimation',
        lectureRef: 'Slide 27 - 34',
        descriptionVi: 'Kéo slider bậc tự do nu từ 1 đến 35. Quan sát đuôi dày của Student xẹp dần và trùng khít hoàn hảo với đường chuẩn Gauss khi nu >= 30.',
        tag: 'Student t',
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        isPriority: true
      },
      {
        id: 'bessel-correction',
        titleEn: "Bessel's Correction: Dividing by n-1 vs n",
        titleVi: 'Bí ẩn Hiệu chỉnh Bessel: Chia n-1 hay n?',
        chapterId: 'ch10-1-estimation',
        lectureRef: 'Slide 14 - 17',
        descriptionVi: 'Mô phỏng 2,500 mẫu nhỏ. Xem công thức chia n luôn ước lượng non, còn chia n-1 triệt tiêu hoàn toàn độ chệch!',
        tag: 'Unbiasedness',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        isPriority: true
      },
      {
        id: 'mle-explorer',
        titleEn: 'Maximum Likelihood Estimation (MLE) Curve',
        titleVi: 'Đường cong Hàm Hợp lý Cực đại',
        chapterId: 'ch10-1-estimation',
        lectureRef: 'Slide 6 - 13',
        descriptionVi: 'Thêm bớt điểm dữ liệu trên trục số, quan sát đường cong Likelihood L(theta) đạt đỉnh cực đại tại trung bình mẫu.',
        tag: 'MLE',
        badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
        isPriority: true
      }
    ]
  },
  {
    id: 'ch10-2-hypothesis',
    number: 'Bài 10.2',
    titleEn: 'Classical Hypothesis Testing',
    titleVi: 'Kiểm tra Giả thuyết Thống kê Cổ điển',
    subtitle: 'Giả thuyết H0 vs H1, Sai lầm loại I (alpha) & loại II (beta), Lực kiểm định (Power), Z-test, T-test, p-value',
    lecturePdf: 'MAT1101 Bài 10.2 -- Kiểm tra giả thuyết thống kê theo trường phái cổ điển.pdf',
    iconName: 'Scale',
    color: 'from-red-500 to-rose-600',
    isPriority: true,
    modules: [
      {
        id: 'type-errors-tradeoff',
        titleEn: 'Type I / II Error & Power Tradeoff',
        titleVi: 'Đánh đổi Sai lầm Loại I, Loại II & Lực kiểm định',
        chapterId: 'ch10-2-hypothesis',
        lectureRef: 'Slide 8 - 16',
        descriptionVi: 'Hai quả chuông H0 và H1 cùng ngưỡng cắt di động. Kéo ngưỡng để thấy alpha và beta đánh đổi, tăng n để cả 2 lỗi cùng giảm mạnh!',
        tag: 'Error Tradeoff',
        badgeColor: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
        isPriority: true
      },
      {
        id: 'p-value-visualizer',
        titleEn: 'Z-Test & T-Test: Real-time P-Value Calculator',
        titleVi: 'Trực quan hóa Trị số p (p-value) & Vùng Bác bỏ',
        chapterId: 'ch10-2-hypothesis',
        lectureRef: 'Slide 17 - 25',
        descriptionVi: 'Chọn kiểm định 1 phía trái, 1 phía phải hoặc 2 phía. Nhập giá trị mẫu, xem diện tích p-value quét đuôi và so sánh với mức ý nghĩa alpha.',
        tag: 'P-Value Engine',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        isPriority: true
      },
      {
        id: 'power-analysis-planning',
        titleEn: 'Power Analysis & Sample Size Planning',
        titleVi: 'Hoạch định Cỡ mẫu & Phân tích Lực Kiểm Định',
        chapterId: 'ch10-2-hypothesis',
        lectureRef: 'Slide 26 - 32',
        descriptionVi: 'Kéo Effect Size d và cỡ mẫu n để xác định xem cần bao nhiêu quan sát thì đạt chuẩn vàng 80% Power trong A/B Testing.',
        tag: 'Power Curve',
        badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        isPriority: true
      }
    ]
  },
  {
    id: 'ch11-regression',
    number: 'Bài 11',
    titleEn: 'Linear Regression & Least Squares',
    titleVi: 'Hồi quy Tuyến tính & Bình phương Tối thiểu',
    subtitle: 'Ước lượng OLS, Hình vuông phần dư (Residual Squares), Điểm ngoại lai đòn bẩy, Phân rã TSS = MSS + RSS & R²',
    lecturePdf: 'MAT1101 Bài 11 -- Hồi quy tuyến tính.pdf',
    iconName: 'LineChart',
    color: 'from-blue-600 to-cyan-500',
    isPriority: true,
    modules: [
      {
        id: 'ols-fitter',
        titleEn: 'Interactive OLS Fitter & Residual Squares',
        titleVi: 'Khớp đường Hồi quy & Các Hình vuông Phần dư',
        chapterId: 'ch11-regression',
        lectureRef: 'Slide 24 - 32',
        descriptionVi: 'Xoay thử đường thẳng thủ công và thấy các hình vuông diện tích phần dư co giãn. Bấm Fit để nhảy về nghiệm OLS tối ưu.',
        tag: 'OLS Squares',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        isPriority: true
      },
      {
        id: 'r2-decomposition',
        titleEn: 'Variance Decomposition: TSS = MSS + RSS & R²',
        titleVi: 'Phân rã Phương sai & Bản chất của R²',
        chapterId: 'ch11-regression',
        lectureRef: 'Slide 33 - 38',
        descriptionVi: 'Trực quan hóa đoạn sai số đỏ (chưa giải thích) và xanh (đã giải thích), thấy rõ vì sao R^2 đo lường tỷ lệ biến thiên.',
        tag: 'R-Squared',
        badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
        isPriority: true
      },
      {
        id: 'leverage-cooks-distance',
        titleEn: 'High Leverage & Influential Outliers (Cook’s D)',
        titleVi: 'Điểm Ngoại Lai, Đòn Bẩy & Khoảng Cách Cook',
        chapterId: 'ch11-regression',
        lectureRef: 'Slide 39 - 44',
        descriptionVi: 'Kéo điểm ngoại lai ra mép xa tọa độ để xem đường OLS bị bẻ gãy ngoắt ngoéo và chỉ số Cook’s D cảnh báo nguy hiểm.',
        tag: "Cook's D",
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        isPriority: true
      },
      {
        id: 'residual-diagnostics',
        titleEn: 'Residual Plot Diagnostics (Gauss-Markov Check)',
        titleVi: 'Bắt Bệnh Mô Hình Qua Đồ Thị Phần Dư',
        chapterId: 'ch11-regression',
        lectureRef: 'Slide 45 - 50',
        descriptionVi: 'Xem đồ thị phần dư e_i theo y_hat để phát hiện các căn bệnh vi phạm giả thiết: Quan hệ phi tuyến (chữ U) hay Loa kèn (Heteroscedasticity).',
        tag: 'Diagnostics',
        badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
        isPriority: true
      }
    ]
  },
  {
    id: 'ch1-foundations',
    number: 'Bài 1',
    titleEn: 'Foundations & Set Theory',
    titleVi: 'Cơ sở Xác suất & Lý thuyết Tập hợp',
    subtitle: 'Không gian mẫu Omega, Tiên đề Kolmogorov, Sơ đồ Venn, Bài toán Cuộc hẹn',
    lecturePdf: 'MAT1101 Bài 1 -- Giới thiệu.pdf',
    iconName: 'BookOpen',
    color: 'from-slate-500 to-slate-700',
    isPriority: false,
    modules: [
      {
        id: 'venn-explorer',
        titleEn: 'Interactive Venn Diagram & De Morgan',
        titleVi: 'Sơ đồ Venn & Luật De Morgan Tương tác',
        chapterId: 'ch1-foundations',
        lectureRef: 'Slide 6 - 10',
        descriptionVi: 'Kéo rê các tập hợp A, B, kiểm chứng công thức cộng P(A U B) = P(A) + P(B) - P(A giao B).',
        tag: 'Set Theory',
        badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        isPriority: false
      },
      {
        id: 'dice-grid',
        titleEn: '2-Dice 6x6 Sample Space Matrix',
        titleVi: 'Ma trận Không gian Mẫu Tung 2 Xúc xắc',
        chapterId: 'ch1-foundations',
        lectureRef: 'Slide 21 - 23',
        descriptionVi: 'Lưới 36 ô tương tác, lọc theo các biến cố: tổng điểm >= 8, mặt đôi, ít nhất một mặt 6.',
        tag: 'Sample Space',
        badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        isPriority: false
      }
    ]
  },
  {
    id: 'ch2-basic-prob',
    number: 'Bài 2',
    titleEn: 'Basic Probability & Bayes Rule',
    titleVi: 'Tính toán Xác suất Cơ bản & Nghịch lý',
    subtitle: 'Xác suất có điều kiện, Luật xác suất toàn phần, Nghịch lý Monty Hall, Test Y tế',
    lecturePdf: 'MAT1101 Bài 2 -- Tính toán xác suất cơ bản.pdf',
    iconName: 'HelpCircle',
    color: 'from-lime-500 to-green-600',
    isPriority: false,
    modules: [
      {
        id: 'monty-hall',
        titleEn: 'Monty Hall Paradox Simulator',
        titleVi: 'Trò chơi & Mô phỏng Nghịch lý Monty Hall',
        chapterId: 'ch2-basic-prob',
        lectureRef: 'Slide 16 - 18',
        descriptionVi: 'Chơi trực tiếp chọn 3 cánh cửa có dê và ô tô, hoặc chạy tự động 10,000 lần để thấy tỷ lệ thắng 66.7% khi đổi cửa.',
        tag: 'Monty Hall',
        badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
        isPriority: false
      },
      {
        id: 'bayes-medical',
        titleEn: 'Bayes Medical Test: False Positive Paradox',
        titleVi: 'Nghịch lý Dương tính Giả trong Test Y tế',
        chapterId: 'ch2-basic-prob',
        lectureRef: 'Slide 22 - 27',
        descriptionVi: 'Lưới 10,000 người minh họa tại sao bệnh hiếm 0.01% thì test 99% chính xác vẫn cho xác suất mắc thật chỉ dưới 10%.',
        tag: 'Medical Paradox',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        isPriority: false
      }
    ]
  },
  {
    id: 'ch3-discrete-rv',
    number: 'Bài 3 & 4',
    titleEn: 'Discrete Random Variables',
    titleVi: 'Biến ngẫu nhiên Rời rạc & Phân bố',
    subtitle: 'Bernoulli, Binomial, Poisson, Geometric, Uniform, Kỳ vọng bập bênh trọng tâm',
    lecturePdf: 'MAT1101 Bài 3 -- Biến ngẫu nhiên rời rạc 1.pdf',
    iconName: 'BarChart2',
    color: 'from-amber-500 to-yellow-600',
    isPriority: false,
    modules: [
      {
        id: 'discrete-sandbox',
        titleEn: 'Discrete Distribution Explorer',
        titleVi: 'Phòng thí nghiệm 5 Phân bố Rời rạc',
        chapterId: 'ch3-discrete-rv',
        lectureRef: 'Slide 9 - 18',
        descriptionVi: 'Khám phá Bernoulli, Binomial, Geometric, Poisson, Uniform với slider tham số và vạch kỳ vọng E[X] trọng tâm.',
        tag: 'PMF Sandbox',
        badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        isPriority: false
      }
    ]
  },
  {
    id: 'ch4-continuous-rv',
    number: 'Bài 5 & 6',
    titleEn: 'Continuous Random Variables',
    titleVi: 'Biến ngẫu nhiên Liên tục & Chuẩn tắc',
    subtitle: 'Hàm mật độ PDF, Hàm tích lũy CDF, Phân bố Chuẩn Gauss, Cây kim Buffon ước lượng pi',
    lecturePdf: 'MAT1101 Bài 5 -- Biến ngẫu nhiên liên tục 1.pdf',
    iconName: 'Activity',
    color: 'from-teal-500 to-blue-600',
    isPriority: false,
    modules: [
      {
        id: 'normal-explorer',
        titleEn: 'Normal Distribution & Z-Score Standardization',
        titleVi: 'Khám phá Phân bố Chuẩn & Chuẩn hóa Z',
        chapterId: 'ch4-continuous-rv',
        lectureRef: 'Slide 25 - 32',
        descriptionVi: 'Điều chỉnh mu và sigma, quan sát quy tắc 1-sigma (68%), 2-sigma (95%), 3-sigma (99.7%) và chuyển đổi sang Z(0, 1).',
        tag: 'Gaussian Bell',
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        isPriority: false
      },
      {
        id: 'buffons-needle',
        titleEn: "Buffon's Needle Monte Carlo Pi Estimator",
        titleVi: 'Thả kim Buffon Ước lượng số Pi',
        chapterId: 'ch4-continuous-rv',
        lectureRef: 'Bài 6 Slide 8 - 10',
        descriptionVi: 'Thả hàng nghìn cây kim ngẫu nhiên trên sàn có vạch kẻ song song để xấp xỉ số vô tỉ pi qua xác suất hình học.',
        tag: 'Monte Carlo Pi',
        badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
        isPriority: false
      }
    ]
  }
];
