/**
 * Registration Form: Allows users to create a new account.
 * On success, shows a toast notification and prompts the user to log in.
 */
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "./AuthForm.module.css";

const Register = () => {
  /**
   * State: Manages form inputs and loading status.
   */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handler: Sends registration data to the backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        username,
        password,
      });
      toast.success("Registration successful! Please log in.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render: Displays the registration form with loading state.
   */
  return (
    <div className={styles.formContainer}>
      <h2>Register</h2>
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
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
