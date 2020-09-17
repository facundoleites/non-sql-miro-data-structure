import * as React from "react";
import * as ReactDOM from "react-dom";
const AuthBase = () => {
  const [loading, setLoading] = React.useState(false);
  const handleClick = React.useCallback(() => {
    setLoading(true);
    miro
      .authorize({
        response_type: "token",
      })
      .then(() => miro.getToken())
      .then((token) => {
        if (token) {
          miro.board.ui.closeModal("success");
        } else {
          miro.showErrorNotification("something went wrong");
        }
        setLoading(false);
      });
  }, [setLoading]);
  return (
    <div>
      <h1 className="miro-h1">Non-sql</h1>
      <h2 className="miro-h2">Auth</h2>
      {loading ? (
        "loading..."
      ) : (
        <button
          className="miro-btn miro-btn--primary"
          onClick={handleClick}
          style={{
            width: "100%",
          }}
        >
          Auth
        </button>
      )}
    </div>
  );
};

export const Auth = React.memo(AuthBase);
ReactDOM.render(<Auth />, document.getElementById("react-app-auth"));
