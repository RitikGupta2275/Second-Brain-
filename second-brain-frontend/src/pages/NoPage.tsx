
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { LogoItem } from "../icons/LogoIcon";

export function NoPage() {
    return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-12 text-center flex flex-col items-center animate-in fade-in duration-200">
                {/* 404 Badge */}
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider mb-6">
                    404 Error
                </span>

                {/* Brand / Illustration Icon */}
                <div className="size-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 border border-indigo-100 shadow-xs">
                    <LogoItem size="md" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                    Page not found
                </h1>

                <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                </p>

                <div className="flex flex-wrap gap-3 justify-center w-full">
                    <Link to="/">
                        <Button variant="primary" text="Go to Dashboard" size="lg" />
                    </Link>

                    <Link to="/signin">
                        <Button variant="outline" text="Sign In" size="lg" />
                    </Link>
                </div>
            </div>
        </div>
    );
}