import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { StytchProvider } from "@stytch/react";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <StytchProvider config={stytchConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StytchProvider>
  </React.StrictMode>
);

const stytchConfig = {
  publicToken: process.env.REACT_APP_STYTCH_PUBLIC_TOKEN || "",
  loginRedirectURL: "http://localhost:3000/dashboard",
  sessionOptions: { duration_minutes: 60 },
};

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
