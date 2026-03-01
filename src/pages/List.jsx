import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Search, Star } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';

export default function List() {
    const { learnedHanjaIds, setCurrentHanjaId, favorites } = useAppStore();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'learned', 'unlearned', 'favorite'

    const handleCardClick = (id) => {
        setCurrentHanjaId(id);
        navigate('/study');
    };

    // Filtering logic
    const filteredData = chunjamunData.filter((item) => {
        const matchesSearch = item.hanja.includes(searchTerm) || item.meaning.includes(searchTerm) || item.sound.includes(searchTerm);
        if (!matchesSearch) return false;

        const isLearned = learnedHanjaIds.includes(item.id);
        const isFavorite = favorites.includes(item.id);

        switch (filterMode) {
            case 'learned': return isLearned;
            case 'unlearned': return !isLearned;
            case 'favorite': return isFavorite;
            default: return true;
        }
    });

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
                    {['all', 'learned', 'unlearned', 'favorite'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setFilterMode(mode)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filterMode === mode
                                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            {mode === 'all' && '전체보기'}
                            {mode === 'learned' && '학습 완료'}
                            {mode === 'unlearned' && '미학습'}
                            {mode === 'favorite' && '✨ 즐겨찾기'}
                        </button>
                    ))}
                </div>
            </header>

            {/* List Content */}
            <div className="grid grid-cols-4 gap-3 overflow-y-auto pb-4 hide-scrollbar" style={{ scrollbarGutter: 'stable' }}>
                {filteredData.length === 0 ? (
                    <div className="col-span-4 py-12 text-center text-slate-400 dark:text-slate-500">
                        검색 결과가 없습니다.
                    </div>
                ) : filteredData.map((item) => {
                    const isLearned = learnedHanjaIds.includes(item.id);
                    const isFavorite = favorites.includes(item.id);
                    return (
                        <div
                            key={item.id}
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
                            {isLearned && (
                                <div className="absolute top-1 right-1 text-primary-500 dark:text-primary-400">
                                    <CheckCircle2 size={12} fill="currentColor" className="text-white dark:text-slate-900" />
                                </div>
                            )}
                            {isFavorite && !isLearned && (
                                <div className="absolute top-1 right-1 text-yellow-400">
                                    <Star size={12} fill="currentColor" />
                                </div>
                            )}
                            {isFavorite && isLearned && (
                                <div className="absolute top-1 left-1 text-yellow-400">
                                    <Star size={12} fill="currentColor" />
                                </div>
                            )}
                            <span className="text-3xl font-hanja mb-1">{item.hanja}</span>
                            <span className="text-[10px] font-medium opacity-80">{item.sound}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
