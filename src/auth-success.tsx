import * as React from "react";
import * as ReactDOM from "react-dom";
const AuthSuccessBase = () => {
  React.useEffect(() => {
    if (window.opener) {
      // Close this window
      window.opener.miroAuthorized();
    }
  }, []);
  return (
    <div>
      <h1 className="miro-h1">Success</h1>
    </div>
  );
};

export const AuthSuccess = React.memo(AuthSuccessBase);
ReactDOM.render(
  <AuthSuccess />,
  document.getElementById("react-app-auth-success")
);
