/**
 * Login Form: Authenticates user, sets token + role, and shows success/error toasts.
 */
import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./AuthForm.module.css";
import { RoleContext } from "../../context/RoleContext";

const Login = ({ setToken }) => {
  /**
   * State + Context: Manages form inputs, loading state, and role context.
   */
  const { setRole } = useContext(RoleContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handler: Submits login credentials to the backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });
      setToken(res.data.token);
      setRole(res.data.role);
      toast.success("Login successful!");
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error(err.response?.data?.error || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render: Displays the login form with loading state.
   */
  return (
    <div className={styles.formContainer}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.formInput}
          />
        </div>
        <div className={styles.formGroup}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.formInput}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={styles.formButton}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
