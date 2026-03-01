import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Home, CheckCircle2, XCircle } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';

const QUESTIONS_PER_SESSION = 10;

export default function Quiz() {
    const navigate = useNavigate();
    const { updateQuizScore } = useAppStore();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Initialize Quiz
    useEffect(() => {
        startNewQuiz();
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
    };

    const handleAnswer = (optionId) => {
        if (answered) return;

        const isCorrect = optionId === questions[currentIndex].id;
        setSelectedId(optionId);
        setAnswered(true);

        if (isCorrect) {
            setScore(s => s + 1);
        }

        setTimeout(() => {
            if (currentIndex < QUESTIONS_PER_SESSION - 1) {
                setCurrentIndex(i => i + 1);
                setSelectedId(null);
                setAnswered(false);
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
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl text-center border border-slate-100 dark:border-slate-700"
                >
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award className="text-primary-600 dark:text-primary-400" size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">테스트 결과</h2>
                    <div className="text-5xl font-black text-primary-600 dark:text-primary-400 mb-2">
                        {score} / {QUESTIONS_PER_SESSION}
                    </div>
                    <div className="flex justify-center space-x-4 mb-6 text-sm font-bold">
                        <span className="text-slate-400">⏱ {elapsedTime}초</span>
                        <span className="text-amber-500">✨ +{score * 10}P</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        {score === QUESTIONS_PER_SESSION ? "완벽해요! 대단한 실력입니다 👏" :
                            score >= 7 ? "훌륭합니다! 조금만 더 하면 완벽해요 👍" :
                                "괜찮아요! 다시 한번 도전해보세요 🌱"}
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={startNewQuiz}
                            className="w-full bg-primary-600 dark:bg-primary-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-primary-700 transition-colors"
                        >
                            <RotateCcw size={20} />
                            <span>다시 도전하기</span>
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-200 transition-colors"
                        >
                            <Home size={20} />
                            <span>홈으로 가기</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const currentItem = questions[currentIndex];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 pt-12 pb-24 flex flex-col">
            <header className="flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 dark:text-slate-400">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1 text-center">
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                        Question {currentIndex + 1} / {QUESTIONS_PER_SESSION}
                    </span>
                    <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-2 overflow-hidden">
                        <motion.div
                            className="h-full bg-primary-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentIndex + 1) / QUESTIONS_PER_SESSION) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="w-10" />
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center"
                >
                    <div className="mb-12">
                        <h1 className="text-[120px] font-hanja font-bold text-slate-800 dark:text-slate-100 leading-none">
                            {currentItem.hanja}
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-4 w-full">
                        {currentItem.options.map(option => {
                            const isCorrect = option.id === currentItem.id;
                            const isSelected = selectedId === option.id;

                            let bgColor = "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700";
                            let textColor = "text-slate-700 dark:text-slate-200";

                            if (answered) {
                                if (isCorrect) {
                                    bgColor = "bg-green-500 border-green-500";
                                    textColor = "text-white";
                                } else if (isSelected) {
                                    bgColor = "bg-red-500 border-red-500";
                                    textColor = "text-white";
                                }
                            }

                            return (
                                <motion.button
                                    key={option.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAnswer(option.id)}
                                    disabled={answered}
                                    className={`
                                        w-full p-5 rounded-2xl border-2 text-lg font-bold transition-all shadow-sm flex items-center justify-between
                                        ${bgColor} ${textColor}
                                    `}
                                >
                                    <span>{option.meaning} {option.sound}</span>
                                    {answered && isCorrect && <CheckCircle2 size={24} className="text-white" />}
                                    {answered && isSelected && !isCorrect && <XCircle size={24} className="text-white" />}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function Award({ className, size }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
    );
}
