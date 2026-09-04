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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Back Button when viewing a specific module */}
        {currentChapter !== 'overview' && (
          <div className="mb-4">
            <button
              onClick={() => setCurrentChapter('overview')}
              className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[2px_2px_0px_#0f172a] dark:shadow-[2px_2px_0px_#0284c7] text-xs font-heading font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              Quay lại danh sách bài học
            </button>
          </div>
        )}

        {/* Dynamic Chapter Content */}
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
      </main>

      {/* Footer */}
      <footer className="w-full border-t-2 border-slate-900/15 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span>Probability & Statistics Visualizer — MAT1101 (VNU-UET)</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/HaiHoang-AI/Probability-Statistics-Visualizer"
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-bold"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <span>React & TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
