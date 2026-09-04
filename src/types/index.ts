export type ThemeMode = 'light' | 'dark';

export type ChapterId = 
  | 'overview'
  | 'ch1-foundations'
  | 'ch2-basic-prob'
  | 'ch3-discrete-rv'
  | 'ch4-continuous-rv'
  | 'ch7-1-derived'
  | 'ch7-2-mgf'
  | 'ch8-limit-theorems'
  | 'ch9-bayesian'
  | 'ch10-1-estimation'
  | 'ch10-2-hypothesis'
  | 'ch11-regression';

export interface ModuleInfo {
  id: string;
  titleEn: string;
  titleVi: string;
  chapterId: ChapterId;
  lectureRef: string;
  descriptionVi: string;
  tag: string;
  badgeColor: string;
  isPriority: boolean;
}

export interface ChapterInfo {
  id: ChapterId;
  number: string;
  titleEn: string;
  titleVi: string;
  subtitle: string;
  lecturePdf: string;
  iconName: string;
  color: string;
  isPriority: boolean;
  modules: ModuleInfo[];
}
