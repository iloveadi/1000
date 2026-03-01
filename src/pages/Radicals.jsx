import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Filter, BookOpen } from 'lucide-react';
import chunjamunData from '../data/chunjamun.json';
import useAppStore from '../store/useAppStore';

// Common radicals found in Chunjamun (Sample mapping)
const RADICAL_GROUPS = [
    { radical: '人', name: '사람 인', ids: [15, 30, 45, 60] }, // Sample IDs, would need full mapping
    { radical: '水', name: '물 수', ids: [7, 69, 100, 150] },
    { radical: '木', name: '나무 목', ids: [21, 82, 94, 180] },
    { radical: '日', name: '날 일', ids: [9, 52, 112, 190] },
    { radical: '土', name: '흙 토', ids: [2, 10, 46, 120] },
    { radical: '口', name: '입 구', ids: [5, 6, 25, 178] },
];

export default function Radicals() {
    const navigate = useNavigate();
    const { setCurrentHanjaId } = useAppStore();
    const [selectedRadical, setSelectedRadical] = useState(null);

    const filteredHanja = selectedRadical
        ? chunjamunData.filter(h => selectedRadical.ids.includes(h.id))
        : [];

    const handleSelectHanja = (id) => {
        setCurrentHanjaId(id);
        navigate('/study');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 pt-12 pb-24">
            <header className="flex items-center mb-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 dark:text-slate-400">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="flex-1 text-center text-xl font-bold text-slate-800 dark:text-slate-100 pr-8">부수별 보기</h1>
            </header>

            {/* Radical Selection Grid */}
            <div className="grid grid-cols-3 gap-3 mb-10">
                {RADICAL_GROUPS.map(group => (
                    <motion.button
                        key={group.radical}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedRadical(group)}
                        className={`
                            p-4 rounded-2xl border-2 flex flex-col items-center transition-all shadow-sm
                            ${selectedRadical?.radical === group.radical
                                ? 'bg-primary-500 border-primary-500 text-white'
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200'}
                        `}
                    >
                        <span className="text-3xl font-hanja mb-1">{group.radical}</span>
                        <span className="text-[10px] font-bold opacity-70">{group.name}</span>
                    </motion.button>
                ))}
            </div>

            {selectedRadical ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {selectedRadical.radical} 부수에 속한 한자 ({filteredHanja.length})
                        </h2>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        {filteredHanja.map(hanja => (
                            <motion.button
                                key={hanja.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSelectHanja(hanja.id)}
                                className="aspect-square bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center shadow-sm"
                            >
                                <span className="text-xl font-hanja font-bold text-slate-800 dark:text-white">{hanja.hanja}</span>
                                <span className="text-[10px] text-slate-400 mt-1">{hanja.meaning}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <Filter size={40} className="mb-4 opacity-20" />
                    <p>학습할 부수를 위에서 선택해 보세요 💡</p>
                </div>
            )}
        </div>
    );
}
