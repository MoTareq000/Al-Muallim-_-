import React from 'react';

interface Command {
    action: string;
    id?: string;
    shape?: 'rect' | 'circle' | 'text';
    label?: string;
    row?: number;
    col?: number;
    from_id?: string;
    to_id?: string;
    color?: string;
}

interface NodePos {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function Whiteboard({ commands }: { commands: Command[] }) {
    if (!commands || commands.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 italic bg-slate-50/50 rounded-2xl border border-slate-200/50 min-h-[400px]">
                <span className="text-4xl mb-4 opacity-50">🖌️</span>
                Whiteboard is clear. Waiting for CodeCoach to draw...
            </div>
        );
    }

    const nodes = new Map<string, Command & NodePos>();
    const edges: Command[] = [];

    commands.forEach(cmd => {
        if (cmd.action === 'add_node' && cmd.id) {
            // Calculate center position based on the 3x3 grid
            const col = Math.max(0, Math.min(2, cmd.col || 0)); // 0, 1, 2
            const row = Math.max(0, Math.min(2, cmd.row || 0)); // 0, 1, 2
            
            const cx = 150 + col * 250; // Col 0=150, Col 1=400, Col 2=650
            const cy = 100 + row * 150; // Row 0=100, Row 1=250, Row 2=400
            const width = 160;
            const height = 60;
            
            nodes.set(cmd.id, {
                ...cmd,
                x: cx - width / 2,
                y: cy - height / 2,
                width,
                height
            });
        } else if (cmd.action === 'add_edge' && cmd.from_id && cmd.to_id) {
            edges.push(cmd);
        }
    });

    return (
        <div className="relative w-full h-full min-h-[500px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
            <svg viewBox="0 0 800 500" className="w-full h-full text-slate-800">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                    </marker>
                </defs>
                
                {/* 1. Render Edges (so they go beneath nodes) */}
                {edges.map((edge, idx) => {
                    const fromNode = nodes.get(edge.from_id!);
                    const toNode = nodes.get(edge.to_id!);
                    if (!fromNode || !toNode) return null;

                    const color = edge.color || '#94a3b8'; // default arrow color
                    
                    // Simple center-to-center lines
                    const startX = fromNode.x + fromNode.width / 2;
                    const startY = fromNode.y + fromNode.height / 2;
                    const endX = toNode.x + toNode.width / 2;
                    const endY = toNode.y + toNode.height / 2;

                    return (
                        <g key={`edge-${idx}`}>
                            <line 
                                x1={startX} y1={startY} x2={endX} y2={endY} 
                                stroke={color} strokeWidth="3" markerEnd="url(#arrowhead)"
                                className="animate-[dash_1.5s_ease-out_forwards]"
                                strokeDasharray="1000" strokeDashoffset="1000"
                            />
                            {edge.label && (
                                <text x={(startX + endX)/2} y={(startY + endY)/2 - 10} 
                                    textAnchor="middle" fill={color} fontSize="13" fontWeight="bold" fontFamily="sans-serif"
                                    className="animate-in fade-in duration-1000 delay-500 fill-mode-both">
                                    {edge.label}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* 2. Render Nodes */}
                {Array.from(nodes.values()).map((node) => {
                    const color = node.color || '#0062b1';
                    const cx = node.x + node.width / 2;
                    const cy = node.y + node.height / 2;

                    return (
                        <g key={node.id} className="animate-in fade-in zoom-in duration-500">
                            {node.shape === 'rect' || !node.shape ? (
                                <rect 
                                    x={node.x} y={node.y} 
                                    width={node.width} height={node.height} 
                                    fill="white" stroke={color} strokeWidth="3" rx="10"
                                    className="shadow-md drop-shadow-sm"
                                />
                            ) : node.shape === 'circle' ? (
                                <circle 
                                    cx={cx} cy={cy} r={node.height / 1.1} 
                                    fill="white" stroke={color} strokeWidth="3"
                                    className="shadow-md drop-shadow-sm"
                                />
                            ) : null}
                            
                            {node.label && (
                                <text x={cx} y={cy} 
                                    textAnchor="middle" dominantBaseline="middle" 
                                    fill="#0f172a" fontSize="14" fontWeight="700" fontFamily="sans-serif">
                                    {node.label}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes dash {
                    to { stroke-dashoffset: 0; }
                }
            `}} />
        </div>
    );
}
