import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // TODO: replace with real auth + backend
  const [user, setUser] = useState(null);

  const login = (data) => {
    setUser({ name: 'Prathmesh', email: data.email });
  };

  const signup = (data) => {
    setUser({ name: data.name || 'New User', email: data.email });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
