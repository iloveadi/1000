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
    const isLoggedIn = !!auth.currentUser;
    if (!isLoggedIn) {
        alert('학습 기록을 저장하려면 로그인이 필요합니다!');
        return;
    }

    const char = cheonjamunData.characters.find(c => c.id === id);
    if (char) {
        char.is_completed = !char.is_completed;
        if (char.is_completed) char.is_wrong = false;

        const completed = cheonjamunData.characters.filter(c => c.is_completed).map(c => c.id);
        const wrong = cheonjamunData.characters.filter(c => c.is_wrong).map(c => c.id);

        localStorage.setItem('cheonjamun_completed', JSON.stringify(completed));
        localStorage.setItem('cheonjamun_wrong_answers', JSON.stringify(wrong));

        // Sync to Cloud
        if (auth.currentUser) {
            await saveProgressToFirestore(auth.currentUser.uid, completed, wrong);
        }

        renderDictionaryList(true);
    }
};

// Learning state helper for games
window.updateLearningState = function (id, isCorrect) {
    const isLoggedIn = !!auth.currentUser;
    if (!isLoggedIn) return;

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
        saveProgressToFirestore(auth.currentUser.uid, completed, wrong);
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
        'active-game-view'
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

// Theme Logic - REMOVED
// function applyTheme(theme) {}
// window.toggleTheme = function() {};
// window.toggleSettings = function() {};

// ... existing logic ...

window.handleGameClick = function (gameId, isPro) {
    if (isPro) {
        // Show PRO Modal
        document.getElementById('pro-modal').style.display = 'flex';
    } else {
        if (gameId === 'word-multi') {
            startWordQuiz();
        } else {
            const gameNames = {
                'word-hanzi': '한자 고르기',
                'sent-blank': '빈칸 채우기'
            };
            const name = gameNames[gameId] || gameId;
            alert(`${name} 게임을 시작합니다! (준비중)`);
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

    container.innerHTML = `
        <div class="quiz-container">
            <div class="quiz-header">
                <span class="quiz-progress">문제 ${quizState.currentIndex + 1} / 10</span>
                <span class="quiz-score">점수: ${quizState.score}</span>
            </div>
            <div class="quiz-question-card">
                <span class="quiz-hanja hanja-text">${q.target.hanja}</span>
                <p class="quiz-instruction">위 한자의 뜻과 음을 고르세요.</p>
            </div>
            <div class="quiz-options">
                ${q.options.map(opt => `
                    <button class="quiz-opt-btn" onclick="handleQuizAnswer(${opt.id})">
                        ${opt.meaning} ${opt.sound}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

window.handleQuizAnswer = function (selectedId) {
    const q = quizState.questions[quizState.currentIndex];
    const isCorrect = selectedId === q.target.id;

    if (isCorrect) {
        quizState.score += 10;
        // Optional: If correct, we don't necessarily mark as completed here, 
        // as completing might require more than one correct answer.
        // But for now, let's keep it simple.
    } else {
        quizState.wrongAnswers.push(q.target);
        // Mark as wrong in data and unmark complete if it was
        const char = cheonjamunData.characters.find(c => c.id === q.target.id);
        if (char) {
            char.is_wrong = true;
            char.is_completed = false;
        }
    }

    quizState.currentIndex++;

    if (quizState.currentIndex < 10) {
        renderQuizQuestion();
    } else {
        showQuizResults();
    }
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

// ... existing code ...

// Initial Load
// const savedTheme = localStorage.getItem('cheonjamun_theme') || 'dark';
// applyTheme(savedTheme);
loadData();

// Event Listeners
window.addEventListener('dataLoaded', (e) => {
    // ... existing listeners ...

    // Settings Button (Disabled for now or remove listener)
    // const settingsBtn = document.querySelector('.app-header .icon-btn[aria-label="설정"]');
    // if(settingsBtn) {
    //     settingsBtn.addEventListener('click', toggleSettings);
    // }
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

        const details = sentence.char_ids.map(id => {
            const char = data.characters.find(c => c.id === id);
            return char ? `<span class="detail-char" onclick="openStrokeModal('${char.hanja}')">${char.hanja} <span class="detail-sound">${char.sound}</span></span>` : '';
        }).join('');

        card.innerHTML = `
            <div class="sentence-header">
                <span class="sentence-id">${sentence.id}</span>
                <span class="sentence-phrase">${sentence.phrase}</span>
            </div>
            <div class="sentence-interpretation">${sentence.interpretation}</div>
            <div class="sentence-details">${details}</div>
        `;
        listContainer.appendChild(card);
    });
}
