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
window.handleLogin = function (provider) {
    // Simulate Login
    alert(`${provider} 로 로그인 중...`);

    // Set Login State
    localStorage.setItem('cheonjamun_is_logged_in', 'true');
    localStorage.setItem('cheonjamun_user_name', '학도 몽글이');

    // Simulate Sync
    setTimeout(() => {
        alert('학습 데이터가 클라우드와 동기화되었습니다!');
        renderAccountView();
        checkAttendance();
    }, 500);
};

window.handleLogout = function () {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('cheonjamun_is_logged_in');
        renderAccountView();
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
    const isLoggedIn = localStorage.getItem('cheonjamun_is_logged_in') === 'true';
    const loginSection = document.getElementById('login-section');
    const profileSection = document.getElementById('profile-section');

    if (isLoggedIn) {
        if (loginSection) loginSection.style.display = 'none';
        if (profileSection) profileSection.style.display = 'block';
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

window.toggleCompleted = function (id) {
    const char = cheonjamunData.characters.find(c => c.id === id);
    if (char) {
        char.is_completed = !char.is_completed;
        if (char.is_completed) char.is_wrong = false; // If completed, it shouldn't be in wrong answers

        const completed = cheonjamunData.characters.filter(c => c.is_completed).map(c => c.id);
        const wrong = cheonjamunData.characters.filter(c => c.is_wrong).map(c => c.id);

        localStorage.setItem('cheonjamun_completed', JSON.stringify(completed));
        localStorage.setItem('cheonjamun_wrong_answers', JSON.stringify(wrong));

        renderDictionaryList(true);
    }
};

// Learning state helper for games
window.updateLearningState = function (id, isCorrect) {
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
            hideAllViews();
            document.getElementById('dictionary-view').style.display = 'block';
            renderDictionaryList(true);
        });
    }

    // Word Games
    const wordBtn = document.querySelector('button[data-target="word-games"]');
    if (wordBtn) {
        wordBtn.addEventListener('click', () => {
            hideAllViews();
            document.getElementById('word-game-view').style.display = 'block';
        });
    }

    // Sentence Games
    const sentBtn = document.querySelector('button[data-target="sentence-games"]');
    if (sentBtn) {
        sentBtn.addEventListener('click', () => {
            hideAllViews();
            document.getElementById('sentence-game-view').style.display = 'block';
        });
    }

    // Account Button (Fixed Listener)
    const acctBtn = document.querySelector('button[data-target="account"]');
    if (acctBtn) {
        acctBtn.addEventListener('click', () => {
            hideAllViews();
            document.getElementById('account-view').style.display = 'block';
            renderAccountView();
        });
    }

    // Sentences List
    const sentencesBtn = document.querySelector('button[data-target="sentences"]');
    if (sentencesBtn) {
        sentencesBtn.addEventListener('click', () => {
            hideAllViews();
            document.getElementById('sentences-view').style.display = 'block';
            renderCheonjamun();
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
            hideAllViews();
            document.getElementById('dashboard-grid').style.display = 'grid';
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
                <button class="results-btn secondary" onclick="location.reload()">메인으로</button>
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

        const details = sentence.char_ids.map(id =>
            data.characters.find(c => c.id === id)
        ).filter(Boolean);

        const gridHtml = details.map(char => `
            <div class="char-card">
                <span class="char-hanja hanja-text">${char.hanja}</span>
                <span class="char-sound-meaning">${char.meaning} ${char.sound}</span>
                <span class="char-info">${char.level} / ${char.stroke_count}획</span>
            </div>
        `).join('');

        card.innerHTML = `
            <div class="sentence-header">
                <h2 class="sentence-phrase hanja-text">${sentence.phrase}</h2>
                <p class="sentence-meaning">${sentence.interpretation}</p>
            </div>
            <div class="char-grid">
                ${gridHtml}
            </div>
        `;
        listContainer.appendChild(card);
    });
}
