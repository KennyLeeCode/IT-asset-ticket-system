import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

// The login page is the first thing users see when they are not signed in
function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      // Show the error message returned by the server, or a fallback message
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo and title */}
        <div className="login-header">
          <div className="login-logo">IT</div>
          <h1 className="login-title">Asset Manager</h1>
          <p className="login-subtitle">Sign in to your IT support portal</p>
        </div>

        {/* Login form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Default credentials hint for first time setup */}
        <div className="login-hint">
          <strong>Default admin login:</strong><br />
          admin@company.com / admin123
        </div>
      </div>
    </div>
  );
}

export default Login;
