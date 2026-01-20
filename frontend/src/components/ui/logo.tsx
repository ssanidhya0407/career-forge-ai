export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
        </defs>
        <path
            d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z"
            stroke="url(#logoGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M50 25 L50 75 M30 40 L70 60 M70 40 L30 60"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.9"
        />
    </svg>
);
