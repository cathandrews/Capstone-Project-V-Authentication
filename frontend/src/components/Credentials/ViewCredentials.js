/**
 * Component for viewing credentials in a division.
 * Fetches and displays divisions and credentials based on user role.
 */
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../Auth/AuthForm.module.css";
import { RoleContext } from "../../context/RoleContext";

const ViewCredentials = ({ token }) => {
  /**
   * State: Manages credentials, selected division, divisions, loading, and errors.
   */
  const [credentials, setCredentials] = useState([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [divisions, setDivisions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { role } = useContext(RoleContext);

  /**
   * Effect: Fetches available divisions on component mount.
   */
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const fetchDivisions = async () => {
      if (!token) {
        setError("No token found. Please log in again.");
        return;
      }
      try {
        const res = await axios.get(
          "http://localhost:5000/api/users/divisions/all",
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: signal,
          }
        );
        setDivisions(res.data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          if (err.response?.status === 401) {
            toast.error("Session expired. Please log in again.");
          }
          setError("Failed to load divisions. Please try again later.");
        }
      }
    };
    fetchDivisions();
    return () => {
      controller.abort();
    };
  }, [token]);

  /**
   * Handler: Fetches credentials for the selected division.
   */
  const fetchCredentials = async () => {
    if (!selectedDivisionId) {
      setError("Please select a Division");
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/credentials/divisions/${selectedDivisionId}/credentials`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: signal,
        }
      );
      setCredentials(res.data);
      toast.success("Credentials fetched successfully!");
    } catch (err) {
      if (!axios.isCancel(err)) {
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
        }
        setError("Failed to load credentials. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render: Displays the UI for selecting a division and viewing credentials.
   */
  return (
    <div className={styles.formContainer}>
      <h2>View Credentials</h2>
      {error && <p className={styles.error}>{error}</p>}
      {divisions.length === 0 ? (
        <p>
          {role === "admin"
            ? "No divisions found. Please add a division."
            : role === "management"
            ? "You are not assigned to any OUs. Please contact an admin."
            : "You are not assigned to any divisions. Please contact an admin."}
        </p>
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
          <button
            onClick={fetchCredentials}
            disabled={isLoading}
            className={styles.formButton}
          >
            {isLoading ? "Loading..." : "Fetch Credentials"}
          </button>
          <div>
            {credentials.length > 0 ? (
              credentials.map((credential) => (
                <div key={credential._id} className={styles.formContainer}>
                  <h3>{credential.title}</h3>
                  <p>Username: {credential.username}</p>
                  <p>URL: {credential.url}</p>
                </div>
              ))
            ) : (
              <p>No credentials found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ViewCredentials;
