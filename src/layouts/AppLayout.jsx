import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 min-h-screen relative shadow-sm flex flex-col transition-colors duration-300">
                <main className="flex-1 overflow-y-auto pb-16 hide-scrollbar" style={{ scrollbarGutter: 'stable' }}>
                    <Outlet />
                </main>
                <Navbar />
            </div>
        </div>
    );
}
