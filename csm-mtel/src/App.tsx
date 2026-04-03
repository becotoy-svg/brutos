import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import FaForm from "@/pages/FaForm";
import FaTypeSelect from "@/pages/FaTypeSelect";
import Guide from "@/pages/Guide";
import Login from "@/pages/Login";
import Schedule from "@/pages/Schedule";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fa/tipo"
          element={
            <ProtectedRoute>
              <FaTypeSelect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fa/novo"
          element={
            <ProtectedRoute>
              <FaForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guia"
          element={
            <ProtectedRoute>
              <Guide />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cronograma"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
