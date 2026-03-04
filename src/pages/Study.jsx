import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Edit3, X, Play, PenTool, Star } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun';
import HanjaCanvas from '../components/HanjaCanvas';
import { playSound } from '../utils/audio';
import { speakText } from '../utils/tts';

export default function Study() {
    const {
        currentHanjaId,
        setCurrentHanjaId,
        markLearned,
        unmarkLearned,
        learnedHanjaIds,
        soundEnabled,
        ttsEnabled,
        favoriteHanjaIds,
        toggleFavorite,
        getDueHanjaIds,
        markReviewed,
        studyRange
    } = useAppStore();

    const [isFlipped, setIsFlipped] = useState(false);
    const [direction, setDirection] = useState(0);
    const [showCanvas, setShowCanvas] = useState(false);
    const canvasRef = useRef(null);

    const rangeData = useMemo(() => {
        if (studyRange === '1-500') return chunjamunData.slice(0, 500);
        if (studyRange === '501-1000') return chunjamunData.slice(500, 1000);
        return chunjamunData;
    }, [studyRange]);

    const currentIndex = useMemo(() => {
        const index = rangeData.findIndex(d => d.id === currentHanjaId);
        return index !== -1 ? index : 0;
    }, [currentHanjaId, rangeData]);

    const hanja = rangeData[currentIndex];
    const isLearned = learnedHanjaIds.includes(hanja.id);
    const isFavorite = favoriteHanjaIds.includes(hanja.id);

    const dueHanjaIds = useMemo(() => getDueHanjaIds(), [getDueHanjaIds]);
    const isDue = dueHanjaIds.includes(hanja.id);

    const handleNext = () => {
        if (currentIndex < rangeData.length - 1) {
            if (soundEnabled) playSound('swipe');
            setDirection(1);
            setIsFlipped(false);
            setCurrentHanjaId(rangeData[currentIndex + 1].id);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            if (soundEnabled) playSound('swipe');
            setDirection(-1);
            setIsFlipped(false);
            setCurrentHanjaId(rangeData[currentIndex - 1].id);
        }
    };

    const toggleFlip = () => {
        if (!isFlipped) {
            if (soundEnabled) playSound('flip');
            if (ttsEnabled) {
                speakText(`${hanja.meaning} ${hanja.sound}`);
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
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden px-6 pt-4 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 h-8">
                <div className="flex items-center gap-3">
                    <span className="text-slate-400 dark:text-slate-500 font-bold text-xs tracking-widest uppercase">
                        Hanja #{String(hanja.id).padStart(4, '0')}
                    </span>
                </div>
                <AnimatePresence>
                    {isLearned && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8, x: 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, x: 10 }}
                            className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 px-3 py-1 rounded-full text-xs flex items-center gap-1 font-semibold whitespace-nowrap shadow-sm"
                        >
                            <CheckCircle2 size={13} /> 학습 완료
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Concept Card */}
            <div className="flex-1 flex justify-center items-center perspective-1000 w-full relative">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={hanja.id}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        drag={showCanvas ? false : "x"}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={handleDragEnd}
                        className="absolute w-full aspect-[3/4] cursor-pointer"
                        onClick={!showCanvas ? toggleFlip : undefined}
                    >
                        <motion.div
                            className="w-full h-full relative preserve-3d"
                            initial={false}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                        >
                            {/* Front Side */}
                            <div className="absolute w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center backface-hidden no-select transition-colors">
                                <div className="absolute top-6 left-6 text-slate-300 dark:text-slate-500 font-bold text-xl tracking-wider select-none">
                                    {String(hanja.id).padStart(4, '0')}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (soundEnabled) playSound('btn');
                                        toggleFavorite(hanja.id);
                                    }}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                >
                                    <Star
                                        size={24}
                                        className={isFavorite ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-600"}
                                    />
                                </button>
                                <h1 className="text-[140px] font-bold text-slate-800 dark:text-slate-100 leading-none font-hanja">{hanja.hanja}</h1>
                                <div className="absolute bottom-6 text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse">탭하여 뒤집기</div>
                            </div>

                            {/* Back Side */}
                            <div className="absolute w-full h-full bg-primary-600 dark:bg-primary-700 rounded-3xl shadow-xl flex flex-col items-center justify-center backface-hidden no-select rotate-y-180 transition-colors">
                                <div className="absolute top-6 left-6 text-primary-200/50 dark:text-primary-300/40 font-bold text-xl tracking-wider select-none">
                                    {String(hanja.id).padStart(4, '0')}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (soundEnabled) playSound('btn');
                                        toggleFavorite(hanja.id);
                                    }}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition"
                                >
                                    <Star
                                        size={24}
                                        className={isFavorite ? "text-amber-300 fill-amber-300" : "text-primary-300/40"}
                                    />
                                </button>
                                <div className="text-primary-100 text-3xl font-medium mb-4">{hanja.meaning}</div>
                                <div className="text-white text-7xl font-bold mb-12">{hanja.sound}</div>

                                <div className="absolute bottom-8 flex gap-2 items-center w-full justify-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isDue) {
                                                if (soundEnabled) playSound('success');
                                                markReviewed(hanja.id);
                                            } else if (!isLearned) {
                                                if (soundEnabled) playSound('success');
                                                markLearned(hanja.id);
                                            }
                                        }}
                                        className={`px-6 py-3 rounded-full font-bold shadow-md transition ${isLearned && !isDue
                                            ? 'bg-white/30 text-white cursor-default'
                                            : 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 hover:bg-slate-50'
                                            }`}
                                    >
                                        {isDue ? '✓ 복습 완료' : (isLearned ? '✓ 학습 완료' : '학습 완료 표시')}
                                    </button>
                                    {isLearned && !isDue && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                unmarkLearned(hanja.id);
                                            }}
                                            className="bg-white/20 text-white/80 px-3 py-3 rounded-full hover:bg-white/30 transition"
                                            title="학습 취소"
                                        >
                                            ↩
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Floating Write Button */}
            <AnimatePresence>
                {!showCanvas && (
                    <motion.button
                        initial={{ scale: 0, x: '-50%' }} animate={{ scale: 1, x: '-50%' }} exit={{ scale: 0, x: '-50%' }}
                        onClick={() => setShowCanvas(true)}
                        className="absolute left-1/2 bottom-28 bg-primary-900 dark:bg-primary-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform z-10 focus:outline-none flex items-center gap-2 pr-6"
                    >
                        <Edit3 size={24} /> <span className="font-bold">직접 써보기</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="flex justify-between mt-auto pb-4 gap-4 px-2">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0 || showCanvas}
                    className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition focus:outline-none"
                >
                    <ChevronLeft size={28} />
                </button>
                <div className="flex-1"></div> {/* Spacer for center button */}
                <button
                    onClick={handleNext}
                    disabled={currentIndex === rangeData.length - 1 || showCanvas}
                    className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition focus:outline-none"
                >
                    <ChevronRight size={28} />
                </button>
            </div>

            {/* Drawing Canvas Modal (Bottom Sheet style) */}
            <AnimatePresence>
                {showCanvas && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 z-40"
                            onClick={() => setShowCanvas(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute inset-x-0 bottom-0 h-[85%] bg-white dark:bg-slate-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 flex flex-col p-6 max-w-md mx-auto transition-colors"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <Edit3 className="text-primary-500" /> 직접 써보기
                                </h2>
                                <button
                                    onClick={() => setShowCanvas(false)}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition focus:outline-none"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 flex justify-center items-center">
                                <HanjaCanvas
                                    key={hanja.id}
                                    ref={canvasRef}
                                    character={hanja.hanja}
                                    width={280}
                                    height={280}
                                    onComplete={() => {
                                        if (soundEnabled) playSound('success');
                                        markLearned(hanja.id);
                                    }}
                                />
                            </div>

                            <div className="flex justify-center gap-4 mt-8 mb-6">
                                <button
                                    onClick={() => canvasRef.current?.animate()}
                                    className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-full active:scale-95 transition focus:outline-none"
                                >
                                    <Play size={18} /> 획순 보기
                                </button>
                                <button
                                    onClick={() => canvasRef.current?.quiz()}
                                    className="flex items-center gap-2 px-5 py-3 bg-primary-600 dark:bg-primary-500 text-white font-semibold rounded-full shadow-md active:scale-95 transition focus:outline-none"
                                >
                                    <PenTool size={18} /> 퀴즈 시작
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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
