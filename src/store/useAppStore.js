import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { achievements } from '../data/achievements';

const useAppStore = create(
    persist(
        (set, get) => ({
            // State
            studyMode: 'single', // 'single' | 'group'
            learnedHanjaIds: [],
            learnedHanjaTimestamps: {}, // SRS tracking: { [id]: timestamp }
            favoriteHanjaIds: [],
            unlockedBadgeIds: [],
            reviewLevels: {}, // SRS: { [id]: level }
            darkMode: false,
            theme: 'light', // 'light' | 'dark' | 'naver'
            soundEnabled: true,
            ttsEnabled: true,
            currentHanjaId: 1,
            quizScores: {
                totalAttempts: 0,
                correctAnswers: 0,
                highScore: 0,
                bestTime: null, // in seconds for 10 q's
                totalPoints: 0
            },
            dailyActivity: {}, // { "YYYY-MM-DD": count }
            streak: {
                count: 0,
                lastActivityDate: null // "YYYY-MM-DD"
            },
            notificationsEnabled: true,
            notificationTime: '09:00', // HH:MM format
            studyRange: '1-500', // '1-500' | '501-1000' | 'all'

            // Actions
            toggleNotifications: () =>
                set((state) => ({
                    notificationsEnabled: !state.notificationsEnabled,
                })),

            setNotificationTime: (time) => set({ notificationTime: time }),

            markLearned: (id) =>
                set((state) => {
                    const isAlreadyLearned = state.learnedHanjaIds.includes(id);
                    if (isAlreadyLearned) return state;

                    const today = new Date().toISOString().split('T')[0];
                    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                    // Update Streak
                    let newStreakCount = state.streak.count;
                    if (state.streak.lastActivityDate === yesterday) {
                        newStreakCount += 1;
                    } else if (state.streak.lastActivityDate !== today) {
                        newStreakCount = 1;
                    }

                    const newState = {
                        learnedHanjaIds: [...state.learnedHanjaIds, id],
                        learnedHanjaTimestamps: {
                            ...state.learnedHanjaTimestamps,
                            [id]: Date.now(),
                        },
                        dailyActivity: {
                            ...state.dailyActivity,
                            [today]: (state.dailyActivity[today] || 0) + 1
                        },
                        streak: {
                            count: newStreakCount,
                            lastActivityDate: today
                        },
                        reviewLevels: {
                            ...state.reviewLevels,
                            [id]: 1
                        }
                    };
                    // Trigger achievement check
                    setTimeout(() => useAppStore.getState().checkAchievements(), 0);
                    return newState;
                }),

            updateQuizScore: (score, timeInSeconds) =>
                set((state) => {
                    const isNewBestTime = !state.quizScores.bestTime || (score === 10 && timeInSeconds < state.quizScores.bestTime);
                    const newState = {
                        quizScores: {
                            ...state.quizScores,
                            totalAttempts: state.quizScores.totalAttempts + 1,
                            correctAnswers: state.quizScores.correctAnswers + score,
                            highScore: Math.max(state.quizScores.highScore, score),
                            bestTime: isNewBestTime ? timeInSeconds : state.quizScores.bestTime,
                            totalPoints: (state.quizScores.totalPoints || 0) + (score * 10) // 10 points per correct answer
                        }
                    };
                    // Trigger achievement check
                    setTimeout(() => useAppStore.getState().checkAchievements(), 0);
                    return newState;
                }),

            addPoints: (points) =>
                set((state) => ({
                    quizScores: {
                        ...state.quizScores,
                        totalPoints: (state.quizScores.totalPoints || 0) + points
                    }
                })),

            unmarkLearned: (id) =>
                set((state) => {
                    const newTimestamps = { ...state.learnedHanjaTimestamps };
                    delete newTimestamps[id];
                    return {
                        learnedHanjaIds: state.learnedHanjaIds.filter((hiddenId) => hiddenId !== id),
                        learnedHanjaTimestamps: newTimestamps,
                    };
                }),

            toggleDarkMode: () =>
                set((state) => {
                    const next = state.theme === 'dark' ? 'light' : 'dark';
                    return { darkMode: next === 'dark', theme: next };
                }),

            setTheme: (theme) => set({ theme, darkMode: theme === 'dark' }),

            toggleSound: () =>
                set((state) => ({
                    soundEnabled: !state.soundEnabled,
                })),

            toggleTts: () =>
                set((state) => ({
                    ttsEnabled: !state.ttsEnabled,
                })),

            toggleFavorite: (id) =>
                set((state) => {
                    const isFavorite = state.favoriteHanjaIds.includes(id);
                    const newState = {
                        favoriteHanjaIds: isFavorite
                            ? state.favoriteHanjaIds.filter((favId) => favId !== id)
                            : [...state.favoriteHanjaIds, id],
                    };
                    // Trigger achievement check
                    setTimeout(() => useAppStore.getState().checkAchievements(), 0);
                    return newState;
                }),

            checkAchievements: () => {
                const state = get();
                const newUnlockedIds = achievements
                    .filter((badge) => !state.unlockedBadgeIds.includes(badge.id) && badge.check(state))
                    .map((badge) => badge.id);

                if (newUnlockedIds.length > 0) {
                    set({
                        unlockedBadgeIds: [...state.unlockedBadgeIds, ...newUnlockedIds],
                    });
                    return achievements.filter((b) => newUnlockedIds.includes(b.id));
                }
                return [];
            },

            setCurrentHanjaId: (id) => set((state) => {
                const range = state.studyRange;
                let clampedId = id;
                if (range === '1-500') clampedId = Math.min(Math.max(id, 1), 500);
                else if (range === '501-1000') clampedId = Math.min(Math.max(id, 501), 1000);
                else clampedId = Math.min(Math.max(id, 1), 1000);
                return { currentHanjaId: clampedId };
            }),

            setStudyRange: (range) => set((state) => {
                let newId = state.currentHanjaId;
                if (range === '501-1000' && newId < 501) newId = 501;
                if (range === '1-500' && newId > 500) newId = 1;
                return { studyRange: range, currentHanjaId: newId };
            }),

            setStudyMode: (mode) => set({ studyMode: mode }),

            markReviewed: (id) =>
                set((state) => {
                    const currentLevel = state.reviewLevels[id] || 1;
                    return {
                        reviewLevels: {
                            ...state.reviewLevels,
                            [id]: Math.min(currentLevel + 1, 5) // Max level 5
                        },
                        learnedHanjaTimestamps: {
                            ...state.learnedHanjaTimestamps,
                            [id]: Date.now()
                        }
                    };
                }),

            getDueHanjaIds: () => {
                const state = get();
                const now = Date.now();
                const intervals = [0, 1, 3, 7, 14, 30]; // level -> days

                return state.learnedHanjaIds.filter(id => {
                    const level = state.reviewLevels[id] || 0;
                    if (level === 0) return false;

                    const lastTimestamp = state.learnedHanjaTimestamps[id];
                    if (!lastTimestamp) return true;

                    const intervalDays = intervals[level] || 30;
                    const nextDueTime = lastTimestamp + (intervalDays * 24 * 60 * 60 * 1000);

                    return now >= nextDueTime;
                });
            },

            resetProgress: () => set({
                learnedHanjaIds: [],
                learnedHanjaTimestamps: {},
                favoriteHanjaIds: [],
                unlockedBadgeIds: [],
                reviewLevels: {},
                currentHanjaId: 1
            }),
        }),
        {
            name: 'chunjamun-storage', // unique name for localStorage key
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);

export default useAppStore;
