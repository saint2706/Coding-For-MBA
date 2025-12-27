// API base URL
const API_BASE = '/api/v1';

// Fetch progress data
async function loadProgress() {
    try {
        // First, trigger a dummy progress update to get/set user ID
        const response = await fetch(`${API_BASE}/progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: 'init',
                day: 1,
                status: 'started'
            })
        });

        const data = await response.json();
        const userId = data.user_id;

        if (!userId) {
            throw new Error('Failed to get user ID from backend');
        }

        // Fetch actual progress
        const progressRes = await fetch(`${API_BASE}/progress/${userId}`);
        const progressData = await progressRes.json();

        // Fetch badges
        const badgesRes = await fetch(`${API_BASE}/badges/${userId}`);
        const badgesData = await badgesRes.json();

        // Fetch structure and suggestions
        let structure = {};
        try {
            const structRes = await fetch('/static/course_structure.json');
            structure = await structRes.json();
        } catch (e) { console.warn('Structure load failed', e); }

        try {
            const suggestRes = await fetch(`${API_BASE}/adaptive/suggest?user_id=${userId}`);
            renderNextMission(await suggestRes.json(), structure);
        } catch (e) { console.warn('Mission load failed', e); }

        // Update UI
        updateDashboard(progressData, badgesData, structure);
        checkAuth(userId);

        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';

    } catch (error) {
        console.error('Error loading progress:', error);

        // Log error details for debugging
        if (error.message) {
            console.error('Error message:', error.message);
        }
        if (error.name) {
            console.error('Error type:', error.name);
        }

        // Graceful Degradation (Offline/Guest Mode)
        const warningHtml = `
            <div class="guest-mode-warning" role="alert">
                <span class="guest-mode-warning-icon">⚠️</span>
                <div>
                    <strong>Guest Mode Enabled:</strong> Could not load personalized progress.
                    <div class="guest-mode-warning-subtext">
                        This may happen if cookies are blocked or the backend is in a restricted mode.
                    </div>
                </div>
            </div>
        `;

        const dashboard = document.getElementById('dashboard');
        if (!dashboard) {
            console.error('Dashboard element not found in DOM');
            document.getElementById('loading').style.display = 'none';
            return;
        }

        // Insert warning before content if not already present
        if (!document.querySelector('.guest-mode-warning')) {
            dashboard.insertAdjacentHTML('afterbegin', warningHtml);
        }

        // Render default locked state
        updateDashboard({
            completion_percentage: 0,
            completed: 0,
            total_lessons: 108,
            lessons: []
        }, {
            badge_count: 0,
            badges: []
        });

        document.getElementById('loading').style.display = 'none';
        dashboard.style.display = 'block';
    }
}

function updateDashboard(progressData, badgesData, structure) {
    // Update completion stats
    const completionPct = progressData.completion_percentage || 0;
    document.getElementById('completion-percentage').textContent = `${completionPct}%`;
    document.getElementById('completed-count').textContent =
        `${progressData.completed}/${progressData.total_lessons || 108}`;
    document.getElementById('badge-count').textContent =
        `${badgesData.badge_count}/7`;
    document.getElementById('streak').textContent = '0 days'; // Placeholder

    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    progressBar.style.width = `${completionPct}%`;
    progressBar.setAttribute('aria-valuenow', completionPct);
    progressText.textContent = `${completionPct}%`;

    // Update badges
    updateBadges(badgesData.badges || []);

    // Update recent activity
    updateActivity(progressData.lessons || [], structure);
}

function updateBadges(badges) {
    const container = document.getElementById('badges-container');
    const earnedPhases = new Set(badges.map(b => b.phase));

    const phaseTitles = {
        1: "Python foundations (syntax, data structures, file handling) (Days 1-20)",
        2: "Data Science & Analytics (Days 21-39)",
        3: "Machine Learning (Days 40-54)",
        4: "Advanced ML & MLOps (Days 55-67)",
        5: "Business Intelligence (Days 68-84)",
        6: "Advanced BI topics (cloud platforms, governance) and capstone project (Days 85-90)",
        7: "SQL & database mastery (design, optimization, advanced features) (Days 91-108)"
    };

    container.innerHTML = '';
    for (let phase = 1; phase <= 7; phase++) {
        const badgeEl = document.createElement('div');
        badgeEl.className = earnedPhases.has(phase) ? 'badge' : 'badge badge-locked';
        badgeEl.textContent = `Phase ${phase}`;

        // UX & Accessibility Improvements
        const title = phaseTitles[phase] || `Phase ${phase}`;
        const status = earnedPhases.has(phase) ? "Completed" : "Locked";

        badgeEl.setAttribute('tabindex', '0'); // Keyboard accessible
        badgeEl.setAttribute('aria-label', `${title}: ${status}`);
        badgeEl.setAttribute('data-tooltip', `${title}: ${status}`);

        if (earnedPhases.has(phase)) {
            const br = document.createElement('br');
            badgeEl.appendChild(br);
            badgeEl.appendChild(document.createTextNode('✅'));
        }

        container.appendChild(badgeEl);
    }
}

function renderNextMission(suggestion, structure) {
    const container = document.getElementById('next-mission-container');

    // If there is no suggestion at all, clear the container and exit.
    if (!suggestion) {
        container.innerHTML = "";
        return;
    }

    // When the curriculum is completed, the backend returns suggested_lesson: null
    // along with a congratulations message. Handle that explicitly.
    if (suggestion.suggested_lesson == null) {
        const message =
            suggestion.reason ||
            suggestion.message ||
            "🎉 You've completed the curriculum! Explore the lessons again or apply your skills to real projects.";

        // Create card element
        const card = document.createElement('div');
        card.className = 'next-mission-card';

        // Create heading
        const heading = document.createElement('h2');
        heading.textContent = '🎉 Curriculum Complete!';
        card.appendChild(heading);

        // Create message paragraph
        const messagePara = document.createElement('p');
        messagePara.className = 'subtitle subtitle-spaced';
        messagePara.textContent = message;
        card.appendChild(messagePara);

        container.innerHTML = '';
        container.appendChild(card);
        return;
    }

    const day = suggestion.suggested_lesson;
    const folder = structure[day] || `Day_${day}`;

    // Fix topic extraction logic to handle fallback case properly
    let topic;
    const parts = folder.split('_');
    if (parts.length >= 3) {
        topic = parts.slice(2).join(' ');
    } else {
        topic = `Lesson ${day}`;
    }

    // Use solutions.py which exists in most Day folders
    const cmd = `python ${folder}/solutions.py`;

    // Create elements safely to avoid XSS
    const card = document.createElement('div');
    card.className = 'next-mission-card';

    // Create heading
    const heading = document.createElement('h2');
    heading.textContent = `🚀 Next Mission: ${topic}`;
    card.appendChild(heading);

    // Create reason paragraph
    const reasonPara = document.createElement('p');
    reasonPara.className = 'subtitle subtitle-spaced';
    reasonPara.textContent = suggestion.reason || '';
    card.appendChild(reasonPara);

    // Create command box
    const commandBox = document.createElement('div');
    commandBox.className = 'command-box';

    // Create code element
    const codeEl = document.createElement('code');
    codeEl.textContent = cmd;
    commandBox.appendChild(codeEl);

    // Create copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.setAttribute('aria-label', 'Copy command');
    copyBtn.setAttribute('data-tooltip', 'Copy command');
    copyBtn.textContent = '📋';

    // Store timeout ID to handle rapid clicks
    let revertTimeoutId = null;

    // Add event listener instead of inline onclick
    if (navigator.clipboard && navigator.clipboard.writeText) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(cmd)
                .then(() => {
                    // Clear any pending revert
                    if (revertTimeoutId) {
                        clearTimeout(revertTimeoutId);
                    }

                    // Visual feedback
                    copyBtn.textContent = '✅';
                    copyBtn.setAttribute('aria-label', 'Copied!');
                    copyBtn.setAttribute('data-tooltip', 'Copied!');

                    // Revert after 2 seconds
                    revertTimeoutId = setTimeout(() => {
                        copyBtn.textContent = '📋';
                        copyBtn.setAttribute('aria-label', 'Copy command');
                        copyBtn.setAttribute('data-tooltip', 'Copy command');
                        revertTimeoutId = null;
                    }, 2000);
                })
                .catch((err) => {
                    console.error('Failed to copy command:', err);
                });
        });
    }

    commandBox.appendChild(copyBtn);
    card.appendChild(commandBox);

    // Clear container and add the new card
    container.innerHTML = '';
    container.appendChild(card);
}

function updateActivity(lessons, structure) {
    const container = document.getElementById('activity-container');

    if (!lessons || lessons.length === 0) {
        container.innerHTML = `
            <li class="empty-activity-message">
                No activity yet. Start learning to see your progress here!
            </li>
        `;
        return;
    }

    // Show last 10 lessons
    const recent = lessons.slice(-10).reverse();
    container.innerHTML = recent.map(lesson => {
        let topic = '';
        if (structure && structure[lesson.day]) {
            const folder = structure[lesson.day];
            const parts = folder.split('_');
            if (parts.length >= 3) {
                topic = parts.slice(2).join(' ');
            }
        }

        return `
        <li class="activity-item">
            <div class="activity-day">
                Day ${lesson.day}
                ${topic ? `<span class="activity-topic">${topic}</span>` : ''}
            </div>
            <div class="activity-status status-${lesson.status}">
                ${lesson.status}
            </div>
        </li>
    `}).join('');
}

// Check authentication status and update UI
async function checkAuth(userId) {
    try {
        // Fetch configuration
        const rootRes = await fetch('/');
        const rootData = await rootRes.json();

        const isGitHubUser = userId && userId.startsWith('github_');

        // Get header element
        const header = document.querySelector('.header');

        // Create auth container if it doesn't exist
        let authContainer = document.getElementById('auth-container');
        if (!authContainer) {
            authContainer = document.createElement('div');
            authContainer.id = 'auth-container';
            authContainer.className = 'auth-container';
            header.appendChild(authContainer);
        }

        if (rootData.endpoints && rootData.endpoints.auth && !isGitHubUser) {
            // Show Login Button
            authContainer.innerHTML = `
                <a href="${rootData.endpoints.auth}" class="btn github-login-btn">
                    Login with GitHub
                </a>
            `;
        } else if (isGitHubUser) {
            // Show User Info
            authContainer.innerHTML = `
                <div class="user-logged-in-badge">
                    ✓ Logged in via GitHub
                </div>
            `;
        }
    } catch (error) {
        console.error('Error checking auth:', error);
    }
}

// Load progress on page load
loadProgress();
