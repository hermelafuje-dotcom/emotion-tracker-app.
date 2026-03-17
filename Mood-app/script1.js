let selectedMoodStr = "";
let startTime = Date.now();

// --- 1. INITIALIZE APP ---
document.addEventListener('DOMContentLoaded', () => {
    const d = new Date();
    const dateElem = document.getElementById('currentDate');
    if (dateElem) {
        dateElem.innerText = d.toLocaleDateString('en-US', { 
            weekday: 'long', month: 'short', day: 'numeric' 
        }).toUpperCase();
    }
    
    displaySavedName(); // Load Name
    loadProfilePhoto(); // Load Photo
    loadHistory();      // Load Moods
});

// --- 2. PROFILE & NAME LOGIC ---
function changeName() {
    const currentName = document.getElementById('userNameDisplay').innerText;
    const newName = prompt("Enter your preferred name:", currentName);
    if (newName && newName.trim() !== "") {
        localStorage.setItem('userCustomName', newName.trim());
        displaySavedName();
    }
}

function displaySavedName() {
    const savedName = localStorage.getItem('userCustomName') || "Alex";
    const nameElement = document.getElementById('userNameDisplay');
    if (nameElement) nameElement.innerText = savedName;
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = function() {
        const base64String = reader.result;
        localStorage.setItem('userProfilePic', base64String);
        loadProfilePhoto();
    }
    if (file) reader.readAsDataURL(file);
}

function loadProfilePhoto() {
    const savedPhoto = localStorage.getItem('userProfilePic');
    const display = document.getElementById('profileImageDisplay');
    const placeholder = document.getElementById('avatarPlaceholder');
    if (savedPhoto && display) {
        display.src = savedPhoto;
        display.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    }
}

// --- 3. NAVIGATION & SCREENS ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) targetScreen.classList.add('active');
    
    if(screenId === 'report') updateWeeklyReport();
    if(screenId === 'activity') loadHistory();
}

// --- 4. MOOD & LOGGING ---
function selectMood(element, mood) {
    document.querySelectorAll('.emoji-circle').forEach(c => {
        c.style.transform = "scale(1)";
        c.style.border = "none";
    });
    const circle = element.querySelector('.emoji-circle');
    circle.style.transform = "scale(1.2)";
    circle.style.border = "2px solid #240b7b";
    selectedMoodStr = mood;
}

function saveEntry() {
    if(!selectedMoodStr) { alert("Please select a mood!"); return; }
    const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    const entry = {
        mood: selectedMoodStr,
        date: new Date().toISOString(),
        note: document.getElementById('journalInput').value
    };
    history.push(entry);
    localStorage.setItem('moodHistory', JSON.stringify(history));
    alert("Log Entry Saved!");
    resetForm();
}

// --- 5. WEEKLY REPORT LOGIC ---
function updateWeeklyReport() {
    const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    const msgElement = document.getElementById('analysisMsg');
    
    if (history.length < 2) {
        msgElement.innerText = "Keep logging! We need more data for your report.";
        return;
    }

    const lastMood = history[history.length - 1].mood;
    const improvements = history.filter(e => e.mood === 'Joyful' || e.mood === 'Calm').length;
    
    msgElement.innerHTML = `
        <strong>Status:</strong> Your last mood was ${lastMood}.<br>
        <strong>Progress:</strong> You've had ${improvements} positive moments recently.<br>
        <strong>Tip:</strong> You log most often on weekdays!
    `;
}

