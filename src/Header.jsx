import { useState, useEffect, useRef } from "react";
import LoginModal from "./LoginModal";
import HamburgerSidebar from "./HamburgerSidebar";
import UserDashboard from "./UserDashboard";
import "./Header.css";

function Header({
  openAbout,
  openOffers,
  openCart,
  openReviews,
  goHome,
  openAdmin,
  cartCount = 0,
}) {
  const [isLoginOpen, setIsLoginOpen]   = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser]                 = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const dropdownRef = useRef();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setShowDropdown(false);
    setShowDashboard(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-content">

          {/* LOGO */}
          <div className="logo-container" onClick={goHome}>
            <h1 className="logo">🍴EATOZ</h1>
            <div className="logo-underline"></div>
          </div>

          {/* NAV */}
          <nav className="nav-menu">
            <span className="nav-link" onClick={openReviews}>Reviews</span>
            <span className="nav-link" onClick={openOffers}>Offers</span>
            <span className="nav-link" onClick={openAbout}>About</span>

            {/* CART */}
            <span className="cart-pill" onClick={openCart}>
              <span className="cart-pill-label">Cart</span>
              {cartCount > 0 ? (
                <span className="cart-chip">{cartCount > 9 ? "9+" : cartCount}</span>
              ) : (
                <span className="cart-dot"></span>
              )}
            </span>

            {/* ADMIN BUTTON — clean black/grey, no red */}
            <button className="admin-nav-btn" onClick={openAdmin}>
              Admin
            </button>

            {/* HAMBURGER */}
            <div className="hamburger-wrapper">
              <button
                className="header-hamburger"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                ☰
              </button>
              <HamburgerSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                user={user}
                logout={logout}
              />
            </div>

            {/* USER */}
            {user ? (
              <div className="user-menu" ref={dropdownRef}>
                <div className="user-name" onClick={() => setShowDropdown(!showDropdown)}>
                  {user.name} ▼
                </div>
                {showDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-item" onClick={() => setShowDashboard(true)}>Profile</div>
                    <div className="dropdown-item logout-item" onClick={logout}>Logout</div>
                  </div>
                )}
              </div>
            ) : (
              <button className="sign-in-btn" onClick={() => setIsLoginOpen(true)}>
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* LOGIN */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* USER DASHBOARD */}
      {showDashboard && user && (
        <UserDashboard
          user={user}
          setUser={setUser}
          logout={logout}
          onClose={() => setShowDashboard(false)}
        />
      )}
    </>
  );
}

export default Header;