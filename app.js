if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Navigation Routing
function handleRouting() {
    const hash = window.location.hash;

    // Exit confirmation for main screen (dashboard)
    if (hash === "" || hash === "#") {
        if (confirm("앱을 종료하시겠습니까?")) {
            // User wants to exit. We can't close the app programmatically in most PWA environments,
            // but we show the message as requested.
        } else {
            // Stay on dashboard
            window.location.hash = "#dashboard";
            return;
        }
    }

    const activeHash = hash || '#dashboard';
    hideAllViews();

    switch (activeHash) {
        case '#dashboard':
            document.getElementById('dashboard-grid').style.display = 'grid';
            break;
        case '#dictionary':
            document.getElementById('dictionary-view').style.display = 'block';
            renderDictionaryList(true);
            break;
        case '#sentences':
            document.getElementById('sentences-view').style.display = 'block';
            renderCheonjamun();
            break;
        case '#word-games':
            document.getElementById('word-game-view').style.display = 'block';
            break;
        case '#sentence-games':
            document.getElementById('sentence-game-view').style.display = 'block';
            break;
        case '#account':
            document.getElementById('account-view').style.display = 'block';
            renderAccountView();
            break;
        case '#word-quiz':
            if (quizState.questions.length === 0) {
                initWordQuiz();
            } else {
                document.getElementById('active-game-view').style.display = 'block';
            }
            break;
        case '#hanja-selection':
            if (quizState.questions.length === 0) {
                initHanjaSelectionGame();
            } else {
                document.getElementById('active-game-view').style.display = 'block';
            }
            break;
        case '#word-board':
            if (boardGameState.cards.length === 0) {
                initBoardGame();
            } else {
                document.getElementById('active-game-view').style.display = 'block';
                if (!document.getElementById('board-game-grid')) {
                    renderBoardGame();
                }
            }
            break;
        case '#sent-match':
            if (sentMeaningState.questions.length === 0) {
                initSentenceMeaningGame();
            } else {
                document.getElementById('active-sent-game-view').style.display = 'block';
            }
            break;
        default:
            document.getElementById('dashboard-grid').style.display = 'grid';
            break;
    }
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', () => {
    if (!window.location.hash) {
        window.location.hash = '#dashboard';
    }
    handleRouting();
});

// Data Handling
let cheonjamunData = {
    characters: [],
    sentences: []
};

let currentView = 'dashboard';
let currentFilter = 'all';
let searchQuery = '';
let sentenceSearchQuery = '';
let dictionaryPage = 1;
const ITEMS_PER_PAGE = 20;

// Quiz State
let quizState = {
    questions: [],
    currentIndex: 0,
    score: 0,
    wrongAnswers: []
};

async function loadData() {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        cheonjamunData = data;

        // Load learning state from local storage
        const wrongAnswers = JSON.parse(localStorage.getItem('cheonjamun_wrong_answers') || '[]');
        const completed = JSON.parse(localStorage.getItem('cheonjamun_completed') || '[]');

        cheonjamunData.characters.forEach(char => {
            char.is_wrong = wrongAnswers.includes(char.id);
            char.is_completed = completed.includes(char.id);
        });

        console.log('Data loaded successfully:', cheonjamunData);
        window.dispatchEvent(new CustomEvent('dataLoaded', { detail: cheonjamunData }));

    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

// Dictionary Logic
function getFilteredCharacters() {
    return cheonjamunData.characters.filter(char => {
        // Search Filter
        const query = searchQuery.trim();
        const matchesSearch = !query ||
            char.hanja.includes(query) ||
            char.meaning.includes(query) ||
            char.sound.includes(query);

        if (!matchesSearch) return false;

        // Tab Filter
        if (currentFilter === 'unlearned') {
            // "Wrong Answers / Unlearned" - include characters marked wrong OR not marked completed
            return char.is_wrong || !char.is_completed;
        }
        if (currentFilter === 'completed') {
            return char.is_completed;
        }

        return true;
    });
}

// Stroke Order Modal Logic
let writer = null;

window.openStrokeModal = function (hanja) {
    const modal = document.getElementById('stroke-modal');
    const title = document.getElementById('modal-hanja-title');
    const target = document.getElementById('stroke-target');

    // Reset
    target.innerHTML = '';
    title.textContent = hanja;
    modal.style.display = 'flex';

    // Initialize HanziWriter
    writer = HanziWriter.create('stroke-target', hanja, {
        width: 200,
        height: 200,
        padding: 5,
        strokeColor: '#E31E24', // Point Color
        showOutline: true,
        outlineColor: '#DDD',
        delayBetweenStrokes: 300
    });

    writer.animateCharacter();
};

window.closeStrokeModal = function () {
    document.getElementById('stroke-modal').style.display = 'none';
    writer = null;
};

// Game Navigation and PRO Logic
window.handleGameClick = function (gameId, isPro) {
    if (isPro) {
        // Show PRO Modal
        document.getElementById('pro-modal').style.display = 'flex';
    } else {
        // Start Free Game (Placeholder)
        alert(`Starting game: ${gameId}`);
    }
};

window.closeProModal = function () {
    document.getElementById('pro-modal').style.display = 'none';
};

// Account & Login Logic
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtJXDh39vsPhIQdyhV4kkW9AkqF-JrRP4",
    authDomain: "project-8679285663544329468.firebaseapp.com",
    projectId: "project-8679285663544329468",
    storageBucket: "project-8679285663544329468.firebasestorage.app",
    messagingSenderId: "427077245166",
    appId: "1:427077245166:web:17630fc4555e1b01b1bbff",
    measurementId: "G-LG0WYLFVWJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Auth State Observer
auth.onAuthStateChanged(user => {
    if (user) {
        localStorage.setItem('cheonjamun_is_logged_in', 'true');
        localStorage.setItem('cheonjamun_user_name', user.displayName || '학도');
        localStorage.setItem('cheonjamun_user_email', user.email);
        localStorage.setItem('cheonjamun_user_picture', user.photoURL);

        // Sync data from Firestore
        syncProgressFromFirestore(user.uid);
    } else {
        localStorage.removeItem('cheonjamun_is_logged_in');
        localStorage.removeItem('cheonjamun_user_name');
        localStorage.removeItem('cheonjamun_user_email');
        localStorage.removeItem('cheonjamun_user_picture');
    }
    renderAccountView();
});

async function syncProgressFromFirestore(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            const cloudData = doc.data();
            const cloudCompleted = cloudData.completed || [];
            const cloudWrong = cloudData.wrong_answers || [];

            // Merge with local data (migration)
            const localCompleted = JSON.parse(localStorage.getItem('cheonjamun_completed') || '[]');
            const localWrong = JSON.parse(localStorage.getItem('cheonjamun_wrong_answers') || '[]');

            const mergedCompleted = [...new Set([...cloudCompleted, ...localCompleted])];
            const mergedWrong = [...new Set([...cloudWrong, ...localWrong])];

            // Update local state and storage
            cheonjamunData.characters.forEach(char => {
                char.is_completed = mergedCompleted.includes(char.id);
                char.is_wrong = mergedWrong.includes(char.id);
            });

            localStorage.setItem('cheonjamun_completed', JSON.stringify(mergedCompleted));
            localStorage.setItem('cheonjamun_wrong_answers', JSON.stringify(mergedWrong));

            // Push merged data back to cloud if it changed
            if (mergedCompleted.length > cloudCompleted.length || mergedWrong.length > cloudWrong.length) {
                await saveProgressToFirestore(uid, mergedCompleted, mergedWrong);
            }

            console.log('Firebase Cloud Sync Complete');
            window.dispatchEvent(new CustomEvent('dataLoaded', { detail: cheonjamunData }));
        } else {
            // First time login: push current local data to cloud
            const localCompleted = JSON.parse(localStorage.getItem('cheonjamun_completed') || '[]');
            const localWrong = JSON.parse(localStorage.getItem('cheonjamun_wrong_answers') || '[]');
            await saveProgressToFirestore(uid, localCompleted, localWrong);
        }
    } catch (error) {
        console.error('Error syncing from Firestore:', error);
    }
}

