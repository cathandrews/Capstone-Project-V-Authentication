/**
 * Component for updating an existing credential.
 * Fetches credentials the user is authorized to update and allows selection and editing.
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../Auth/AuthForm.module.css";

const UpdateCredential = ({ token }) => {
  /**
   * State: Manages credentials, selected credential, form inputs, loading, and errors.
   */
  const [credentials, setCredentials] = useState([]);
  const [selectedCredentialId, setSelectedCredentialId] = useState("");
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Effect: Fetches credentials the user is authorized to update.
   */
  useEffect(() => {
    const fetchCredentials = async () => {
      if (!token) {
        setError("No token found. Please log in again.");
        return;
      }

      try {
        // Fetch all divisions the user is assigned to
        const divisionsRes = await axios.get(
          "http://localhost:5000/api/users/divisions/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Fetch credentials for each division
        const credentialsPromises = divisionsRes.data.map((division) =>
          axios.get(
            `http://localhost:5000/api/credentials/divisions/${division._id}/credentials`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );

        const credentialsResponses = await Promise.all(credentialsPromises);
        const allCredentials = credentialsResponses.flatMap(
          (response) => response.data
        );
        setCredentials(allCredentials);
      } catch (err) {
        console.error("Failed to fetch credentials:", err);
        if (err.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
        } else if (err.response?.status === 403) {
          setError("You are not authorized to update any credentials.");
        } else {
          setError("Failed to load credentials. Please try again later.");
        }
      }
    };

    fetchCredentials();
  }, [token]);

  /**
   * Handler: Populates form fields when a credential is selected.
   */
  const handleCredentialSelect = (e) => {
    const credentialId = e.target.value;
    setSelectedCredentialId(credentialId);
    const selectedCredential = credentials.find(
      (cred) => cred._id === credentialId
    );
    if (selectedCredential) {
      setTitle(selectedCredential.title);
      setUsername(selectedCredential.username);
      setPassword(selectedCredential.password);
      setUrl(selectedCredential.url);
    }
  };

  /**
   * Handler: Submits updated credential data to the backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await axios.put(
        `http://localhost:5000/api/credentials/${selectedCredentialId}`,
        { title, username, password, url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Credential updated successfully!");
    } catch (err) {
      console.error("Failed to update credential:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized to update this credential.");
      } else {
        setError("Failed to update credential. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render: Displays the form for updating a credential.
   */
  return (
    <div className={styles.formContainer}>
      <h2>Update Credential</h2>
      {error && <p className={styles.error}>{error}</p>}
      {credentials.length === 0 ? (
        <p>
          No credentials found or you are not authorized to update credentials.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Credential:</label>
            <select
              value={selectedCredentialId}
              onChange={handleCredentialSelect}
              required
              className={styles.formInput}
            >
              <option value="">Select a credential</option>
              {credentials.map((credential) => (
                <option key={credential._id} value={credential._id}>
                  {credential.title}
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
            {isLoading ? "Updating..." : "Update Credential"}
          </button>
        </form>
      )}
    </div>
  );
};

export default UpdateCredential;
