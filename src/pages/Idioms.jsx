import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';

export default function Idioms() {
    const { learnedHanjaIds, setCurrentHanjaId } = useAppStore();
    const navigate = useNavigate();
    const [mode, setMode] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const listRef = useRef(null);
    const itemRefs = useRef({});

    // Performance optimization: prevent heavy render during page transition
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        // Render only viewport items (e.g. 15 groups) during the 250ms slide transition
        const timer = setTimeout(() => setIsReady(true), 300);
        return () => clearTimeout(timer);
    }, []);

    // Generate index marks (every 10 groups, plus the last one)
    const indexMarks = useMemo(() => {
        const marks = [];
        const totalGroups = Math.ceil(chunjamunData.length / 4);
        for (let i = 1; i <= totalGroups; i += 25) {
            marks.push(i);
        }
        if (marks[marks.length - 1] !== totalGroups) {
            marks.push(totalGroups);
        }
        return marks;
    }, []);

    // Chunking logic for 4-character idioms
    const groupedData = useMemo(() => {
        const groups = [];
        for (let i = 0; i < chunjamunData.length; i += 4) {
            groups.push(chunjamunData.slice(i, i + 4));
        }

        if (mode === 'all' && !searchTerm) return groups;

        return groups.filter(group => {
            // Search Match (Match if any hanja, meaning, or sound in the group matches)
            const matchesSearch = searchTerm === '' || group.some(item =>
                item.hanja.includes(searchTerm) ||
                item.meaning.includes(searchTerm) ||
                item.sound.includes(searchTerm)
            );

            if (!matchesSearch) return false;

            // Mode Match
            const allLearned = group.every(item => learnedHanjaIds.includes(item.id));
            if (mode === 'learned') return allLearned;
            if (mode === 'unlearned') return !allLearned;

            return true;
        });
    }, [mode, learnedHanjaIds, searchTerm]);

    const handleGroupClick = (group) => {
        // Set special mode and navigate to specialized study if needed, 
        // but for now we'll use a specific idiom study view or parameters
        setCurrentHanjaId(group[0].id);
        navigate('/idiom-study');
    };

    const scrollToGroup = (indexMark) => {
        // indexMark is 1-based group index (e.g., 1, 11, 21...)
        // We find the DOM node mapped to this group index
        const node = itemRefs.current[indexMark];
        if (node && listRef.current) {
            // Scroll the element into view inside the list container with some top padding
            const containerTop = listRef.current.getBoundingClientRect().top;
            const elementTop = node.getBoundingClientRect().top;
            const currentScroll = listRef.current.scrollTop;

            listRef.current.scrollTo({
                top: currentScroll + (elementTop - containerTop) - 20,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="pt-12 pb-6 h-full transition-colors duration-300 bg-slate-50 dark:bg-slate-900 flex flex-col">
            <header className="px-6 mb-4 shrink-0">
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">천자문 문장</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        4글자씩 묶어서 구절의 의미를 학습합니다.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="한자, 뜻, 음 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                    />
                </div>
                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {[
                        { id: 'all', label: '전체보기' },
                        { id: 'learned', label: '학습 완료' },
                        { id: 'unlearned', label: '미학습' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setMode(tab.id)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border
                                ${mode === tab.id
                                    ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent shadow-sm'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <div ref={listRef} className="flex-1 overflow-y-auto pr-10 pl-6 pb-24 hide-scrollbar flex flex-col gap-4 relative" style={{ scrollbarGutter: 'stable' }}>
                {/* Vertical Quick Index Navigation */}
                {mode === 'all' && !searchTerm && (
                    <div className="fixed right-1.5 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center py-2 px-0.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-lg border border-slate-100 dark:border-slate-700">
                        {indexMarks.map(mark => (
                            <button
                                key={mark}
                                onClick={() => scrollToGroup(mark)}
                                className="w-6 h-6 my-0.5 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-500 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors active:scale-90"
                            >
                                {mark}
                            </button>
                        ))}
                    </div>
                )}

                {groupedData.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                        해당하는 문장이 없습니다.
                    </div>
                ) : (isReady ? groupedData : groupedData.slice(0, 15)).map((group, index) => {
                    const allLearned = group.every(item => learnedHanjaIds.includes(item.id));
                    const displayIndex = mode === 'all' ? index : Math.floor((group[0].id - 1) / 4);

                    return (
                        <div
                            key={group[0].id}
                            ref={(el) => {
                                // Save ref for every 10th item (1, 11, 21...) or the last item
                                if (mode === 'all' && !searchTerm) {
                                    const groupNum = displayIndex + 1;
                                    if ((groupNum - 1) % 25 === 0 || groupNum === Math.ceil(chunjamunData.length / 4)) {
                                        itemRefs.current[groupNum] = el;
                                    }
                                }
                            }}
                            onClick={() => handleGroupClick(group)}
                            className={`
                                w-full rounded-2xl p-5 pt-8 cursor-pointer transition-all active:scale-[0.98] relative shadow-sm border
                                ${allLearned
                                    ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-200 dark:border-primary-800'
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                                }
                            `}
                        >
                            <div className="absolute top-1 left-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                                {String(displayIndex + 1).padStart(3, '0')}
                            </div>




                            <div className="grid grid-cols-4 gap-2 text-center items-end h-full">
                                {group.map(item => (
                                    <div key={item.id} className="flex flex-col items-center justify-between h-full">
                                        <span className={`text-4xl font-hanja mb-4 ${allLearned ? 'text-primary-900 dark:text-primary-200' : 'text-slate-800 dark:text-slate-100'}`}>
                                            {item.hanja}
                                        </span>
                                        <div className="w-full border-t border-slate-100 dark:border-slate-700/50 pt-3 flex-1 flex flex-col justify-end">
                                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                                                {item.meaning}<br />{item.sound}
                                            </div>
                                        </div>
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
