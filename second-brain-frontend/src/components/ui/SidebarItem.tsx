import type { ReactElement } from "react";

export interface SidebarItemProps {
    onClick?: () => void;
    text: string;
    icon: ReactElement;
    active?: boolean;
}

export function SidebarItem({ onClick, text, icon, active = false }: SidebarItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm
                transition-all duration-150 cursor-pointer select-none text-left
                ${
                    active
                        ? "bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100/80 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                }
            `}
        >
            <span
                className={`shrink-0 flex items-center justify-center transition-colors ${
                    active ? "text-indigo-600" : "text-slate-400"
                }`}
            >
                {icon}
            </span>
            <span className="truncate">{text}</span>
        </button>
    );
}