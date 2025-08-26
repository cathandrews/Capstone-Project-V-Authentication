// UpdateCredentialsPage: Page component for updating credentials.
// Renders the UpdateCredential component and passes the authentication token.
import React from "react";
import UpdateCredential from "../components/Credentials/UpdateCredential";

const UpdateCredentialPage = ({ token }) => {
  return (
    <div>
      <h1>Update Credential</h1>
      <UpdateCredential token={token} />
    </div>
  );
};

export default UpdateCredentialPage;
