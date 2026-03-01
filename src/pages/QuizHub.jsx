import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Mic, ChevronRight, Puzzle } from 'lucide-react';

const quizTypes = [
    {
        id: 'quiz',
        path: '/quiz',
        icon: BrainCircuit,
        iconBg: 'bg-primary-50 dark:bg-primary-900/20',
        iconColor: 'text-primary-600 dark:text-primary-400',
        title: '한자 테스트',
        desc: '한자를 보고 뜻·음을 맞혀보세요',
        badge: '4지선다',
        badgeColor: 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400',
    },
    {
        id: 'dictation',
        path: '/dictation-quiz',
        icon: Mic,
        iconBg: 'bg-primary-50 dark:bg-primary-900/20',
        iconColor: 'text-primary-600 dark:text-primary-400',
        title: '받아쓰기',
        desc: '뜻·음을 듣고 한자를 골라보세요',
        badge: '듣기 퀴즈',
        badgeColor: 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400',
    },
    {
        id: 'idiom',
        path: '/idiom-quiz',
        icon: Puzzle,
        iconBg: 'bg-primary-50 dark:bg-primary-900/20',
        iconColor: 'text-primary-600 dark:text-primary-400',
        title: '사자성어 채우기',
        desc: '구절의 의미를 보고 빈칸의 한자를 맞혀보세요',
        badge: '빈칸 퀴즈',
        badgeColor: 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400',
    },
];

export default function QuizHub() {
    const navigate = useNavigate();

    return (
        <div className="px-6 pt-12 pb-24 h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">퀴즈 & 게임</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">재미있게 한자를 익혀보세요 🎮</p>
            </header>

            <div className="flex flex-col gap-4">
                {quizTypes.map((q, i) => {
                    const Icon = q.icon;
                    return (
                        <motion.button
                            key={q.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate(q.path)}
                            className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 flex items-center gap-4 text-left"
                        >
                            <div className={`w-14 h-14 ${q.iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
                                <Icon size={28} className={q.iconColor} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-800 dark:text-slate-100">{q.title}</span>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${q.badgeColor}`}>{q.badge}</span>
                                </div>
                                <p className="text-sm text-slate-400 dark:text-slate-500">{q.desc}</p>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 shrink-0" />
                        </motion.button>
                    );
                })}
            </div>

            {/* Coming soon placeholder */}
            <div className="mt-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center text-slate-400 dark:text-slate-600">
                <p className="text-2xl mb-2">🚀</p>
                <p className="text-sm font-medium">더 많은 퀴즈가 곧 추가됩니다!</p>
            </div>
        </div>
    );
}
