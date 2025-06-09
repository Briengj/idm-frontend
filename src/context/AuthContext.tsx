import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the shape of the context data
interface AuthContextType {
  token: string | null;
  login: (newToken: string) => void;
  logout: () => void;
}

// --- CHANGE 1: Create the context with a default value of 'null' ---
// This is a more standard and robust pattern.
const AuthContext = createContext<AuthContextType | null>(null);

// --- CHANGE 2: Define the component's props with a 'type' alias ---
// This is a more modern way to type components and avoids the error you saw.
type AuthProviderProps = {
  children: React.ReactNode;
};

// Create the provider component that will wrap our application
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);

  // This effect runs once when the app loads to check for an existing token
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Function to update state and localStorage on login
  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('accessToken', newToken);
  };

  // Function to clear state and localStorage on logout
  const logout = () => {
    setToken(null);
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to make it easy for other components to access the auth state
export const useAuth = () => {
  const context = useContext(AuthContext);
  // --- CHANGE 3: Check for 'null' instead of 'undefined' ---
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};