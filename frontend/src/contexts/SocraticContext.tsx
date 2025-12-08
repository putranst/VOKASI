'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SocraticContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isEnabled: boolean;
    setIsEnabled: (enabled: boolean) => void;
    projectId: string;
    setProjectId: (id: string) => void;
    phase: 'conceive' | 'design' | 'implement' | 'operate';
    setPhase: (phase: 'conceive' | 'design' | 'implement' | 'operate') => void;
    context: any;
    setContext: (ctx: any) => void;
}

const SocraticContext = createContext<SocraticContextType | undefined>(undefined);

export function SocraticProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [projectId, setProjectId] = useState('');
    const [phase, setPhase] = useState<'conceive' | 'design' | 'implement' | 'operate'>('conceive');
    const [context, setContext] = useState<any>({});

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
            setContext
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

// Hook for CDIO pages to register themselves with the Socratic system
export function useSocraticPage(
    projectId: string,
    phase: 'conceive' | 'design' | 'implement' | 'operate',
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
        close: () => socratic.setIsOpen(false)
    };
}
