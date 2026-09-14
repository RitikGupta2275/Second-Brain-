import axios from "axios";
import { CopyIcon } from "../../icons/CopyIcon";
import { CrossIcon } from "../../icons/CrossIcon";
import { CheckIcon } from "../../icons/CheckIcon";
import { ShareIcon } from "../../icons/ShareIcon";
import { Button } from "./Button";
import { BACKEND_URL } from "../../Config";
import { useState, useEffect } from "react";

export interface inputProps {
    open: boolean;
    onClose: () => void;
    count: number;
}

export function ShareBrainModel({ open, onClose, count }: inputProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState("");

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

    // Reset copied state when dialog opens
    useEffect(() => {
        if (open) {
            setCopied(false);
            setError("");
        }
    }, [open]);

    async function generateLink() {
        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/v1/brain/share`,
                {
                    share: true
                },
                {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                }
            );

            const hash = response.data.hash;
            const shareLink = `${window.location.origin}/share/${hash}`;
            await navigator.clipboard.writeText(shareLink);
            setGeneratedUrl(shareLink);
            setCopied(true);
        } catch (e) {
            setError("Failed to generate share link. Please try again.");
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
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 z-10 animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-xs shrink-0">
                            <ShareIcon size="md" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                Share Your Second Brain
                            </h2>
                            <p className="text-xs text-slate-500">
                                Make your collection accessible to anyone with the link
                            </p>
                        </div>
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

                {/* Body Content */}
                <div className="mt-5 space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Share your entire collection of saved YouTube videos and Twitter/X threads. Anyone with your public link can view your content in read-only mode.
                    </p>

                    {/* Stats Pill */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                        <span className="text-slate-500">Content to be shared:</span>
                        <span className="font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                            {count} {count === 1 ? "item" : "items"}
                        </span>
                    </div>

                    {/* Copied Success Box */}
                    {copied && generatedUrl && (
                        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 space-y-2 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                                <CheckIcon size="sm" className="text-emerald-600" />
                                <span>Link copied to your clipboard!</span>
                            </div>
                            <p className="text-[11px] text-emerald-700 break-all font-mono bg-white/70 p-2 rounded border border-emerald-100">
                                {generatedUrl}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs font-medium flex items-center gap-2">
                            <svg className="size-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2">
                        <Button
                            onClick={generateLink}
                            variant={copied ? "secondary" : "primary"}
                            text={copied ? "Copy Link Again" : "Generate & Copy Link"}
                            startIcon={copied ? <CheckIcon size="md" /> : <CopyIcon size="md" />}
                            fullWidth
                            size="lg"
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}