// --- 6. UTILS ---
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    const list = document.getElementById('historyList');
    
    if (!list) return;

    // --- The Empty State Logic ---
    if (history.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px 20px; opacity: 0.6;">
                <div style="font-size: 50px; margin-bottom: 10px;">✨</div>
                <p style="font-weight: 500; color: #4f0779;">Your journey starts here!</p>
                <p style="font-size: 13px; color: #b0b0d0;">Log your first mood on the Home screen to see your insights.</p>
            </div>
        `;
        return;
    }

    // --- Normal History Display ---
    list.innerHTML = history.slice().reverse().map(e => `
        <div class="history-item" style="background:white; padding:15px; border-radius:20px; margin-bottom:12px; border-left:5px solid #240b7b; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <strong style="font-size: 14px;">${new Date(e.date).toLocaleDateString()}</strong>
                <span style="font-size: 11px; background: #eceeff; padding: 3px 8px; border-radius: 10px; color: #240b7b; font-weight: bold;">${e.mood}</span>
            </div>
            <p style="font-size: 13px; color: #666; line-height: 1.4;">${e.note || "No notes for this entry."}</p>
        </div>
    `).join('');
}

function resetForm() {
    selectedMoodStr = "";
    document.querySelectorAll('.emoji-circle').forEach(c => {
        c.style.transform = "scale(1)";
        c.style.border = "none";
    });
    document.getElementById('journalInput').value = "";
    showScreen('home');
}

function clearData() {
    if(confirm("Delete all history?")) {
        localStorage.removeItem('moodHistory');
        loadHistory();
    }
}
// --- RESET PROFILE LOGIC ---
function resetProfile() {
    if(confirm("This will remove your custom name and photo. Continue?")) {
        // 1. Remove specific items from memory
        localStorage.removeItem('userCustomName');
        localStorage.removeItem('userProfilePic');
        
        // 2. Reset the name display back to default
        const nameElement = document.getElementById('userNameDisplay');
        if (nameElement) nameElement.innerText = "Alex";
        
        // 3. Hide the photo and show the placeholder emoji again
        const display = document.getElementById('profileImageDisplay');
        const placeholder = document.getElementById('avatarPlaceholder');
        
        if (display) {
            display.src = "";
            display.style.display = 'none';
        }
        if (placeholder) {
            placeholder.style.display = 'flex';
        }
        
        alert("Profile has been reset!");
    }
}
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    
    screens.forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none'; // Ensure they are fully hidden
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block'; // Bring it into the DOM
        
        // This tiny timeout allows the "slide" animation to play
        setTimeout(() => {
            targetScreen.classList.add('active');
        }, 10);
    }
    
    if(screenId === 'report') updateWeeklyReport();
    if(screenId === 'activity') loadHistory();
}
function getAISupport() {
    // You can customize this message to include their mood!
    const baseMessage = encodeURIComponent(`I am feeling ${selectedMoodStr || 'a bit overwhelmed'}. Can you give me some support?`);
    
    // This is the URL for ChatGPT with a pre-filled prompt
    const chatGPTUrl = `https://chatgpt.com/?q=${baseMessage}`;

    // We use window.open to open it in a new browser tab
    if (confirm("Redirecting to AI Support. Would you like to continue?")) {
        window.open(chatGPTUrl, '_blank');
    }
}
function updateWeeklyReport() {
    const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    const msgElement = document.getElementById('analysisMsg');
    
    // 1. Reset all bars to 0 first (for the animation effect)
    const moods = ['Joyful', 'Calm', 'Anxious', 'Sad', 'Angry'];
    moods.forEach(m => document.getElementById(`bar-${m}`).style.height = "0px");

    if (history.length === 0) {
        msgElement.innerText = "No data yet! Log some moods to see your chart.";
        return;
    }

    // 2. Count occurrences of each mood
    const counts = {};
    moods.forEach(m => counts[m] = 0);
    history.forEach(entry => {
        if(counts[entry.mood] !== undefined) counts[entry.mood]++;
    });

    // 3. Find the mood with the highest count to scale the chart
    const maxCount = Math.max(...Object.values(counts));
    const chartHeight = 120; // Max pixels for the tallest bar

    // 4. Update the Bar Heights
    moods.forEach(m => {
        const height = maxCount > 0 ? (counts[m] / maxCount) * chartHeight : 0;
        document.getElementById(`bar-${m}`).style.height = `${height}px`;
    });

    // 5. Update the text message
    const topMood = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    msgElement.innerHTML = `You've been feeling mostly <strong>${topMood}</strong> lately. Keep tracking to see your long-term patterns!`;
}
function downloadPDFReport() {
    // 1. Make sure the report has the latest data/chart
    updateWeeklyReport();
    
    // 2. Small delay to let the chart animation finish
    setTimeout(() => {
        window.print();
    }, 500);
}
function showMoodDetails() {
    const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    
    if (history.length === 0) {
        alert("No data available yet. Start logging your moods to see your deep-dive analysis!");
        return;
    }

    // Simple Logic: Calculate how many 'Positive' vs 'Negative' days
    const positiveMoods = history.filter(e => e.mood === 'Joyful' || e.mood === 'Calm').length;
    const total = history.length;
    const score = Math.round((positiveMoods / total) * 100);

    // React by showing an informative alert (or you can use the Modal code from before)
    alert(`✧ Wellness Deep Dive ✧\n\nTotal Check-ins: ${total}\nPositive Vibe Rate: ${score}%\n\nKeep it up! Your consistency is the key to better mental health.`);
}
function selectMood(element, mood) {
    // 1. Remove all special glow classes from all emojis
    document.querySelectorAll('.emoji-circle').forEach(c => {
        c.className = "emoji-circle " + c.classList[1]; // Keeps the original color class
        c.style.transform = "scale(1)";
    });

    // 2. Add the glow to the clicked one
    const circle = element.querySelector('.emoji-circle');
    circle.classList.add(`selected-${mood.toLowerCase()}`);
    circle.style.transform = "scale(1.2)";
    
    selectedMoodStr = mood;
}