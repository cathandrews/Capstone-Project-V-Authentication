/**
 * Component for updating a user's role.
 * - Fetches all users from the backend.
 * - Allows admins to change a user's role.
 * - Updates the global role state if the current user's role is changed.
 */
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../Auth/AuthForm.module.css";
import { RoleContext } from "../../context/RoleContext";
const ChangeRole = ({ token }) => {
  /**
   * State: Manages form inputs, lists, and UI feedback.
   */
  const { setRole } = useContext(RoleContext);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setLocalRole] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  /**
   * Effect: Fetches all users on component mount.
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRes = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersRes.data);
      } catch (err) {
        setError("Failed to load users. Please try again later.");
      }
    };
    fetchUsers();
  }, [token]);
  /**
   * Handler: Submits role update request to the backend.
   * Sends: { role }
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await axios.put(
        `http://localhost:5000/api/users/${selectedUserId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User role updated successfully!");
      if (selectedUserId === localStorage.getItem("userId")) {
        setRole(role);
      }
    } catch (err) {
      setError("Failed to update user role. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  /**
   * Render: Displays the form for changing a user's role.
   */
  return (
    <div className={styles.formContainer}>
      <h2>Change User Role</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>User:</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            required
            className={styles.formInput}
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Role:</label>
          <select
            value={role}
            onChange={(e) => setLocalRole(e.target.value)}
            required
            className={styles.formInput}
          >
            <option value="">Select Role</option>
            <option value="normal">Normal</option>
            <option value="management">Management</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={styles.formButton}
        >
          {isLoading ? "Updating..." : "Change Role"}
        </button>
      </form>
    </div>
  );
};
export default ChangeRole;
