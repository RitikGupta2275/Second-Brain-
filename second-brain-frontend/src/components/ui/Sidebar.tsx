import { LogoItem } from "../../icons/LogoIcon";
import { TwitterIcon } from "../../icons/TwitterIcons";
import { YoutubeIcon } from "../../icons/YoutubeIcon";
import { BookmarkIcon } from "../../icons/BookmarkIcon";
import { AllIcon } from "../../icons/AllIcon";
import { CrossIcon } from "../../icons/CrossIcon";
import { SidebarItem } from "./SidebarItem";
import { User } from "./User";

export interface SidebarProps {
    selectedType?: "all" | "youtube" | "twitter" | "bookmark";
    setSelectedType: React.Dispatch<
        React.SetStateAction<"all" | "youtube" | "twitter" | "bookmark">
    >;
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({
    selectedType = "all",
    setSelectedType,
    isOpen = false,
    onClose
}: SidebarProps) {
    const handleSelect = (type: "all" | "youtube" | "twitter" | "bookmark") => {
        setSelectedType(type);
        if (onClose) onClose();
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white">
            {/* Brand Logo Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <LogoItem size="sm" />
                    </div>
                    <span className="text-base font-bold tracking-tight text-slate-900">
                        Second Brain
                    </span>
                </div>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                        aria-label="Close sidebar"
                    >
                        <CrossIcon size="sm" />
                    </button>
                )}
            </div>

            {/* Navigation / Filters */}
            <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Filters
                </div>

                <SidebarItem
                    onClick={() => handleSelect("all")}
                    text="All Content"
                    icon={<AllIcon size="md" />}
                    active={selectedType === "all"}
                />

                <SidebarItem
                    onClick={() => handleSelect("youtube")}
                    text="YouTube Videos"
                    icon={<YoutubeIcon size="md" />}
                    active={selectedType === "youtube"}
                />

                <SidebarItem
                    onClick={() => handleSelect("twitter")}
                    text="Twitter / X"
                    icon={<TwitterIcon size="md" />}
                    active={selectedType === "twitter"}
                />

                <SidebarItem
                    onClick={() => handleSelect("bookmark")}
                    text="Web Bookmarks"
                    icon={<BookmarkIcon size="md" />}
                    active={selectedType === "bookmark"}
                />
            </div>

            {/* Bottom User Section */}
            <div className="p-4 border-t border-slate-100">
                <User />
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Static Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-screen border-r border-slate-200/80 fixed left-0 top-0 z-30">
                {sidebarContent}
            </aside>

            {/* Mobile Drawer Backdrop & Slide-over */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        onClick={onClose}
                    />
                    <div className="relative flex flex-col w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
}