import { useEffect } from "react";
import { CheckIcon } from "../../icons/CheckIcon";
import { CrossIcon } from "../../icons/CrossIcon";

export interface ToastProps {
    show: boolean;
    message: string;
    type?: "success" | "error" | "info";
    onClose: () => void;
}

export function Toast({ show, message, type = "success", onClose }: ToastProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    const bgClasses = {
        success: "bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-950/40",
        error: "bg-rose-900/95 text-white border-rose-700 shadow-rose-950/40",
        info: "bg-slate-900/95 text-white border-slate-700 shadow-slate-950/40"
    };

    const iconBg = {
        success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        error: "bg-rose-500/20 text-rose-400 border-rose-500/30",
        info: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md max-w-md ${bgClasses[type]}`}>
                <div className={`size-7 rounded-xl flex items-center justify-center border shrink-0 ${iconBg[type]}`}>
                    {type === "success" && <CheckIcon size="sm" />}
                    {type === "error" && <span className="font-bold text-xs">!</span>}
                    {type === "info" && <span className="font-bold text-xs">🔖</span>}
                </div>

                <p className="text-xs sm:text-sm font-medium pr-2">
                    {message}
                </p>

                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-auto cursor-pointer"
                >
                    <CrossIcon size="sm" />
                </button>
            </div>
        </div>
    );
}
