import { useState, useEffect } from "react";
import { CrossIcon } from "../../icons/CrossIcon";
import { YoutubeIcon } from "../../icons/YoutubeIcon";
import { TwitterIcon } from "../../icons/TwitterIcons";
import { BookmarkIcon } from "../../icons/BookmarkIcon";
import { Button } from "./Button";
import { BACKEND_URL } from "../../Config";
import axios from "axios";

export interface inputProps {
    open: boolean;
    onClose: () => void;
}

export function CreateContentModel({ open, onClose }: inputProps) {
    const [loading, setLoading] = useState(false);
    const [fetchingTitle, setFetchingTitle] = useState(false);
    const [error, setError] = useState("");
    const [type, setType] = useState<"youtube" | "twitter" | "bookmark">("youtube");

    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");

    // Reset fields when modal opens/closes
    useEffect(() => {
        if (open) {
            setTitle("");
            setLink("");
            setError("");
            setLoading(false);
            setFetchingTitle(false);
        }
    }, [open]);

    // Close on Escape key press
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && open) {
                onClose();
            }
        }
        if (open) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    // Auto-detect type & fetch title from URL
    async function handleAutoFetchTitle(urlToFetch: string) {
        if (!urlToFetch || urlToFetch.trim().length < 8) return;

        let detectedType: "youtube" | "twitter" | "bookmark" = "bookmark";
        if (urlToFetch.includes("youtube.com") || urlToFetch.includes("youtu.be")) {
            detectedType = "youtube";
            setType("youtube");
        } else if (urlToFetch.includes("twitter.com") || urlToFetch.includes("x.com")) {
            detectedType = "twitter";
            setType("twitter");
        } else {
            detectedType = "bookmark";
            setType("bookmark");
        }

        setFetchingTitle(true);

        try {
            // For YouTube, client-side oEmbed works with CORS
            if (detectedType === "youtube") {
                try {
                    const res = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(urlToFetch)}&format=json`);
                    if (res.data && res.data.title) {
                        setTitle(res.data.title);
                        setFetchingTitle(false);
                        return;
                    }
                } catch {
                    // Fallback to backend
                }
            }

            // For Twitter / X, client-side fxtwitter works directly with CORS
            if (detectedType === "twitter") {
                try {
                    const match = urlToFetch.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/);
                    if (match) {
                        const username = match[1];
                        const statusId = match[2];
                        const res = await axios.get(`https://api.fxtwitter.com/${username}/status/${statusId}`);
                        if (res.data && res.data.tweet && res.data.tweet.text) {
                            setTitle(res.data.tweet.text);
                            setFetchingTitle(false);
                            return;
                        }
                    }
                } catch {
                    // Fallback to backend
                }
            }

            // For all other URLs or fallback, call our backend endpoint
            const response = await axios.get(`${BACKEND_URL}/api/v1/fetch-title?url=${encodeURIComponent(urlToFetch)}`, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            if (response.data && response.data.title) {
                setTitle(response.data.title);
            }
        } catch {
            // Silently fail if title cannot be auto-fetched
        } finally {
            setFetchingTitle(false);
        }
    }

    async function addContent(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await axios.post(
                BACKEND_URL + "/api/v1/content",
                {
                    link,
                    title,
                    type
                },
                {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                }
            );

            onClose();
        } catch {
            setError("Failed to add content. Please check the URL and try again.");
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop Overlay */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Dialog Card */}
            <div
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 z-10 animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                            Add New Content / Bookmark
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Save web links, YouTube videos, or Twitter threads to your Second Brain
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <CrossIcon size="sm" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={addContent} className="space-y-4 mt-5">
                    {/* Content Type Segmented Selector */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                            Content Type
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200/60">
                            <button
                                type="button"
                                onClick={() => setType("youtube")}
                                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                                    type === "youtube"
                                        ? "bg-white text-rose-700 shadow-xs border border-rose-100/80 font-semibold"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <YoutubeIcon size="sm" />
                                YouTube
                            </button>

                            <button
                                type="button"
                                onClick={() => setType("twitter")}
                                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                                    type === "twitter"
                                        ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <TwitterIcon size="sm" />
                                Twitter / X
                            </button>

                            <button
                                type="button"
                                onClick={() => setType("bookmark")}
                                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer select-none ${
                                    type === "bookmark"
                                        ? "bg-white text-indigo-700 shadow-xs border border-indigo-100/80 font-semibold"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                <BookmarkIcon size="sm" />
                                Bookmark
                            </button>
                        </div>
                    </div>

                    {/* URL Link Input with Auto Fetch Button */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                                Source Link / URL
                            </label>
                            {link.length > 8 && (
                                <button
                                    type="button"
                                    onClick={() => handleAutoFetchTitle(link)}
                                    disabled={fetchingTitle}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 cursor-pointer flex items-center gap-1"
                                >
                                    {fetchingTitle ? "Fetching..." : "✨ Auto Fetch Title"}
                                </button>
                            )}
                        </div>
                        <input
                            type="url"
                            value={link}
                            onChange={(e) => {
                                setLink(e.target.value);
                            }}
                            onBlur={() => {
                                if (link && !title) {
                                    handleAutoFetchTitle(link);
                                }
                            }}
                            placeholder={
                                type === "youtube"
                                    ? "https://www.youtube.com/watch?v=..."
                                    : type === "twitter"
                                    ? "https://x.com/username/status/..."
                                    : "https://example.com/article..."
                            }
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            required
                        />
                    </div>

                    {/* Title Input with Auto Fetching Status Indicator */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                                Title
                            </label>
                            {fetchingTitle && (
                                <span className="text-xs font-medium text-indigo-600 animate-pulse flex items-center gap-1">
                                    <svg className="size-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Fetching title automatically...
                                </span>
                            )}
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Next.js 15 Full Tutorial or Clean Architecture Guide"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs font-medium flex items-center gap-2">
                            <svg className="size-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="pt-3 flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            text="Cancel"
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            text="Add Content"
                            loading={loading}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
