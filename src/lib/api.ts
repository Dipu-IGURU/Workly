// Use environment variable if available, otherwise use production URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://can-hiring.onrender.com/api';

// For local development, you can uncomment the line below
// export const API_BASE_URL = 'http://localhost:5001/api';

export interface ProfileData {
  avatar?: string;
  fullName?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  website?: string;
  currentSalary?: string;
  experience?: string;
  age?: string;
  education?: string;
  description?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  country?: string;
  city?: string;
  address?: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const profileApi = {
  // Get user profile
  getProfile: async (): Promise<{ success: boolean; profile: ProfileData }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: getAuthHeader(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch profile');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in getProfile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (data: Partial<ProfileData>): Promise<{
    message: string; success: boolean; profile: ProfileData 
}> => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  },
};
