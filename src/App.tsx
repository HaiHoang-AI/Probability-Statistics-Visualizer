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
import { Heart, BookOpen, ArrowLeft, Code } from 'lucide-react';

export const App: React.FC = () => {
  const [currentChapter, setCurrentChapter] = useState<ChapterId>('overview');

  return (
    <div className="min-h-screen flex flex-col bg-clay-bg dark:bg-clay-darkBg text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Top Header */}
      <Header
        currentChapterId={currentChapter}
        onSelectChapter={setCurrentChapter}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button when viewing a specific module */}
        {currentChapter !== 'overview' && (
          <div className="mb-4">
            <button
              onClick={() => setCurrentChapter('overview')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-heading font-bold text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Quay lại Danh sách bài giảng
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
      <footer className="w-full border-t border-amber-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🎲 <strong>Probability & Statistics Visualizer</strong> — MAT1101 (VNU-UET)</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/HaiHoang-AI/Probability-Statistics-Visualizer"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-orange-500 transition-colors font-medium"
            >
              <Code size={14} /> GitHub Repository
            </a>
            <span>•</span>
            <span>Made with React & TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
