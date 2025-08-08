// This interceptor ensures all API requests use the correct base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://can-hiring.onrender.com';

// Keep a reference to the original fetch
const originalFetch: typeof fetch = window.fetch.bind(window);

// Replace the global fetch
window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let url: string;
  let options = { ...init };

  // Convert input to URL string
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else if (input instanceof Request) {
    url = input.url;
    options = { ...input, ...options };
  } else {
    return originalFetch(input, init);
  }

  // Only process relative URLs or those that start with /api
  if (url.startsWith('/') || url.startsWith('/api') || url.includes('localhost')) {
    // Remove any leading slashes and localhost references
    const path = url.replace(/^https?:\/\/[^/]+/, '').replace(/^\/+/, '');
    
    // Construct the full URL with the base URL
    const fullUrl = `${API_BASE_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
    
    // Create new request with the full URL
    return originalFetch(fullUrl, options);
  }

  // For external URLs, use the original fetch
  return originalFetch(input, init);
};

export {};
