// AddCredentialPage: Page component for adding a new credential.
// Renders the AddCredential component and passes the authentication token.
import React from "react";
import AddCredential from "../components/Credentials/AddCredential";

const AddCredentialPage = ({ token }) => {
  return (
    <div>
      <h1>Add Credential</h1>
      <AddCredential token={token} />
    </div>
  );
};

export default AddCredentialPage;
