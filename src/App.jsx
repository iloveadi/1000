import React, { useEffect, useState } from 'react';
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
import IdiomQuiz from './pages/IdiomQuiz';
import Intro from './pages/Intro';
import Achievements from './pages/Achievements';
import useAppStore from './store/useAppStore';

function App() {
  const { theme } = useAppStore();
  const [showIntro, setShowIntro] = useState(() => {
    // Show intro only once per session
    const seen = sessionStorage.getItem('chunjamun-intro-seen');
    return !seen;
  });

  const handleIntroDone = () => {
    sessionStorage.setItem('chunjamun-intro-seen', '1');
    setShowIntro(false);
  };

  useEffect(() => {
    const el = document.documentElement;
    el.classList.remove('dark', 'naver', 'pink', 'orange');
    if (theme === 'dark') el.classList.add('dark');
    if (theme === 'naver') el.classList.add('naver');
    if (theme === 'pink') el.classList.add('pink');
    if (theme === 'orange') el.classList.add('orange');
  }, [theme]);


  return (
    <>
      {showIntro && <Intro onDone={handleIntroDone} />}
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
            <Route path="idiom-quiz" element={<IdiomQuiz />} />
            <Route path="quiz-hub" element={<QuizHub />} />
            <Route path="achievements" element={<Achievements />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
