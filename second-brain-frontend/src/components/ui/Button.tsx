import type { ReactElement } from "react";
import { Spinner } from "../../icons/Spinner";

type Variants = "primary" | "secondary" | "danger" | "outline";
type Sizes = "sm" | "md" | "lg";

export interface ButtonProps {
    variant: Variants;
    text?: string;
    children?: React.ReactNode;
    startIcon?: ReactElement;
    endIcon?: ReactElement;
    onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    fullWidth?: boolean;
    loading?: boolean;
    size?: Sizes;
    disabled?: boolean;
    className?: string;
    type?: "button" | "submit" | "reset";
}

const variantStyles: Record<Variants, string> = {
    primary: "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-200/50 border border-transparent",
    secondary: "bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200/80 text-indigo-700 border border-indigo-100",
    danger: "bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200/60",
    outline: "bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm"
};

const sizeStyles: Record<Sizes, string> = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5 rounded-lg font-medium",
    md: "text-sm px-4 py-2 gap-2 rounded-lg font-medium",
    lg: "text-base px-5 py-2.5 gap-2.5 rounded-xl font-medium"
};

export const Button = ({
    variant = "primary",
    text,
    children,
    startIcon,
    endIcon,
    onClick,
    fullWidth = false,
    loading = false,
    size = "md",
    disabled = false,
    className = "",
    type = "button"
}: ButtonProps) => {
    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`
                inline-flex items-center justify-center
                transition-all duration-150 ease-in-out
                cursor-pointer select-none
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1
                disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
                ${variantStyles[variant] || variantStyles.primary}
                ${sizeStyles[size] || sizeStyles.md}
                ${fullWidth ? "w-full" : ""}
                ${className}
            `}
        >
            {loading ? (
                <Spinner className="-ml-0.5" size={size === "lg" ? "lg" : "md"} />
            ) : startIcon ? (
                <span className="shrink-0 flex items-center justify-center">{startIcon}</span>
            ) : null}

            {text ? <span>{text}</span> : children}

            {!loading && endIcon && (
                <span className="shrink-0 flex items-center justify-center">{endIcon}</span>
            )}
        </button>
    );
};

