
import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    startElement?: React.ReactNode;
    endElement?: React.ReactNode;
    ref?: any;
}

export const Input = ({
    placeholder,
    type = "text",
    label,
    error,
    helperText,
    fullWidth = true,
    startElement,
    endElement,
    className = "",
    ref,
    disabled,
    ...props
}: InputProps) => {
    return (
        <div className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""}`}>
            {label && (
                <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                    {label}
                </label>
            )}

            <div className="relative flex items-center">
                {startElement && (
                    <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
                        {startElement}
                    </div>
                )}

                <input
                    ref={ref}
                    type={type}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full py-2.5 text-sm text-slate-900 bg-white
                        border rounded-lg transition-all duration-150 ease-in-out
                        placeholder:text-slate-400
                        disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
                        ${startElement ? "pl-10" : "px-3.5"}
                        ${endElement ? "pr-10" : "px-3.5"}
                        ${
                            error
                                ? "border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15"
                                : "border-slate-300 hover:border-slate-400 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15"
                        }
                        focus:outline-none
                        ${className}
                    `}
                    {...props}
                />

                {endElement && (
                    <div className="absolute right-3 flex items-center text-slate-400">
                        {endElement}
                    </div>
                )}
            </div>

            {error ? (
                <p className="text-xs text-rose-600 font-medium">{error}</p>
            ) : helperText ? (
                <p className="text-xs text-slate-500">{helperText}</p>
            ) : null}
        </div>
    );
};
