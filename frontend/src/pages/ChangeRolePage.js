// ChangeRolePage: Page component for changing a user's role.
// Renders the ChangeRole component and passes the authentication token.
import React from "react";
import ChangeRole from "../components/Users/ChangeRole";

const ChangeRolePage = ({ token }) => {
  return (
    <div>
      <h1>Change User Role</h1>
      <ChangeRole token={token} />
    </div>
  );
};

export default ChangeRolePage;
