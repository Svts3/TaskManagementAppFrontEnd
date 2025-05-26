import axios from "axios";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./FormSchema";
import Input from "./Input";
import "./SignUp.css";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";

export default function SignUp() {
    const [isPending, setTransition] = useTransition();
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [signInIsSuccessfull, setSignInIsSuccessfull] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(formSchema),
    });

    const handleSubmitForm = async (formData) => {
        setTransition(async () => {
            try {
                const response = await axios.post("http://localhost:8080/auth/register", {
                    firstName: formData["first-name"],
                    lastName: formData["last-name"],
                    email: formData["email"],
                    password: formData["password"],
                });
                if (response.status === 200) {
                    setError(false);
                    setSignInIsSuccessfull(true);
                }
            } catch (e) {
                setError(true);
                setSignInIsSuccessfull(false);
                setErrorMessage(e.response?.data?.message || e.message);
            }
        });
    };

    useEffect(() => {
        if (signInIsSuccessfull) {
            navigate("/sign-in", { replace: true });
        }
    }, [signInIsSuccessfull, navigate]);

    return (
        <div>
            <div className="sign-up-container">
                <div className="sign-up-form">
                    <h2>Create Your Account</h2>
                    <form onSubmit={handleSubmit(handleSubmitForm)} className="form-grid">
                        <div className="form-group">
                            <label htmlFor="first-name">First Name</label>
                            <Input
                                name="first-name"
                                id="first-name"
                                type="text"
                                required={true}
                                register={register}
                                errors={errors}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="last-name">Last Name</label>
                            <Input
                                name="last-name"
                                id="last-name"
                                type="text"
                                required={true}
                                register={register}
                                errors={errors}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <Input
                                name="email"
                                id="email"
                                type="email"
                                required={true}
                                register={register}
                                errors={errors}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <Input
                                name="password"
                                id="password"
                                type="password"
                                required={true}
                                register={register}
                                errors={errors}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <Input
                                name="confirm-password"
                                id="confirm-password"
                                type="password"
                                required={true}
                                register={register}
                                errors={errors}
                            />
                        </div>
                        <div className="form-group full-width">
                            <button disabled={isPending} type="submit">
                                {isPending ? "Signing Up..." : "Sign Up"}
                            </button>
                        </div>
                        {error && (
                            <div className="form-group full-width">
                                <span className="error-message">{errorMessage}</span>
                            </div>
                        )}
                    </form>
                    <div className="redirect-link">
                        Already have an account? <a href="/sign-in">Log in</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
