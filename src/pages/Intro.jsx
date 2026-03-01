import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FLOATING = ['天', '地', '人', '仁', '義', '禮', '智', '信'];

export default function Intro({ onDone }) {
    const [phase, setPhase] = useState('show');

    useEffect(() => {
        const t = setTimeout(() => {
            setPhase('exit');
            setTimeout(onDone, 800);
        }, 5000);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <div className="fixed inset-0 z-[100]" style={{ background: '#08090d' }}>
            {/* Radial ambient glow */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(200,160,60,0.10) 0%, transparent 70%)',
                }}
            />

            {/* Horizontal ink-wash lines */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 0.04 }}
                    transition={{ duration: 1.4, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
                    className="absolute left-0 right-0"
                    style={{
                        top: `${15 + i * 18}%`,
                        height: '1px',
                        background: 'linear-gradient(to right, transparent 0%, rgba(212,180,100,1) 30%, rgba(212,180,100,1) 70%, transparent 100%)',
                        transformOrigin: 'center',
                    }}
                />
            ))}

            {/* Floating background Hanja */}
            {FLOATING.map((ch, i) => (
                <motion.span
                    key={ch}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.035 + (i % 3) * 0.015 }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.1 }}
                    className="absolute font-hanja font-bold select-none pointer-events-none"
                    style={{
                        color: '#c8a03c',
                        fontSize: `${80 + (i % 4) * 35}px`,
                        left: `${(i * 14 + 3) % 82}%`,
                        top: `${(i * 19 + 5) % 82}%`,
                        letterSpacing: '-0.02em',
                    }}
                >
                    {ch}
                </motion.span>
            ))}

            {/* Center content */}
            <AnimatePresence>
                {phase === 'show' && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.7 }}
                        className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                        {/* Outer glow ring */}
                        <motion.div
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: [0.34, 1.1, 0.64, 1] }}
                            className="relative flex items-center justify-center"
                            style={{ width: 200, height: 200 }}
                        >
                            {/* Rotating outer ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                                className="absolute inset-0 rounded-full"
                                style={{
                                    border: '1px solid rgba(200,160,60,0.25)',
                                }}
                            />
                            {/* Static inner ring */}
                            <div
                                className="absolute rounded-full"
                                style={{
                                    inset: 16,
                                    border: '1px solid rgba(200,160,60,0.15)',
                                }}
                            />
                            {/* Glow blur circle */}
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle, rgba(200,160,60,0.12) 0%, transparent 70%)',
                                    filter: 'blur(10px)',
                                }}
                            />
                            {/* Main Hanja character */}
                            <motion.span
                                initial={{ scale: 0.4, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                                className="font-hanja font-bold select-none relative z-10"
                                style={{
                                    fontSize: '90px',
                                    lineHeight: 1,
                                    color: '#e8c870',
                                    textShadow: '0 0 40px rgba(200,160,60,0.7), 0 0 80px rgba(200,160,60,0.3)',
                                }}
                            >
                                天
                            </motion.span>
                        </motion.div>

                        {/* Diamond divider */}
                        <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="flex items-center gap-3 mt-6"
                        >
                            <div style={{ width: 48, height: 1, background: 'linear-gradient(to right, transparent, rgba(200,160,60,0.6))' }} />
                            <div style={{ width: 5, height: 5, background: '#c8a03c', transform: 'rotate(45deg)', opacity: 0.8 }} />
                            <div style={{ width: 48, height: 1, background: 'linear-gradient(to left, transparent, rgba(200,160,60,0.6))' }} />
                        </motion.div>

                        {/* App name */}
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.85 }}
                            className="text-center mt-5"
                        >
                            <h1
                                className="font-bold tracking-[0.25em]"
                                style={{ fontSize: '22px', color: '#f0e0a0', letterSpacing: '0.25em' }}
                            >
                                천자문 학습
                            </h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.1, duration: 0.5 }}
                                style={{ color: 'rgba(200,160,60,0.55)', fontSize: '11px', letterSpacing: '0.3em', marginTop: '6px' }}
                            >
                                千字文 · 1,000 CHARACTERS
                            </motion.p>
                        </motion.div>

                        {/* Animated progress bar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.3, duration: 0.4 }}
                            className="mt-12 relative"
                            style={{ width: 80, height: 2, background: 'rgba(200,160,60,0.15)', borderRadius: 1 }}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: 1.4, duration: 1.4, ease: 'easeInOut' }}
                                style={{ height: '100%', background: 'rgba(200,160,60,0.8)', borderRadius: 1 }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom credits */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute bottom-8 w-full text-center"
            >
                <p style={{ color: 'rgba(200,160,60,0.6)', fontSize: '10px', letterSpacing: '0.35em' }}>BEAR DEV.</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginTop: '6px' }}>
                    사랑하는 내 딸 <strong style={{ color: '#f472b6', fontWeight: 700 }}>YJ</strong>를 위해 만듦
                </p>
            </motion.div>

            {/* Exit wipe overlay */}
            <AnimatePresence>
                {phase === 'exit' && (
                    <motion.div
                        key="wipe"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
                        className="absolute inset-0"
                        style={{ background: '#08090d' }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
