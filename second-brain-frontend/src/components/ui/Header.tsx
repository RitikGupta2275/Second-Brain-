import { LogoItem } from "../../icons/LogoIcon";
import { Link } from "react-router-dom";

export interface HeaderProps {
    username: string;
}

export function Header({ username }: HeaderProps) {
    const initial = username ? username.charAt(0).toUpperCase() : "U";

    return (
        <header className="bg-white border-b border-slate-200/80">
            {/* Top Public Navigation Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <LogoItem size="sm" />
                    </div>
                    <span className="text-base font-bold tracking-tight text-slate-900">
                        Second Brain
                    </span>
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Public Shared View
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/signup"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        Create Your Own Brain
                    </Link>
                </div>
            </div>

            {/* Owner Hero Banner */}
            <div className="bg-linear-to-b from-slate-50 to-white border-t border-slate-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center border border-indigo-200/60 shadow-xs shrink-0">
                        {initial}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                {username ? `${username}'s Second Brain` : "Shared Second Brain"}
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            A curated public collection of saved videos, threads, and knowledge
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
