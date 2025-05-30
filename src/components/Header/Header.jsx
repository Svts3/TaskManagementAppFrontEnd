import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Header.css";

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken"));
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "accessToken") {
        setIsAuthenticated(!!e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    const handleAuthEvent = () => setIsAuthenticated(!!localStorage.getItem("accessToken"));
    window.addEventListener("authChanged", handleAuthEvent);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("authChanged", handleAuthEvent);
    };
  }, []);

  const dispatchAuthChanged = () => {
    window.dispatchEvent(new Event("authChanged"));
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    dispatchAuthChanged();
    navigate("/sign-in");
  };

  return (
    <header>
      <div className="container">
        <div className="logo">
          <Link to="/">TaskManager</Link>
        </div>
        <nav className="nav-buttons">
          {!isAuthenticated && (
            <>
              <Link to="/sign-in" className="button signin"><button className="button">Sign In</button></Link>
              <Link to="/sign-up" className="button signup"><button className="button">Sign Up</button></Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link to="/workspaces"><button className="button">Workspaces</button></Link>
              <Link to={`/profile/${getUserId()}`}><button className="button">Profile</button></Link>
              <button className="button" onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function getUserId() {
  const token = localStorage.getItem("accessToken");
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch {
    return "";
  }
}