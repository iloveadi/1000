import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, ChevronRight, Sparkles } from 'lucide-react';
import changelogData from '../data/changelog.json';

const ChangelogModal = ({ isOpen, onClose }) => {
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
                            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[80vh] border border-slate-100 dark:border-slate-800"
                        >
                            {/* Header */}
                            <div className="px-6 py-5 bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-700 dark:to-indigo-800 text-white relative">
                                <div className="flex items-center space-x-2 mb-1">
                                    <Sparkles size={18} className="text-primary-200" />
                                    <h2 className="text-xl font-black tracking-tight">千字文 學習은?</h2>
                                </div>
                                <p className="text-primary-100 text-[11px] font-medium opacity-80">업데이트 및 수정 내역</p>
                                <button
                                    onClick={onClose}
                                    className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth hide-scrollbar">
                                {changelogData.map((log, index) => (
                                    <div key={log.version} className="relative">
                                        {/* Version Tag */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest ${index === 0 ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                    v{log.version}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">{log.date}</span>
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center">
                                            <ChevronRight size={14} className="text-primary-500 mr-1" />
                                            {log.title}
                                        </h3>

                                        <ul className="space-y-1.5 pl-5">
                                            {log.changes.map((change, i) => (
                                                <li key={i} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed list-disc marker:text-primary-400">
                                                    {change}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                                <button
                                    onClick={onClose}
                                    className="px-8 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition"
                                >
                                    확인
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChangelogModal;
