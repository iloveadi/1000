import { RefreshCcw, Info, Volume2, VolumeX, Megaphone, MicOff, Bell, BellOff, Palette, Clock } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function Settings() {
    const { theme, setTheme, resetProgress, learnedHanjaIds, soundEnabled, toggleSound, ttsEnabled, toggleTts, notificationsEnabled, toggleNotifications, notificationTime, setNotificationTime } = useAppStore();

    const handleReset = () => {
        if (window.confirm("정말 모든 학습 기록을 초기화하시겠습니까? (이 작업은 되돌릴 수 없습니다.)")) {
            resetProgress();
            alert("학습 진도가 초기화되었습니다.");
        }
    };

    const handleNotificationToggle = () => {
        if (!notificationsEnabled && 'Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    toggleNotifications();
                } else {
                    alert('알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해 주세요.');
                }
            });
        } else {
            toggleNotifications();
        }
    };

    const themes = [
        { id: 'light', label: '라이트', bg: 'bg-slate-100', accent: 'bg-amber-800', ring: 'ring-slate-300' },
        { id: 'dark', label: '다크', bg: 'bg-slate-800', accent: 'bg-amber-700', ring: 'ring-slate-600' },
        { id: 'naver', label: '네이버', bg: 'bg-green-50', accent: 'bg-green-500', ring: 'ring-green-400' },
        { id: 'pink', label: '핑크', bg: 'bg-pink-50', accent: 'bg-pink-400', ring: 'ring-pink-300' },
    ];

    return (
        <div className="px-6 pt-12 pb-24 h-full bg-slate-50 dark:bg-slate-900 naver:bg-green-50 transition-colors duration-300 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 naver:text-green-900 tracking-tight">설정</h1>
            </header>

            <div className="space-y-4">


                {/* Theme Selector */}
                <div className="bg-white dark:bg-slate-800 naver:bg-white p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 naver:border-green-200 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <Palette size={18} className="text-slate-500 dark:text-slate-400 naver:text-green-600" />
                        <span className="text-slate-700 dark:text-slate-200 naver:text-green-900 font-medium">테마</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {themes.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${theme === t.id
                                    ? 'border-primary-500 shadow-md scale-105'
                                    : 'border-transparent bg-slate-50 dark:bg-slate-700 naver:bg-green-50'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center ring-2 ${t.ring}`}>
                                    <div className={`w-4 h-4 rounded-full ${t.accent}`} />
                                </div>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 naver:text-green-800">{t.label}</span>
                                {theme === t.id && <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Other Preferences */}
                <div className="bg-white dark:bg-slate-800 naver:bg-white rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 naver:border-green-200 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 transition-colors">

                    <button
                        onClick={toggleSound}
                        className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-xl transition-colors">
                                {soundEnabled ? <Volume2 className="text-slate-600 dark:text-slate-300" size={20} /> : <VolumeX className="text-slate-600 dark:text-slate-300" size={20} />}
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 naver:text-green-900 font-medium">UI 사운드</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : ''}`} />
                        </div>
                    </button>

                    <button
                        onClick={toggleTts}
                        className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-xl transition-colors">
                                {ttsEnabled ? <Megaphone className="text-slate-600 dark:text-slate-300" size={20} /> : <MicOff className="text-slate-600 dark:text-slate-300" size={20} />}
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 naver:text-green-900 font-medium">음성 읽어주기 (TTS)</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${ttsEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${ttsEnabled ? 'translate-x-6' : ''}`} />
                        </div>
                    </button>


                    <button
                        onClick={handleReset}
                        className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded-xl">
                                <RefreshCcw className="text-red-500 dark:text-red-400" size={20} />
                            </div>
                            <span className="text-red-500 dark:text-red-400 font-medium">학습 기록 초기화</span>
                        </div>
                    </button>

                </div>

            </div>

            <div className="mt-12 text-center text-xs text-slate-400">
                <p>천자문 PWA v1.0</p>
                <p className="mt-1">오프라인에서도 언제든 학습할 수 있습니다.</p>
            </div>

        </div >
    );
}
