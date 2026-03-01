import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Flame, Target, BarChart3, Calendar, Award } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';

export default function Stats() {
    const navigate = useNavigate();
    const { learnedHanjaIds, quizScores, dailyActivity, streak } = useAppStore();

    const totalCount = chunjamunData.length;
    const learnedCount = learnedHanjaIds.length;
    const progressPercent = Math.round((learnedCount / totalCount) * 100) || 0;

    // Get last 7 days for activity chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const maxActivity = Math.max(...Object.values(dailyActivity), 5);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 pt-12 pb-24">
            <header className="flex items-center mb-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 dark:text-slate-400">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="flex-1 text-center text-xl font-bold text-slate-800 dark:text-slate-100 pr-8">학습 통계</h1>
            </header>

            <div className="space-y-6">
                {/* Streak, High Score, Points Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center"
                    >
                        <div className="w-9 h-9 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-2 text-orange-600 dark:text-orange-400">
                            <Flame size={18} fill="currentColor" />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">연속</span>
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{streak.count}일</span>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center"
                    >
                        <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2 text-blue-600 dark:text-blue-400">
                            <Target size={18} />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">최고점</span>
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{quizScores.highScore}점</span>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center"
                    >
                        <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-2 text-amber-600 dark:text-amber-400">
                            <Award size={18} />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1">포인트</span>
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{(quizScores.totalPoints || 0)}P</span>
                    </motion.div>
                </div>

                {/* Best Time Record row */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center transition-colors">
                    <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                        <span className="text-xs font-bold uppercase tracking-wider">최단 시간 (10점 만점 기준)</span>
                    </div>
                    <div className="text-xl font-black text-primary-600 dark:text-primary-400">
                        {quizScores.bestTime ? `${quizScores.bestTime}초` : '--'}
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-4">
                        <BarChart3 size={20} className="text-primary-500" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">전체 진척도</h2>
                    </div>

                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <span className="text-3xl font-black text-primary-600 dark:text-primary-400">{progressPercent}%</span>
                            <span className="text-slate-400 dark:text-slate-500 ml-2">완료</span>
                        </div>
                        <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                            {learnedCount} / {totalCount} 자
                        </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="bg-primary-500 dark:bg-primary-400 h-full rounded-full"
                        />
                    </div>
                </div>

                {/* Daily Activity Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2 mb-8">
                        <Calendar size={20} className="text-primary-500" />
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">최근 학습 활동</h2>
                    </div>

                    <div className="flex items-end justify-between h-32 px-2">
                        {last7Days.map((date, idx) => {
                            const count = dailyActivity[date] || 0;
                            const height = (count / maxActivity) * 100;
                            const dayName = ['일', '월', '화', '수', '목', '금', '토'][new Date(date).getDay()];
                            const isToday = date === new Date().toISOString().split('T')[0];

                            return (
                                <div key={date} className="flex flex-col items-center flex-1">
                                    <div className="relative flex flex-col items-center justify-end h-24 w-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            className={`w-4 sm:w-6 rounded-t-lg transition-colors ${isToday ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                        />
                                        {count > 0 && (
                                            <span className="absolute -top-6 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                {count}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[10px] mt-2 font-medium ${isToday ? 'text-primary-600 font-bold' : 'text-slate-400'}`}>
                                        {dayName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quiz Summary */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">테스트 요약</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">총 도전 횟수</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">{quizScores.totalAttempts}회</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">정답 수</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">{quizScores.correctAnswers}개</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">평균 정답률</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100">
                                {quizScores.totalAttempts > 0 ? Math.round((quizScores.correctAnswers / (quizScores.totalAttempts * 10)) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
