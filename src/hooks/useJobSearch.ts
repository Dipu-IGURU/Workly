import { useState, useEffect, useCallback } from 'react';
import { searchJobs, JobSearchParams, JobListing } from '@/services/jsearchService';

export const useJobSearch = (initialParams: JobSearchParams) => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialParams.page || 1);

  const search = useCallback(async (searchParams: JobSearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await searchJobs({
        ...searchParams,
        page: searchParams.page || currentPage,
      });
      
      if (result) {
        setJobs(result.data);
        setTotalResults(result.total);
        setCurrentPage(searchParams.page || 1);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Initial search on mount or when dependencies change
  useEffect(() => {
    search(initialParams);
  }, [search, initialParams]);

  const changePage = useCallback((page: number) => {
    search({ ...initialParams, page });
  }, [search, initialParams]);

  return {
    jobs,
    loading,
    error,
    totalResults,
    currentPage,
    search,
    changePage,
  };
};

export default useJobSearch;
