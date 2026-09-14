import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useState, useRef } from "react";
import { BACKEND_URL } from "../Config";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { LogoItem } from "../icons/LogoIcon";
import { EyeIcon } from "../icons/EyeIcon";
import { EyeOffIcon } from "../icons/EyeOffIcon";
import { Alert } from "../components/ui/Alert";

export function Signup() {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    async function signup(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const username = usernameRef.current?.value;
            const password = passwordRef.current?.value;

            await axios.post(BACKEND_URL + "/api/v1/signup", {
                username,
                password
            });

            alert("You have signed up!");
            navigate("/signin");
        } catch (e) {
            setError("Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
                {/* Brand Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="size-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100 shadow-sm">
                        <LogoItem size="md" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Create an account
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5">
                        Start organizing your saved videos and tweets
                    </p>
                </div>

                {/* Signup Form */}
                <form onSubmit={signup} className="space-y-4">
                    <Input
                        ref={usernameRef}
                        label="Username"
                        placeholder="Choose a username"
                        autoComplete="username"
                        required
                    />

                    <Input
                        ref={passwordRef}
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        required
                        endElement={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="cursor-pointer hover:text-slate-600 focus:outline-none transition-colors p-1"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOffIcon size="sm" /> : <EyeIcon size="sm" />}
                            </button>
                        }
                    />

                    <Alert message={error} />

                    <div className="pt-2">
                        <Button
                            type="submit"
                            loading={loading}
                            variant="primary"
                            text="Create Account"
                            fullWidth
                            size="lg"
                        />
                    </div>
                </form>

                {/* Footer Link to Signin */}
                <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-5">
                    Already have an account?{" "}
                    <Link
                        to="/signin"
                        className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}

