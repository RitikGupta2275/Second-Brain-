export function PlayIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
    const sizeClasses = {
        sm: "size-4",
        md: "size-6",
        lg: "size-8"
    };

    return (
        <svg 
            className={`${sizeClasses[size]} ${className}`} 
            fill="currentColor" 
            viewBox="0 0 24 24"
        >
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
        </svg>
    );
}
