import { create } from 'zustand';

export const useResumeStore = create((set) => ({
  activeResume: null,
  classification: null,
  isAnalyzing: false,

  setResume: (resume) => set({ activeResume: resume, classification: resume?.classification || null }),
  setAnalyzing: (bool) => set({ isAnalyzing: bool }),
  clearResume: () => set({ activeResume: null, classification: null }),
}));
