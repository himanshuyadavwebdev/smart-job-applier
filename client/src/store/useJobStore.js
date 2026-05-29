import { create } from 'zustand';

export const useJobStore = create((set, get) => ({
  jobs: [],
  savedJobs: [],
  totalCount: 0,
  currentPage: 1,
  filters: {
    role: '',
    location: '',
    jobType: '',
    salaryMin: '',
    experienceLevel: '',
  },
  isLoading: false,

  setJobs: (jobs, total) => set({ jobs, totalCount: total }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  setPage: (page) => set({ currentPage: page }),
  setSavedJobs: (saved) => set({ savedJobs: saved }),
  setLoading: (bool) => set({ isLoading: bool }),

  toggleSaveJob: (jobId) => {
    set((state) => {
      const jobs = state.jobs.map((j) =>
        String(j._id) === String(jobId) ? { ...j, isSaved: !j.isSaved } : j
      );
      return { jobs };
    });
  },
}));
