import React, { createContext, useContext, useState } from 'react';

interface JobsContextType {
  refreshJobs: () => void;
  jobsVersion: number;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [jobsVersion, setJobsVersion] = useState(0);

  const refreshJobs = () => {
    setJobsVersion(prev => prev + 1);
  };

  return (
    <JobsContext.Provider value={{ refreshJobs, jobsVersion }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}