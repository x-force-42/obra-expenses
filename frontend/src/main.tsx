import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "@/app/App";
import { worker } from "@/mocks/browser";

import "@/index.css";

function renderApp() {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW !== "true") {
    return;
  }

  await worker.start({
    onUnhandledRequest: "bypass",
  });
}

void enableMocking()
  .catch((error) => {
    console.error("MSW failed to start. Rendering app without request mocking.", error);
  })
  .finally(() => {
    renderApp();
  });
