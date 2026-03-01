import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Star } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';

export default function Idioms() {
    const { learnedHanjaIds, setCurrentHanjaId, favorites } = useAppStore();
    const navigate = useNavigate();

    // Chunking logic for 4-character idioms
    const groupedData = useMemo(() => {
        const groups = [];
        for (let i = 0; i < chunjamunData.length; i += 4) {
            groups.push(chunjamunData.slice(i, i + 4));
        }
        return groups;
    }, []);

    const handleGroupClick = (group) => {
        // Set special mode and navigate to specialized study if needed, 
        // but for now we'll use a specific idiom study view or parameters
        setCurrentHanjaId(group[0].id);
        navigate('/idiom-study');
    };

    return (
        <div className="px-6 pt-12 pb-6 h-full transition-colors duration-300 bg-slate-50 dark:bg-slate-900 flex flex-col">
            <header className="mb-6 shrink-0">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">천자문 문장</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    4글자씩 묶어서 구절의 의미를 학습합니다.
                </p>
            </header>

            <div className="flex flex-col gap-4 overflow-y-auto pb-4 hide-scrollbar" style={{ scrollbarGutter: 'stable' }}>
                {groupedData.map((group, index) => {
                    const allLearned = group.every(item => learnedHanjaIds.includes(item.id));
                    const anyFavorite = group.some(item => favorites.includes(item.id));

                    return (
                        <div
                            key={index}
                            onClick={() => handleGroupClick(group)}
                            className={`
                                w-full rounded-2xl p-5 cursor-pointer transition-all active:scale-[0.98] relative shadow-sm border
                                flex flex-col gap-4
                                ${allLearned
                                    ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-200 dark:border-primary-800'
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                                }
                            `}
                        >
                            {allLearned && (
                                <div className="absolute top-4 right-4 text-primary-500 dark:text-primary-400">
                                    <CheckCircle2 size={18} fill="currentColor" className="text-white dark:text-slate-900" />
                                </div>
                            )}
                            {anyFavorite && !allLearned && (
                                <div className="absolute top-4 right-4 text-yellow-400">
                                    <Star size={18} fill="currentColor" />
                                </div>
                            )}

                            <div className="flex justify-between items-center pr-6">
                                {group.map(item => (
                                    <span key={item.id} className={`text-4xl font-hanja ${allLearned ? 'text-primary-900 dark:text-primary-200' : 'text-slate-800 dark:text-slate-100'}`}>
                                        {item.hanja}
                                    </span>
                                ))}
                            </div>

                            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-3">
                                {group.map(item => (
                                    <div key={`sound-${item.id}`} className="flex-1 text-center text-[11px] font-medium text-slate-500 dark:text-slate-300">
                                        {item.meaning}<br />{item.sound}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
