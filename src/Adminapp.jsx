import { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./Admindashboard";

function AdminApp({ onExitAdmin }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminUser");
    const storedToken = localStorage.getItem("adminToken");
    if (storedAdmin && storedToken) {
      setAdmin(JSON.parse(storedAdmin));
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (adminData, adminToken) => {
    setAdmin(adminData);
    setToken(adminToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    setAdmin(null);
    setToken(null);
  };

  if (!admin || !token) {
    return <AdminLogin onLogin={handleLogin} onBack={onExitAdmin} />; // ✅
  }

  return (
    <AdminDashboard
      admin={admin}
      onLogout={handleLogout}
      onBackHome={onExitAdmin} // ✅
    />
  );
}

export default AdminApp;