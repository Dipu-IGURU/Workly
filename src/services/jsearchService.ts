// Environment variables
const JSEARCH_API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const JSEARCH_API_HOST = import.meta.env.VITE_RAPIDAPI_HOST;

if (!JSEARCH_API_KEY || !JSEARCH_API_HOST) {
  console.error('Missing required environment variables for JSearch API');
}

export interface JobSearchParams {
  query: string;
  page?: number;
  num_pages?: number;
  country?: string;
  date_posted?: 'all' | 'today' | '3days' | 'week' | 'month';
  job_type?: 'fulltime' | 'parttime' | 'contract' | 'internship' | 'temporary';
  remote_jobs_only?: boolean;
  employment_types?: string;
  job_requirements?: string;
}

export interface JobListing {
  job_id: string;
  title: string;
  employer_name: string;
  employer_logo?: string;
  job_publisher: string;
  job_employment_type: string;
  job_highlights?: {
    qualifications?: string[];
    responsibilities?: string[];
    benefits?: string[];
  };
  job_description: string;
  job_apply_link: string;
  job_city: string;
  job_country: string;
  job_posted_at_timestamp: number;
  job_is_remote: boolean;
}

export const searchJobs = async (params: JobSearchParams): Promise<{
  data: JobListing[];
  total: number;
} | null> => {
  if (!JSEARCH_API_KEY || !JSEARCH_API_HOST) {
    console.error('JSearch API configuration is missing');
    return null;
  }

  try {
    const queryParams = new URLSearchParams();
    
    // Required parameters
    queryParams.append('query', params.query);
    
    // Optional parameters with defaults
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('num_pages', (params.num_pages || 1).toString());
    queryParams.append('country', params.country || 'us');
    queryParams.append('date_posted', params.date_posted || 'all');
    
    if (params.job_type) {
      queryParams.append('job_type', params.job_type);
    }
    
    if (params.remote_jobs_only) {
      queryParams.append('remote_jobs_only', 'true');
    }
    
    if (params.employment_types) {
      queryParams.append('employment_types', params.employment_types);
    }
    
    if (params.job_requirements) {
      queryParams.append('job_requirements', params.job_requirements);
    }

    const response = await fetch(
      `https://${JSEARCH_API_HOST}/search?${queryParams.toString()}`, 
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': JSEARCH_API_KEY,
          'x-rapidapi-host': JSEARCH_API_HOST,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(data.message || 'Failed to fetch jobs');
    }

    return {
      data: data.data || [],
      total: data.results || 0,
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return null;
  }
};

export const getJobDetails = async (jobId: string): Promise<JobListing | null> => {
  if (!JSEARCH_API_KEY || !JSEARCH_API_HOST) {
    console.error('JSearch API configuration is missing');
    return null;
  }

  try {
    const response = await fetch(
      `https://${JSEARCH_API_HOST}/job-details?job_id=${encodeURIComponent(jobId)}`, 
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': JSEARCH_API_KEY,
          'x-rapidapi-host': JSEARCH_API_HOST,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.data || data.data.length === 0) {
      throw new Error('Job not found');
    }

    return data.data[0];
  } catch (error) {
    console.error('Error fetching job details:', error);
    return null;
  }
};
