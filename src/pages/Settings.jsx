import React, { useState } from 'react';
import { RefreshCcw, Info, Volume2, VolumeX, Megaphone, MicOff, Palette, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../store/useAppStore';

export default function Settings() {
    const { theme, setTheme, resetProgress, soundEnabled, toggleSound, ttsEnabled, toggleTts } = useAppStore();
    const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

    const handleReset = () => {
        if (window.confirm("정말 모든 학습 기록을 초기화하시겠습니까? (이 작업은 되돌릴 수 없습니다.)")) {
            resetProgress();
            alert("학습 진도가 초기화되었습니다.");
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

                {/* Dedication */}
                <div className="bg-pink-50 dark:bg-pink-900/10 naver:bg-pink-50 rounded-2xl border border-pink-100 dark:border-pink-900/30 naver:border-pink-200 p-4 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        사랑하는 내 딸 <strong className="font-bold text-pink-500">YJ</strong>를 위해 만듦 🩷
                    </p>
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

                {/* Information Options */}
                <div className="bg-white dark:bg-slate-800 naver:bg-white rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 naver:border-green-200 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 transition-colors mt-6">
                    <button
                        onClick={() => setShowPrivacyPolicy(true)}
                        className="w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-xl transition-colors">
                                <Info className="text-slate-600 dark:text-slate-300" size={20} />
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 naver:text-green-900 font-medium">개인정보처리방침</span>
                        </div>
                    </button>
                </div>

            </div>

            <div className="mt-12 text-center text-xs text-slate-400">
                <p>천자문 학습 v1.0</p>
                <p className="mt-1">오프라인에서도 언제든 학습할 수 있습니다.</p>
                <p className="mt-3 font-medium text-slate-300 dark:text-slate-500">&copy; 2026 Bear Dev.</p>
            </div>

            {/* Privacy Policy Modal */}
            <AnimatePresence>
                {showPrivacyPolicy && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPrivacyPolicy(false)}
                            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-slate-800 naver:bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full max-h-[85vh] overflow-y-auto z-10 border border-slate-100 dark:border-slate-700 naver:border-green-200"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 naver:text-green-900">개인정보처리방침</h2>
                                <button
                                    onClick={() => setShowPrivacyPolicy(false)}
                                    className="p-2 -mr-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 naver:text-green-800 leading-relaxed">
                                <p>
                                    <strong>천자문 학습</strong> (이하 "본 애플리케이션")은 사용자의 사생활 및 개인정보 보호를 매우 중요하게 생각합니다.
                                </p>
                                <p>
                                    <strong>1. 개인정보 수집 및 이용</strong><br />
                                    본 애플리케이션은 회원가입, 로그인 등 사용자를 식별할 수 있는 어떠한 개인정보(이름, 이메일, 전화번호, 위치 정보 등)도 <strong>수집, 저장, 가공, 또는 외부 서버로 전송하지 않습니다.</strong>
                                </p>
                                <p>
                                    <strong>2. 데이터 보관 (로컬 스토리지)</strong><br />
                                    학습 진도, 통계, 앱 설정(테마, 사운드 등)과 같은 모든 데이터는 전적으로 사용자의 스마트폰 또는 브라우저 내부(Local Storage)에만 안전하게 보관됩니다. 앱을 삭제하거나 브라우저 캐시를 지우면 해당 데이터는 영구적으로 삭제됩니다.
                                </p>
                                <p>
                                    <strong>3. 제3자 제공 및 위탁</strong><br />
                                    수집하는 개인정보가 없으므로 제3자에게 제공하거나 처리를 위탁하는 일도 발생하지 않습니다.
                                </p>
                                <p>
                                    <strong>4. 문의사항</strong><br />
                                    개인정보처리방침과 관련된 문의사항이 있으실 경우, 아래 이메일로 연락해 주시기 바랍니다.<br />
                                    <a href="mailto:iloveadi@gmail.com" className="text-primary-500 underline">iloveadi@gmail.com</a>
                                </p>
                            </div>

                            <button
                                onClick={() => setShowPrivacyPolicy(false)}
                                className="mt-8 w-full bg-slate-100 dark:bg-slate-700 naver:bg-green-100 text-slate-700 dark:text-slate-100 naver:text-green-800 font-bold py-3 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                            >
                                확인했습니다
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div >
    );
}
