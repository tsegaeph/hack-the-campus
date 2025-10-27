import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom"; // <-- changed
import App from "./App";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>  {/* <-- changed */}
      <App />
    </HashRouter>
  </React.StrictMode>
);
