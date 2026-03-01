import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Award, Lock, CheckCircle2, Sparkles, Flame, Calendar, Target, Coins, Star, Bookmark, Crown, BookOpen } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { achievements } from '../data/achievements';

const iconMap = {
    Sparkles, Award, BookOpen, Crown, Flame, Calendar, Target, Coins, Star
};

export default function Achievements() {
    const navigate = useNavigate();
    const { unlockedBadgeIds, learnedHanjaIds, quizScores, streak, favoriteHanjaIds } = useAppStore();

    const progress = (id) => {
        const state = { learnedHanjaIds, quizScores, streak, favoriteHanjaIds };
        const badge = achievements.find(b => b.id === id);
        // This is a bit simplified, but fine for display
        return unlockedBadgeIds.includes(id) ? 100 : 0;
    };

    return (
        <div className="px-6 pt-12 pb-24 h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto hide-scrollbar">
            <header className="mb-8 flex items-center space-x-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
                >
                    <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">나의 업적</h1>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {achievements.map((badge) => {
                    const isUnlocked = unlockedBadgeIds.includes(badge.id);
                    const Icon = iconMap[badge.icon] || Award;

                    return (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={`relative p-5 rounded-3xl border transition-all ${isUnlocked
                                    ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'
                                    : 'bg-slate-100/50 dark:bg-slate-800/30 border-dashed border-slate-200 dark:border-slate-700 opacity-70'
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${isUnlocked ? badge.color : 'from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700'} shadow-lg`}>
                                    <Icon size={28} className="text-white" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-bold ${isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {badge.name}
                                        </h3>
                                        {isUnlocked && <CheckCircle2 size={16} className="text-green-500" />}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {badge.description}
                                    </p>
                                </div>
                            </div>

                            {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <Lock size={40} className="text-slate-200/30 dark:text-slate-700/30" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-8 p-6 bg-primary-600 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-1">천자문 정복자</h3>
                    <p className="text-sm text-primary-100 mb-4 opacity-80">전체 업적의 {Math.round((unlockedBadgeIds.length / achievements.length) * 100)}%를 달성했습니다.</p>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-white h-full rounded-full transition-all duration-1000"
                            style={{ width: `${(unlockedBadgeIds.length / achievements.length) * 100}%` }}
                        />
                    </div>
                </div>
                <Award className="absolute -bottom-4 -right-4 text-white/10" size={120} />
            </div>
        </div>
    );
}
