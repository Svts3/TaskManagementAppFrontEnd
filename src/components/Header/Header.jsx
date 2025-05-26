import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            try {
                // Decode JWT token to extract user ID
                const payload = JSON.parse(atob(accessToken.split('.')[1]));
                setUserId(payload.id || null);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Error decoding token:", error);
                setIsAuthenticated(false);
                setUserId(null);
            }
        } else {
            setIsAuthenticated(false);
            setUserId(null);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
        setUserId(null);
    };

    return (
        <header>
            <div className="container">
                <div className="logo">
                    <Link to="/">TaskMaster</Link>
                </div>
                <div className="nav-buttons">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/sign-up">
                                <button className="button signup">Sign Up</button>
                            </Link>
                            <Link to="/sign-in">
                                <button className="button signin">Sign In</button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to={`/profile/${userId}`}>
                                <button className="button profile">Profile</button>
                            </Link>
                            <Link to="/workspaces">
                                <button className="button workspaces">My Workspaces</button>
                            </Link>
                            <Link to="/">
                                <button className="button logout" onClick={handleLogout}>
                                    Logout
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}