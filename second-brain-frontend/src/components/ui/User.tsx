import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { BACKEND_URL } from "../../Config";
import axios from "axios";
import { LogoutIcon } from "../../icons/LogoutIcon";

export function User() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function getUser() {
            try {
                const response = await axios.get(`${BACKEND_URL}/api/v1/me`, {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                });
                setUsername(response.data.username);
            } catch (e) {
                setError("Unable to load user");
            } finally {
                setLoading(false);
            }
        }
        getUser();
    }, []);

    // Handle click outside to close popover
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    function logout() {
        localStorage.removeItem("token");
        navigate("/signin");
    }

    const initial = username ? username.charAt(0).toUpperCase() : "U";

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* User Popover Dialog */}
            {open && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-lg shadow-slate-200/50 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl mb-3 border border-slate-100">
                        <div className="size-9 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-sm shadow-xs shrink-0">
                            {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                                {loading ? "Loading..." : error ? "User" : username}
                            </p>
                            <p className="text-xs text-slate-400">Personal Account</p>
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-rose-500 mb-2 px-1 text-center font-medium">
                            {error}
                        </p>
                    )}

                    <Button
                        onClick={logout}
                        text="Log out"
                        variant="danger"
                        size="sm"
                        fullWidth
                        startIcon={<LogoutIcon size="sm" />}
                    />
                </div>
            )}

            {/* Profile Trigger Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`
                    w-full flex items-center gap-3 p-2 rounded-xl text-left
                    transition-all duration-150 cursor-pointer select-none
                    border
                    ${
                        open
                            ? "bg-slate-100/90 border-slate-300"
                            : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/70"
                    }
                `}
                aria-expanded={open}
                aria-haspopup="true"
            >
                <div className="size-9 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-sm shrink-0 border border-indigo-200/60">
                    {initial}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                        {loading ? "Loading..." : error ? "User" : username}
                    </p>
                    <p className="text-xs text-slate-500">Free Plan</p>
                </div>

                <svg
                    className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        open ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>
        </div>
    );
}