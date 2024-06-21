import * as React from "react";
import { Routes, Route, useNavigate } from 'react-router-dom';
import { NextUIProvider } from "@nextui-org/react";

import Landing from './Landing/Landing';
import Pricing from './Landing/Pricing';
import Future from './Landing/Future';
import ContactUs from './Landing/ContactUs';
import Home from './Home/Home';
import Events from './Events/Events';

function App() {
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/future" element={<Future />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/home" element={<Home />} />
        <Route path="/events" element={<Events />} />
      </Routes>
    </NextUIProvider>
  );
}

export default App;
