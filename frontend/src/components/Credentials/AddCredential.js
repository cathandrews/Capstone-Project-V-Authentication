/**
 * Component for adding a new credential to a division.
 * Fetches available divisions and submits new credential data to the backend.
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../Auth/AuthForm.module.css";

const AddCredential = ({ token }) => {
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [divisions, setDivisions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Effect: Fetch available divisions on component mount.
   */
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/users/divisions/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDivisions(res.data);
        // Auto-select the first division if available
        if (res.data.length > 0) {
          setSelectedDivisionId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch divisions:", err);
        setError("Failed to load divisions. Please try again later.");
      }
    };
    fetchDivisions();
  }, [token]);

  /**
   * Handler: Submit new credential data to the backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await axios.post(
        `http://localhost:5000/api/credentials/divisions/${selectedDivisionId}/credentials`,
        { title, username, password, url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Credential added successfully!");
      setTitle("");
      setUsername("");
      setPassword("");
      setUrl("");
    } catch (err) {
      console.error("Failed to add credential:", err);
      setError("Failed to add credential. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render: Displays the form for adding a new credential.
   */
  return (
    <div className={styles.formContainer}>
      <h2>Add Credential</h2>
      {error && <p className={styles.error}>{error}</p>}
      {divisions.length === 0 ? (
        <p>You are not assigned to any divisions. Please contact an admin.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Division:</label>
            <select
              value={selectedDivisionId}
              onChange={(e) => setSelectedDivisionId(e.target.value)}
              required
              className={styles.formInput}
            >
              <option value="">Select a division</option>
              {divisions.map((division) => (
                <option key={division._id} value={division._id}>
                  {division.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={styles.formInput}
            />
          </div>
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
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className={styles.formInput}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={styles.formButton}
          >
            {isLoading ? "Adding..." : "Add Credential"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddCredential;
