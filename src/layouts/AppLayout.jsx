import React, { useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const NAV_PATHS = ['/', '/study', '/idioms', '/list', '/quiz-hub', '/settings'];

export default function AppLayout() {
    const location = useLocation();
    const prevIdxRef = useRef(NAV_PATHS.indexOf(location.pathname));

    const currentIdx = NAV_PATHS.indexOf(location.pathname);
    const dir = currentIdx >= prevIdxRef.current ? -1 : 1;
    prevIdxRef.current = currentIdx;

    const variants = {
        enter: { opacity: 0, y: 6 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 min-h-screen relative shadow-sm flex flex-col transition-colors duration-300">
                <main className="flex-1 relative overflow-hidden pb-16">
                    <AnimatePresence initial={false} mode="sync">
                        <motion.div
                            key={location.pathname}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                duration: 0.18,
                                ease: 'easeOut',
                            }}
                            className="absolute inset-0 overflow-y-auto hide-scrollbar"
                            style={{ scrollbarGutter: 'stable' }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
                <Navbar />
            </div>
        </div>
    );
}
