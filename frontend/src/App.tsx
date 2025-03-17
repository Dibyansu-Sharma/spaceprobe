import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import Dashboard from "./Dashboard";
import MockDashboard from "./MockDashboard";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mock-dashboard" element={<MockDashboard />} />
      </Routes>
    </Router>
  );
}
