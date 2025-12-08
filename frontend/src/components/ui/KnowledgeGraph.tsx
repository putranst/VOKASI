'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

interface KnowledgeGraphProps {
    width?: number;
    height?: number;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ width = 600, height = 400 }) => {
    const fgRef = useRef<any>(null);
    const [data, setData] = useState({ nodes: [], links: [] });

    useEffect(() => {
        // Sample Data for Demo
        const initialNodes = [
            { id: 'PKC', group: 1, val: 20, label: 'My Knowledge' },
            { id: 'CDIO', group: 2, val: 10, label: 'CDIO Framework' },
            { id: 'Conceive', group: 2, val: 5, label: 'Conceive' },
            { id: 'Design', group: 2, val: 5, label: 'Design' },
            { id: 'Implement', group: 2, val: 5, label: 'Implement' },
            { id: 'Operate', group: 2, val: 5, label: 'Operate' },
            { id: 'React', group: 3, val: 8, label: 'React.js' },
            { id: 'NextJS', group: 3, val: 8, label: 'Next.js' },
            { id: 'TypeScript', group: 3, val: 8, label: 'TypeScript' },
            { id: 'Supabase', group: 4, val: 8, label: 'Supabase' },
            { id: 'PostgreSQL', group: 4, val: 5, label: 'PostgreSQL' },
        ];

        const initialLinks = [
            { source: 'PKC', target: 'CDIO' },
            { source: 'CDIO', target: 'Conceive' },
            { source: 'CDIO', target: 'Design' },
            { source: 'CDIO', target: 'Implement' },
            { source: 'CDIO', target: 'Operate' },
            { source: 'PKC', target: 'React' },
            { source: 'React', target: 'NextJS' },
            { source: 'PKC', target: 'TypeScript' },
            { source: 'PKC', target: 'Supabase' },
            { source: 'Supabase', target: 'PostgreSQL' },
        ];

        setData({ nodes: initialNodes as any, links: initialLinks as any });
    }, []);

    return (
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
            <ForceGraph2D
                ref={fgRef}
                width={width}
                height={height}
                graphData={data}
                nodeLabel="label"
                nodeColor={(node: any) => {
                    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                    return colors[node.group % colors.length];
                }}
                nodeRelSize={6}
                linkColor={() => '#e5e7eb'}
                linkWidth={2}
                enableNodeDrag={true}
                enableZoomInteraction={true}
                cooldownTicks={100}
                onEngineStop={() => fgRef.current?.zoomToFit(400)}
            />
        </div>
    );
};
