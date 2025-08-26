/**
 * Component for rendering the navigation bar.
 * Shows different links based on user role and provides logout functionality.
 */
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navigation.module.css";
import { RoleContext } from "../context/RoleContext";

const Navigation = ({ token, setToken }) => {
  /**
   * Context and Navigation: Manages user role and page redirection.
   */
  const { role, setRole } = useContext(RoleContext);
  const navigate = useNavigate();

  /**
   * Handler: Clears token and role, then redirects to home.
   */
  const handleLogout = () => {
    setToken("");
    setRole("");
    localStorage.removeItem("role");
    navigate("/");
  };

  /**
   * Guard: If no token, don't render navigation.
   */
  if (!token) return null;

  /**
   * Render: Displays the navigation bar with role-based links.
   */
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link to="/credentials">View Credentials</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/add-credential">Add Credential</Link>
        </li>
        {(role === "admin" || role === "management") && (
          <li className={styles.navItem}>
            <Link to="/update-credential">Update Credential</Link>
          </li>
        )}
        {role === "admin" && (
          <>
            <li className={styles.navItem}>
              <Link to="/assign-user">Assign User</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/change-role">Change Role</Link>
            </li>
          </>
        )}
      </ul>
      <button onClick={handleLogout} className={styles.logoutButton}>
        Logout
      </button>
    </nav>
  );
};

export default Navigation;
