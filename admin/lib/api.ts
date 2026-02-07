const PRODUCTION_API_URL = "https://manzilline-production-fcab.up.railway.app/api/v1";
export const DEVELOPMENT_API_URL = "http://localhost:4000/api/v1";
export const API_URL = DEVELOPMENT_API_URL;

// Helper function to get auth headers with token
export const getAuthHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  // Get token from localStorage (zustand persist stores it there)
  const stored = typeof window !== 'undefined' ? localStorage.getItem('m_store') : null;
  let token = null;
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      token = parsed?.state?.user?.token || null;
    } catch (e) {
      // If parsing fails, token remains null
    }
  }
  
  const headers: Record<string, string> = {
    ...additionalHeaders,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};