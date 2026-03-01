import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';
import { playSound } from '../utils/audio';
import { speakText } from '../utils/tts';

export default function IdiomStudy() {
    const { currentHanjaId, setCurrentHanjaId, markLearned, unmarkLearned, learnedHanjaIds, soundEnabled, ttsEnabled } = useAppStore();
    const navigate = useNavigate();
    const [isFlipped, setIsFlipped] = useState(false);
    const [direction, setDirection] = useState(0);

    const currentIndex = chunjamunData.findIndex(d => d.id === currentHanjaId) !== -1
        ? chunjamunData.findIndex(d => d.id === currentHanjaId)
        : 0;

    const groupStartIndex = Math.floor(currentIndex / 4) * 4;
    const currentGroup = chunjamunData.slice(groupStartIndex, groupStartIndex + 4);
    const isGroupLearned = currentGroup.every(h => learnedHanjaIds.includes(h.id));

    const handleNext = () => {
        if (groupStartIndex + 4 < chunjamunData.length) {
            if (soundEnabled) playSound('swipe');
            setDirection(1);
            setIsFlipped(false);
            setCurrentHanjaId(chunjamunData[groupStartIndex + 4].id);
        }
    };

    const handlePrev = () => {
        if (groupStartIndex > 0) {
            if (soundEnabled) playSound('swipe');
            setDirection(-1);
            setIsFlipped(false);
            setCurrentHanjaId(chunjamunData[groupStartIndex - 4].id);
        }
    };

    const toggleFlip = () => {
        if (!isFlipped) {
            if (soundEnabled) playSound('flip');
            if (ttsEnabled) {
                const groupText = currentGroup.map(h => `${h.meaning} ${h.sound}`).join(', ');
                speakText(groupText);
            }
        }
        setIsFlipped(!isFlipped);
    };

    const handleDragEnd = (e, { offset }) => {
        if (offset.x < -50) handleNext();
        else if (offset.x > 50) handlePrev();
    };

    const variants = {
        enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (dir) => ({ zIndex: 0, x: dir < 0 ? 300 : -300, opacity: 0 })
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden px-6 pt-12 pb-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={() => navigate('/idioms')}
                    className="p-2 -ml-2 text-slate-600 dark:text-slate-400"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {Math.floor(groupStartIndex / 4) + 1} / {Math.ceil(chunjamunData.length / 4)}
                    </span>
                </div>
            </div>

            {/* Idiom Card */}
            <div className="flex-1 flex justify-center items-center perspective-1000 w-full relative">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={`idiom-${groupStartIndex}`}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={handleDragEnd}
                        className="absolute w-full aspect-[4/5] cursor-pointer"
                        onClick={toggleFlip}
                    >
                        <motion.div
                            className="w-full h-full relative preserve-3d"
                            initial={false}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                        >
                            {/* Front Side */}
                            <div className="absolute w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center backface-hidden no-select transition-colors p-8">
                                <div className="grid grid-cols-2 gap-6 w-full h-full items-center justify-items-center py-8">
                                    {currentGroup.map(h => (
                                        <h1 key={h.id} className="text-[100px] font-bold text-slate-800 dark:text-slate-100 leading-none font-hanja">{h.hanja}</h1>
                                    ))}
                                </div>
                                <div className="mt-8 text-slate-400 text-sm font-medium animate-pulse">탭하여 해석 보기</div>
                                {isGroupLearned && (
                                    <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                                        <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} />
                                    </div>
                                )}
                            </div>

                            {/* Back Side */}
                            <div className="absolute w-full h-full bg-primary-600 dark:bg-primary-700 rounded-3xl shadow-xl flex flex-col items-center justify-center backface-hidden no-select rotate-y-180 transition-colors p-6 overflow-hidden">
                                <div className="flex flex-col gap-3 w-full justify-center h-full">
                                    {currentGroup.map(h => (
                                        <div key={`back-${h.id}`} className="flex justify-between items-center px-4 border-b border-primary-500/30 pb-2 last:border-0">
                                            <span className="text-primary-100 text-2xl font-medium">{h.meaning}</span>
                                            <span className="text-white text-3xl font-bold">{h.sound}</span>
                                        </div>
                                    ))}
                                    <div className="flex gap-2 items-center mt-4 justify-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isGroupLearned) {
                                                    if (soundEnabled) playSound('success');
                                                    currentGroup.forEach(h => markLearned(h.id));
                                                }
                                            }}
                                            className={`px-6 py-3 rounded-full font-bold shadow-md transition ${isGroupLearned
                                                ? 'bg-white/30 text-white cursor-default'
                                                : 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 hover:scale-105'
                                                }`}
                                        >
                                            {isGroupLearned ? '✓ 학습 완료' : '구절 전체 학습 완료'}
                                        </button>
                                        {isGroupLearned && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    currentGroup.forEach(h => unmarkLearned(h.id));
                                                }}
                                                className="bg-white/20 text-white/80 px-3 py-3 rounded-full hover:bg-white/30 transition"
                                                title="학습 취소"
                                            >
                                                ↩
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between mt-auto pb-4 gap-4 px-2">
                <button
                    onClick={handlePrev}
                    disabled={groupStartIndex === 0}
                    className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm disabled:opacity-50 text-slate-700 dark:text-slate-300 transition"
                >
                    <ChevronLeft size={28} />
                </button>
                <button
                    onClick={handleNext}
                    disabled={groupStartIndex + 4 >= chunjamunData.length}
                    className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm disabled:opacity-50 text-slate-700 dark:text-slate-300 transition"
                >
                    <ChevronRight size={28} />
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
        </div>
    );
}
