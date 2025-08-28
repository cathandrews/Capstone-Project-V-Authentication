/**
 * Root Component: Wraps the app with Router and RoleProvider, manages token persistence.
 */
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RoleProvider } from "./context/RoleContext";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import Navigation from "./components/Navigation";
import CredentialsPage from "./pages/CredentialsPage";
import AddCredentialPage from "./pages/AddCredentialPage";
import UpdateCredentialPage from "./pages/UpdateCredentialPage";
import AssignUserPage from "./pages/AssignUserPage";
import ChangeRolePage from "./pages/ChangeRolePage";

function App() {
  /**
   * State: Manages token persistence in sessionStorage.
   */
  const [token, setToken] = useState(sessionStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("token", token);
    } else {
      sessionStorage.removeItem("token");
    }
  }, [token]);

  /**
   * Render: Conditionally shows auth forms or app routes based on token presence.
   */
  return (
    <RoleProvider token={token}>
      <Router>
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#f5f5f5",
            padding: "20px",
          }}
        >
          <ToastContainer />
          {!token ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "40px",
                marginTop: "50px",
                flexWrap: "wrap",
              }}
            >
              <Register setToken={setToken} />
              <Login setToken={setToken} />
            </div>
          ) : (
            <>
              <Navigation token={token} setToken={setToken} />
              <div style={{ padding: "20px", marginTop: "20px" }}>
                <Routes>
                  <Route
                    path="/credentials"
                    element={<CredentialsPage token={token} />}
                  />
                  <Route
                    path="/add-credential"
                    element={<AddCredentialPage token={token} />}
                  />
                  <Route
                    path="/update-credential"
                    element={<UpdateCredentialPage token={token} />}
                  />
                  <Route
                    path="/assign-user"
                    element={<AssignUserPage token={token} />}
                  />
                  <Route
                    path="/change-role"
                    element={<ChangeRolePage token={token} />}
                  />
                  <Route
                    index
                    element={<Navigate to="/credentials" replace />}
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/credentials" replace />}
                  />
                </Routes>
              </div>
            </>
          )}
        </div>
      </Router>
    </RoleProvider>
  );
}

export default App;
