import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import chunjamunData from '../data/chunjamun.json';
import groupInterpretations from '../data/groupInterpretations';
import { playSound } from '../utils/audio';

export default function IdiomQuiz() {
    const navigate = useNavigate();
    const { soundEnabled } = useAppStore();

    const [currentPattern, setCurrentPattern] = useState(null);
    const [options, setOptions] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [gameState, setGameState] = useState('playing'); // playing, answered, finished

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

    const generateQuestion = () => {
        // Pick a random group
        const groupIndex = Math.floor(Math.random() * idiomGroups.length);
        const group = idiomGroups[groupIndex];

        // Pick which of the 4 characters to hide
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

        // Shuffle options
        newOptions.sort(() => Math.random() - 0.5);

        setCurrentPattern({
            group,
            hiddenIndex,
            targetCharacter,
            interpretation: groupInterpretations[group[0].id] || "해석이 등록되지 않은 구절입니다.",
        });
        setOptions(newOptions);
        setSelectedId(null);
        setIsCorrect(null);
        setGameState('playing');
    };

    useEffect(() => {
        generateQuestion();
    }, []);

    const handleOptionSelect = (option) => {
        if (gameState !== 'playing') return;

        setSelectedId(option.id);
        const correct = option.id === currentPattern.targetCharacter.id;
        setIsCorrect(correct);
        setGameState('answered');

        setScore(prev => ({
            correct: prev.correct + (correct ? 1 : 0),
            total: prev.total + 1
        }));

        if (soundEnabled) {
            playSound(correct ? 'success' : 'error');
        }
    };

    if (!currentPattern) return null;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden px-6 pt-12 pb-6">
            {/* Header */}
            <div className="flex flex-col mb-8 gap-4">
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold text-sm">점수</span>
                        <span className="font-bold text-primary-600 dark:text-primary-400 text-lg">
                            {score.correct} <span className="text-slate-300 dark:text-slate-600 font-normal">/ {score.total}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Quiz Area */}
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">

                {/* Question Info */}
                <motion.div
                    key={`q-${score.total}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-primary-200 dark:border-primary-800">
                        <BrainCircuit size={14} /> 사자성어 빈칸 채우기
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium text-lg leading-relaxed px-4">
                        다음 뜻을 가진 구절을 완성해 보세요.
                    </p>
                    <p className="text-primary-600 dark:text-primary-400 font-bold mt-2 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        "{currentPattern.interpretation}"
                    </p>
                </motion.div>

                {/* Idiom Display */}
                <div className="grid grid-cols-4 gap-3 mb-10">
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
                                        aspect-square rounded-2xl flex flex-col items-center justify-center relative
                                        ${isHidden && !showAnswer ? 'bg-slate-200 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600' : 'bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700'}
                                        ${showAnswer && isCorrect ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' : ''}
                                        ${showAnswer && !isCorrect ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' : ''}
                                    `}
                                >
                                    {(!isHidden || showAnswer) ? (
                                        <>
                                            <span className={`text-4xl font-hanja mb-1 ${showAnswer ? (isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 'text-slate-800 dark:text-slate-100'}`}>
                                                {char.hanja}
                                            </span>
                                            {(showAnswer || gameState === 'answered') && (
                                                <span className="text-[10px] font-medium text-slate-500">{char.sound}</span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-3xl text-slate-400 font-bold opacity-50">?</span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

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
                                    relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[100px]
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
                                            <div className="bg-white rounded-full"><CheckCircle2 className="text-green-500" size={28} /></div> :
                                            <div className="bg-white rounded-full"><XCircle className="text-red-500" size={28} /></div>
                                        }
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Floating Next Button */}
                <AnimatePresence>
                    {gameState === 'answered' && (
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-center w-full px-6"
                        >
                            <button
                                onClick={generateQuestion}
                                className="flex items-center gap-2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform"
                            >
                                다음 문제 풀기 <RotateCcw size={18} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
