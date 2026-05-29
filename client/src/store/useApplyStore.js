import { create } from 'zustand';

export const useApplyStore = create((set, get) => ({
  currentJob: null,
  generatedDocs: null,
  step: 1,
  isGenerating: false,
  application: null,
  isOpen: false,

  startApply: (job) => set({ currentJob: job, step: 1, generatedDocs: null, application: null, isOpen: true }),

  setGeneratedDocs: (docs) => set({ generatedDocs: docs }),

  setStep: (step) => set({ step }),

  setGenerating: (bool) => set({ isGenerating: bool }),

  updateDoc: (field, value) =>
    set((state) => ({
      generatedDocs: state.generatedDocs ? { ...state.generatedDocs, [field]: value } : null,
    })),

  confirmApply: (applicationData) => set({ application: applicationData }),

  reset: () =>
    set({
      currentJob: null,
      generatedDocs: null,
      step: 1,
      isGenerating: false,
      application: null,
      isOpen: false,
    }),
}));
