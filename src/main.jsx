import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import BeppuTravelItineraryApp from "../beppu_travel_itinerary_app.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <BeppuTravelItineraryApp />
    </HashRouter>
  </React.StrictMode>,
);
