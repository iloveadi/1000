export const achievements = [
    // Progress Based
    {
        id: 'beginner_10',
        name: '천자문의 첫걸음',
        description: '한자 10자를 학습했습니다.',
        icon: 'Sparkles',
        color: 'from-yellow-400 to-orange-500',
        check: (state) => state.learnedHanjaIds.length >= 10
    },
    {
        id: 'apprentice_100',
        name: '한자 수련생',
        description: '한자 100자를 학습했습니다.',
        icon: 'Award',
        color: 'from-blue-400 to-indigo-600',
        check: (state) => state.learnedHanjaIds.length >= 100
    },
    {
        id: 'scholar_500',
        name: '천자문 학사',
        description: '한자 500자를 학습했습니다.',
        icon: 'BookOpen',
        color: 'from-purple-400 to-pink-600',
        check: (state) => state.learnedHanjaIds.length >= 500
    },
    {
        id: 'master_1000',
        name: '천자문 마스터',
        description: '천자문 1000자를 모두 완독했습니다.',
        icon: 'Crown',
        color: 'from-red-500 to-yellow-600',
        check: (state) => state.learnedHanjaIds.length >= 1000
    },

    // Streak Based
    {
        id: 'streak_3',
        name: '작심삼일 탈출',
        description: '3일 연속 학습을 달성했습니다.',
        icon: 'Flame',
        color: 'from-orange-400 to-red-500',
        check: (state) => state.streak.count >= 3
    },
    {
        id: 'streak_7',
        name: '꾸준함의 미덕',
        description: '7일 연속 학습을 달성했습니다.',
        icon: 'Calendar',
        color: 'from-green-400 to-teal-600',
        check: (state) => state.streak.count >= 7
    },

    // Quiz & Points Based
    {
        id: 'high_score',
        name: '만점의 기쁨',
        description: '퀴즈에서 완벽한 점수를 획득했습니다.',
        icon: 'Target',
        color: 'from-cyan-400 to-blue-500',
        check: (state) => state.quizScores.highScore >= 100
    },
    {
        id: 'collector_p',
        name: '포인트 수집가',
        description: '총 1000포인트 이상을 모았습니다.',
        icon: 'Coins',
        color: 'from-amber-300 to-yellow-600',
        check: (state) => state.quizScores.totalPoints >= 1000
    },

    // Social/Activity Based
    {
        id: 'favorite_lover',
        name: '애착 한자',
        description: '즐겨찾기에 한자를 10개 이상 등록했습니다.',
        icon: 'Star',
        color: 'from-pink-400 to-rose-500',
        check: (state) => state.favoriteHanjaIds.length >= 10
    }
];
