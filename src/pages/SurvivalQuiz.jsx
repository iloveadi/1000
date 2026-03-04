import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Home, Timer, Check, X, Award, Zap } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';
import { playSound } from '../utils/audio';

// Speed Survival: 2 seconds per question. 
// Game ends on first mistake or after 20 questions.
const MAX_QUESTIONS = 20;
const SECONDS_PER_QUESTION = 2;

export default function SurvivalQuiz() {
    const navigate = useNavigate();
    const { soundEnabled, updateQuizScore } = useAppStore();

    const [question, setQuestion] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('playing'); // playing, answered, finished
    const [answeredCorrectly, setAnsweredCorrectly] = useState(null);
    const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
    const timerRef = useRef(null);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        generateQuestion();
        return () => clearInterval(timerRef.current);
    }, []);

    const generateQuestion = () => {
        const isMatch = Math.random() > 0.5;
        const target = chunjamunData[Math.floor(Math.random() * chunjamunData.length)];
        let displayMeaning = target.meaning;
        let displaySound = target.sound;

        if (!isMatch) {
            // Find a distractor
            let distractor;
            do {
                distractor = chunjamunData[Math.floor(Math.random() * chunjamunData.length)];
            } while (distractor.id === target.id);
            displayMeaning = distractor.meaning;
            displaySound = distractor.sound;
        }

        setQuestion({
            hanja: target.hanja,
            meaning: displayMeaning,
            sound: displaySound,
            isMatch
        });
        setTimeLeft(SECONDS_PER_QUESTION);
        setGameState('playing');
        startTimer();
    };

    const startTimer = () => {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0.1) {
                    clearInterval(timerRef.current);
                    handleAnswer(null); // Timeout = Fail
                    return 0;
                }
                return +(prev - 0.1).toFixed(1);
            });
        }, 100);
    };

    const handleAnswer = (userChoice) => {
        if (gameState !== 'playing') return;
        clearInterval(timerRef.current);

        const correct = (userChoice === question.isMatch);
        setAnsweredCorrectly(correct);
        setGameState('answered');

        if (soundEnabled) {
            playSound(correct ? 'success' : 'error');
        }

        if (correct) {
            setScore(s => s + 1);
            setTimeout(() => {
                if (currentIndex + 1 < MAX_QUESTIONS) {
                    setCurrentIndex(i => i + 1);
                    generateQuestion();
                } else {
                    finishGame(true);
                }
            }, 600);
        } else {
            setTimeout(() => {
                finishGame(false);
            }, 1000);
        }
    };

    const finishGame = (perfect) => {
        setGameState('finished');
        const finalTime = Math.round((Date.now() - startTime) / 1000);
        updateQuizScore(score, finalTime);
    };

    if (gameState === 'finished') {
        const pct = Math.round((score / MAX_QUESTIONS) * 100);
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl text-center border border-slate-100 dark:border-slate-700"
                >
                    <div className="text-6xl mb-4">{score >= 15 ? '👑' : score >= 8 ? '🔥' : '🌱'}</div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">서바이벌 종료!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">최종 생존 점수</p>

                    <div className="text-6xl font-black text-primary-600 dark:text-primary-400 mb-1">
                        {score} <span className="text-2xl text-slate-400">/ {MAX_QUESTIONS}</span>
                    </div>

                    <div className="flex justify-center space-x-4 mb-6 text-sm font-bold mt-2">
                        <span className="text-amber-500">✨ +{score * 20}P</span>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm px-2 leading-relaxed">
                        {score === MAX_QUESTIONS ? "이미 당신은 천자문 마스터! 완벽한 서바이벌이었습니다 👏" :
                            score >= 10 ? "대단한 순발력입니다! 다음엔 만점에 도전해보세요 🔥" :
                                "빠른 속도에 당황하셨나요? 다시 한번 도전해보세요! 💪"}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-2xl font-bold transition"
                        >
                            <RotateCcw size={18} />
                            <span>다시 도전</span>
                        </button>
                        <button
                            onClick={() => navigate('/quiz-hub')}
                            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-2xl font-bold transition"
                        >
                            <Home size={18} />
                            <span>목록으로</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!question) return null;

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
                <div className="flex flex-col items-center">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter">Speed Survival</span>
                    <span className="text-slate-800 dark:text-slate-100 font-black text-lg">
                        {currentIndex + 1}번째 한자
                    </span>
                </div>
                <div className="w-10" />
            </div>

            {/* Timer Progress Bar (Full width) */}
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full mb-8 relative overflow-hidden">
                <motion.div
                    className={`h-full transition-colors ${timeLeft <= 0.6 ? 'bg-red-500' : 'bg-primary-500'}`}
                    style={{ width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%` }}
                />
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full relative">
                {/* Survival Score Badge */}
                <div className="absolute -top-12 right-0 flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full font-black text-sm border border-amber-200 dark:border-amber-800">
                    <Zap size={14} className="fill-current" />
                    <span>{score}</span>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className={`
                            bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-2 p-10 mb-10 text-center transition-colors
                            ${gameState === 'answered' && answeredCorrectly ? 'border-green-400 bg-green-50 dark:bg-green-900/10' :
                                gameState === 'answered' && !answeredCorrectly ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-700'}
                        `}
                    >
                        <h1 className="text-[100px] font-hanja font-bold text-slate-800 dark:text-slate-100 leading-none mb-6">
                            {question.hanja}
                        </h1>
                        <div className="space-y-1">
                            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">이 한자의 뜻과 음은?</p>
                            <div className="text-4xl font-black text-slate-800 dark:text-slate-100">
                                {question.meaning} <span className="text-primary-500">{question.sound}</span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-6 pb-10">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAnswer(false)}
                        disabled={gameState !== 'playing'}
                        className={`
                            aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 border-4 text-slate-400 transition-all font-black text-xl
                            ${gameState === 'playing' ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-red-400 hover:text-red-500 active:bg-red-50' :
                                !question.isMatch ? 'bg-green-500 border-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50'}
                        `}
                    >
                        <X size={60} strokeWidth={4} />
                        <span>틀림</span>
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAnswer(true)}
                        disabled={gameState !== 'playing'}
                        className={`
                            aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 border-4 text-slate-400 transition-all font-black text-xl
                            ${gameState === 'playing' ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-400 hover:text-blue-500 active:bg-blue-50' :
                                question.isMatch ? 'bg-green-500 border-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50'}
                        `}
                    >
                        <Check size={60} strokeWidth={4} />
                        <span>맞음</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
