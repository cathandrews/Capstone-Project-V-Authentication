/**
 * Component for updating an existing credential.
 * Fetches all credentials and allows selection and editing of a specific credential.
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
   * Effect: Fetches all credentials on component mount.
   */
  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const divisions = await axios.get(
          "http://localhost:5000/api/users/divisions/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const credentialsPromises = divisions.data.map((division) =>
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
        setError("Failed to load credentials. Please try again later.");
      }
    };
    fetchCredentials();
  }, [token]);

  /**
   * Handler: Populates form fields when a credential is selected.
   */
  const handleCredentialSelect = (e) => {
    const selectedCredentialId = e.target.value;
    setSelectedCredentialId(selectedCredentialId);
    const selectedCredential = credentials.find(
      (cred) => cred._id === selectedCredentialId
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
      setError("Failed to update credential. Please try again later.");
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
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
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
