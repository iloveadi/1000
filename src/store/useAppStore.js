import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAppStore = create(
    persist(
        (set) => ({
            // State
            studyMode: 'single', // 'single' | 'group'
            learnedHanjaIds: [],
            learnedHanjaTimestamps: {}, // SRS tracking: { [id]: timestamp }
            favorites: [], // Bookmarked hanja IDs
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

            // Actions
            toggleNotifications: () =>
                set((state) => ({
                    notificationsEnabled: !state.notificationsEnabled,
                })),

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

                    return {
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
                        }
                    };
                }),

            updateQuizScore: (score, timeInSeconds) =>
                set((state) => {
                    const isNewBestTime = !state.quizScores.bestTime || (score === 10 && timeInSeconds < state.quizScores.bestTime);
                    return {
                        quizScores: {
                            ...state.quizScores,
                            totalAttempts: state.quizScores.totalAttempts + 1,
                            correctAnswers: state.quizScores.correctAnswers + score,
                            highScore: Math.max(state.quizScores.highScore, score),
                            bestTime: isNewBestTime ? timeInSeconds : state.quizScores.bestTime,
                            totalPoints: (state.quizScores.totalPoints || 0) + (score * 10) // 10 points per correct answer
                        }
                    };
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

            toggleFavorite: (id) =>
                set((state) => ({
                    favorites: state.favorites.includes(id)
                        ? state.favorites.filter((favId) => favId !== id)
                        : [...state.favorites, id],
                })),

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

            setCurrentHanjaId: (id) => set({ currentHanjaId: id }),

            setStudyMode: (mode) => set({ studyMode: mode }),

            resetProgress: () => set({ learnedHanjaIds: [], learnedHanjaTimestamps: {}, favorites: [], currentHanjaId: 1 }),
        }),
        {
            name: 'chunjamun-storage', // unique name for localStorage key
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);

export default useAppStore;
