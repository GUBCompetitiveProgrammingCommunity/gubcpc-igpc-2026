import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Cursor from "./components/Cursor";
import Bubbles from "./components/Bubbles";
import Loader from "./components/Loader";
import Home from "./pages/Home";
import About from "./pages/About";
import Schedule from "./pages/Schedule";
import Contact from "./pages/Contact";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/data.json")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setTimeout(() => setLoading(false), 2800);
      })
      .catch(() => setTimeout(() => setLoading(false), 2800));
  }, []);

  if (loading) return <Loader />;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050f07] text-white font-sans selection:bg-green-500/30">
        <Cursor />
        <Bubbles />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home data={data} />} />
          <Route path="/about" element={<About data={data} />} />
          <Route path="/schedule" element={<Schedule data={data} />} />
          <Route path="/contact" element={<Contact data={data} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
