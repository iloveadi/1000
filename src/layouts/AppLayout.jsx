import React, { useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Sparkles, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import useAppStore from '../store/useAppStore';
import { achievements } from '../data/achievements';

const NAV_PATHS = ['/', '/study', '/idioms', '/list', '/quiz-hub', '/settings'];

export default function AppLayout() {
    const location = useLocation();
    const currentIdx = NAV_PATHS.indexOf(location.pathname) !== -1 ? NAV_PATHS.indexOf(location.pathname) : 0;

    // Compute dir synchronously during render
    const prevIdxRef = useRef(currentIdx);
    const dirRef = useRef(1);

    if (currentIdx !== prevIdxRef.current) {
        dirRef.current = currentIdx > prevIdxRef.current ? 1 : -1;
        prevIdxRef.current = currentIdx;
    }

    const dir = dirRef.current;

    const [newBadge, setNewBadge] = React.useState(null);

    // Subscribe to store for new badges
    React.useEffect(() => {
        const unsubscribe = useAppStore.subscribe(
            (state) => state.unlockedBadgeIds,
            (newIds, oldIds) => {
                if (newIds.length > oldIds.length) {
                    const latestId = newIds[newIds.length - 1];
                    const badge = achievements.find(b => b.id === latestId);
                    if (badge) {
                        setNewBadge(badge);
                        setTimeout(() => setNewBadge(null), 5000);
                    }
                }
            }
        );
        return unsubscribe;
    }, []);

    const variants = {
        enter: (direction) => ({
            opacity: 0,
            x: direction > 0 ? '100%' : '-100%',
        }),
        center: {
            opacity: 1,
            x: 0,
        },
        exit: (direction) => ({
            opacity: 0,
            x: direction > 0 ? '-100%' : '100%',
        }),
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 min-h-screen relative shadow-sm flex flex-col transition-colors duration-300">
                <main className="flex-1 relative w-full h-full overflow-hidden pb-16 bg-slate-50 dark:bg-slate-950">
                    <AnimatePresence initial={false} mode="popLayout" custom={dir}>
                        <motion.div
                            key={location.pathname}
                            custom={dir}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                duration: 0.25,
                                ease: 'easeOut',
                            }}
                            className="absolute inset-x-0 top-0 bottom-16 overflow-y-auto hide-scrollbar bg-slate-50 dark:bg-slate-950"
                            style={{ scrollbarGutter: 'stable', willChange: 'transform, opacity' }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
                <Navbar />

                {/* Achievement Toast */}
                <AnimatePresence>
                    {newBadge && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50 pointer-events-none"
                        >
                            <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 p-4 rounded-2xl shadow-2xl border border-white/10 dark:border-slate-800/10 flex items-center space-x-4 pointer-events-auto">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${newBadge.color} shadow-lg shrink-0`}>
                                    <Award size={24} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-1 mb-0.5">
                                        <Sparkles size={12} className="text-amber-400" />
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Achievement Unlocked!</p>
                                    </div>
                                    <p className="font-bold text-sm truncate">{newBadge.name}</p>
                                    <p className="text-[10px] opacity-70 truncate">{newBadge.description}</p>
                                </div>
                                <button
                                    onClick={() => setNewBadge(null)}
                                    className="p-1 hover:bg-white/10 dark:hover:bg-black/5 rounded-full"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
