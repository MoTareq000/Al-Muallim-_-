import React from 'react';

export function DynamicVisuals({ visual }: { visual: any }) {
    if (!visual) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 italic bg-slate-50/50 rounded-2xl border border-slate-200/50 min-h-[400px]">
                <span className="text-4xl mb-4 opacity-50">✨</span>
                Waiting for CodeCoach visuals...
            </div>
        );
    }

    const { type, title, data } = visual;

    return (
        <div className="w-full h-full flex flex-col animate-in fade-in zoom-in duration-500 overflow-y-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
            <h3 className="text-xl font-bold text-[#0062b1] mb-6 border-b border-blue-100 pb-3 w-full text-center sticky top-0 bg-white z-10">
                {title}
            </h3>

            <div className="flex-1 w-full flex items-center justify-center pb-8">
                {type === 'comparison_table' && (
                    <table className="w-full max-w-2xl text-sm text-left border-collapse border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <thead>
                            <tr className="bg-blue-50/80 text-blue-900 border-b border-slate-200">
                                {Object.keys(data[0]).map(k => <th key={k} className="p-4 font-bold">{k}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row: any, i: number) => (
                                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    {Object.values(row).map((val: any, j: number) => (
                                        <td key={j} className="p-4 text-slate-700">{val as string}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {type === 'code_snippet' && (
                    <div className="w-full max-w-2xl text-left bg-slate-900 p-6 rounded-2xl shadow-xl">
                        <pre className="text-emerald-400 font-mono text-[15px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                            <code>{data.code}</code>
                        </pre>
                        {data.explanation && <p className="text-slate-400 text-sm mt-4 pt-4 border-t border-slate-800/50 italic">{data.explanation}</p>}
                    </div>
                )}
                
                {type === 'bullet_list' && (
                     <ul className="w-full max-w-md space-y-4">
                        {data.items.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
                                <span className="text-[#0062b1] mt-0.5 text-lg">•</span>
                                <span className="font-medium leading-relaxed">{item}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {type === 'concept_card' && (
                    <div className="bg-gradient-to-br from-[#0062b1]/5 to-[#38a1f3]/10 p-8 rounded-3xl border border-[#0062b1]/20 text-center w-full max-w-md shadow-sm transition-transform hover:scale-105">
                        <h4 className="text-2xl font-black text-[#0062b1] mb-4">{data.term}</h4>
                        <p className="text-slate-700 mb-6 leading-relaxed text-lg">{data.definition}</p>
                        {data.analogy && (
                            <div className="bg-white/80 p-4 rounded-2xl text-sm text-[#063966] border border-[#0062b1]/10 shadow-sm text-left">
                                <strong className="block mb-1 text-[#0062b1]">💡 Analogy:</strong> 
                                {data.analogy}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
