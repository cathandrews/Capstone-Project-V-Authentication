// AssignUserPage: Page component for assigning users to divisions/OUs.
// Renders the AssignUser component and passes the authentication token.
import React from "react";
import AssignUser from "../components/Users/AssignUser";

const AssignUserPage = ({ token }) => {
  return (
    <div>
      <h1>Assign User</h1>
      <AssignUser token={token} />
    </div>
  );
};

export default AssignUserPage;
