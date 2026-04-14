'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// IRIS phases
type IRISPhase = 'immerse' | 'realize' | 'iterate' | 'scale';
type Phase = IRISPhase;

// IRIS phase-specific Socratic prompts for AI tutor
export const IRIS_PROMPTS: Record<IRISPhase, { focus: string; questions: string[] }> = {
    immerse: {
        focus: 'Understanding the authentic problem context through observation and empathy',
        questions: [
            'What problem have you observed in your institutional anchor?',
            'Who are the stakeholders affected by this problem?',
            'What did you notice during your immersion that surprised you?',
            'What SFIA competencies do you think you will need?',
        ]
    },
    realize: {
        focus: 'Analyzing knowledge gaps and mapping against SFIA competency descriptors',
        questions: [
            'What do you already know (Q - questionable knowledge) about this problem?',
            'What do you need to learn (P - programmed knowledge)?',
            'How does this map to SFIA Level 2, 3, or 4 descriptors?',
            'What questions emerged from your reflection?',
        ]
    },
    iterate: {
        focus: 'Running Build-Measure-Learn cycles to develop solutions',
        questions: [
            'What hypothesis are you testing in this iteration?',
            'What did you build and how did you measure its effectiveness?',
            'What did you learn that will inform your next iteration?',
            'How many BML cycles have you completed?',
        ]
    },
    scale: {
        focus: 'Deploying to institution and demonstrating competency for certification',
        questions: [
            'How did you hand off the solution to the institution?',
            'What training did you provide to stakeholders?',
            'What measurable impact has your solution achieved?',
            'What evidence supports your SFIA competency level?',
        ]
    }
};

interface SocraticContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isEnabled: boolean;
    setIsEnabled: (enabled: boolean) => void;
    projectId: string;
    setProjectId: (id: string) => void;
    phase: IRISPhase;
    setPhase: (phase: Phase) => void;
    context: any;
    setContext: (ctx: any) => void;
    // New: Get phase-specific prompts
    phasePrompts: { focus: string; questions: string[] };
}

const SocraticContext = createContext<SocraticContextType | undefined>(undefined);

export function SocraticProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [projectId, setProjectId] = useState('');
    const [phase, setPhaseInternal] = useState<IRISPhase>('immerse');
    const [context, setContext] = useState<any>({});

    // Set phase directly
    const setPhase = (p: Phase) => {
        setPhaseInternal(p);
    };

    const phasePrompts = IRIS_PROMPTS[phase];

    return (
        <SocraticContext.Provider value={{
            isOpen,
            setIsOpen,
            isEnabled,
            setIsEnabled,
            projectId,
            setProjectId,
            phase,
            setPhase,
            context,
            setContext,
            phasePrompts
        }}>
            {children}
        </SocraticContext.Provider>
    );
}

export function useSocratic() {
    const context = useContext(SocraticContext);
    if (context === undefined) {
        throw new Error('useSocratic must be used within a SocraticProvider');
    }
    return context;
}

// Hook for IRIS/CDIO pages to register themselves with the Socratic system
export function useSocraticPage(
    projectId: string,
    phase: Phase,
    phaseContext: any
) {
    const socratic = useSocratic();

    React.useEffect(() => {
        socratic.setIsEnabled(true);
        socratic.setProjectId(projectId);
        socratic.setPhase(phase);
        socratic.setContext(phaseContext);

        return () => {
            socratic.setIsEnabled(false);
            socratic.setIsOpen(false);
        };
    }, [projectId, phase]);

    // Update context when it changes
    React.useEffect(() => {
        socratic.setContext(phaseContext);
    }, [JSON.stringify(phaseContext)]);

    return {
        isOpen: socratic.isOpen,
        toggle: () => socratic.setIsOpen(!socratic.isOpen),
        close: () => socratic.setIsOpen(false),
        phasePrompts: socratic.phasePrompts
    };
}
