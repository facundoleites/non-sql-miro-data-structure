import * as React from "react";
import { Footer } from "./Footer";
import "./styles.scss";
const LayoutBase: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setloading] = React.useState(true);
  React.useEffect(() => {
    miro.onReady(async () => {
      const authorized = await miro.isAuthorized();
      console.log("authorized", authorized);
      if (authorized) {
      } else {
        const res = await miro.board.ui.openModal("auth.html");
        console.log("res", res);
        if (res === "success") {
          setloading(false);
        }
      }
    });
  }, [setloading]);
  return (
    <div className="Layout">
      <main className="LayoutBody">{loading ? "loading..." : children}</main>
      <Footer />
    </div>
  );
};
export const Layout = React.memo(LayoutBase);
