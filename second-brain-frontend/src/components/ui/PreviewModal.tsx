import { useEffect } from "react";
import { CrossIcon } from "../../icons/CrossIcon";
import { ExternalLinkIcon } from "../../icons/ExternalLinkIcon";

interface PreviewModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    link: string;
    embedUrl: string | null;
    type: "youtube" | "twitter";
}

export function PreviewModal({ open, onClose, title, link, embedUrl, type }: PreviewModalProps) {
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

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop Blur Overlay */}
            <div
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div
                className="relative w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 fade-in duration-200 text-white flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90">
                    <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">
                            {type === "youtube" ? "YouTube Video Preview" : "Twitter / X Post"}
                        </span>
                        <h2 className="text-lg font-bold text-white truncate mt-0.5" title={title}>
                            {title}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Open original page"
                        >
                            <ExternalLinkIcon size="md" />
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            <CrossIcon size="md" />
                        </button>
                    </div>
                </div>

                {/* Video / Embed Content */}
                <div className="p-4 sm:p-6 flex items-center justify-center bg-black min-h-[350px]">
                    {type === "youtube" && embedUrl ? (
                        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
                            <iframe
                                className="w-full h-full border-0"
                                src={`${embedUrl}?autoplay=1`}
                                title={title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div className="p-8 text-center max-w-md">
                            <p className="text-slate-400 text-sm mb-4">
                                Preview iframe unavailable. You can visit the link directly.
                            </p>
                            <a
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-600/30"
                            >
                                Open Original Link <ExternalLinkIcon size="sm" />
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate max-w-lg">{link}</span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
