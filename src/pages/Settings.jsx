import { RefreshCcw, Moon, Sun, Info, Volume2, VolumeX, Megaphone, MicOff, Bell, BellOff } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export default function Settings() {
    const { darkMode, toggleDarkMode, resetProgress, learnedHanjaIds, soundEnabled, toggleSound, ttsEnabled, toggleTts, notificationsEnabled, toggleNotifications } = useAppStore();

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

    return (
        <div className="px-6 pt-12 pb-24 h-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">설정</h1>
            </header>

            <div className="space-y-4">

                {/* Progress Info */}
                <section className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-50 dark:bg-primary-900/40 p-2 rounded-xl">
                            <Info className="text-primary-600 dark:text-primary-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-slate-700 dark:text-slate-200 font-semibold">현재 학습 현황</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{learnedHanjaIds.length}자 마스터 완료</p>
                        </div>
                    </div>
                </section>

                {/* Preferences */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 transition-colors">

                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-xl transition-colors">
                                {darkMode ? <Moon className="text-slate-600 dark:text-slate-300" size={20} /> : <Sun className="text-slate-600 dark:text-slate-300" size={20} />}
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">다크 모드</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : ''}`} />
                        </div>
                    </button>

                    <button
                        onClick={toggleSound}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-xl transition-colors">
                                {soundEnabled ? <Volume2 className="text-slate-600 dark:text-slate-300" size={20} /> : <VolumeX className="text-slate-600 dark:text-slate-300" size={20} />}
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">UI 사운드</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : ''}`} />
                        </div>
                    </button>

                    <button
                        onClick={toggleTts}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-xl transition-colors">
                                {ttsEnabled ? <Megaphone className="text-slate-600 dark:text-slate-300" size={20} /> : <MicOff className="text-slate-600 dark:text-slate-300" size={20} />}
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">음성 읽어주기 (TTS)</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${ttsEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${ttsEnabled ? 'translate-x-6' : ''}`} />
                        </div>
                    </button>

                    <button
                        onClick={handleNotificationToggle}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-xl transition-colors">
                                {notificationsEnabled ? <Bell className="text-slate-600 dark:text-slate-300" size={20} /> : <BellOff className="text-slate-600 dark:text-slate-300" size={20} />}
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">학습 알림</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : ''}`} />
                        </div>
                    </button>

                    <button
                        onClick={handleReset}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
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

        </div>
    );
}
