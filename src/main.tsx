import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // ← IMPORTANT
import TraceFlightsDMO from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TraceFlightsDMO />
  </React.StrictMode>
);
