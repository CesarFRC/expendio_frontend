import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('expendio_token'));
  const [loading, setLoading] = useState(true);

  // Hydrate user from token on mount
  useEffect(() => {
    if (token) {
      authService.getMe()
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem('expendio_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('expendio_token', data.access_token);
    setToken(data.access_token);
    setUser(data.empleado);
    return data;
  };

  const logout = async () => {
    try { await authService.logout(); } catch (_) { /* ok */ }
    localStorage.removeItem('expendio_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.rol?.nombre === 'Admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
