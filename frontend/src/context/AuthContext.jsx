import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// AuthContext holds the logged in user's info and shares it with the whole app
// Any component can call useAuth() to get the current user or call login/logout
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Load any previously saved user from localStorage so the login persists on refresh
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();

  // Send the email and password to the server, save the token and user on success
  async function login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: userData } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // Send the user to the dashboard right after logging in
    navigate("/dashboard");
  }

  // Clear all saved data and send the user back to the login screen
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so components can access auth without importing the context directly
export function useAuth() {
  return useContext(AuthContext);
}
