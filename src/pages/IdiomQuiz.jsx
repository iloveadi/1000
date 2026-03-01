import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle2, XCircle, RotateCcw, BrainCircuit, Award, Home, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';
import groupInterpretations from '../data/groupInterpretations';
import { playSound } from '../utils/audio';

const QUESTIONS_PER_SESSION = 10;
const SECONDS_PER_QUESTION = 10;

export default function IdiomQuiz() {
    const navigate = useNavigate();
    const { soundEnabled, updateQuizScore } = useAppStore();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState([]);

    const [selectedId, setSelectedId] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('playing'); // playing, answered, finished

    // Timer & Session state
    const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    // Prepare idiom groups (arrays of 4 characters)
    const idiomGroups = useMemo(() => {
        const groups = [];
        for (let i = 0; i < chunjamunData.length; i += 4) {
            if (i + 4 <= chunjamunData.length) {
                groups.push(chunjamunData.slice(i, i + 4));
            }
        }
        return groups;
    }, []);

    const startNewQuiz = () => {
        // Select 10 random groups
        const shuffledGroups = [...idiomGroups].sort(() => 0.5 - Math.random());
        const selectedGroups = shuffledGroups.slice(0, QUESTIONS_PER_SESSION);

        const generatedQuestions = selectedGroups.map(group => {
            const hiddenIndex = Math.floor(Math.random() * 4);
            const targetCharacter = group[hiddenIndex];

            // Generate options (1 correct, 3 wrong)
            const newOptions = [targetCharacter];
            while (newOptions.length < 4) {
                const randomChar = chunjamunData[Math.floor(Math.random() * chunjamunData.length)];
                if (!newOptions.find(o => o.id === randomChar.id) && !group.find(g => g.id === randomChar.id)) {
                    newOptions.push(randomChar);
                }
            }
            newOptions.sort(() => Math.random() - 0.5);

            return {
                group,
                hiddenIndex,
                targetCharacter,
                options: newOptions,
                interpretation: groupInterpretations[group[0].id] || "해석이 등록되지 않은 구절입니다.",
            };
        });

        setQuestions(generatedQuestions);
        setCurrentIndex(0);
        setScore(0);
        setGameState('playing');
        setStartTime(Date.now());
        setElapsedTime(0);
        setupQuestion(generatedQuestions[0]);
    };

    const setupQuestion = (question) => {
        setOptions(question.options);
        setSelectedId(null);
        setIsCorrect(null);
        setTimeLeft(SECONDS_PER_QUESTION);
        setGameState('playing');
    };

    useEffect(() => {
        startNewQuiz();
        return () => clearInterval(timerRef.current);
    }, []);

    // Timer Logic
    useEffect(() => {
        if (gameState === 'playing' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (gameState === 'playing' && timeLeft === 0) {
            handleTimeout();
        }

        return () => clearInterval(timerRef.current);
    }, [gameState, timeLeft]);

    const handleTimeout = () => {
        setSelectedId(null);
        setIsCorrect(false);
        setGameState('answered');
        if (soundEnabled) playSound('error');
        scheduleNext();
    };


    const handleOptionSelect = (option) => {
        if (gameState !== 'playing') return;

        clearInterval(timerRef.current);
        const question = questions[currentIndex];

        setSelectedId(option.id);
        const correct = option.id === question.targetCharacter.id;
        setIsCorrect(correct);
        setGameState('answered');

        if (correct) {
            setScore(s => s + 1);
        }

        if (soundEnabled) {
            playSound(correct ? 'success' : 'error');
        }

        scheduleNext();
    };

    const scheduleNext = () => {
        setTimeout(() => {
            if (currentIndex < QUESTIONS_PER_SESSION - 1) {
                setCurrentIndex(i => i + 1);
                setupQuestion(questions[currentIndex + 1]);
            } else {
                const finalTime = Math.round((Date.now() - startTime) / 1000);
                setElapsedTime(finalTime);
                setGameState('finished');
                updateQuizScore(score + (isCorrect ? 1 : 0), finalTime);
            }
        }, 1200);
    };

    if (questions.length === 0) return null;

    if (gameState === 'finished') {
        const pct = Math.round((score / QUESTIONS_PER_SESSION) * 100);
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-6 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl text-center border border-slate-100 dark:border-slate-700"
                >
                    <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '📖' : '💪'}</div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">퀴즈 완료!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">사자성어 정확도</p>

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

    const currentPattern = questions[currentIndex];

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
                    사자성어 {currentIndex + 1} / {QUESTIONS_PER_SESSION}
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

            {/* Quiz Area */}
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`q-${currentIndex}`}
                        initial={{ x: 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -60, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 mb-6 text-center"
                    >
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-widest mb-4">뜻을 보고 빈칸에 알맞은 한자를 골라보세요</p>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8 leading-tight">
                            "{currentPattern.interpretation}"
                        </div>

                        {/* Idiom Display inside Card */}
                        <div className="grid grid-cols-4 gap-2 px-2">
                            <AnimatePresence mode="popLayout">
                                {currentPattern.group.map((char, index) => {
                                    const isHidden = index === currentPattern.hiddenIndex;
                                    const showAnswer = isHidden && gameState === 'answered';

                                    return (
                                        <motion.div
                                            key={`pos-${index}-${showAnswer ? 'ans' : 'q'}`}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className={`
                                                aspect-square rounded-xl flex flex-col items-center justify-center relative border transition-colors
                                                ${isHidden && !showAnswer ?
                                                    'bg-slate-50 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-700' :
                                                    'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}
                                                ${showAnswer && isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : ''}
                                                ${showAnswer && !isCorrect ? 'bg-red-50 dark:bg-red-900/20 border-red-200' : ''}
                                            `}
                                        >
                                            {(!isHidden || showAnswer) ? (
                                                <>
                                                    <span className={`text-4xl font-hanja ${showAnswer ? (isCorrect ? 'text-green-600' : 'text-red-600') : 'text-slate-800 dark:text-slate-100'}`}>
                                                        {char.hanja}
                                                    </span>
                                                    {(showAnswer || gameState === 'answered') && (
                                                        <span className="text-[9px] font-medium text-slate-400 -mt-1">{char.sound}</span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-2xl text-slate-300 font-bold opacity-50">?</span>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {options.map((option, idx) => {
                        const isSelected = selectedId === option.id;
                        const isTarget = option.id === currentPattern.targetCharacter.id;

                        let btnStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-slate-700";

                        if (gameState === 'answered') {
                            if (isSelected && isCorrect) btnStyle = "bg-green-500 border-green-600 text-white shadow-lg shadow-green-500/30 scale-105 z-10";
                            else if (isSelected && !isCorrect) btnStyle = "bg-red-50 dark:bg-red-900/40 border-red-500 text-red-600 dark:text-red-400 opacity-70";
                            else if (isTarget && !isCorrect) btnStyle = "bg-green-50 dark:bg-green-900/40 border-green-500 text-green-600 dark:text-green-400 border-2";
                            else btnStyle = "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 opacity-50";
                        }

                        return (
                            <motion.button
                                key={option.id}
                                disabled={gameState !== 'playing'}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileTap={gameState === 'playing' ? { scale: 0.95 } : {}}
                                onClick={() => handleOptionSelect(option)}
                                className={`
                                    relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[110px]
                                    ${btnStyle}
                                `}
                            >
                                <span className="text-4xl font-hanja mb-2">{option.hanja}</span>
                                <span className={`text-sm font-medium ${isSelected && isCorrect ? 'text-green-100' : 'opacity-80'}`}>
                                    {option.meaning} {option.sound}
                                </span>

                                {gameState === 'answered' && isSelected && (
                                    <div className="absolute -top-3 -right-3">
                                        {isCorrect ?
                                            <div className="bg-white rounded-full p-0.5 shadow-sm overflow-hidden"><CheckCircle2 className="text-green-500" size={28} /></div> :
                                            <div className="bg-white rounded-full p-0.5 shadow-sm overflow-hidden"><XCircle className="text-red-500" size={28} /></div>
                                        }
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
