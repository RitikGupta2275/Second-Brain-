import { useEffect } from "react";

interface DeleteModalProps {
    open: boolean;
    title: string;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeleteModal({ open, title, loading = false, onClose, onConfirm }: DeleteModalProps) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
                onClick={onClose}
            />

            {/* Simple Compact Card */}
            <div
                className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-5 z-10 animate-in zoom-in-95 fade-in duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                <h4 className="text-base font-bold text-slate-900 mb-1">
                    Are you sure you want to delete?
                </h4>
                {title && (
                    <p className="text-xs text-slate-500 truncate mb-4">
                        "{title}"
                    </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}
