import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

/**
 * Context for managing the user's role globally.
 * Provides the role state and a function to update it.
 */
export const RoleContext = createContext();

/**
 * RoleProvider: Wraps the app and provides the role state and update function.
 * - Fetches the user's role from the backend on token change.
 * - Falls back to decoding the JWT if the API call fails.
 * - Does NOT show toasts on error (errors are logged to console only).
 */
export const RoleProvider = ({ children, token }) => {
  const [role, setRole] = useState(sessionStorage.getItem("role") || "");

  // Persist role to sessionStorage whenever it changes
  useEffect(() => {
    if (role) {
      sessionStorage.setItem("role", role);
    } else {
      sessionStorage.removeItem("role");
    }
  }, [role]);

  // Fetch the user's role when the token changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!token) {
        setRole("");
        return;
      }
      try {
        // Try to fetch the role from the backend
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(res.data.role);
      } catch (err) {
        console.error("Failed to fetch user role:", err);
        // Fallback: Decode the JWT to get the role if the API call fails
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            setRole(payload?.role || "");
          }
        } catch (decodeErr) {
          console.error("Failed to decode JWT for role:", decodeErr);
          setRole("");
        }
      }
    };
    fetchUserRole();
  }, [token]);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};
