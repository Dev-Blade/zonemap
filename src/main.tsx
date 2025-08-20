import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./components/App.tsx";
import "./assets/css/index.css";
import "flowbite";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="bg-white dark:bg-black">
      <App />
    </div>
  </React.StrictMode>
);
