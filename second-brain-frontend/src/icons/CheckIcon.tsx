import { iconSizeVariants, type IconProps } from "./index";

export function CheckIcon({ size = "md", className = "" }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className={`${iconSizeVariants[size] || "size-4"} ${className}`}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
    );
}
