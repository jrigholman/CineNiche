import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { StytchProvider } from "@stytch/react";
import { StytchUIClient } from "@stytch/vanilla-js";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

// Define stytchConfig before using it
const stytchConfig = {
  publicToken: process.env.REACT_APP_STYTCH_PUBLIC_TOKEN || "public-token-test-1234abcd-1234-1234-1234-123456789012",
  loginRedirectURL: "http://localhost:3000/dashboard",
  sessionOptions: { duration_minutes: 60 },
};

// Initialize the Stytch client with error handling
let stytchClient;
try {
  stytchClient = new StytchUIClient(stytchConfig.publicToken);
  console.log("Stytch client initialized successfully");
} catch (error) {
  console.error("Failed to initialize Stytch client:", error);
  // We'll render without StytchProvider in this case
}

// Conditional rendering based on whether Stytch initialized correctly
if (stytchClient) {
  root.render(
    <React.StrictMode>
      <StytchProvider stytch={stytchClient} config={stytchConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StytchProvider>
    </React.StrictMode>
  );
} else {
  // Fallback rendering without Stytch
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
