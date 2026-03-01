import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, List, Settings, Quote, Gamepad2 } from 'lucide-react';

const navItems = [
    { path: '/', label: '홈', icon: Home },
    { path: '/study', label: '학습', icon: BookOpen },
    { path: '/idioms', label: '문장', icon: Quote },
    { path: '/list', label: '목록', icon: List },
    { path: '/quiz-hub', label: '퀴즈', icon: Gamepad2 },
    { path: '/settings', label: '설정', icon: Settings },
];

export default function Navbar() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-bottom z-50 transition-colors duration-300">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                }`
                            }
                        >
                            <Icon size={23} strokeWidth={2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
