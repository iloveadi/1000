import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HANJA_CHARS = ['天', '地', '玄', '黃', '宇', '宙', '洪', '荒'];

export default function Intro({ onDone }) {
    const [phase, setPhase] = useState('in'); // 'in' | 'out'

    useEffect(() => {
        const timer = setTimeout(() => {
            setPhase('out');
            setTimeout(() => {
                onDone();
            }, 700);
        }, 2600);
        return () => clearTimeout(timer);
    }, [onDone]);

    return (
        <AnimatePresence>
            {phase !== 'done' && (
                <motion.div
                    key="intro"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 60%, #1e1b4b 100%)' }}
                >
                    {/* Floating scattered Hanja background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                        {HANJA_CHARS.map((ch, i) => (
                            <motion.span
                                key={ch}
                                initial={{ opacity: 0, scale: 0.5, y: 30 }}
                                animate={{ opacity: 0.07, scale: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
                                className="absolute font-hanja font-bold text-white select-none"
                                style={{
                                    fontSize: `${90 + (i % 3) * 40}px`,
                                    left: `${(i * 13 + 5) % 85}%`,
                                    top: `${(i * 17 + 8) % 80}%`,
                                }}
                            >
                                {ch}
                            </motion.span>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="relative flex flex-col items-center gap-6 px-8">
                        {/* Central hanja */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                            className="font-hanja font-bold text-white leading-none select-none"
                            style={{ fontSize: '120px', textShadow: '0 0 60px rgba(139, 92, 246, 0.6)' }}
                        >
                            天
                        </motion.div>

                        {/* App name */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
                            className="text-center"
                        >
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                천자문 학습
                            </h1>
                            <p className="text-indigo-300 text-sm font-medium mt-1 tracking-widest uppercase">
                                1,000 Hanja Characters
                            </p>
                        </motion.div>

                        {/* Animated dots */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.4 }}
                            className="flex gap-2 mt-2"
                        >
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                                    className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                                />
                            ))}
                        </motion.div>
                    </div>

                    {/* Bottom credit */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        className="absolute bottom-10 text-white text-xs text-center tracking-widest font-medium"
                    >
                        BEAR DEV.
                    </motion.p>

                    {/* Slide-out overlay */}
                    <AnimatePresence>
                        {phase === 'out' && (
                            <motion.div
                                key="slide-out"
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)' }}
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
