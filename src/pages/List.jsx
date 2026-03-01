import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';

export default function List() {
    const { learnedHanjaIds, setCurrentHanjaId } = useAppStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [mode, setMode] = useState('all'); // 'all', 'learned', 'unlearned'
    const listRef = useRef(null);
    const itemRefs = useRef({});

    // Generate index marks (every 25 items, plus the last one)
    const indexMarks = useMemo(() => {
        const marks = [];
        const totalItems = chunjamunData.length;
        for (let i = 1; i <= totalItems; i += 100) {
            marks.push(i);
        }
        if (marks[marks.length - 1] !== totalItems) {
            marks.push(totalItems);
        }
        return marks;
    }, []);

    const handleCardClick = (id) => {
        setCurrentHanjaId(id);
        navigate('/study');
    };

    // Filtering logic
    const filteredData = useMemo(() => {
        return chunjamunData.filter((item) => {
            const matchesSearch = item.hanja.includes(searchTerm) || item.meaning.includes(searchTerm) || item.sound.includes(searchTerm);
            if (!matchesSearch) return false;

            const isLearned = learnedHanjaIds.includes(item.id);

            switch (mode) {
                case 'learned': return isLearned;
                case 'unlearned': return !isLearned;
                default: return true;
            }
        });
    }, [searchTerm, mode, learnedHanjaIds]);

    const scrollToItem = (indexMark) => {
        const node = itemRefs.current[indexMark];
        if (node && listRef.current) {
            const containerTop = listRef.current.getBoundingClientRect().top;
            const elementTop = node.getBoundingClientRect().top;
            const currentScroll = listRef.current.scrollTop;

            listRef.current.scrollTo({
                top: currentScroll + (elementTop - containerTop) - 20,
                behavior: 'smooth'
            });
        }
    };

    const filterTabs = [
        { id: 'all', label: '전체보기' },
        { id: 'learned', label: '학습 완료' },
        { id: 'unlearned', label: '미학습' },
    ];

    return (
        <div className="px-6 pt-12 pb-6 h-full transition-colors duration-300 bg-slate-50 dark:bg-slate-900 flex flex-col">
            <header className="mb-6 shrink-0">
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">전체 목록</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {learnedHanjaIds.length} / {chunjamunData.length} 글자 완료
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="한자, 뜻, 음색인 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setMode(tab.id)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${mode === tab.id
                                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* List Content */}
            <div ref={listRef} className="flex-1 min-h-[50vh] overflow-y-auto pb-24 hide-scrollbar relative" style={{ scrollbarGutter: 'stable' }}>
                {/* Vertical Quick Index Navigation */}
                {mode === 'all' && !searchTerm && (
                    <div className="fixed right-1 top-[55%] -translate-y-1/2 z-10 flex flex-col items-center justify-center py-2 px-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                        {indexMarks.map(mark => (
                            <button
                                key={mark}
                                onClick={() => scrollToItem(mark)}
                                className="w-6 h-6 my-1 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-500 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors active:scale-90"
                            >
                                {mark}
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-4 gap-3">
                    {filteredData.length === 0 ? (
                        <div className="col-span-4 py-12 text-center text-slate-400 dark:text-slate-500">
                            검색 결과가 없습니다.
                        </div>
                    ) : filteredData.map((item) => {
                        const isLearned = learnedHanjaIds.includes(item.id);
                        return (
                            <div
                                key={item.id}
                                ref={(el) => {
                                    if (mode === 'all' && !searchTerm) {
                                        if ((item.id - 1) % 100 === 0 || item.id === chunjamunData.length) {
                                            itemRefs.current[item.id] = el;
                                        }
                                    }
                                }}
                                onClick={() => handleCardClick(item.id)}
                                className={`
                                aspect-square rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer
                                transition-all active:scale-95 relative shadow-sm border
                                ${isLearned
                                        ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-200 dark:border-primary-800 text-primary-900 dark:text-primary-300'
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'
                                    }
                            `}
                            >


                                {/* Sequence Number */}
                                <div className="absolute top-0.5 left-1.5 text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-tighter">
                                    {String(item.id).padStart(4, '0')}
                                </div>

                                <span className="text-3xl font-hanja mb-1">{item.hanja}</span>
                                <span className="text-[10px] font-medium opacity-80">{item.sound}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
