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
import useAppStore from './store/useAppStore';

function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    const el = document.documentElement;
    el.classList.remove('dark', 'naver');
    if (theme === 'dark') el.classList.add('dark');
    if (theme === 'naver') el.classList.add('naver');
  }, [theme]);

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
