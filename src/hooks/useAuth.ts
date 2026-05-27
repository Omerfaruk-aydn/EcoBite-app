import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAppStore } from '../store/useAppStore';

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, setUser } = useAppStore();

  useEffect(() => {
    // Session check on load
    const token = localStorage.getItem('token');
    if (token && !user) {
        const fetchProfile = async () => {
          try {
            const res = await apiClient.get('/auth/me');
            setUser(res.data);
          } catch (err) {
            console.error('Profile fetch failed');
            localStorage.removeItem('token');
            setUser(null);
          } finally {
            setLoading(false);
          }
        };
        fetchProfile();
    } else {
        setLoading(false);
    }
  }, [user, setUser]);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const res = await apiClient.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
      navigate('/home');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Giriş başarısız';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      setError(null);
      setLoading(true);
      const res = await apiClient.post('/auth/register', { email, password: pass, displayName: name });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
      navigate('/home');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Kayıt başarısız';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInAsDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create/Login to a real 'demo' account on the backend
      const res = await apiClient.post('/auth/login', { 
        email: 'demo@ecobite.app', 
        password: 'demo-password-123' 
      }).catch(async () => {
        // If demo doesn't exist, register it
        return await apiClient.post('/auth/register', { 
          email: 'demo@ecobite.app', 
          password: 'demo-password-123', 
          displayName: 'Demo Kullanıcı' 
        });
      });

      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
      navigate('/home');
    } catch (err: any) {
      setError('Hızlı giriş şu an yapılamıyor.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return {
    user,
    loading,
    error,
    signInWithEmail,
    signInAsDemo,
    registerWithEmail,
    signOut,
  };
};
