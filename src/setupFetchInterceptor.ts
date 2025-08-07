// Intercepts global fetch to rewrite localhost backend URLs to production
// This allows legacy code that still calls 'http://localhost:5001' to work in production
// without editing every single fetch statement.

const API_HOST = import.meta.env.VITE_API_URL || 'https://can-hiring.onrender.com';

// Keep a reference to the original fetch
const originalFetch: typeof fetch = window.fetch.bind(window);

// Replace the global fetch
window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let newInput = input;

  // If the request is a string URL, perform replacement
  if (typeof input === 'string') {
    newInput = input.replace('http://localhost:5001', API_HOST);
  } else if (input instanceof Request) {
    // If it's a Request object, clone and adjust the URL
    const url = input.url.replace('http://localhost:5001', API_HOST);
    newInput = new Request(url, input);
  }

  return originalFetch(newInput, init);
};

export {};
