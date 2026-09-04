# 🎲 Probability & Statistics Visualizer (MAT1101)

> **Interactive Educational Platform for Probability & Statistics (Xác suất Thống kê — VNU-UET)**  
> Trực quan hóa sinh động 100% kiến thức giáo trình môn MAT1101 với phong cách thiết kế Claymorphism hiện đại, hỗ trợ song ngữ Anh - Việt và chế độ Light / Dark mode.

![UI Style: Claymorphism](https://img.shields.io/badge/UI-Claymorphism-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal?style=for-the-badge&logo=tailwind-css)
![KaTeX](https://img.shields.io/badge/Math-KaTeX-green?style=for-the-badge)
![Deploy: Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

---

## 🌟 Giới thiệu

Khi học môn **Xác suất Thống kê (MAT1101)**, sinh viên thường gặp khó khăn lớn nhất là **không thể hình dung về mặt hình ảnh** các khái niệm toán học trừu tượng như:
- Tích chập (Convolution) thực chất trượt và quét diện tích như thế nào?
- Tại sao dù phân bố ban đầu có méo mó, kỳ dị đến đâu thì trung bình mẫu qua Định lý Giới hạn Trung tâm (CLT) lại luôn ép về hình chuông Gauss hoàn hảo?
- Bản chất tần suất của "Khoảng tin cậy 95%" là gì? (Tham số đứng yên cố định, chỉ có các khoảng tin cậy ngẫu nhiên nhảy qua nhảy lại!)
- Tại sao lại gọi là Phương pháp Bình phương Tối thiểu (OLS)? (Nó thực sự là thu nhỏ diện tích các hình vuông phần dư!)
- Sự đánh đổi giữa Sai lầm Loại I ($\alpha$) và Sai lầm Loại II ($\beta$), và tại sao tăng cỡ mẫu $n$ là cách duy nhất để giảm cả 2 lỗi cùng lúc?

**Probability & Statistics Visualizer** sinh ra để giải quyết triệt để vấn đề đó bằng cách biến mọi công thức trừu tượng thành animation và tương tác thời gian thực.

---

## 🔥 Danh mục Bài học & Phòng Thí nghiệm Tương tác

### 🚀 Phần Trọng Tâm (Ưu tiên Bài 7 – Bài 11)

1. **Bài 7.1: Biến ngẫu nhiên Dẫn xuất & Phép Tích chập (Derived Distributions & Convolution)**
   - **Mô phỏng Hoạt ảnh Tích chập ($Z = X + Y$):** Xem $f_Y(z-x)$ bị lật ngược và trượt từ trái sang phải, quét qua $f_X(x)$ để tạo nên hình phân bố tam giác trên $[0, 2]$.
   - **Tương quan & Trực giao:** Slider $\rho \in [-1, 1]$ điều khiển đám mây điểm bivariate. Thử nghiệm đặc biệt: $Y = X^2$ có $\rho = 0$ nhưng không độc lập.
   - **Luật Phương sai Toàn phần (Eve's Law):** $\text{Var}(X) = \text{Var}(\mathbb{E}[X|Y]) + \mathbb{E}[\text{Var}(X|Y)]$.

2. **Bài 7.2: Hàm sinh Moment (MGF — Moment Generating Function)**
   - Khảo sát đường cong $M_X(s) = \mathbb{E}[e^{sX}]$ quanh lân cận gốc $s = 0$.
   - Tiếp tuyến tại $s = 0$ cho kỳ vọng $\mathbb{E}[X]$, parabol xấp xỉ Taylor bậc 2 cho Moment cấp hai $\mathbb{E}[X^2]$.
   - So sánh MGF của Poisson, Mũ (Exponential) và Chuẩn (Normal).

3. **Bài 8: Các Định lý Giới hạn & Định lý Giới hạn Trung tâm (CLT)**
   - **Phòng thí nghiệm CLT (CLT Lab):** Chọn phân bố gốc bất kỳ (2 Đỉnh Bimodal, Mũ lệch, Đều, Xúc xắc 6 mặt), kéo cỡ mẫu $n \in [1, 50]$ và mô phỏng 5,000 mẫu trung bình $\bar{X}_n$ để chứng kiến chuông Gauss xuất hiện kỳ diệu.
   - **Mô phỏng Quỹ đạo Luật số lớn (LLN):** 15 đường quỹ đạo dao động mạnh ở $n$ nhỏ rồi hội tụ hoàn toàn vào ống sai số $[\mu - \epsilon, \mu + \epsilon]$.

4. **Bài 9: Suy luận Thống kê theo Trường phái Bayes (Bayesian Inference)**
   - **Mô hình Beta - Nhị thức:** Nhập số lần ngửa/tung hoặc bấm nút tung đồng xu. Đồ thị vẽ đồng thời Prior, Likelihood và Posterior, hiển thị vị trí Mode ($\hat{\theta}_{MAP}$) vs Mean ($\hat{\theta}_{LMS}$).
   - **Hợp nhất Cảm biến Gauss (Gaussian Sensor Fusion):** Tiền thân của bộ lọc Kalman 1D, chuông hậu nghiệm tự co hẹp phương sai $1/v = \sum 1/\sigma_i^2$.

5. **Bài 10.1: Ước lượng Thống kê Cổ điển (Classical Estimation)**
   - **Mô phỏng 100 Khoảng tin cậy lặp lại:** Thấy tham số $\mu$ đứng yên cố định, 100 khoảng ngẫu nhiên xếp chồng (khoảng trúng màu xanh lá, khoảng trượt màu đỏ).
   - **Đường cong MLE (Maximum Likelihood Estimation):** Cực đại hóa hàm hợp lý trên các điểm dữ liệu mẫu.
   - **Phân bố Student $t$ vs Chuẩn tắc $\mathcal{N}(0, 1)$:** Kéo bậc tự do $\nu \to 30+$ để thấy đuôi Student xẹp dần về Gauss.

6. **Bài 10.2: Kiểm tra Giả thuyết Thống kê Cổ điển (Hypothesis Testing)**
   - **Đánh đổi Sai lầm Loại I / II & Power:** Hai quả chuông $H_0$ và $H_1$ cùng vạch ngưỡng di động. Kéo ngưỡng để thấy $\alpha$ và $\beta$ đánh đổi; tăng $n$ để tăng lực kiểm định.
   - **Bộ tính Trị số p ($p$-value):** Kiểm định 1 phía trái, 1 phía phải hoặc 2 phía kèm kết luận bác bỏ $H_0$ tự động.

7. **Bài 11: Hồi quy Tuyến tính & Bình phương Tối thiểu (Linear Regression & OLS)**
   - **Khớp đường OLS & Hình vuông phần dư:** Xoay đường thẳng thủ công, quan sát diện tích các ô vuông residual co giãn. Bấm nút "Auto-Fit" để trượt về nghiệm OLS tối ưu. Thêm điểm ngoại lai (outlier) để xem đường hồi quy bị kéo lệch.
   - **Phân rã Biến thiên:** $TSS = MSS + RSS$ và thanh đo hệ số xác định $R^2$.

---

### 📖 Phần Cơ Sở (Bài 1 – Bài 6)

- **Bài 1:** Sơ đồ Venn tương tác kiểm chứng công thức cộng $P(A \cup B)$ và luật De Morgan; Ma trận $6 \times 6$ lọc 36 biến cố xúc xắc.
- **Bài 2:** Trò chơi tương tác Nghịch lý Monty Hall (Đổi cửa vs Giữ cửa); Nghịch lý Dương tính giả trong xét nghiệm Y tế.
- **Bài 3 & 4:** Phòng thí nghiệm 5 phân bố rời rạc (Bernoulli, Binomial, Poisson, Geometric, Uniform).
- **Bài 5 & 6:** Phân bố Chuẩn Gauss với tính diện tích tích phân tự động; Thả kim Buffon ước lượng số vô tỉ $\pi$ bằng Monte Carlo.

---

## 🎨 Thiết kế & Trải nghiệm Người dùng (UI/UX)

- **Phong cách Claymorphism:** Các thẻ 3D mềm mại, hiệu ứng đổ bóng đa tầng (inner/outer shadows), nút bấm có độ nảy xúc giác.
- **Hỗ trợ 2 Chế độ:**
  - ☀️ **Light Mode:** Tông màu kem ấm áp (`#FFF7ED`), thẻ clay trắng với viền màu rực rỡ (cam, xanh, tím).
  - 🌙 **Dark Mode:** Tông màu xanh đen vũ trụ (`#0B0F19`), thẻ clay tối với viền phát quang dịu nhẹ bảo vệ mắt.
- **Ngôn ngữ:** Thuật ngữ chuyên môn chuẩn quốc tế (Tiếng Anh) đi kèm diễn giải và trực giác dễ hiểu (Tiếng Việt).

---

## 🛠️ Cài đặt & Chạy cục bộ (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/HaiHoang-AI/Probability-Statistics-Visualizer.git
cd Probability-Statistics-Visualizer

# 2. Cài đặt dependencies
npm install

# 3. Chạy môi trường phát triển
npm run dev
```

Mở trình duyệt tại: `http://localhost:3000`

---

## 🚀 Hướng dẫn Deploy lên Vercel

Dự án đã được cấu hình sẵn tệp `vercel.json` hỗ trợ định tuyến Single Page Application (SPA).

1. Đăng nhập vào [Vercel](https://vercel.com).
2. Chọn **"Add New..."** $\to$ **"Project"**.
3. Import kho mã nguồn `HaiHoang-AI/Probability-Statistics-Visualizer`.
4. Giữ nguyên các thiết lập mặc định (Vite framework preset).
5. Bấm **Deploy**! Chỉ sau khoảng 30 giây, ứng dụng sẽ hoạt động trên toàn cầu.

---

## 📄 Bản quyền & Tham khảo

- Giáo trình: **MAT1101 — Xác suất Thống kê**, Trường Đại học Công nghệ, ĐHQGHN (VNU-UET).
- Giảng viên: PGS. TS. Trần Quốc Long.
- Tài liệu tham khảo chính: D. P. Bertsekas & J. N. Tsitsiklis, *Introduction to Probability*, 2nd Edition (Athena Scientific).
