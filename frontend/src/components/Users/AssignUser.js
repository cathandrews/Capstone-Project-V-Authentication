/**
 * Component for assigning users to divisions/OUs or removing them.
 * - Fetches users, divisions, and OUs from the backend.
 * - Allows admins to assign/unassign users to divisions and OUs.
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../Auth/AuthForm.module.css";

const AssignUser = ({ token }) => {
  /**
   * State: Manages form inputs, lists, and UI feedback.
   */
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [selectedOuId, setSelectedOuId] = useState("");
  const [divisionsToRemove, setDivisionsToRemove] = useState([]);
  const [ousToRemove, setOusToRemove] = useState([]);
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [ous, setOus] = useState([]);
  const [userDivisions, setUserDivisions] = useState([]);
  const [userOUs, setUserOUs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Effect: Fetches initial data (users, divisions, and OUs) on component mount.
   */
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const usersRes = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersRes.data);
        const divisionsRes = await axios.get(
          "http://localhost:5000/api/users/divisions/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDivisions(divisionsRes.data);
        const ousRes = await axios.get(
          "http://localhost:5000/api/users/ous/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOus(ousRes.data);
      } catch (err) {
        setError("Failed to load lists. Please try again later.");
      }
    };
    fetchLists();
  }, [token]);

  /**
   * Effect: Fetches user's current divisions and OUs when a user is selected.
   */
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!selectedUserId) {
        setUserDivisions([]);
        setUserOUs([]);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/${selectedUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserDivisions(res.data.divisions || []);
        setUserOUs(res.data.OUs || []);
      } catch (err) {
        setError("Failed to load user details. Please try again later.");
      }
    };
    fetchUserDetails();
  }, [selectedUserId, token]);

  /**
   * Handlers: Toggle checkboxes for removing divisions/OUs.
   */
  const handleDivisionToRemoveChange = (divisionId) => {
    if (divisionsToRemove.includes(divisionId)) {
      setDivisionsToRemove(divisionsToRemove.filter((id) => id !== divisionId));
    } else {
      setDivisionsToRemove([...divisionsToRemove, divisionId]);
    }
  };
  const handleOuToRemoveChange = (ouId) => {
    if (ousToRemove.includes(ouId)) {
      setOusToRemove(ousToRemove.filter((id) => id !== ouId));
    } else {
      setOusToRemove([...ousToRemove, ouId]);
    }
  };

  /**
   * Handler: Submits assignment/unassignment requests to the backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await axios.post(
        `http://localhost:5000/api/users/${selectedUserId}/assign`,
        {
          divisionId: selectedDivisionId,
          ouId: selectedOuId,
          divisionsToRemove,
          ousToRemove,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User assigned successfully!");
    } catch (err) {
      setError("Failed to assign user. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render: Displays the form for assigning/unassigning users.
   */
  return (
    <div className={styles.formContainer}>
      <h2>Assign User</h2>
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
          <label>Assign to Division:</label>
          <select
            value={selectedDivisionId}
            onChange={(e) => setSelectedDivisionId(e.target.value)}
            className={styles.formInput}
          >
            <option value="">Select a division (optional)</option>
            {divisions.map((division) => (
              <option key={division._id} value={division._id}>
                {division.name}
              </option>
            ))}
          </select>
        </div>
        {selectedUserId && userDivisions.length > 0 && (
          <div className={styles.formGroup}>
            <h4>Remove from Divisions:</h4>
            {userDivisions.map((division) => (
              <div key={division._id}>
                <label>
                  <input
                    type="checkbox"
                    checked={divisionsToRemove.includes(division._id)}
                    onChange={() => handleDivisionToRemoveChange(division._id)}
                  />
                  {division.name}
                </label>
              </div>
            ))}
          </div>
        )}
        <div className={styles.formGroup}>
          <label>Assign to OU:</label>
          <select
            value={selectedOuId}
            onChange={(e) => setSelectedOuId(e.target.value)}
            className={styles.formInput}
          >
            <option value="">Select an OU (optional)</option>
            {ous.map((ou) => (
              <option key={ou._id} value={ou._id}>
                {ou.name}
              </option>
            ))}
          </select>
        </div>
        {selectedUserId && userOUs.length > 0 && (
          <div className={styles.formGroup}>
            <h4>Remove from OUs:</h4>
            {userOUs.map((ou) => (
              <div key={ou._id}>
                <label>
                  <input
                    type="checkbox"
                    checked={ousToRemove.includes(ou._id)}
                    onChange={() => handleOuToRemoveChange(ou._id)}
                  />
                  {ou.name}
                </label>
              </div>
            ))}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={styles.formButton}
        >
          {isLoading ? "Assigning..." : "Assign User"}
        </button>
      </form>
    </div>
  );
};

export default AssignUser;
