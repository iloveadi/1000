import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RefreshCcw, ChevronRight } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function ReviewCard() {
    const navigate = useNavigate();
    const { getDueHanjaIds, setCurrentHanjaId, studyRange } = useAppStore();

    const rangeDueIds = useMemo(() => {
        const dueIds = getDueHanjaIds();
        if (studyRange === '1-500') return dueIds.filter(id => id <= 500);
        if (studyRange === '501-1000') return dueIds.filter(id => id > 500);
        return dueIds;
    }, [getDueHanjaIds, studyRange]);

    const count = rangeDueIds.length;

    if (count === 0) return null;

    const handleStartReview = () => {
        // Find the first due Hanja within range and navigate to its study page
        setCurrentHanjaId(rangeDueIds[0]);
        navigate('/study');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-600 dark:bg-primary-500 rounded-2xl shadow-lg border border-primary-500/20 mb-4 overflow-hidden relative"
        >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />

            <div className="p-5 flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                        <RefreshCcw size={24} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-0.5">망각 곡선 복습</p>
                        <h3 className="text-white font-bold text-lg">
                            {count}개의 한자 복습 시기
                        </h3>
                    </div>
                </div>

                <button
                    onClick={handleStartReview}
                    className="bg-white text-primary-600 px-4 py-2 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-transform flex items-center space-x-1"
                >
                    <span>공부하러 가기</span>
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="px-5 pb-3">
                <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="h-full bg-white/40"
                    />
                </div>
            </div>
        </motion.div>
    );
}
