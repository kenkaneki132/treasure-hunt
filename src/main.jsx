import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

// HashRouter: GitHub Pages can't rewrite /treasure-hunt/Game to index.html, so refreshing a
// BrowserRouter route returned 404. Hash URLs (#/Game) always load the app.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </HashRouter>
  </React.StrictMode>
);
