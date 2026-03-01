import React, { useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NAV_PATHS = ['/', '/study', '/idioms', '/list', '/settings'];

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const touchStartX = useRef(null);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(deltaX) < 60) return; // minimum swipe distance

        const currentIdx = NAV_PATHS.indexOf(location.pathname);
        if (currentIdx === -1) return;

        if (deltaX < 0 && currentIdx < NAV_PATHS.length - 1) {
            // Swipe left → next page
            navigate(NAV_PATHS[currentIdx + 1]);
        } else if (deltaX > 0 && currentIdx > 0) {
            // Swipe right → previous page
            navigate(NAV_PATHS[currentIdx - 1]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 min-h-screen relative shadow-sm flex flex-col transition-colors duration-300">
                <main
                    className="flex-1 overflow-y-auto pb-16 hide-scrollbar"
                    style={{ scrollbarGutter: 'stable' }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <Outlet />
                </main>
                <Navbar />
            </div>
        </div>
    );
}
