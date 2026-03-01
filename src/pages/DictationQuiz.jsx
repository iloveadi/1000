import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw, Home, ChevronLeft, Timer, CheckCircle2, XCircle } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';
import { speakText } from '../utils/tts';
import { playSound } from '../utils/audio';

const QUESTIONS_PER_SESSION = 10;
const SECONDS_PER_QUESTION = 10;

function shuffle(arr) {
    return [...arr].sort(() => 0.5 - Math.random());
}

export default function DictationQuiz() {
    const navigate = useNavigate();
    const { ttsEnabled, soundEnabled, updateQuizScore } = useAppStore();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        startNewQuiz();
        return () => clearInterval(timerRef.current);
    }, []);

    const startNewQuiz = () => {
        const pool = shuffle(chunjamunData);
        const selected = pool.slice(0, QUESTIONS_PER_SESSION);
        const quizItems = selected.map(item => ({
            ...item,
            options: shuffle([item, ...pool.filter(d => d.id !== item.id).slice(0, 3)])
        }));
        setQuestions(quizItems);
        setCurrentIndex(0);
        setScore(0);
        setSelectedId(null);
        setAnswered(false);
        setIsFinished(false);
        setStartTime(Date.now());
        setElapsedTime(0);
        setTimeLeft(SECONDS_PER_QUESTION);
    };

    // Auto-play TTS when question changes
    useEffect(() => {
        if (questions.length === 0 || isFinished) return;
        const q = questions[currentIndex];
        if (q && ttsEnabled) speakText(`${q.meaning} ${q.sound}`);
    }, [currentIndex, questions, isFinished, ttsEnabled]);

    // Timer Logic
    useEffect(() => {
        if (!isFinished && !answered && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !answered) {
            handleAnswer(null); // Timeout
        }

        return () => clearInterval(timerRef.current);
    }, [isFinished, answered, timeLeft]);

    const handleAnswer = (optionId) => {
        if (answered || isFinished) return;

        clearInterval(timerRef.current);
        const q = questions[currentIndex];
        const correct = optionId === q.id;
        setSelectedId(optionId);
        setAnswered(true);

        if (correct) setScore(s => s + 1);

        if (soundEnabled) {
            playSound(correct ? 'success' : 'error');
        }

        setTimeout(() => {
            if (currentIndex + 1 >= QUESTIONS_PER_SESSION) {
                const finalTime = Math.round((Date.now() - startTime) / 1000);
                setElapsedTime(finalTime);
                setIsFinished(true);
                updateQuizScore(score + (correct ? 1 : 0), finalTime);
            } else {
                setCurrentIndex(i => i + 1);
                setSelectedId(null);
                setAnswered(false);
                setTimeLeft(SECONDS_PER_QUESTION);
            }
        }, 1200);
    };

    const playTTS = () => {
        const q = questions[currentIndex];
        if (q) speakText(`${q.meaning} ${q.sound}`);
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
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">받아쓰기 정확도</p>

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

    const q = questions[currentIndex];
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors px-6 pt-8 pb-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition"
                >
                    <ChevronLeft size={24} />
                </button>
                <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                    받아쓰기 {currentIndex + 1} / {QUESTIONS_PER_SESSION}
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
                {/* Question card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={q.id}
                        initial={{ x: 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -60, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 mb-6 text-center"
                    >
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-widest mb-3">뜻과 음을 듣고 한자를 선택하세요</p>
                        <div className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-1">{q.meaning}</div>
                        <div className="text-2xl font-bold text-primary-500 mb-6">{q.sound}</div>
                        <button
                            onClick={playTTS}
                            className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-semibold transition hover:bg-primary-100 dark:hover:bg-primary-900/50"
                        >
                            <Volume2 size={16} /> 다시 듣기
                        </button>
                    </motion.div>
                </AnimatePresence>

                {/* Options */}
                <div className="grid grid-cols-2 gap-3">
                    {q.options.map((opt, idx) => {
                        const isCorrect = opt.id === q.id;
                        const isSelected = opt.id === selectedId;
                        let style = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100';
                        if (answered && isCorrect) style = 'bg-green-500 border-green-600 text-white shadow-lg shadow-green-500/20 scale-105 z-10';
                        else if (answered && isSelected && !isCorrect) style = 'bg-red-500 border-red-600 text-white opacity-90';

                        return (
                            <motion.button
                                key={opt.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                whileTap={!answered ? { scale: 0.95 } : {}}
                                onClick={() => handleAnswer(opt.id)}
                                className={`border-2 rounded-2xl py-5 text-5xl font-hanja font-bold shadow-sm transition-all flex items-center justify-center relative ${style}`}
                            >
                                {opt.hanja}
                                {answered && isCorrect && <CheckCircle2 size={20} className="text-white absolute top-2 right-2" />}
                                {answered && isSelected && !isCorrect && <XCircle size={20} className="text-white absolute top-2 right-2" />}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
