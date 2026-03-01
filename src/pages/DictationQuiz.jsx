import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw, Home, ChevronLeft } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';
import { speakText } from '../utils/tts';

const QUESTIONS_PER_SESSION = 10;

function shuffle(arr) {
    return [...arr].sort(() => 0.5 - Math.random());
}

export default function DictationQuiz() {
    const navigate = useNavigate();
    const { ttsEnabled, updateQuizScore } = useAppStore();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => { startNewQuiz(); }, []);

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
    };

    // Auto-play TTS when question changes
    useEffect(() => {
        if (questions.length === 0 || isFinished) return;
        const q = questions[currentIndex];
        if (q) speakText(`${q.meaning} ${q.sound}`);
    }, [currentIndex, questions, isFinished]);

    useEffect(() => {
        if (!isFinished || !startTime) return;
        setElapsedTime(Math.round((Date.now() - startTime) / 1000));
    }, [isFinished]);

    const handleAnswer = (optionId) => {
        if (answered) return;
        const correct = optionId === questions[currentIndex].id;
        setSelectedId(optionId);
        setAnswered(true);
        if (correct) setScore(s => s + 1);

        setTimeout(() => {
            if (currentIndex + 1 >= QUESTIONS_PER_SESSION) {
                setIsFinished(true);
                updateQuizScore(score + (correct ? 1 : 0), Math.round((Date.now() - startTime) / 1000));
            } else {
                setCurrentIndex(i => i + 1);
                setSelectedId(null);
                setAnswered(false);
            }
        }, 1000);
    };

    const playTTS = () => {
        const q = questions[currentIndex];
        if (q) speakText(`${q.meaning} ${q.sound}`);
    };

    if (questions.length === 0) return null;

    if (isFinished) {
        const pct = Math.round((score / QUESTIONS_PER_SESSION) * 100);
        return (
            <div className="flex flex-col h-full items-center justify-center px-6 bg-slate-50 dark:bg-slate-900 transition-colors">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 w-full max-w-sm text-center border border-slate-100 dark:border-slate-700">
                    <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '📖' : '💪'}</div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">퀴즈 완료!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">받아쓰기 정확도</p>
                    <div className="text-5xl font-black text-primary-600 dark:text-primary-400 mb-1">{score}<span className="text-2xl text-slate-400"> / {QUESTIONS_PER_SESSION}</span></div>
                    <div className="text-slate-500 text-sm mt-1 mb-6">소요 시간: {elapsedTime}초</div>
                    <div className="flex gap-3">
                        <button onClick={startNewQuiz} className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-2xl font-bold transition">
                            <RotateCcw size={18} /> 다시 하기
                        </button>
                        <button onClick={() => navigate('/')} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-2xl font-bold transition">
                            <Home size={18} /> 홈
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const q = questions[currentIndex];
    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors px-6 pt-12 pb-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-500 dark:text-slate-400">
                    <ChevronLeft size={24} />
                </button>
                <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                    받아쓰기 {currentIndex + 1} / {QUESTIONS_PER_SESSION}
                </span>
                <span className="text-primary-600 dark:text-primary-400 font-bold">{score}점</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mb-8">
                <motion.div className="h-1.5 bg-primary-500 rounded-full" animate={{ width: `${((currentIndex) / QUESTIONS_PER_SESSION) * 100}%` }} transition={{ duration: 0.4 }} />
            </div>

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
                {q.options.map(opt => {
                    const isCorrect = opt.id === q.id;
                    const isSelected = opt.id === selectedId;
                    let style = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100';
                    if (answered && isCorrect) style = 'bg-green-50 dark:bg-green-900/30 border-green-400 text-green-700 dark:text-green-300 scale-105';
                    else if (answered && isSelected && !isCorrect) style = 'bg-red-50 dark:bg-red-900/30 border-red-400 text-red-600 dark:text-red-400';
                    return (
                        <motion.button
                            key={opt.id}
                            whileTap={!answered ? { scale: 0.95 } : {}}
                            onClick={() => handleAnswer(opt.id)}
                            className={`border-2 rounded-2xl py-5 text-5xl font-hanja font-bold shadow-sm transition-all ${style}`}
                        >
                            {opt.hanja}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
