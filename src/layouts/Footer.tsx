import * as React from "react";
const FooterBase = () => {
  return (
    <footer className="LayoutFooter">
      <p>Made by Facundo Leites with 💚 from Curitiba, Brazil</p>
    </footer>
  );
};
export const Footer = React.memo(FooterBase);
