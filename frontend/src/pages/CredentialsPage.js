// CredentialsPage: Page component for viewing credentials.
// Renders the ViewCredentials component and passes the authentication token.
import React from "react";
import ViewCredentials from "../components/Credentials/ViewCredentials";

const CredentialsPage = ({ token }) => {
  return (
    <div>
      <h1>View Credentials</h1>
      <ViewCredentials token={token} />
    </div>
  );
};

export default CredentialsPage;
