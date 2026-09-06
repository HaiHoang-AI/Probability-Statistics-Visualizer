import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { LandingPage } from './components/landing/LandingPage';
import { DerivedConvolution } from './components/modules/ch7/DerivedConvolution';
import { MomentGeneratingFunction } from './components/modules/ch7/MomentGeneratingFunction';
import { LimitTheoremsCLT } from './components/modules/ch8/LimitTheoremsCLT';
import { BayesianInference } from './components/modules/ch9/BayesianInference';
import { ClassicalEstimation } from './components/modules/ch10/ClassicalEstimation';
import { HypothesisTesting } from './components/modules/ch10/HypothesisTesting';
import { LinearRegression } from './components/modules/ch11/LinearRegression';
import { Foundations } from './components/modules/ch1/Foundations';
import { BasicProbability } from './components/modules/ch2/BasicProbability';
import { DiscreteRV } from './components/modules/ch3/DiscreteRV';
import { ContinuousRV } from './components/modules/ch4/ContinuousRV';
import { ChapterId } from './types';

export const App: React.FC = () => {
  const [currentChapter, setCurrentChapter] = useState<ChapterId>('overview');

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Header */}
      <Header
        currentChapterId={currentChapter}
        onSelectChapter={setCurrentChapter}
      />

      {/* Main Container */}
      <main className="flex-1 w-full px-4 sm:px-8 xl:px-10 py-6 max-w-[1920px] mx-auto">
        {/* Back Button when viewing a specific module */}
        {currentChapter !== 'overview' && (
          <div className="mb-4">
            <button
              onClick={() => setCurrentChapter('overview')}
              className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] text-xs font-heading font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              Quay lại danh sách bài học
            </button>
          </div>
        )}

        {/* Dynamic Chapter Content with smooth page transition */}
        <div key={currentChapter} className="page-transition">
          {currentChapter === 'overview' && <LandingPage onSelectChapter={setCurrentChapter} />}
          {currentChapter === 'ch7-1-derived' && <DerivedConvolution />}
          {currentChapter === 'ch7-2-mgf' && <MomentGeneratingFunction />}
          {currentChapter === 'ch8-limit-theorems' && <LimitTheoremsCLT />}
          {currentChapter === 'ch9-bayesian' && <BayesianInference />}
          {currentChapter === 'ch10-1-estimation' && <ClassicalEstimation />}
          {currentChapter === 'ch10-2-hypothesis' && <HypothesisTesting />}
          {currentChapter === 'ch11-regression' && <LinearRegression />}
          {currentChapter === 'ch1-foundations' && <Foundations />}
          {currentChapter === 'ch2-basic-prob' && <BasicProbability />}
          {currentChapter === 'ch3-discrete-rv' && <DiscreteRV />}
          {currentChapter === 'ch4-continuous-rv' && <ContinuousRV />}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t-2 border-slate-900/15 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-600 dark:text-slate-400">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Project & Author info */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span className="font-heading font-black text-sm text-slate-900 dark:text-white">
              Probability & Statistics Visualizer
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="font-medium text-slate-500 dark:text-slate-400">
              MAT1101 (VNU-UET)
            </span>
          </div>

          {/* Right: Author Social Links with Official Logos */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1 hidden lg:inline">
              Kết nối với tác giả:
            </span>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/lehai.hoang.3705?locale=vi_VN"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] dark:hover:bg-[#1877F2] dark:hover:border-[#1877F2] active:translate-x-[1px] active:translate-y-[1px] transition-all font-heading font-bold text-xs group cursor-pointer"
              title="Facebook: Lê Hải Hoàng"
            >
              <svg className="w-4 h-4 fill-[#1877F2] group-hover:fill-white transition-colors shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/HaiHoang-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] hover:bg-slate-900 hover:text-white hover:border-slate-900 dark:hover:bg-sky-600 dark:hover:border-sky-500 active:translate-x-[1px] active:translate-y-[1px] transition-all font-heading font-bold text-xs group cursor-pointer"
              title="GitHub: HaiHoang-AI"
            >
              <svg className="w-4 h-4 fill-slate-900 dark:fill-white group-hover:fill-white transition-colors shrink-0" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/hai-hoang-b96833300/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] dark:hover:bg-[#0A66C2] dark:hover:border-[#0A66C2] active:translate-x-[1px] active:translate-y-[1px] transition-all font-heading font-bold text-xs group cursor-pointer"
              title="LinkedIn: Hai Hoang"
            >
              <svg className="w-4 h-4 fill-[#0A66C2] group-hover:fill-white transition-colors shrink-0" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
              </svg>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
