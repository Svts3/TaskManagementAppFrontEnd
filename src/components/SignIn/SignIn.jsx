import { useState, useTransition, useEffect } from "react";
import axios from "axios";
import "./SignIn.css";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
    const [pending, setTransition] = useTransition();
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [signInIsSuccessful, setSignInIsSuccessful] = useState(false);
    const navigate = useNavigate();

    const handleFormSubmit = async (formData) => {
        setTransition(async () => {
            setError(false);
            try {
                const requestData = {
                    email: formData.get("email"),
                    password: formData.get("password"),
                };
                const response = await axios.post("http://localhost:8080/auth/login", requestData);

                if (response.status === 200) {
                    setSignInIsSuccessful(true);
                    localStorage.setItem("accessToken", response.data.accessToken);
                    localStorage.setItem("refreshToken", response.data.refreshToken);
                    window.dispatchEvent(new Event("authChanged")); // Notify Header
                }
            } catch (e) {
                setSignInIsSuccessful(false);
                setError(true);
                setErrorMessage(e.response?.data?.message || `Something went wrong: ${e.message}`);
            }
        });
    };

    useEffect(() => {
        if (signInIsSuccessful) {
            navigate("/workspaces", { replace: true });
        }
    }, [signInIsSuccessful, navigate]);

    return (
        <div className="sign-in-container">
            <div className="sign-in-form">
                <h2>Sign In to Your Account</h2>
                <form action={handleFormSubmit}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="input-field"
                        placeholder="EMAIL"
                        required
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="input-field"
                        placeholder="PASSWORD"
                        required
                    />
                    <button type="submit" disabled={pending} className="submit-button">
                        {pending ? "Signing In..." : "Sign In"}
                    </button>
                    {error && <p className="error-message">{errorMessage}</p>}
                    <div className="redirect-link">
                        Don't have an account? <a href="/sign-up">Sign up</a>
                    </div>
                </form>
            </div>
        </div>
    );
}