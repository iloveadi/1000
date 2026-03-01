import React from 'react';
import { motion } from 'framer-motion';

export default function ActivityHeatmap({ dailyActivity }) {
    // Generate dates for the last 12 weeks (84 days)
    const weeks = 12;
    const daysPerWeek = 7;
    const totalDays = weeks * daysPerWeek;

    const today = new Date();
    const dates = Array.from({ length: totalDays }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (totalDays - 1 - i));
        return d.toISOString().split('T')[0];
    });

    // Group dates into weeks
    const weekData = [];
    for (let i = 0; i < weeks; i++) {
        weekData.push(dates.slice(i * daysPerWeek, (i + 1) * daysPerWeek));
    }

    const getColor = (count) => {
        if (!count) return 'bg-slate-100 dark:bg-slate-800';
        if (count < 5) return 'bg-primary-200 dark:bg-primary-900/60';
        if (count < 15) return 'bg-primary-300 dark:bg-primary-700/80';
        if (count < 30) return 'bg-primary-500 dark:bg-primary-500';
        return 'bg-primary-700 dark:bg-primary-400';
    };

    return (
        <div className="flex flex-col">
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-2">
                {weekData.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1.5">
                        {week.map((date) => {
                            const count = dailyActivity[date] || 0;
                            return (
                                <motion.div
                                    key={date}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: (wIdx * 7 + new Date(date).getDay()) * 0.005 }}
                                    className={`w-3.5 h-3.5 rounded-sm ${getColor(count)} transition-colors duration-500`}
                                    title={`${date}: ${count} characters`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 px-1">
                <span>{weeks}주 전</span>
                <div className="flex items-center space-x-1">
                    <span>적음</span>
                    <div className="flex space-x-1">
                        <div className="w-2.5 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-px" />
                        <div className="w-2.5 h-2.5 bg-primary-200 dark:bg-primary-900/60 rounded-px" />
                        <div className="w-2.5 h-2.5 bg-primary-500 dark:bg-primary-500 rounded-px" />
                        <div className="w-2.5 h-2.5 bg-primary-700 dark:bg-primary-400 rounded-px" />
                    </div>
                    <span>많음</span>
                </div>
                <span>오늘</span>
            </div>
        </div>
    );
}
