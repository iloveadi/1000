import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import Study from './pages/Study';
import List from './pages/List';
import Idioms from './pages/Idioms';
import IdiomStudy from './pages/IdiomStudy';
import Quiz from './pages/Quiz';
import Stats from './pages/Stats';
import Radicals from './pages/Radicals';
import Settings from './pages/Settings';
import DictationQuiz from './pages/DictationQuiz';
import QuizHub from './pages/QuizHub';
import useAppStore from './store/useAppStore';

function App() {
  const { theme, notificationsEnabled, notificationTime } = useAppStore();

  useEffect(() => {
    const el = document.documentElement;
    el.classList.remove('dark', 'naver', 'pink');
    if (theme === 'dark') el.classList.add('dark');
    if (theme === 'naver') el.classList.add('naver');
    if (theme === 'pink') el.classList.add('pink');
  }, [theme]);

  useEffect(() => {
    if (!notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;

    const scheduleNotification = () => {
      const [h, m] = notificationTime.split(':').map(Number);
      const now = new Date();
      const next = new Date();
      next.setHours(h, m, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1); // if time already passed today, schedule tomorrow
      const msUntil = next - now;

      const timer = setTimeout(() => {
        new Notification('천자문 학습 시간이에요! 📖', {
          body: '오늘의 한자 학습을 시작해볼까요?',
          icon: '/pwa-192x192.png',
        });
        scheduleNotification(); // reschedule for next day
      }, msUntil);

      return timer;
    };

    const timer = scheduleNotification();
    return () => clearTimeout(timer);
  }, [notificationsEnabled, notificationTime]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="study" element={<Study />} />
          <Route path="list" element={<List />} />
          <Route path="idioms" element={<Idioms />} />
          <Route path="idiom-study" element={<IdiomStudy />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="stats" element={<Stats />} />
          <Route path="radicals" element={<Radicals />} />
          <Route path="settings" element={<Settings />} />
          <Route path="dictation-quiz" element={<DictationQuiz />} />
          <Route path="quiz-hub" element={<QuizHub />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
