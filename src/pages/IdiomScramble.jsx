import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Home, CheckCircle2, Award, ArrowRight } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun';
import groupInterpretations from '../data/groupInterpretations';
import { playSound } from '../utils/audio';

const QUESTIONS_PER_SESSION = 5;

export default function IdiomScramble() {
    const navigate = useNavigate();
    const { soundEnabled, updateQuizScore, studyRange } = useAppStore();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime] = useState(Date.now());

    // Scramble state
    const [choices, setChoices] = useState([]);
    const [selected, setSelected] = useState([]);
    const [gameState, setGameState] = useState('playing'); // playing, answered

    // Prepare idiom groups
    const idiomGroups = useMemo(() => {
        const rangeData = studyRange === 'all' ? chunjamunData :
            (studyRange === '1-500' ? chunjamunData.slice(0, 500) : chunjamunData.slice(500, 1000));
        const groups = [];
        for (let i = 0; i < rangeData.length; i += 4) {
            if (i + 4 <= rangeData.length) {
                groups.push(rangeData.slice(i, i + 4));
            }
        }
        return groups;
    }, [studyRange]);

    useEffect(() => {
        startNewQuiz();
    }, []);

    const startNewQuiz = () => {
        const shuffledGroups = [...idiomGroups].sort(() => 0.5 - Math.random());
        const selectedGroups = shuffledGroups.slice(0, QUESTIONS_PER_SESSION);

        const generated = selectedGroups.map(group => ({
            group,
            scrambled: [...group].sort(() => 0.5 - Math.random()),
            interpretation: groupInterpretations[group[0].id] || "의미 정보가 없습니다."
        }));

        setQuestions(generated);
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
        setupQuestion(generated[0]);
    };

    const setupQuestion = (q) => {
        setChoices(q.scrambled);
        setSelected([]);
        setGameState('playing');
    };

    const handleChoiceClick = (char) => {
        if (gameState !== 'playing' || selected.length >= 4) return;

        // Add to selected, remove from choices
        const newSelected = [...selected, char];
        const choiceIdx = choices.findIndex(c => c.id === char.id);
        const newChoices = [...choices];
        newChoices.splice(choiceIdx, 1);

        setSelected(newSelected);
        setChoices(newChoices);

        if (newSelected.length === 4) {
            checkAnswer(newSelected);
        }
    };

    const handleSelectedClick = (char, idx) => {
        if (gameState !== 'playing') return;

        // Remove from selected, add back to choices
        const newSelected = [...selected];
        newSelected.splice(idx, 1);

        setSelected(newSelected);
        setChoices([...choices, char]);
    };

    const checkAnswer = (finalSelected) => {
        const correctOrder = questions[currentIndex].group;
        const isCorrect = finalSelected.every((char, idx) => char.id === correctOrder[idx].id);

        setGameState('answered');
        if (isCorrect) {
            setScore(s => s + 1);
        }

        if (soundEnabled) {
            playSound(isCorrect ? 'success' : 'error');
        }

        setTimeout(() => {
            if (currentIndex + 1 < QUESTIONS_PER_SESSION) {
                setCurrentIndex(i => i + 1);
                setupQuestion(questions[currentIndex + 1]);
            } else {
                finishGame();
            }
        }, 1500);
    };

    const finishGame = () => {
        setIsFinished(true);
        const finalTime = Math.round((Date.now() - startTime) / 1000);
        updateQuizScore(score * 2, finalTime); // Higher points for scramble
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
                    <div className="text-6xl mb-4">{score >= 4 ? '🧩' : '🏗️'}</div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">조합 완료!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">사자성어 조합 정확도</p>
                    <div className="text-5xl font-black text-primary-600 dark:text-primary-400 mb-6">
                        {score} <span className="text-2xl text-slate-400">/ {QUESTIONS_PER_SESSION}</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={startNewQuiz} className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-2xl font-bold transition"><RotateCcw size={18} /><span>다시 하기</span></button>
                        <button onClick={() => navigate('/quiz-hub')} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 py-3 rounded-2xl font-bold transition"><Home size={18} /><span>목록</span></button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const q = questions[currentIndex];
    const isCorrect = gameState === 'answered' && selected.every((char, idx) => char.id === q.group[idx].id);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors px-6 pt-8 pb-6 relative overflow-hidden">
            <header className="flex justify-between items-center mb-6">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition"><ChevronLeft size={24} /></button>
                <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">사자성어 조합 {currentIndex + 1} / {QUESTIONS_PER_SESSION}</span>
                <div className="w-10" />
            </header>

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-8 text-center">
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">뜻에 맞게 한자를 순서대로 배치하세요</p>
                    <div className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">"{q.interpretation}"</div>
                </div>

                {/* Slots Area */}
                <div className="grid grid-cols-4 gap-3 mb-12">
                    {[0, 1, 2, 3].map(i => {
                        const char = selected[i];
                        return (
                            <motion.button
                                key={`slot-${i}`}
                                onClick={() => char && handleSelectedClick(char, i)}
                                whileTap={char && gameState === 'playing' ? { scale: 0.95 } : {}}
                                className={`
                                    aspect-square rounded-2xl border-2 flex flex-col items-center justify-center relative transition-all
                                    ${!char ? 'bg-slate-100 dark:bg-slate-900 border-dashed border-slate-200 dark:border-slate-800' :
                                        gameState === 'answered' ? (isCorrect ? 'bg-green-500 border-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-red-500 border-red-600 text-white') :
                                            'bg-white dark:bg-slate-800 border-primary-100 dark:border-primary-900 text-slate-800 dark:text-slate-100 shadow-sm'}
                                `}
                            >
                                {char ? (
                                    <>
                                        <span className="text-4xl font-hanja">{char.hanja}</span>
                                        <span className={`text-[10px] font-bold ${gameState === 'answered' ? 'text-white' : 'text-primary-500'}`}>{char.sound}</span>
                                    </>
                                ) : (
                                    <span className="text-slate-300 dark:text-slate-700 font-black text-xl">{i + 1}</span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Choices Area */}
                <div className="flex flex-wrap justify-center gap-4 min-h-[120px]">
                    <AnimatePresence>
                        {choices.map(char => (
                            <motion.button
                                key={char.id}
                                layout
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleChoiceClick(char)}
                                disabled={gameState !== 'playing'}
                                className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-md flex flex-col items-center justify-center text-slate-800 dark:text-slate-100"
                            >
                                <span className="text-3xl font-hanja">{char.hanja}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{char.sound}</span>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Hint if wrong */}
            {gameState === 'answered' && !isCorrect && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-10 left-6 right-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-2xl flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-red-600 dark:text-red-400 font-bold text-xs mb-1">정답:</p>
                        <div className="flex gap-1">
                            {q.group.map(c => <span key={c.id} className="text-xl font-hanja font-bold text-red-700 dark:text-red-300">{c.hanja}</span>)}
                        </div>
                    </div>
                    <ArrowRight className="text-red-400" size={20} />
                </motion.div>
            )}
        </div>
    );
}