async function saveProgressToFirestore(uid, completed, wrong) {
    try {
        await db.collection('users').doc(uid).set({
            completed: completed,
            wrong_answers: wrong,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Error saving to Firestore:', error);
    }
}

window.handleLogin = async function (provider) {
    if (provider === 'google') {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
        } catch (error) {
            console.error('Login Error:', error);
            alert('로그인 중 오류가 발생했습니다: ' + error.message);
        }
    }
};

window.handleLogout = function () {
    if (confirm('로그아웃 하시겠습니까?')) {
        auth.signOut();
    }
};

window.goToFavorites = function () {
    // Switch to Dictionary and Filter Favorites
    document.querySelector('.dashboard-grid').style.display = 'none';
    document.getElementById('account-view').style.display = 'none';

    const dictView = document.getElementById('dictionary-view');
    if (dictView) dictView.style.display = 'block';

    // Set filter to favorite (needs to simulate tab click or logic)
    const favTab = document.querySelector('.filter-tab[data-filter="favorite"]');
    if (favTab) favTab.click();
};

function renderAccountView() {
    const user = auth.currentUser;
    const loginSection = document.getElementById('login-section');
    const profileSection = document.getElementById('profile-section');

    if (user) {
        if (loginSection) loginSection.style.display = 'none';
        if (profileSection) {
            profileSection.style.display = 'block';

            const nameEl = profileSection.querySelector('.user-name');
            const picEl = profileSection.querySelector('.profile-avatar img');

            if (nameEl) nameEl.textContent = user.displayName;
            if (picEl && user.photoURL) picEl.src = user.photoURL;
        }
    } else {
        if (loginSection) loginSection.style.display = 'block';
        if (profileSection) profileSection.style.display = 'none';
    }
}

function checkAttendance() {
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem('cheonjamun_last_attendance');

    if (lastCheck !== today) {
        localStorage.setItem('cheonjamun_last_attendance', today);
        // Visual update can happen here
    }
}

// Render Dictionary
function renderDictionaryList(reset = false) {
    const listContainer = document.getElementById('hanja-list');
    if (!listContainer) return;

    if (reset) {
        listContainer.innerHTML = '';
        dictionaryPage = 1;
    }

    const filtered = getFilteredCharacters();
    const start = (dictionaryPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const items = filtered.slice(start, end);

    if (items.length === 0 && reset) {
        listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">검색 결과가 없습니다.</p>';
        return;
    }

    items.forEach(char => {
        const card = document.createElement('div');
        card.className = 'hanja-list-card';

        card.innerHTML = `
            <div class="hanja-card-left">
                <span class="hanja-main-char hanja-text">${char.hanja}</span>
                <span class="hanja-sub-text">[${char.meaning} / ${char.sound}]</span>
                <div style="margin-top:8px;">
                     <span class="hanja-badge badge-level">${char.level}</span>
                     <span class="hanja-badge badge-stroke">${char.stroke_count}획</span>
                     <span class="hanja-badge badge-radical">부수: ${char.radical}</span>
                </div>
            </div>
            <div class="hanja-card-right">
                <div class="action-icon" onclick="openStrokeModal('${char.hanja}')" title="획순 보기">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
                </div>
                <!-- Learning state check (placeholder) -->
                <div class="action-icon ${char.is_completed ? 'completed' : ''}" onclick="toggleCompleted(${char.id})" title="${char.is_completed ? '학습 취소' : '학습 완료'}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="16 10 11 15 8 12"></polyline>
                    </svg>
                </div>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

window.toggleCompleted = async function (id) {
    // Login check removed for offline mode
    // const isLoggedIn = !!auth.currentUser; 

    const char = cheonjamunData.characters.find(c => c.id === id);
    if (char) {
        char.is_completed = !char.is_completed;
        if (char.is_completed) char.is_wrong = false;

        const completed = cheonjamunData.characters.filter(c => c.is_completed).map(c => c.id);
        const wrong = cheonjamunData.characters.filter(c => c.is_wrong).map(c => c.id);

        localStorage.setItem('cheonjamun_completed', JSON.stringify(completed));
        localStorage.setItem('cheonjamun_wrong_answers', JSON.stringify(wrong));

        // Sync to Cloud (Silent fail if not logged in)
        if (auth.currentUser) {
            saveProgressToFirestore(auth.currentUser.uid, completed, wrong).catch(console.error);
        }

        renderDictionaryList(true);
    }
};

// Learning state helper for games
window.updateLearningState = function (id, isCorrect) {
    // Login check removed for offline mode

    const char = cheonjamunData.characters.find(c => c.id === id);
    if (!char) return;

    if (isCorrect) {
        char.is_completed = true;
        char.is_wrong = false;
    } else {
        char.is_completed = false;
        char.is_wrong = true;
    }

    const completed = cheonjamunData.characters.filter(c => c.is_completed).map(c => c.id);
    const wrong = cheonjamunData.characters.filter(c => c.is_wrong).map(c => c.id);

    localStorage.setItem('cheonjamun_completed', JSON.stringify(completed));
    localStorage.setItem('cheonjamun_wrong_answers', JSON.stringify(wrong));

    // Sync to Cloud
    if (auth.currentUser) {
        saveProgressToFirestore(auth.currentUser.uid, completed, wrong).catch(console.error);
    }
};

function setupDictionaryListeners() {
    // Search
    const searchInput = document.getElementById('hanja-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderDictionaryList(true);
        });
    }

    // Tabs
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderDictionaryList(true);
        });
    });

    // Infinite Scroll
    window.addEventListener('scroll', () => {
        const view = document.getElementById('dictionary-view');
        if (!view || view.style.display === 'none') return;

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            dictionaryPage++;
            renderDictionaryList(false); // Append
        }
    });
}

// Global quiz state helper (already declared at top)

function hideAllViews() {
    const views = [
        'dashboard-grid',
        'dictionary-view',
        'word-game-view',
        'sentence-game-view',
        'sentences-view',
        'account-view',
        'active-game-view',
        'active-sent-game-view'
    ];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// Event Listeners
window.addEventListener('dataLoaded', (e) => {
    setupDictionaryListeners();

    // Dictionary
    const dictBtn = document.querySelector('button[data-target="dictionary"]');
    if (dictBtn) {
        dictBtn.addEventListener('click', () => {
            window.location.hash = '#dictionary';
        });
    }

    // Word Games
    const wordBtn = document.querySelector('button[data-target="word-games"]');
    if (wordBtn) {
        wordBtn.addEventListener('click', () => {
            window.location.hash = '#word-games';
        });
    }

    // Sentence Games
    const sentBtn = document.querySelector('button[data-target="sentence-games"]');
    if (sentBtn) {
        sentBtn.addEventListener('click', () => {
            window.location.hash = '#sentence-games';
        });
    }

    // Account Button (Fixed Listener)
    const acctBtn = document.querySelector('button[data-target="account"]');
    if (acctBtn) {
        acctBtn.addEventListener('click', () => {
            window.location.hash = '#account';
        });
    }

    // Sentences List
    const sentencesBtn = document.querySelector('button[data-target="sentences"]');
    if (sentencesBtn) {
        sentencesBtn.addEventListener('click', () => {
            window.location.hash = '#sentences';
        });
    }

    // Sentence Search Listener
    const sentSearchInput = document.getElementById('sentence-search');
    if (sentSearchInput) {
        sentSearchInput.addEventListener('input', (e) => {
            sentenceSearchQuery = e.target.value.trim();
            renderCheonjamun();
        });
    }

    // Back to Dashboard (Header Title Click)
    const titleBtn = document.querySelector('.target-title');
    if (titleBtn) {
        titleBtn.addEventListener('click', () => {
            window.location.hash = '#dashboard';
        });
    }
});

// ===== Settings Functions =====

// Toggle Settings Panel
window.toggleSettings = function () {
    const overlay = document.getElementById('settings-overlay');
    const panel = document.getElementById('settings-panel');
    const isOpen = panel.classList.contains('open');

    if (isOpen) {
        panel.classList.remove('open');
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    } else {
        overlay.style.display = 'block';
        panel.classList.add('open');
        document.body.style.overflow = 'hidden';
        updateSettingsStats();
    }
};

// Settings button event listener
document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.querySelector('.app-header .icon-btn[aria-label="설정"]');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', toggleSettings);
    }

    // Restore saved settings
    restoreSettings();
});

function restoreSettings() {
    // Restore theme
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        const toggle = document.getElementById('theme-toggle');
        if (toggle) toggle.checked = true;
    }

    // Restore font size
    const savedFontSize = localStorage.getItem('app-font-size') || 'medium';
    changeFontSize(savedFontSize, false);

    // Restore TTS
    const savedTTS = localStorage.getItem('app-tts');
    if (savedTTS === 'true') {
        const toggle = document.getElementById('tts-toggle');
        if (toggle) toggle.checked = true;
    }
}

// Theme Toggle
window.toggleTheme = function () {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('app-theme', isLight ? 'light' : 'dark');
};

// Font Size
window.changeFontSize = function (size, save = true) {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${size}`);

    // Update active button
    document.querySelectorAll('.font-size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === size);
    });

    if (save) localStorage.setItem('app-font-size', size);
};

// TTS Toggle
window.toggleTTS = function () {
    const toggle = document.getElementById('tts-toggle');
    const enabled = toggle.checked;
    localStorage.setItem('app-tts', enabled);
};

// Reset Progress
window.resetProgress = function () {
    if (confirm('정말 학습 기록을 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
        // Reset all character progress
        if (typeof cheonjamunData !== 'undefined' && cheonjamunData.characters) {
            cheonjamunData.characters.forEach(c => {
                c.is_completed = false;
                c.is_wrong = false;
                c.is_favorite = false;
            });
        }

        // Clear localStorage progress keys
        localStorage.removeItem('cheonjamun_progress');
        localStorage.removeItem('quiz_stats');

        // Update stats display
        updateSettingsStats();

        alert('학습 기록이 초기화되었습니다.');
    }
};

// Update Statistics in Settings
function updateSettingsStats() {
    if (typeof cheonjamunData === 'undefined' || !cheonjamunData.characters) return;

    const chars = cheonjamunData.characters;
    const learned = chars.filter(c => c.is_completed).length;
    const favorites = chars.filter(c => c.is_favorite).length;

    // Calculate accuracy from quiz stats
    const quizStats = JSON.parse(localStorage.getItem('quiz_stats') || '{"correct":0,"total":0}');
    const accuracy = quizStats.total > 0 ? Math.round((quizStats.correct / quizStats.total) * 100) : 0;

    const learnedEl = document.getElementById('stat-learned');
    const accuracyEl = document.getElementById('stat-accuracy');
    const favoritesEl = document.getElementById('stat-favorites');

    if (learnedEl) learnedEl.textContent = `${learned}자`;
    if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
    if (favoritesEl) favoritesEl.textContent = `${favorites}개`;
}

window.handleGameClick = function (gameId, isPro) {
    if (isPro) {
        // Show PRO Modal
        document.getElementById('pro-modal').style.display = 'flex';
    } else {
        if (gameId === 'word-multi') {
            startWordQuiz();
        } else if (gameId === 'sent-blank') {
            startSentenceBlankGame();
        } else if (gameId === 'word-hanzi') {
            startHanjaSelectionGame();
        } else if (gameId === 'word-board') {
            startBoardGame();
        } else if (gameId === 'sent-match') {
            startSentenceMeaningGame();
        } else {
            alert(`${gameId} 게임을 시작합니다! (준비중)`);
        }
    }
};

function startWordQuiz() {
    initWordQuiz();
    window.location.hash = '#word-quiz';
}

function initWordQuiz() {
    hideAllViews();
    document.getElementById('active-game-view').style.display = 'block';

    const allChars = cheonjamunData.characters;
    if (allChars.length < 4) {
        alert('한자 데이터가 부족합니다.');
        return;
    }

    // Split into pools: Unlearned (is_wrong=true or is_completed=false) vs Completed
    const unlearnedPool = allChars.filter(c => c.is_wrong || !c.is_completed);
    const completedPool = allChars.filter(c => c.is_completed && !c.is_wrong);

    // Shuffle both
    const shuffledUnlearned = [...unlearnedPool].sort(() => 0.5 - Math.random());
    const shuffledCompleted = [...completedPool].sort(() => 0.5 - Math.random());

    let selected = [];

    // Pick 8 from unlearned (or as many as available)
    const unlearnedCount = Math.min(8, shuffledUnlearned.length);
    selected = shuffledUnlearned.slice(0, unlearnedCount);

    // Pick 2 from completed (or as many as available)
    const completedCount = Math.min(2, shuffledCompleted.length);
    selected = selected.concat(shuffledCompleted.slice(0, completedCount));

    // If we still don't have 10, fill from whatever is left in both pools
    if (selected.length < 10) {
        const remainingNeeded = 10 - selected.length;
        const remainingPool = allChars.filter(c => !selected.find(s => s.id === c.id));
        const extra = [...remainingPool].sort(() => 0.5 - Math.random()).slice(0, remainingNeeded);
        selected = selected.concat(extra);
    }

    // Shuffle the final 10
    selected = selected.sort(() => 0.5 - Math.random());

    quizState = {
        questions: selected.map(char => {
            // Pick 3 random distractors
            const distractors = allChars
                .filter(c => c.id !== char.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            const options = [...distractors, char].sort(() => 0.5 - Math.random());
            return {
                target: char,
                options: options
            };
        }),
        currentIndex: 0,
        score: 0,
        wrongAnswers: []
    };

    renderQuizQuestion();
}

function renderQuizQuestion() {
    const container = document.getElementById('active-game-view');
    const q = quizState.questions[quizState.currentIndex];

    const optButtons = q.options.map(opt => `
        <button class="sent-blank-opt" onclick="handleQuizAnswer(${opt.id})">
            <span class="opt-reading" style="font-size:1.1rem; font-weight:600;">${opt.meaning} ${opt.sound}</span>
        </button>
    `).join('');

    container.innerHTML = `
        <div class="quiz-container">
            <div class="quiz-header">
                <span class="quiz-progress">문제 ${quizState.currentIndex + 1} / 10</span>
                <span class="quiz-score">점수: ${quizState.score}</span>
            </div>
            <div class="quiz-question-card">
                <span class="quiz-hanja hanja-text">${q.target.hanja}</span>
            </div>
            <div class="sent-blank-options">${optButtons}</div>
        </div>
    `;
}

window.handleQuizAnswer = function (selectedId) {
    const q = quizState.questions[quizState.currentIndex];
    const isCorrect = selectedId === q.target.id;

    if (isCorrect) {
        quizState.score += 10;
        // Correct: score only. Completion can only be set from the dictionary.
    } else {
        quizState.wrongAnswers.push(q.target);
        // Wrong: mark as wrong and remove completion
        const char = cheonjamunData.characters.find(c => c.id === q.target.id);
        if (char) {
            char.is_wrong = true;
            char.is_completed = false;
        }
        const completed = cheonjamunData.characters.filter(c => c.is_completed).map(c => c.id);
        const wrong = cheonjamunData.characters.filter(c => c.is_wrong).map(c => c.id);
        localStorage.setItem('cheonjamun_completed', JSON.stringify(completed));
        localStorage.setItem('cheonjamun_wrong_answers', JSON.stringify(wrong));
        if (auth.currentUser) saveProgressToFirestore(auth.currentUser.uid, completed, wrong).catch(console.error);
    }

    // Disable buttons and flash feedback
    const container = document.getElementById('active-game-view');
    const buttons = container.querySelectorAll('.sent-blank-opt');
    buttons.forEach(btn => { btn.disabled = true; btn.onclick = null; });

    q.options.forEach((opt, i) => {
        if (opt.id === q.target.id) {
            buttons[i].classList.add('correct');
        } else if (opt.id === selectedId && !isCorrect) {
            buttons[i].classList.add('wrong');
        }
    });

    setTimeout(() => {
        quizState.currentIndex++;
        if (quizState.currentIndex < 10) {
            renderQuizQuestion();
        } else {
            showQuizResults();
        }
    }, 900);
};

function showQuizResults() {
    const container = document.getElementById('active-game-view');
    container.innerHTML = `
        <div class="quiz-results">
            <h2 class="results-title">퀴즈 종료!</h2>
            <div class="results-score-circle">
                <span class="results-score">${quizState.score}</span>
                <span class="results-label">점</span>
            </div>
            <p class="results-msg">${quizState.score === 100 ? '완벽해요! 대단한 실력입니다.' : '수고하셨습니다!'}</p>
            
            ${quizState.wrongAnswers.length > 0 ? `
                <div class="wrong-list">
                    <h3>복습이 필요한 한자</h3>
                    <div class="wrong-grid">
                        ${quizState.wrongAnswers.map(char => `
                            <div class="wrong-item">
                                <span class="hanja-text">${char.hanja}</span>
                                <span>${char.meaning} ${char.sound}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="results-actions">
                <button class="results-btn primary" onclick="startWordQuiz()">다시 하기</button>
                <button class="results-btn secondary" onclick="window.location.hash = '#word-games'">메인으로</button>
            </div>
        </div>
    `;
}

window.closeProModal = function () {
    document.getElementById('pro-modal').style.display = 'none';
};

// ===== Hanja Selection Game (Meaning -> Hanja) =====

function startHanjaSelectionGame() {
    initHanjaSelectionGame();
    window.location.hash = '#hanja-selection';
}

function initHanjaSelectionGame() {
    hideAllViews();
    document.getElementById('active-game-view').style.display = 'block';

    const allChars = cheonjamunData.characters;
    if (allChars.length < 4) {
        alert('한자 데이터가 부족합니다.');
        return;
    }

    // Reuse selection logic from Word Quiz
    const unlearnedPool = allChars.filter(c => c.is_wrong || !c.is_completed);
    const completedPool = allChars.filter(c => c.is_completed && !c.is_wrong);

    const shuffledUnlearned = [...unlearnedPool].sort(() => 0.5 - Math.random());
    const shuffledCompleted = [...completedPool].sort(() => 0.5 - Math.random());

    let selected = [];
    selected = shuffledUnlearned.slice(0, Math.min(8, shuffledUnlearned.length));
    selected = selected.concat(shuffledCompleted.slice(0, Math.min(2, shuffledCompleted.length)));

    if (selected.length < 10) {
        const remainingID = selected.map(s => s.id);
        const remainingPool = allChars.filter(c => !remainingID.includes(c.id));
        const extra = [...remainingPool].sort(() => 0.5 - Math.random()).slice(0, 10 - selected.length);
        selected = selected.concat(extra);
    }

    selected = selected.sort(() => 0.5 - Math.random());

    quizState = {
        questions: selected.map(char => {
            const distractors = allChars
                .filter(c => c.id !== char.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            const options = [...distractors, char].sort(() => 0.5 - Math.random());
            return { target: char, options: options };
        }),
        currentIndex: 0,
        score: 0,
        wrongAnswers: []
    };

    renderHanjaSelectionQuestion();
}

function renderHanjaSelectionQuestion() {
    const container = document.getElementById('active-game-view');
    const q = quizState.questions[quizState.currentIndex];

    // Options are Hanja characters
    const optButtons = q.options.map(opt => `
        <button class="sent-blank-opt" onclick="handleHanjaSelectionAnswer(${opt.id})">
            <span class="opt-hanja hanja-text" style="font-size: 2.2rem;">${opt.hanja}</span>
        </button>
    `).join('');

    container.innerHTML = `
        <div class="quiz-container">
            <div class="quiz-header">
                <span class="quiz-progress">문제 ${quizState.currentIndex + 1} / 10</span>
                <span class="quiz-score">점수: ${quizState.score}</span>
            </div>
            <div class="quiz-question-card">
                <!-- Word Meaning Question -->
                <span class="hanja-text" style="font-size: 2.5rem; color: white; display:block; margin-bottom:10px;">
                    ${q.target.meaning} ${q.target.sound}
                </span>
            </div>
            <div class="sent-blank-options">${optButtons}</div>
        </div>
    `;
}

window.handleHanjaSelectionAnswer = function (selectedId) {
    const q = quizState.questions[quizState.currentIndex];
    const isCorrect = selectedId === q.target.id;

    if (isCorrect) {
        quizState.score += 10;
    } else {
        quizState.wrongAnswers.push(q.target);
        updateLearningState(q.target.id, false);
    }

    // Feedback
    const container = document.getElementById('active-game-view');
    const buttons = container.querySelectorAll('.sent-blank-opt');
    buttons.forEach(btn => { btn.disabled = true; btn.onclick = null; });

    q.options.forEach((opt, i) => {
        if (opt.id === q.target.id) {
            buttons[i].classList.add('correct');
        } else if (opt.id === selectedId && !isCorrect) {
            buttons[i].classList.add('wrong');
        }
    });

    setTimeout(() => {
        quizState.currentIndex++;
        if (quizState.currentIndex < 10) {
            renderHanjaSelectionQuestion();
        } else {
            showHanjaSelectionResults();
        }
    }, 900);
};

function showHanjaSelectionResults() {
    const container = document.getElementById('active-game-view');
    container.innerHTML = `
        <div class="quiz-results">
            <h2 class="results-title">한자 고르기 완료!</h2>
            <div class="results-score-circle">
                <span class="results-score">${quizState.score}</span>
                <span class="results-label">점</span>
            </div>
            <p class="results-msg">${quizState.score === 100 ? '완벽해요! 한자 박사님이시네요!' : '수고하셨습니다! 다시 도전해보세요.'}</p>
            
            ${quizState.wrongAnswers.length > 0 ? `
                <div class="wrong-list">
                    <h3>틀린 문제 복습</h3>
                    <div class="wrong-grid">
                        ${quizState.wrongAnswers.map(char => `
                            <div class="wrong-item">
                                <span class="hanja-text" style="font-size:1.5rem;">${char.hanja}</span>
                                <span style="font-size:0.9rem;">${char.meaning} ${char.sound}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="results-actions">
                <button class="results-btn primary" onclick="startHanjaSelectionGame()">다시 하기</button>
                <button class="results-btn secondary" onclick="window.location.hash = '#word-games'">메인으로</button>
            </div>
        </div>
    `;
}

// ... existing code ...

// Initial Load
// const savedTheme = localStorage.getItem('cheonjamun_theme') || 'dark';
// applyTheme(savedTheme);
loadData();

// Event Listeners
window.addEventListener('dataLoaded', (e) => {
    // ... existing listeners ...
});
// Render Sentences
function renderCheonjamun() {
    const listContainer = document.getElementById('sentence-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    const data = cheonjamunData;
    if (!data.sentences || data.sentences.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">데이터가 없습니다.</p>';
        return;
    }

    // Filter sentences based on search query
    const filteredSentences = data.sentences.filter(s => {
        const query = sentenceSearchQuery.toLowerCase();
        return s.phrase.toLowerCase().includes(query) ||
            s.interpretation.toLowerCase().includes(query);
    });

    if (filteredSentences.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">검색 결과가 없습니다.</p>';
        return;
    }

    filteredSentences.forEach(sentence => {
        const card = document.createElement('div');
        card.className = 'sentence-card';

        // Build individual character mini-cards (using original CSS class names)
        const charCards = sentence.char_ids.map(id => {
            const char = data.characters.find(c => c.id === id);
            if (!char) return '';
            return `
                <div class="char-card" onclick="openStrokeModal('${char.hanja}')" style="cursor:pointer;">
                    <span class="char-hanja hanja-text">${char.hanja}</span>
                    <span class="char-sound-meaning">${char.meaning} ${char.sound}</span>
                    <span class="char-info">${char.level} / ${char.stroke_count}획</span>
                </div>`;
        }).join('');

        card.innerHTML = `
            <div class="sentence-header">
                <span class="sentence-number">${String(sentence.id).padStart(3, '0')}</span>
                <div class="sentence-phrase hanja-text">${sentence.phrase}</div>
                <div class="sentence-meaning">${sentence.interpretation}</div>
            </div>
            <div class="char-grid">${charCards}</div>
        `;
        listContainer.appendChild(card);
    });
}

// ===== Sentence Fill-in-the-Blank Game =====

let sentBlankState = {
    questions: [],
    currentIndex: 0,
    score: 0,
    wrongAnswers: []
};

function startSentenceBlankGame() {
    initSentenceBlankGame();
}

function initSentenceBlankGame() {
    hideAllViews();
    const container = document.getElementById('active-sent-game-view');
    container.style.display = 'block';

    const sentences = cheonjamunData.sentences;
    const characters = cheonjamunData.characters;

    if (!sentences || sentences.length < 10) {
        container.innerHTML = '<p style="text-align:center;padding:40px;">문장 데이터가 부족합니다.</p>';
        return;
    }

    // Pick 10 random sentences
    const shuffled = [...sentences].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    sentBlankState = {
        questions: selected.map(sentence => {
            // Pick a random position (0-3) to blank out
            const blankPos = Math.floor(Math.random() * sentence.char_ids.length);
            const correctId = sentence.char_ids[blankPos];
            const correctChar = characters.find(c => c.id === correctId);

            // Generate 3 unique distractors
            const distractors = characters
                .filter(c => c.id !== correctId)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            const options = [...distractors, correctChar].sort(() => 0.5 - Math.random());

            return { sentence, blankPos, correctChar, options };
        }),
        currentIndex: 0,
        score: 0,
        wrongAnswers: []
    };

    renderSentBlankQuestion();
}

function renderSentBlankQuestion() {
    const container = document.getElementById('active-sent-game-view');
    const q = sentBlankState.questions[sentBlankState.currentIndex];
    const { sentence, blankPos, options } = q;
    const characters = cheonjamunData.characters;

    // Build the 4-character display with one blank slot
    const charDisplay = sentence.char_ids.map((id, idx) => {
        const char = characters.find(c => c.id === id);
        if (idx === blankPos) {
            return `<span class="sent-blank-slot">?</span>`;
        }
        return `<span class="sent-blank-char hanja-text">${char ? char.hanja : '?'}</span>`;
    }).join('');

    // Option buttons
    const optButtons = options.map(opt => `
        <button class="sent-blank-opt" onclick="handleSentBlankAnswer(${opt.id})">
            <span class="opt-hanja hanja-text">${opt.hanja}</span>
        </button>
    `).join('');

    container.innerHTML = `
        <div class="quiz-container">
            <div class="quiz-header">
                <span class="quiz-progress">문제 ${sentBlankState.currentIndex + 1} / 10</span>
                <span class="quiz-score">점수: ${sentBlankState.score}</span>
            </div>
            <div class="sent-blank-question">
                <div class="sent-blank-phrase">${charDisplay}</div>
                <div class="sent-blank-interp">${sentence.interpretation}</div>
            </div>
            <p class="quiz-instruction">빈칸에 들어갈 한자를 고르세요.</p>
            <div class="sent-blank-options">${optButtons}</div>
        </div>
    `;
}

window.handleSentBlankAnswer = function (selectedId) {
    const q = sentBlankState.questions[sentBlankState.currentIndex];
    const isCorrect = selectedId === q.correctChar.id;

    if (isCorrect) {
        sentBlankState.score += 10;
        // Sentence game does NOT affect learning state
    } else {
        sentBlankState.wrongAnswers.push(q);
        // Sentence game does NOT affect learning state
    }

    // Disable buttons and show feedback colors
    const container = document.getElementById('active-sent-game-view');
    const buttons = container.querySelectorAll('.sent-blank-opt');
    buttons.forEach(btn => { btn.disabled = true; btn.onclick = null; });

    q.options.forEach((opt, i) => {
        if (opt.id === q.correctChar.id) {
            buttons[i].classList.add('correct');
        } else if (opt.id === selectedId && !isCorrect) {
            buttons[i].classList.add('wrong');
        }
    });

    setTimeout(() => {
        sentBlankState.currentIndex++;
        if (sentBlankState.currentIndex < 10) {
            renderSentBlankQuestion();
        } else {
            showSentBlankResults();
        }
    }, 900);
};

function showSentBlankResults() {
    const container = document.getElementById('active-sent-game-view');
    const wrong = sentBlankState.wrongAnswers;

    container.innerHTML = `
        <div class="quiz-results">
            <h2 class="results-title">빈칸 채우기 완료!</h2>
            <div class="results-score-circle">
                <span class="results-score">${sentBlankState.score}</span>
                <span class="results-label">점</span>
            </div>
            <p class="results-msg">${sentBlankState.score === 100 ? '완벽해요! 천자문 마스터!' : '수고하셨습니다!'}</p>
            ${wrong.length > 0 ? `
                <div class="wrong-list">
                    <h3>틀린 문장</h3>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${wrong.map(q => `
                            <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:12px; text-align:center;">
                                <div class="hanja-text" style="font-size:1.4rem; letter-spacing:4px; margin-bottom:4px;">${q.sentence.phrase}</div>
                                <div style="color:#94A3B8; font-size:0.85rem;">${q.sentence.interpretation}</div>
                                <div style="margin-top:6px; font-size:0.9rem;">정답: <span class="hanja-text" style="color:#6366F1; font-size:1.2rem;">${q.correctChar.hanja}</span> (${q.correctChar.meaning} ${q.correctChar.sound})</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            <div class="results-actions">
                <button class="results-btn primary" onclick="startSentenceBlankGame()">다시 하기</button>
                <button class="results-btn secondary" onclick="window.location.hash = '#sentence-games'">메인으로</button>
            </div>
        </div>
    `;
}

// ===== Sentence Meaning Match Game (Hanja Phrase -> Meaning) =====

let sentMeaningState = {
    questions: [],
    currentIndex: 0,
    score: 0,
    wrongAnswers: []
};

function startSentenceMeaningGame() {
    initSentenceMeaningGame();
    window.location.hash = '#sent-match';
}

function initSentenceMeaningGame() {
    hideAllViews();
    const container = document.getElementById('active-sent-game-view');
    container.style.display = 'block';

    const sentences = cheonjamunData.sentences;
    if (!sentences || sentences.length < 10) {
        container.innerHTML = '<p style="text-align:center;padding:40px;">문장 데이터가 부족합니다.</p>';
        return;
    }

    // Pick 10 random sentences
    const shuffled = [...sentences].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    sentMeaningState = {
        questions: selected.map(sentence => {
            const distractors = sentences
                .filter(s => s.id !== sentence.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            const options = [...distractors, sentence].sort(() => 0.5 - Math.random());
            return { target: sentence, options: options };
        }),
        currentIndex: 0,
        score: 0,
        wrongAnswers: []
    };

    renderSentenceMeaningQuestion();
}

function renderSentenceMeaningQuestion() {
    const container = document.getElementById('active-sent-game-view');
    const q = sentMeaningState.questions[sentMeaningState.currentIndex];

    // Options are Meanings
    const optButtons = q.options.map(opt => `
        <button class="sent-blank-opt" onclick="handleSentenceMeaningAnswer(${opt.id})" style="flex-direction:row; justify-content:center; text-align:center;">
            <span class="opt-reading" style="font-size:1.1rem; color:var(--text-color);">${opt.interpretation}</span>
        </button>
    `).join('');

    container.innerHTML = `
        <div class="quiz-container">
            <div class="quiz-header">
                <span class="quiz-progress">문제 ${sentMeaningState.currentIndex + 1} / 10</span>
                <span class="quiz-score">점수: ${sentMeaningState.score}</span>
            </div>
            <div class="quiz-question-card">
                <span class="hanja-text" style="font-size: 3rem; color: white; display:block; margin-bottom:10px;">
                    ${q.target.phrase}
                </span>
            </div>
            <div class="sent-blank-options" style="grid-template-columns: 1fr;">${optButtons}</div>
        </div>
    `;
}

window.handleSentenceMeaningAnswer = function (selectedId) {
    const q = sentMeaningState.questions[sentMeaningState.currentIndex];
    const isCorrect = selectedId === q.target.id;

    if (isCorrect) {
        sentMeaningState.score += 10;
    } else {
        sentMeaningState.wrongAnswers.push(q.target);
    }

    // Feedback
    const container = document.getElementById('active-sent-game-view');
    const buttons = container.querySelectorAll('.sent-blank-opt');
    buttons.forEach(btn => { btn.disabled = true; btn.onclick = null; });

    q.options.forEach((opt, i) => {
        if (opt.id === q.target.id) {
            buttons[i].classList.add('correct');
        } else if (opt.id === selectedId && !isCorrect) {
            buttons[i].classList.add('wrong');
        }
    });

    setTimeout(() => {
        sentMeaningState.currentIndex++;
        if (sentMeaningState.currentIndex < 10) {
            renderSentenceMeaningQuestion();
        } else {
            showSentenceMeaningResults();
        }
    }, 900);
};

function showSentenceMeaningResults() {
    const container = document.getElementById('active-sent-game-view');
    container.innerHTML = `
        <div class="quiz-results">
            <h2 class="results-title">의미 맞추기 완료!</h2>
            <div class="results-score-circle">
                <span class="results-score">${sentMeaningState.score}</span>
                <span class="results-label">점</span>
            </div>
            <p class="results-msg">${sentMeaningState.score === 100 ? '완벽해요! 문해력이 대단하시네요!' : '수고하셨습니다!'}</p>
            
            ${sentMeaningState.wrongAnswers.length > 0 ? `
                <div class="wrong-list">
                    <h3>틀린 문장 복습</h3>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${sentMeaningState.wrongAnswers.map(s => `
                            <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:12px; text-align:center;">
                                <div class="hanja-text" style="font-size:1.4rem; letter-spacing:4px; margin-bottom:4px;">${s.phrase}</div>
                                <div style="color:#94A3B8; font-size:0.9rem;">${s.interpretation}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="results-actions">
                <button class="results-btn primary" onclick="startSentenceMeaningGame()">다시 하기</button>
                <button class="results-btn secondary" onclick="window.location.hash = '#sentence-games'">메인으로</button>
            </div>
        </div>
    `;
}

// ===== Board Game (Memory Match) =====

let boardGameState = {
    cards: [],
    flippedIndices: [],
    matchedPairs: 0,
    moves: 0,
    isLocked: false
};

function startBoardGame() {
    initBoardGame();
    window.location.hash = '#word-board';
}

function initBoardGame() {
    hideAllViews();
    document.getElementById('active-game-view').style.display = 'block';

    const allChars = cheonjamunData.characters;
    if (allChars.length < 8) {
        alert('한자 데이터가 부족합니다.');
        return;
    }

    // Select 8 random characters
    // Mix of unlearned and random
    const unlearnedPool = allChars.filter(c => c.is_wrong || !c.is_completed);
    const completedPool = allChars.filter(c => c.is_completed && !c.is_wrong);

    // Prioritize unlearned, fill with random/completed
    let selectedChars = [...unlearnedPool].sort(() => 0.5 - Math.random()).slice(0, 8);
    if (selectedChars.length < 8) {
        const moreNeeded = 8 - selectedChars.length;
        const others = allChars.filter(c => !selectedChars.find(s => s.id === c.id));
        selectedChars = selectedChars.concat(others.sort(() => 0.5 - Math.random()).slice(0, moreNeeded));
    }

    // Create 16 cards (8 pairs)
    let cards = [];
    selectedChars.forEach(char => {
        // Card 1: Hanja
        cards.push({
            id: char.id,
            type: 'hanja',
            content: char.hanja,
            meaning: char.meaning,
            sound: char.sound,
            isFlipped: false,
            isMatched: false
        });
        // Card 2: Meaning/Sound
        cards.push({
            id: char.id,
            type: 'meaning',
            content: `${char.meaning} ${char.sound}`,
            isFlipped: false,
            isMatched: false
        });
    });

    // Shuffle
    cards.sort(() => 0.5 - Math.random());

    boardGameState = {
        cards: cards,
        flippedIndices: [],
        matchedPairs: 0,
        moves: 0,
        isLocked: false
    };

    renderBoardGame();
}

function renderBoardGame() {
    const container = document.getElementById('active-game-view');

    const gridHtml = boardGameState.cards.map((card, index) => `
        <div class="board-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}" onclick="handleBoardCardClick(${index})">
            <div class="board-card-inner type-${card.type}">
                <div class="board-card-front">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                    </svg>
                </div>
                <div class="board-card-back">
                    <span class="${card.type === 'hanja' ? 'card-hanja' : 'card-meaning'} hanja-text">${card.content}</span>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="board-container">
            <div class="board-header">
                <h2 style="margin:0; font-size:1.2rem; color:var(--point-color);">카드 뒤집기</h2>
                <span style="font-size:0.9rem; color:#888;">이동: ${boardGameState.moves}</span>
            </div>
            <div class="board-grid" id="board-game-grid">
                ${gridHtml}
            </div>
            <div style="margin-top:20px; text-align:center;">
                 <button class="results-btn secondary" onclick="window.location.hash = '#word-games'" style="padding: 8px 16px; font-size: 0.9rem;">나가기</button>
            </div>
        </div>
    `;
}

window.handleBoardCardClick = function (index) {
    if (boardGameState.isLocked) return;
    const card = boardGameState.cards[index];

    // Ignore if already matched or flipped
    if (card.isMatched || card.isFlipped) return;

    // Flip card
    card.isFlipped = true;
    boardGameState.flippedIndices.push(index);

    renderBoardGame();

    // Check match if 2 cards flipped
    if (boardGameState.flippedIndices.length === 2) {
        boardGameState.isLocked = true;
        boardGameState.moves++;

        const idx1 = boardGameState.flippedIndices[0];
        const idx2 = boardGameState.flippedIndices[1];
        const card1 = boardGameState.cards[idx1];
        const card2 = boardGameState.cards[idx2];

        if (card1.id === card2.id) {
            // Match!
            setTimeout(() => {
                card1.isMatched = true;
                card2.isMatched = true;
                boardGameState.matchedPairs++;
                boardGameState.flippedIndices = [];
                boardGameState.isLocked = false;
                renderBoardGame();

                if (boardGameState.matchedPairs === 8) {
                    showBoardGameResults();
                }
            }, 600);
        } else {
            // No Match
            setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;
                boardGameState.flippedIndices = [];
                boardGameState.isLocked = false;
                renderBoardGame();
            }, 1000);
        }
    }
};

function showBoardGameResults() {
    const container = document.getElementById('active-game-view');
    container.innerHTML = `
        <div class="quiz-results">
            <h2 class="results-title">게임 클리어!</h2>
            <div class="results-score-circle">
                <span class="results-score" style="font-size:2rem;">${boardGameState.moves}</span>
                <span class="results-label">회 이동</span>
            </div>
            <p class="results-msg">참 잘했어요! 기억력이 대단하시네요.</p>
            <div class="results-actions">
                <button class="results-btn primary" onclick="startBoardGame()">다시 하기</button>
                <button class="results-btn secondary" onclick="window.location.hash = '#word-games'">메인으로</button>
            </div>
        </div>
    `;
}

// ===== Modal Functions =====

window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
};

window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore background scrolling
    }
};

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
        document.body.style.overflow = '';
    }
};
