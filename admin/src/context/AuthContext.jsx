import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);

  // Load from localStorage on first render
  // useEffect(() => {
  //   const storedToken = localStorage.getItem('token');
  //   if (storedToken) {
  //     try {
  //       const decoded = jwtDecode(storedToken);
  //       setUser(decoded.user);
  //       setRole(decoded.user.role);
  //       setToken(storedToken);
  //     } catch (err) {
  //       console.error('Invalid token');
  //       logout(); // remove corrupted token
  //     }
  //   }
  // }, []);

//   useEffect(() => {
//   const storedToken = localStorage.getItem('token');
//   if (storedToken) {
//     try {
//       const decoded = jwtDecode(storedToken);
//       setUser(decoded);         // <-- fix here
//       setRole(decoded.role);    // <-- fix here
//       setToken(storedToken);
//     } catch (err) {
//       console.error('Invalid token');
//       logout(); // remove corrupted token
//     }
//   }
// }, []);

useEffect(() => {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    try {
      const decoded = jwtDecode(storedToken);
      const normalizedUser = {
        ...decoded,
        id: decoded._id || decoded.id, // ensure 'id' is always present
      };

      setUser(normalizedUser);
      setRole(normalizedUser.role);
      setToken(storedToken);
    } catch (err) {
      console.error('Invalid token');
      logout();
    }
  }
}, []);


  // Login handler
  // const login = (token, user) => {
  //   localStorage.setItem('token', token);
  //   setToken(token);
  //   setUser(user);
  //   setRole(user.role);
  // };
  const login = (token, user) => {
  localStorage.setItem('token', token);
  setToken(token);

  const normalizedUser = {
    ...user,
    id: user._id || user.id, // normalize the ID
  };

  setUser(normalizedUser);
  setRole(normalizedUser.role);
};


  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing auth context
export const useAuth = () => useContext(AuthContext);
