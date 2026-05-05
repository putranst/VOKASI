import React from 'react';
import { Sparkles, Brain, Search, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThinkingIndicatorProps {
    status: 'idle' | 'analyzing' | 'generating' | 'refining';
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ status }) => {
    if (status === 'idle') return null;

    const steps = {
        analyzing: { icon: Search, text: 'Analyzing your problem statement...', color: 'text-blue-500' },
        generating: { icon: Brain, text: 'Brainstorming solutions...', color: 'text-purple-500' },
        refining: { icon: PenTool, text: 'Refining suggestions...', color: 'text-pink-500' }
    };

    const currentStep = steps[status];
    const Icon = currentStep.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl shadow-lg"
        >
            <div className={`p-2 rounded-lg bg-gray-50 ${currentStep.color}`}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <Icon size={20} />
                </motion.div>
            </div>
            <div>
                <p className="text-sm font-bold text-gray-900">{currentStep.text}</p>
                <div className="flex gap-1 mt-1">
                    <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className={`w-1.5 h-1.5 rounded-full ${currentStep.color.replace('text-', 'bg-')}`}
                    />
                    <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className={`w-1.5 h-1.5 rounded-full ${currentStep.color.replace('text-', 'bg-')}`}
                    />
                    <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className={`w-1.5 h-1.5 rounded-full ${currentStep.color.replace('text-', 'bg-')}`}
                    />
                </div>
            </div>
        </motion.div>
    );
};
