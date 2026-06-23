import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on load
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();

        if (json.success) {
          setUser(json.data);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Session verify error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Login failed');
      }

      localStorage.setItem('token', json.data.token);
      
      // Load full profile
      const profileRes = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${json.data.token}`,
        },
      });
      const profileJson = await profileRes.json();
      
      if (profileJson.success) {
        setUser(profileJson.data);
        return profileJson.data;
      } else {
        throw new Error('Could not fetch user profile');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register handler
  const register = async (userData) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Registration failed');
      }

      localStorage.setItem('token', json.data.token);
      
      // Load profile
      const profileRes = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${json.data.token}`,
        },
      });
      const profileJson = await profileRes.json();
      
      if (profileJson.success) {
        setUser(profileJson.data);
        return profileJson.data;
      } else {
        throw new Error('Could not fetch registered user profile');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Profile update failed');
      }

      setUser(json.data.profile);
      return json.data.profile;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Helper fetch function that automatically appends Auth token
  const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    // If options.body is FormData, don't set Content-Type header (let browser set it with boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();
    return json;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        fetchWithAuth,
        apiUrl: API_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
