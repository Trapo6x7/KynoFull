import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import 'leaflet/dist/leaflet.css';

if (import.meta.env.DEV) {
  window.alert = () => {};
  window.confirm = () => false;
  window.prompt = () => null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);