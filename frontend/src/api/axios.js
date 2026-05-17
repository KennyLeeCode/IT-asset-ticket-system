import axios from "axios";

// Create a single axios instance that all API calls in the app will use
// This way we only have to set the base URL once
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Before every request goes out, automatically attach the user's login token
// The token is stored in localStorage after the user logs in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server responds with a 401 (not authorized), the token has expired
// Automatically log the user out and send them back to the login page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
