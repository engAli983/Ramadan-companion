/**
 * Main Application Logic
 * Shared across pages
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check for new day and update visit
    if (Storage.isNewDay()) {
        console.log("New Day Detected");
        // Reset daily specific states if needed
        Storage.updateLastVisit();
    }

    // Helper to determine Ramadan Phase
    // For simplicity, we assume day 1-10 = early, 11-20 = middle, 21+ = last
    // In a real usage, we might calculate this from a start date.
    // Here we will mock it or calculate based on a hypothetical start.
    // Let's assume user sets day 1 or we just use random persistence for demo if date logic is complex without backend.
    
    // Better approach: Calculate based on Hijri date or simply Day X of 30.
    // For MVP, let's derive "Ramadan Day" from a stored start date or just simulate it.
    // SIMULATION: We will pick a random phase for demonstration if date isn't set, 
    // OR cleaner: We check current date against a fixed Ramadan start date (e.g. March 2025).
    // Let's stick to a simpler method: Current Date vs Stored "Start Date".
    // If no start date, we can assume today is Day 1 for the user's journey.
    
    // Init Decorations
    App.initDecorations();
    
    // Init Theme
    App.initTheme();
});

const App = {
    // Initialize Theme (Dark/Light)
    initTheme: () => {
        const themeToggle = document.getElementById('theme-toggle');
        const savedTheme = localStorage.getItem('theme');
        const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        // Apply initial state
        if (isDark) {
            document.body.classList.add('dark-theme');
            if (themeToggle) themeToggle.textContent = '☀️'; // Sun icon for switching to light
        } else {
             if (themeToggle) themeToggle.textContent = '🌙'; // Moon icon for switching to dark
        }
        
        // Event Listener
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-theme');
                const darkNow = document.body.classList.contains('dark-theme');
                localStorage.setItem('theme', darkNow ? 'dark' : 'light');
                themeToggle.textContent = darkNow ? '☀️' : '🌙';
            });
        }
    },

    // Inject Ramadan Decorations (Lanterns)
    initDecorations: () => {
        // Only if not already present
        if(document.querySelector('.ramadan-decorations')) return;

        const container = document.createElement('div');
        container.className = 'ramadan-decorations';
        
        // Lantern SVG (Static Body Only)
        const lanternSVG = `
        <svg viewBox="0 0 55 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Top Cap -->
            <path d="M27.5 20 L40 30 H15 L27.5 20Z" fill="#b45309"/>
            <!-- Body -->
            <path d="M15 30 L10 50 L15 75 H40 L45 50 L40 30 H15Z" fill="url(#grad1)" stroke="#d97706" stroke-width="1"/>
            <!-- Bottom -->
            <path d="M15 75 L20 85 H35 L40 75" fill="#b45309"/>
            <!-- Light -->
            <circle cx="27.5" cy="52" r="8" fill="#fbbf24" opacity="0.6"></circle>
            <!-- Gradient -->
            <defs>
                <linearGradient id="grad1" x1="27" y1="30" x2="27" y2="75" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#0f766e"/>
                    <stop offset="1" stop-color="#0d9488"/>
                </linearGradient>
            </defs>
        </svg>
        `;

        // Static Background Lanterns
        const lantern1 = document.createElement('div');
        lantern1.className = 'lantern';
        lantern1.style.right = '-20px';
        lantern1.style.top = '10px';
        lantern1.style.width = '120px';
        lantern1.style.transform = 'rotate(-10deg)';
        lantern1.innerHTML = lanternSVG;

        const lantern2 = document.createElement('div');
        lantern2.className = 'lantern';
        lantern2.style.left = '-30px';
        lantern2.style.top = '40px';
        lantern2.style.width = '100px';
        lantern2.style.transform = 'rotate(15deg)';
        lantern2.innerHTML = lanternSVG;

        container.appendChild(lantern1);
        container.appendChild(lantern2);
        
        document.body.appendChild(container);

        // Add Crescent Moon in Background via CSS text-pseudo or similar for header?
        // Let's add it to the header via JS if header exists
        const header = document.querySelector('header');
        if(header) {
            header.style.position = 'relative';
            const moon = document.createElement('div');
            moon.style.position = 'absolute';
            moon.style.top = '10px';
            moon.style.left = '20px';
            moon.style.fontSize = '3rem';
            moon.style.opacity = '0.1'; // Very subtle
            moon.style.transform = 'rotate(-15deg)';
            moon.innerHTML = '🌙';
            header.prepend(moon);
        }
    },

    // Get current Ramadan Phase
    getPhase: (ramadanDay) => {
        if (ramadanDay <= 10) return 'early';
        if (ramadanDay <= 20) return 'middle';
        return 'last';
    },

    // Fetch JSON data
    fetchData: async (filename) => {
        try {
            const response = await fetch(`data/${filename}`);
            if (!response.ok) throw new Error(`Failed to load ${filename}`);
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    // Load Ayah of the Day
    loadDailyAyah: async () => {
        const container = document.getElementById('ayah-container');
        if (!container) return; // Not on home page

        const cached = Storage.getDailyAyah();
        const today = new Date().toDateString();

        // If we have a cached ayah for TODAY, use it.
        if (cached && cached.date === today) {
            App.renderAyah(cached.data);
            return;
        }

        // Otherwise, fetch new
        const verses = await App.fetchData('quran.json');
        
        // Determine phase (Mocking day 1 for now, or random)
        // For a feeling of progression, let's pick based on Day of Month maybe?
        const dayOfMonth = new Date().getDate(); 
        const phase = App.getPhase(dayOfMonth % 30 + 1); // Mock 1-30 cycle
        
        const possibleVerses = verses.filter(v => v.phase === phase);
        // Random pick from valid phase
        const randomVerse = possibleVerses[Math.floor(Math.random() * possibleVerses.length)];

        // Cache it
        Storage.setDailyAyah({ date: today, data: randomVerse });
        App.renderAyah(randomVerse);
    },

    renderAyah: (ayah) => {
        const container = document.getElementById('ayah-text');
        const meta = document.getElementById('ayah-meta');
        const why = document.getElementById('ayah-why');
        
        if(container) container.textContent = ayah.text;
        if(meta) meta.textContent = `${ayah.surah} - آية ${ayah.ayah}`;
        
        // Tooltip or sub-text for "Why"
        if(why) why.title = ayah.why;
    },

    // Calendar & Countdown Logic
    initCalendar: () => {
        const calendarContainer = document.getElementById('calendar-widget');
        if (!calendarContainer) return;

        const today = new Date();
        
        // 1. Dates Display
        const optionsGregorian = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const optionsHijri = { year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic-umalqura' };

        document.getElementById('date-gregorian').textContent = today.toLocaleDateString('ar-EG', optionsGregorian);
        document.getElementById('date-hijri').textContent = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', optionsHijri).format(today);

        // 2. Countdown Logic
        const currentYear = today.getFullYear();
        let ramadanStart = new Date(currentYear, 1, 18); // Feb 18 approx
        
        const diffTime = ramadanStart - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const counterEl = document.getElementById('ramadan-counter');
        
        if (diffDays > 0 && diffDays <= 365) {
            counterEl.innerHTML = `باقي <span class="text-primary" style="font-size:1.4rem; font-weight:bold;">${diffDays}</span> يوم على رمضان`;
        } else if (diffDays <= 0 && diffDays > -30) {
            const currentRamadanDay = Math.abs(diffDays) + 1;
            counterEl.innerHTML = `اليوم <span class="text-primary" style="font-size:1.4rem; font-weight:bold;">${currentRamadanDay}</span> من رمضان (تقريبي)`;
        } else {
            counterEl.innerHTML = `اللهم بلغنا رمضان`;
        }
    },

    // Toast Notification
    showNotification: (message) => {
        // Remove existing if any
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-notification toast-success';
        toast.innerHTML = `<span>✅</span> <span>${message}</span>`;
        
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Hide after 3s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Global Expose
window.App = App;

// Auto-run calendar on load and Notification Setup
document.addEventListener('DOMContentLoaded', () => {
    App.initCalendar();
    
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker Registered', reg))
        .catch(err => console.error('Service Worker Registration Failed', err));
    }

    // Permission Side Toast Logic
    if(Notification.permission !== 'granted' && Notification.permission !== 'denied') {
         setTimeout(() => {
             // Show Toast on side
             App.showNotification("🔔 انقر هنا لتفعيل التنبيهات", "info");
             const toast = document.querySelector('.toast-notification');
             
             if (toast) {
                 toast.style.cursor = 'pointer';
                 
                 // Hide after 60 seconds (1 minute)
                 const hideTimeout = setTimeout(() => {
                     toast.classList.remove('show');
                 }, 60000);

                 // Handle Click
                 toast.onclick = () => {
                     clearTimeout(hideTimeout); // Stop auto-hide
                     
                     Notification.requestPermission().then(perm => {
                         if(perm === 'granted') {
                             // Show success for 5-10 seconds
                             App.showNotification("✅ تم تفعيل التنبيهات بنجاح", "success");
                             
                             // Test notification
                             if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                                 App.sendNotification("أهلاً بك!", "تم تفعيل نظام التنبيهات بنجاح.");
                             }

                             setTimeout(() => {
                                 const successToast = document.querySelector('.toast-notification');
                                 if(successToast) successToast.classList.remove('show');
                             }, 8000); // 8 seconds success message
                         } else {
                             // Denied or closed
                             toast.classList.remove('show');
                         }
                     });
                 };
             }
         }, 5000); // Initial delay 5s
    }

    // Wird Reminder Logic (Check every minute)
    setInterval(() => {
        const now = new Date();
        // Check if it's 11:00 PM (23:00) exactly (or within first minute)
        if (now.getHours() === 23 && now.getMinutes() === 0) {
             const progress = Storage.getWirdProgress();
             
             // If not completed today
             if (!progress.completed) {
                 // Check if we already notified today to avoid spam (using a session flag or parsing lastNotified)
                 const lastReminded = sessionStorage.getItem('wird_reminder_sent');
                 const todayStr = now.toDateString();
                 
                 if (lastReminded !== todayStr) {
                     App.sendNotification(
                         "تذكير بالورد اليومي 📖", 
                         "باقي ساعة واحدة على نهاية اليوم. لا تنس قراءة وردك من القرآن الكريم."
                     );
                     sessionStorage.setItem('wird_reminder_sent', todayStr);
                 }
             }
        }
    }, 60000); // Run every minute
});

// Extend App with Notification Logic
App.sendNotification = (title, body) => {
    if (Notification.permission === 'granted') {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title, {
                    body: body,
                    icon: '/icon.png', // Ensure an icon exists or remove
                    vibrate: [200, 100, 200]
                });
            });
        } else {
            new Notification(title, { body });
        }
    }
};
