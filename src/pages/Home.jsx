import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';
import { BookOpen, Award, Flame, BrainCircuit, BarChart3, Fingerprint } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const { learnedHanjaIds, streak } = useAppStore();

    const totalCount = chunjamunData.length;
    const learnedCount = learnedHanjaIds.length;
    const progressPercent = Math.round((learnedCount / totalCount) * 100) || 0;

    return (
        <div className="px-6 pt-12 pb-24 h-full flex flex-col transition-colors duration-300 bg-slate-50 dark:bg-slate-900 overflow-y-auto hide-scrollbar">
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">천자문 시작</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">오늘도 지혜를 한 획 더해보세요 🌿</p>
                </div>
                {streak.count > 0 && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full flex items-center space-x-1 border border-orange-200 dark:border-orange-800/50"
                    >
                        <Flame size={16} className="text-orange-600 dark:text-orange-400" fill="currentColor" />
                        <span className="text-sm font-bold text-orange-700 dark:text-orange-300">{streak.count}일</span>
                    </motion.div>
                )}
            </header>

            {/* Progress Card */}
            <motion.div
                whileHover={{ y: -2 }}
                onClick={() => navigate('/stats')}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6 cursor-pointer"
            >
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <Award className="text-primary-500 dark:text-primary-400" size={20} />
                        <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">나의 학습 진도</h2>
                    </div>
                    <span className="text-xl font-black text-primary-600 dark:text-primary-400">{progressPercent}%</span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="bg-primary-500 dark:bg-primary-400 h-full rounded-full"
                    />
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-right">
                    총 {totalCount}자 중 <span className="font-bold text-slate-600 dark:text-slate-300">{learnedCount}자</span> 완료
                </p>
            </motion.div>

            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/quiz')}
                    className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center space-y-3"
                >
                    <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <BrainCircuit size={28} />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">테스트</span>
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/stats')}
                    className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center space-y-3"
                >
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <BarChart3 size={28} />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">통계</span>
                </motion.button>
            </div>

            {/* Sub Menu Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">심화 학습</h3>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/list')}
                    className="w-full bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center space-x-4 shadow-sm"
                >
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Fingerprint size={22} />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-slate-800 dark:text-slate-100">부수별 묶음 보기</p>
                        <p className="text-xs text-slate-400">부수를 알면 한자가 더 쉬워집니다</p>
                    </div>
                </motion.button>
            </div>

            <div className="flex-1" />

            {/* Final Sticky-ish Action */}
            <button
                onClick={() => navigate('/study')}
                className="w-full bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 text-white rounded-2xl py-4 font-bold text-lg shadow-lg flex justify-center items-center space-x-3 transform active:scale-95 transition-all mt-8"
            >
                <BookOpen size={22} />
                <span>이어서 학습하기</span>
            </button>
        </div>
    );
}
