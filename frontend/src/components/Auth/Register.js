/**
 * Register Component: Handles user registration with support for multiple OUs and divisions.
 * New users are always registered as "normal" users.
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../Auth/AuthForm.module.css";

const Register = ({ setToken }) => {
  // State for form inputs and selections
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ous, setOUs] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedOuIds, setSelectedOuIds] = useState([]);
  const [selectedDivisionIds, setSelectedDivisionIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Effect: Fetch all OUs on component mount.
   */
  useEffect(() => {
    const fetchOUs = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/users/ous/public"
        );
        setOUs(res.data);
      } catch (err) {
        console.error("Failed to fetch OUs:", err);
        setError("Failed to load OUs. Please try again later.");
      }
    };
    fetchOUs();
  }, []);

  /**
   * Effect: Fetch divisions for selected OUs.
   */
  useEffect(() => {
    const fetchDivisions = async () => {
      if (selectedOuIds.length === 0) return;
      try {
        // Fetch divisions for each selected OU using the public endpoint
        const divisionPromises = selectedOuIds.map((ouId) =>
          axios.get(
            `http://localhost:5000/api/users/ous/${ouId}/divisions/public`
          )
        );
        const divisionResponses = await Promise.all(divisionPromises);
        const allDivisions = divisionResponses.flatMap((res) => res.data);
        setDivisions(allDivisions);
      } catch (err) {
        console.error("Failed to fetch divisions:", err);
        setError("Failed to load divisions. Please try again later.");
      }
    };
    fetchDivisions();
  }, [selectedOuIds]);

  /**
   * Handler: Submit the registration form.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    // Validate that at least one OU and division is selected
    if (selectedOuIds.length === 0) {
      setError("At least one OU must be selected.");
      setIsLoading(false);
      return;
    }
    if (selectedDivisionIds.length === 0) {
      setError("At least one division must be selected.");
      setIsLoading(false);
      return;
    }
    try {
      console.log("Submitting registration with:", {
        username,
        selectedOuIds,
        selectedDivisionIds,
      });
      // Register the user with selected OUs and divisions
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username,
        password,
        ouIds: selectedOuIds,
        divisionIds: selectedDivisionIds,
      });
      // Set the JWT token on successful registration
      setToken(res.data.token);
      toast.success("Registration successful!");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError(
        err.response?.data?.error ||
          "Registration failed. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handler: Toggle selection of an OU.
   */
  const handleOuSelection = (e) => {
    const ouId = e.target.value;
    if (selectedOuIds.includes(ouId)) {
      setSelectedOuIds(selectedOuIds.filter((id) => id !== ouId));
    } else {
      setSelectedOuIds([...selectedOuIds, ouId]);
    }
  };

  /**
   * Handler: Toggle selection of a division.
   */
  const handleDivisionSelection = (e) => {
    const divisionId = e.target.value;
    if (selectedDivisionIds.includes(divisionId)) {
      setSelectedDivisionIds(
        selectedDivisionIds.filter((id) => id !== divisionId)
      );
    } else {
      setSelectedDivisionIds([...selectedDivisionIds, divisionId]);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Register</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Username input */}
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
        {/* Password input */}
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
        {/* OU selection checkboxes */}
        <div className={styles.formGroup}>
          <label>OUs:</label>
          {ous.map((ou) => (
            <div key={ou._id} className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  value={ou._id}
                  checked={selectedOuIds.includes(ou._id)}
                  onChange={handleOuSelection}
                />
                {ou.name}
              </label>
            </div>
          ))}
        </div>
        {/* Division selection checkboxes */}
        <div className={styles.formGroup}>
          <label>Divisions:</label>
          {divisions.map((division) => (
            <div key={division._id} className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  value={division._id}
                  checked={selectedDivisionIds.includes(division._id)}
                  onChange={handleDivisionSelection}
                />
                {division.name}
              </label>
            </div>
          ))}
        </div>
        {/* Submit button */}
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
