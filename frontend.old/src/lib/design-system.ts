export const tokens = {
    colors: {
        glass: {
            background: 'rgba(255, 255, 255, 0.8)',
            border: 'rgba(255, 255, 255, 0.4)',
            highlight: 'rgba(255, 255, 255, 0.9)',
        },
        shadow: {
            subtle: '0 4px 20px rgba(0, 0, 0, 0.04)',
            medium: '0 8px 30px rgba(0, 0, 0, 0.08)',
            float: '0 12px 40px rgba(108, 89, 72, 0.12)', // T6 Primary hint
        }
    },
    animation: {
        enter: {
            initial: { opacity: 0, scale: 0.98, y: 10 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.98, y: 10 },
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } // NotebookLM spring-like ease
        },
        sparkle: {
            animate: {
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
            },
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    }
}

export const styles = {
    glassPanel: "bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl",
    glassButton: "px-4 py-2 bg-white/50 hover:bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-full transition-all duration-300 font-medium text-sm text-gray-700 shadow-sm hover:shadow-md active:scale-95",
    zenInput: "w-full bg-transparent text-gray-900 placeholder:text-gray-300 outline-none text-lg font-medium",
    premiumCard: "bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500",
};
