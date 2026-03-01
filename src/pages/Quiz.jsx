import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Home, CheckCircle2, XCircle, Timer, Award } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';
import { playSound } from '../utils/audio';

const QUESTIONS_PER_SESSION = 10;
const SECONDS_PER_QUESTION = 5;

export default function Quiz() {
    const navigate = useNavigate();
    const { soundEnabled, updateQuizScore } = useAppStore();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [answered, setAnswered] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    // Initialize Quiz
    useEffect(() => {
        startNewQuiz();
        return () => clearInterval(timerRef.current);
    }, []);

    const startNewQuiz = () => {
        const shuffled = [...chunjamunData].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, QUESTIONS_PER_SESSION);

        const quizItems = selected.map(item => {
            const distractors = shuffled
                .filter(d => d.id !== item.id)
                .slice(0, 3);

            const options = [...distractors, item]
                .sort(() => 0.5 - Math.random());

            return {
                ...item,
                options
            };
        });

        setQuestions(quizItems);
        setCurrentIndex(0);
        setScore(0);
        setSelectedId(null);
        setIsFinished(false);
        setAnswered(false);
        setStartTime(Date.now());
        setElapsedTime(0);
        setTimeLeft(SECONDS_PER_QUESTION);
    };

    // Timer Logic
    useEffect(() => {
        if (!isFinished && !answered && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !answered) {
            handleAnswer(null); // Timeout as incorrect
        }

        return () => clearInterval(timerRef.current);
    }, [isFinished, answered, timeLeft]);

    const handleAnswer = (optionId) => {
        if (answered || isFinished) return;

        clearInterval(timerRef.current);
        const isCorrect = optionId === questions[currentIndex].id;
        setSelectedId(optionId);
        setAnswered(true);

        if (isCorrect) {
            setScore(s => s + 1);
        }

        if (soundEnabled) {
            playSound(isCorrect ? 'success' : 'error');
        }

        setTimeout(() => {
            if (currentIndex < QUESTIONS_PER_SESSION - 1) {
                setCurrentIndex(i => i + 1);
                setSelectedId(null);
                setAnswered(false);
                setTimeLeft(SECONDS_PER_QUESTION);
            } else {
                const finalTime = Math.round((Date.now() - startTime) / 1000);
                setElapsedTime(finalTime);
                setIsFinished(true);
                updateQuizScore(score + (isCorrect ? 1 : 0), finalTime);
            }
        }, 1200);
    };

    if (questions.length === 0) return null;

    if (isFinished) {
        const pct = Math.round((score / QUESTIONS_PER_SESSION) * 100);
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl text-center border border-slate-100 dark:border-slate-700"
                >
                    <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '📖' : '💪'}</div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">테스트 완료!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">한자 테스트 정확도</p>

                    <div className="text-5xl font-black text-primary-600 dark:text-primary-400 mb-1">
                        {score} <span className="text-2xl text-slate-400">/ {QUESTIONS_PER_SESSION}</span>
                    </div>

                    <div className="flex justify-center space-x-4 mb-6 text-sm font-bold mt-2">
                        <span className="text-slate-400">⏱ {elapsedTime}초</span>
                        <span className="text-amber-500">✨ +{score * 10}P</span>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm px-2">
                        {score === QUESTIONS_PER_SESSION ? "완벽해요! 대단한 실력입니다 👏" :
                            score >= 7 ? "훌륭합니다! 조금만 더 하면 완벽해요 👍" :
                                "괜찮아요! 다시 한번 도전해보세요 🌱"}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={startNewQuiz}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-2xl font-bold transition"
                        >
                            <RotateCcw size={18} />
                            <span>다시 하기</span>
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-2xl font-bold transition"
                        >
                            <Home size={18} />
                            <span>홈</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const currentItem = questions[currentIndex];

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden px-6 pt-8 pb-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition"
                >
                    <ChevronLeft size={24} />
                </button>
                <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                    한자 테스트 {currentIndex + 1} / {QUESTIONS_PER_SESSION}
                </span>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 justify-center shrink-0 min-w-[64px]">
                        <Timer size={14} className={timeLeft <= 2 ? "text-red-500" : "text-slate-400"} />
                        <div className={`text-sm font-bold flex items-center ${timeLeft <= 2 ? "text-red-500" : "text-slate-700 dark:text-slate-200"}`}>
                            <span className="tabular-nums w-[18px] text-right inline-block">{timeLeft}</span>
                            <span>초</span>
                        </div>
                    </div>
                    <span className="text-primary-600 dark:text-primary-400 font-bold hidden sm:inline">{score * 10}점</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mb-4">
                <motion.div
                    className="h-1.5 bg-primary-500 rounded-full"
                    animate={{ width: `${((currentIndex) / QUESTIONS_PER_SESSION) * 100}%` }}
                    transition={{ duration: 0.4 }}
                />
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                {/* Question Card Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`q-${currentIndex}`}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-4 text-center"
                    >
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-widest mb-4">주어진 한자의 뜻과 음을 고르세요</p>
                        <h1 className="text-[80px] font-hanja font-bold text-slate-800 dark:text-slate-100 leading-none">
                            {currentItem.hanja}
                        </h1>
                    </motion.div>
                </AnimatePresence>

                {/* Options Grid */}
                <div className="grid grid-cols-1 gap-2">
                    {currentItem.options.map((option, idx) => {
                        const isCorrect = option.id === currentItem.id;
                        const isSelected = selectedId === option.id;

                        let btnStyle = "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-slate-800";

                        if (answered) {
                            if (isCorrect) {
                                btnStyle = "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20 scale-102 z-10";
                            } else if (isSelected) {
                                btnStyle = "bg-red-500 border-red-500 text-white opacity-90";
                            } else {
                                btnStyle = "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-400 opacity-50";
                            }
                        }

                        return (
                            <motion.button
                                key={option.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileTap={!answered ? { scale: 0.98 } : {}}
                                onClick={() => handleAnswer(option.id)}
                                disabled={answered}
                                className={`
                                    w-full p-5 rounded-2xl border-2 text-lg font-bold transition-all shadow-sm flex items-center justify-between
                                    ${btnStyle}
                                `}
                            >
                                <span>{option.meaning} {option.sound}</span>
                                {answered && isCorrect && <CheckCircle2 size={24} className="text-white" />}
                                {answered && isSelected && !isCorrect && <XCircle size={24} className="text-white" />}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
