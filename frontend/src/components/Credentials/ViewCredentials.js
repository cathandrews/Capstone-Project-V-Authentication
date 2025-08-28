/**
 * Component for viewing credentials in a division.
 * Fetches and displays divisions and credentials based on user role.
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../Auth/AuthForm.module.css";

const ViewCredentials = ({ token }) => {
  /**
   * State: Manages credentials, selected division, loading, and errors.
   */
  const [credentials, setCredentials] = useState([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [divisions, setDivisions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Effect: Fetch divisions on component mount.
   */
  useEffect(() => {
    const fetchDivisions = async () => {
      if (!token) {
        setError("No token found. Please log in again.");
        return;
      }
      try {
        console.log("Fetching divisions with token:", token);
        const res = await axios.get(
          "http://localhost:5000/api/users/divisions/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Divisions fetched:", res.data);
        setDivisions(res.data);
        if (res.data.length > 0) {
          setSelectedDivisionId(res.data[0]._id);
        }
      } catch (err) {
        console.error(
          "Failed to fetch divisions:",
          err.response?.data || err.message
        );
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
        }
        setError("Failed to load divisions. Please try again later.");
      }
    };
    fetchDivisions();
  }, [token]);

  /**
   * Effect: Fetch credentials when selectedDivisionId changes.
   */
  useEffect(() => {
    if (selectedDivisionId) {
      const fetchCredentials = async () => {
        setIsLoading(true);
        setError("");
        try {
          console.log(
            `Fetching credentials for division ${selectedDivisionId}`
          );
          const res = await axios.get(
            `http://localhost:5000/api/credentials/divisions/${selectedDivisionId}/credentials`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("Credentials fetched:", res.data);
          setCredentials(res.data);
        } catch (err) {
          console.error(
            "Failed to fetch credentials:",
            err.response?.data || err.message
          );
          if (err.response?.status === 401) {
            toast.error("Session expired. Please log in again.");
          } else if (err.response?.status === 403) {
            setError(
              "Access denied. You do not have permission to view these credentials."
            );
          } else {
            setError("Failed to load credentials. Please try again later.");
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchCredentials();
    }
  }, [selectedDivisionId, token]);

  /**
   * Render: Displays the UI for selecting a division and viewing credentials.
   */
  return (
    <div className={styles.formContainer}>
      <h2>View Credentials</h2>
      {error && <p className={styles.error}>{error}</p>}
      {divisions.length === 0 ? (
        <p>You are not assigned to any divisions. Please contact an admin.</p>
      ) : (
        <>
          <div className={styles.formGroup}>
            <label>Select Division:</label>
            <select
              value={selectedDivisionId}
              onChange={(e) => setSelectedDivisionId(e.target.value)}
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
          <div>
            {isLoading ? (
              <p>Loading credentials...</p>
            ) : credentials.length > 0 ? (
              credentials.map((credential) => (
                <div key={credential._id} className={styles.formContainer}>
                  <h3>{credential.title}</h3>
                  <p>Username: {credential.username}</p>
                  <p>URL: {credential.url}</p>
                </div>
              ))
            ) : (
              <p>No credentials found for this division.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ViewCredentials;
