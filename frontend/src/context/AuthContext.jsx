import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('studyflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on load
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Attempt server profile validation
          const response = await api.get('/auth/profile');
          if (response.data && response.data.success) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.warn('⚠️ Server profile load failed, using local token credentials or fallback.', error.message);
          
          // Hackathon Mock Fallback: If server is offline but token exists, mock load a dummy user
          const mockUser = {
            _id: 'mock_user_123',
            username: 'Demo Scholar',
            email: 'scholar@studyflow.ai',
            xpPoints: 850,
            level: 2,
            completedSessions: 14,
            badges: ['Novice Scholar', 'Focus Champion', 'Quiz Whiz', 'Streak Master'],
            dailyAiRequests: 4,
            subscriptionType: 'free'
          };
          setUser(mockUser);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Login handler
  const login = async (emailOrUsername, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { emailOrUsername, password });
      if (response.data && response.data.success) {
        const { token: receivedToken, user: loggedUser } = response.data;
        localStorage.setItem('studyflow_token', receivedToken);
        setToken(receivedToken);
        setUser(loggedUser);
        toast.success(`Welcome back, ${loggedUser.username}!`);
        return { success: true };
      }
    } catch (error) {
      console.warn('⚠️ API login failed. Activating mock mode for demo purposes...', error.message);
      
      // MOCK FALLBACK for presentations (accepts any credentials for smooth demoing)
      const mockUser = {
        _id: 'mock_user_123',
        username: emailOrUsername.split('@')[0] || 'Demo Scholar',
        email: emailOrUsername.includes('@') ? emailOrUsername : 'demo@studyflow.ai',
        xpPoints: 850,
        level: 2,
        completedSessions: 14,
        badges: ['Novice Scholar', 'Focus Champion', 'Quiz Whiz', 'Streak Master'],
        dailyAiRequests: 4,
        subscriptionType: 'free'
      };
      
      localStorage.setItem('studyflow_token', 'mock_token_key');
      setToken('mock_token_key');
      setUser(mockUser);
      toast.success(`Demo mode: Logged in as ${mockUser.username}!`);
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
  };

  // Register handler
  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { username, email, password });
      if (response.data && response.data.success) {
        const { token: receivedToken, user: loggedUser } = response.data;
        localStorage.setItem('studyflow_token', receivedToken);
        setToken(receivedToken);
        setUser(loggedUser);
        toast.success(`Account created! Welcome ${loggedUser.username}!`);
        return { success: true };
      }
    } catch (error) {
      console.warn('⚠️ API registration failed. Activating mock signup for demo...', error.message);

      // MOCK FALLBACK signup
      const mockUser = {
        _id: 'mock_user_new',
        username,
        email,
        xpPoints: 750, // Seeds demo metrics
        level: 2,
        completedSessions: 14,
        badges: ['Novice Scholar', 'Focus Champion', 'Quiz Whiz', 'Streak Master'],
        dailyAiRequests: 0,
        subscriptionType: 'free'
      };

      localStorage.setItem('studyflow_token', 'mock_token_key');
      setToken('mock_token_key');
      setUser(mockUser);
      toast.success(`Demo mode: Account registered successfully!`);
      setLoading(false);
      return { success: true };
    }
    setLoading(false);
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('studyflow_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully.');
  };

  // Helper method to increment user XP from frontend focus sessions / quizzes
  const gainXp = (amount) => {
    if (!user) return;
    setUser(prev => {
      const newXp = prev.xpPoints + amount;
      const nextLevelThreshold = prev.level * 500;
      let newLevel = prev.level;
      let unlockedBadge = null;
      let currentBadges = [...prev.badges];

      if (newXp >= nextLevelThreshold) {
        newLevel += 1;
        toast.success(`🎉 Level Up! You reached Level ${newLevel}!`, { duration: 5000 });
        
        // Award badge based on levels
        if (newLevel === 3 && !currentBadges.includes('Academic Elite')) {
          unlockedBadge = 'Academic Elite';
          currentBadges.push(unlockedBadge);
          toast.success(`🏆 New Badge: Academic Elite Unlocked!`);
        }
      }

      return {
        ...prev,
        xpPoints: newXp,
        level: newLevel,
        badges: currentBadges
      };
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, gainXp, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
