import { createContext, useState, useEffect, type ReactNode } from 'react';

// Create the context
export const AuthContext = createContext({
  token: null as string | null,
  login: (_token: string) => {},
  logout: () => {},
});

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user is already logged in when the app starts
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
