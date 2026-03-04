import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Calendar, Zap, TrendingDown } from 'lucide-react';

const SrsInfoModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[70] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[85vh] border border-slate-100 dark:border-slate-800"
                        >
                            {/* Header */}
                            <div className="px-6 py-6 bg-gradient-to-br from-indigo-500 to-primary-600 text-white relative">
                                <div className="bg-white/20 p-2 rounded-2xl w-fit mb-4">
                                    <Brain size={24} className="text-white" />
                                </div>
                                <h2 className="text-xl font-black tracking-tight mb-1">복습 알고리즘 (SRS) 이란?</h2>
                                <p className="text-indigo-100 text-xs opacity-90 leading-relaxed">
                                    Spaced Repetition System: 간격을 둔 반복 학습법
                                </p>
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
                                <section>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <TrendingDown size={16} className="text-primary-500" />
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">에빙하우스의 망각 곡선</h3>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        사람은 학습 후 20분만 지나도 42%를 잊어버리고, 한 달 뒤에는 80%를 망각합니다. SRS는 이 망각이 일어나기 직전 최적의 타이밍에 복습을 제안합니다.
                                    </p>
                                </section>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                        <Calendar size={16} className="text-indigo-500 mb-2" />
                                        <h4 className="text-[11px] font-bold mb-1 dark:text-slate-200">점진적 간격</h4>
                                        <p className="text-[10px] text-slate-400 leading-tight">잘 아는 것은 더 긴 간격으로, 어려운 것은 더 자주 복습합니다.</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                        <Zap size={16} className="text-amber-500 mb-2" />
                                        <h4 className="text-[11px] font-bold mb-1 dark:text-slate-200">효율적 집중</h4>
                                        <p className="text-[10px] text-slate-400 leading-tight">불필요한 중복 학습을 줄이고 취약한 부분을 집중 공략합니다.</p>
                                    </div>
                                </div>

                                <section className="p-4 rounded-2xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100/50 dark:border-primary-800/30">
                                    <h3 className="font-bold text-primary-700 dark:text-primary-300 text-sm mb-2">복습 단계가 올라갈수록...</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-slate-500">1단계 (직후)</span>
                                            <span className="font-bold text-primary-600">4시간 뒤</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-slate-500">2단계</span>
                                            <span className="font-bold text-primary-600">1일 뒤</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-slate-500">3단계</span>
                                            <span className="font-bold text-primary-600">3일 뒤</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-slate-500">4단계</span>
                                            <span className="font-bold text-primary-600">7일 뒤</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-slate-500">5단계 (마스터)</span>
                                            <span className="font-bold text-primary-600">14일 뒤</span>
                                        </div>
                                    </div>
                                </section>

                                <p className="text-[10px] text-center text-slate-400">
                                    매일 '오늘의 복습' 카드를 확인하여 <br /> 장기 기억으로 전환해 보세요!
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                                <button
                                    onClick={onClose}
                                    className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    이해했습니다
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SrsInfoModal;
