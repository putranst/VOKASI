'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

interface KnowledgeGraphProps {
    graph?: {
        nodes?: Array<{ id: string; label?: string; type?: string; importance?: string }>;
        edges?: Array<{ source: string; target: string; relationship?: string }>;
        links?: Array<{ source: string; target: string; relationship?: string }>;
    };
    selectedNodeId?: string | null;
    onNodeSelect?: (node: { id: string; label?: string; type?: string; importance?: string } | null) => void;
    width?: number;
    height?: number;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ graph, selectedNodeId = null, onNodeSelect, width = 600, height = 400 }) => {
    const fgRef = useRef<any>(null);
    const [data, setData] = useState({ nodes: [], links: [] });

    useEffect(() => {
        const fallbackNodes = [
            { id: 'PKC', group: 1, val: 20, label: 'My Knowledge' },
            { id: 'IRIS', group: 2, val: 10, label: 'IRIS Cycle' },
            { id: 'Immersion', group: 2, val: 5, label: 'Immersion' },
            { id: 'Reflection', group: 2, val: 5, label: 'Reflection' },
            { id: 'Iteration', group: 2, val: 5, label: 'Iteration' },
            { id: 'Scale', group: 2, val: 5, label: 'Scale' },
        ];

        const fallbackLinks = [
            { source: 'PKC', target: 'IRIS' },
            { source: 'IRIS', target: 'Immersion' },
            { source: 'IRIS', target: 'Reflection' },
            { source: 'IRIS', target: 'Iteration' },
            { source: 'IRIS', target: 'Scale' },
        ];

        const rawNodes = graph?.nodes?.length ? graph.nodes : fallbackNodes;
        const rawLinks = (graph?.edges?.length ? graph.edges : graph?.links?.length ? graph.links : fallbackLinks) as Array<{ source: string; target: string; relationship?: string }>;

        const normalizedNodes = rawNodes.map((node: any, index: number) => ({
            ...node,
            id: node.id,
            label: node.label || node.id,
            group: node.type === 'skill' ? 3 : node.type === 'topic' ? 2 : 1 + (index % 4),
            val: node.importance === 'high' ? 18 : node.importance === 'medium' ? 11 : 7,
        }));

        const normalizedLinks = rawLinks.map((link: any) => ({
            source: typeof link.source === 'object' ? link.source.id : link.source,
            target: typeof link.target === 'object' ? link.target.id : link.target,
            relationship: link.relationship,
        }));

        setData({ nodes: normalizedNodes as any, links: normalizedLinks as any });
    }, [graph]);

    return (
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
            <ForceGraph2D
                ref={fgRef}
                width={width}
                height={height}
                graphData={data}
                nodeLabel="label"
                nodeColor={(node: any) => {
                    if (selectedNodeId && node.id === selectedNodeId) {
                        return '#111827';
                    }
                    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                    return colors[node.group % colors.length];
                }}
                nodeRelSize={8}
                linkColor={(link: any) => {
                    if (!selectedNodeId) {
                        return '#e5e7eb';
                    }
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    return sourceId === selectedNodeId || targetId === selectedNodeId ? '#8b5cf6' : '#e5e7eb';
                }}
                linkWidth={(link: any) => {
                    if (!selectedNodeId) {
                        return 2;
                    }
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    return sourceId === selectedNodeId || targetId === selectedNodeId ? 3.5 : 1.5;
                }}
                enableNodeDrag={true}
                enableZoomInteraction={true}
                cooldownTicks={100}
                onEngineStop={() => fgRef.current?.zoomToFit(400)}
                onNodeClick={(node: any) => onNodeSelect?.(node || null)}
            />
        </div>
    );
};
