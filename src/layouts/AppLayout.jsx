import React, { useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const NAV_PATHS = ['/', '/study', '/idioms', '/list', '/quiz-hub', '/settings'];

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const touchStartX = useRef(null);
    const swipeDir = useRef(0); // -1 = left, 1 = right

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(deltaX) < 60) return;

        const currentIdx = NAV_PATHS.indexOf(location.pathname);
        if (currentIdx === -1) return;

        if (deltaX < 0 && currentIdx < NAV_PATHS.length - 1) {
            swipeDir.current = -1; // going right (next page slides in from right)
            navigate(NAV_PATHS[currentIdx + 1]);
        } else if (deltaX > 0 && currentIdx > 0) {
            swipeDir.current = 1; // going left (prev page slides in from left)
            navigate(NAV_PATHS[currentIdx - 1]);
        }
    };

    const variants = {
        enter: (dir) => ({
            x: dir < 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir) => ({
            x: dir < 0 ? '-100%' : '100%',
            opacity: 0,
        }),
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 min-h-screen relative shadow-sm flex flex-col transition-colors duration-300">
                <main
                    className="flex-1 relative overflow-hidden pb-16"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <AnimatePresence initial={false} custom={swipeDir.current} mode="wait">
                        <motion.div
                            key={location.pathname}
                            custom={swipeDir.current}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: 'tween', ease: [0.25, 0.46, 0.45, 0.94], duration: 0.28 },
                                opacity: { duration: 0.15 },
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
