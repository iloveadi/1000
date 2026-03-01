import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';
import { BookOpen, Flame, BrainCircuit, BarChart3, Calendar, Award, Target, Fingerprint } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const { learnedHanjaIds, streak, quizScores, dailyActivity } = useAppStore();

    const totalCount = chunjamunData.length;
    const learnedCount = learnedHanjaIds.length;
    const progressPercent = Math.round((learnedCount / totalCount) * 100) || 0;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });
    const maxActivity = Math.max(...Object.values(dailyActivity), 5);

    return (
        <div className="px-6 pt-12 pb-24 h-full flex flex-col transition-colors duration-300 bg-slate-50 dark:bg-slate-900 overflow-y-auto hide-scrollbar">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">천자문 학습</h1>
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
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-4">
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
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-primary-500 rounded-full"
                    />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-right">
                    총 {totalCount}자 중 <span className="font-bold text-slate-600 dark:text-slate-300">{learnedCount}자</span> 완료
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                    { icon: Flame, bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600 dark:text-orange-400', label: '연속', value: `${streak.count}일`, filled: true },
                    { icon: Target, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400', label: '최고점', value: `${quizScores.highScore}점` },
                    { icon: Award, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400', label: '포인트', value: `${quizScores.totalPoints || 0}P` },
                ].map(({ icon: Icon, bg, color, label, value, filled }) => (
                    <div key={label} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                        <div className={`w-9 h-9 ${bg} rounded-full flex items-center justify-center mb-2 ${color}`}>
                            <Icon size={18} fill={filled ? 'currentColor' : 'none'} />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">{label}</span>
                        <span className="text-base font-bold text-slate-800 dark:text-slate-100">{value}</span>
                    </div>
                ))}
            </div>

            {/* Activity Chart */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-4">
                <div className="flex items-center space-x-2 mb-5">
                    <Calendar size={18} className="text-primary-500" />
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">최근 학습 활동</h2>
                </div>
                <div className="flex items-end justify-between h-24 px-1">
                    {last7Days.map((date) => {
                        const count = dailyActivity[date] || 0;
                        const height = (count / maxActivity) * 100;
                        const dayName = ['일', '월', '화', '수', '목', '금', '토'][new Date(date).getDay()];
                        const isToday = date === new Date().toISOString().split('T')[0];
                        return (
                            <div key={date} className="flex flex-col items-center flex-1">
                                <div className="relative flex flex-col items-center justify-end h-16 w-full">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        className={`w-4 rounded-t-lg transition-colors ${isToday ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    />
                                    {count > 0 && <span className="absolute -top-5 text-[10px] font-bold text-slate-400">{count}</span>}
                                </div>
                                <span className={`text-[10px] mt-1.5 font-medium ${isToday ? 'text-primary-600 font-bold' : 'text-slate-400'}`}>{dayName}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sub Menu */}
            <div className="space-y-3 mb-6">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">심화 학습</h3>
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

            {/* CTA Button */}
            <button
                onClick={() => navigate('/study')}
                className="w-full bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 text-white rounded-2xl py-4 font-bold text-lg shadow-lg flex justify-center items-center space-x-3 transform active:scale-95 transition-all"
            >
                <BookOpen size={22} />
                <span>이어서 학습하기</span>
            </button>
        </div>
    );
}
