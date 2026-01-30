/**
 * Prayer Times Logic
 * Uses AlAdhan API
 */

const PrayerManager = {
  // City Configuration (Default: Cairo)
  config: {
    city: "Cairo",
    country: "Egypt",
    method: 5, // Egyptian General Authority
  },

  // State
  timings: null,
  hijriMonth: null, // Store current Hijri month number
  lastNotifiedPrayer: null, // Track last notification to avoid duplicates
  lastPreNotifiedPrayer: null, // Track 15-min warning notification

  init: async () => {
    await PrayerManager.fetchTimings();
    PrayerManager.startTimer();
  },

  fetchTimings: async () => {
    const { city, country, method } = PrayerManager.config;
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`; // DD-MM-YYYY

    try {
      // Check LocalStorage first
      const cached = localStorage.getItem("prayerTimings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === dateStr) {
          PrayerManager.timings = parsed.timings;
          PrayerManager.hijriMonth = parsed.hijri?.month?.number; // Restore Hijri
          PrayerManager.renderPrayers();
          return;
        }
      }

      // Fetch new
      const res = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${city}&country=${country}&method=${method}`,
      );
      const data = await res.json();

      if (data.code === 200) {
        PrayerManager.timings = data.data.timings;
        const hijri = data.data.date.hijri;
        PrayerManager.hijriMonth = hijri.month.number; // Store Month Number (9 = Ramadan)

        localStorage.setItem(
          "prayerTimings",
          JSON.stringify({
            date: dateStr,
            timings: data.data.timings,
            hijri: hijri,
          }),
        );
        PrayerManager.renderPrayers();
      }
    } catch (e) {
      console.error("Error fetching prayers:", e);
      document.getElementById("next-prayer-name").textContent =
        "تعذر تحميل المواقيت";
    }
  },

  renderPrayers: () => {
    if (!PrayerManager.timings) return;

    const list = document.getElementById("prayers-list");
    list.innerHTML = "";

    const prayers = [
      { key: "Fajr", name: "الفجر" },
      { key: "Dhuhr", name: "الظهر" },
      { key: "Asr", name: "العصر" },
      { key: "Maghrib", name: "المغرب" },
      { key: "Isha", name: "العشاء" },
    ];

    prayers.forEach((p) => {
      const time = PrayerManager.formatTime(PrayerManager.timings[p.key]);

      const div = document.createElement("div");
      div.className = "prayer-row";
      div.id = `prayer-${p.key}`;
      div.innerHTML = `<span>${p.name}</span><span>${time}</span>`;

      list.appendChild(div);
    });

    PrayerManager.updateHighlight();
  },

  // Convert 24h to 12h Arabic
  formatTime: (timeStr) => {
    let [h, m] = timeStr.split(":").map(Number);
    const suffix = h >= 12 ? "م" : "ص";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, "0")} ${suffix}`;
  },

  startTimer: () => {
    setInterval(() => {
      PrayerManager.updateHighlight();
    }, 1000);
  },

  updateHighlight: () => {
    if (!PrayerManager.timings) return;

    const now = new Date();
    const prayTimes = PrayerManager.timings;
    const keys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    let nextPrayer = null;
    let minDiff = Infinity;
    let activeKey = null;

    // Find next prayer logic
    for (let key of keys) {
      const timeStr = prayTimes[key];
      const [h, m] = timeStr.split(":");
      const pDate = new Date();
      pDate.setHours(h, m, 0, 0);

      let diff = pDate - now;

      // Notification Logic (Window of 1 minute)
      if (diff <= 0 && diff > -60000) {
        if (PrayerManager.lastNotifiedPrayer !== key) {
          const arabicName = {
            Fajr: "الفجر",
            Dhuhr: "الظهر",
            Asr: "العصر",
            Maghrib: "المغرب",
            Isha: "العشاء",
          }[key];

          // Differentiate Messages for Ramadan
          let title = `حان الآن موعد صلاة ${arabicName}`;
          let body = "حي على الصلاة، حي على الفلاح";

          if (isRamadan) {
            if (key === "Maghrib") {
              title = "حان موعد أذان المغرب 🍽️";
              body = "صياما مقبولا وإفطارا شهيا. لا تنس الدعاء عند الإفطار.";
            } else if (key === "Fajr") {
              title = "حان موعد أذان الفجر 🕌";
              body = "تقبل الله صيامكم وقيامكم.";
            }
          }

          // Trigger Notification
          if (window.App && App.sendNotification) {
            App.sendNotification(title, body);
          }

          PrayerManager.lastNotifiedPrayer = key;
        }
      }

      // Pre-Adhan Notification (Window of 14-15 minutes before)
      // 15 mins = 900000 ms. Let's trigger if between 15 and 14 mins left
      if (diff > 840000 && diff <= 900000) {
        if (PrayerManager.lastPreNotifiedPrayer !== key) {
          const arabicName = {
            Fajr: "الفجر",
            Dhuhr: "الظهر",
            Asr: "العصر",
            Maghrib: "المغرب",
            Isha: "العشاء",
          }[key];

          let body = `اقترب موعد صلاة ${arabicName} (باقي 15 دقيقة)`;

          // Ramadan Specifics
          if (isRamadan && key === "Maghrib") {
            body = `🌙 اقترب موعد الإفطار (باقي 15 دقيقة). جهز دعواتك!`;
          } else if (isRamadan && key === "Fajr") {
            body = `⏳ اقترب موعد الإمساك (باقي 15 دقيقة). تسحروا فإن في السحور بركة.`;
          }

          if (window.App && App.sendNotification) {
            App.sendNotification(`اقترب وقت ${arabicName}`, body);
          }

          PrayerManager.lastPreNotifiedPrayer = key;
        }
      }

      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        nextPrayer = pDate;
        activeKey = key;
      }
    }

    let isNextDay = false;
    if (!nextPrayer) {
      activeKey = "Fajr";
      const [h, m] = prayTimes["Fajr"].split(":");
      nextPrayer = new Date();
      nextPrayer.setDate(nextPrayer.getDate() + 1);
      nextPrayer.setHours(h, m, 0, 0);
      minDiff = nextPrayer - now;
      isNextDay = true;
    }

    // --- Ramadan Logic (Auto-Detect) ---
    // Ramadan is Month 9 in Hijri calendar
    // Ensure month is parsed as integer
    const currentHijriMonth = parseInt(PrayerManager.hijriMonth || 0);
    const isRamadan = currentHijriMonth === 9;

    // Arabic Names Map
    const arabicNames = {
      Fajr: "الفجر",
      Dhuhr: "الظهر",
      Asr: "العصر",
      Maghrib: "المغرب",
      Isha: "العشاء",
    };

    let label = `الصلاة القادمة: ${arabicNames[activeKey]} ${isNextDay ? "(غداً)" : ""}`;

    if (isRamadan) {
      if (activeKey === "Maghrib") {
        label = `🍽️ باقي على الإفطار (المغرب)`;
      } else if (activeKey === "Fajr") {
        label = `🛑 باقي على الإمساك (الفجر)`;
      }
    }

    // Update UI
    const labelEl = document.getElementById("next-prayer-name");
    if (labelEl) labelEl.textContent = label;

    // Highlight active row
    document
      .querySelectorAll(".prayer-row")
      .forEach((r) => r.classList.remove("active"));
    const row = document.getElementById(`prayer-${activeKey}`);
    if (row) row.classList.add("active");

    // Countdown
    if (minDiff > 0) {
      const hours = Math.floor(minDiff / (1000 * 60 * 60));
      const minutes = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((minDiff % (1000 * 60)) / 1000);
      const str = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      const timerEl = document.getElementById("countdown-timer");
      if (timerEl) timerEl.textContent = str;
    }
  },

  // Helper: Get Today's Fajr Date Object
  getFajrDate: () => {
    if (!PrayerManager.timings) return null;
    const fajrTime = PrayerManager.timings["Fajr"]; // "HH:MM"
    if (!fajrTime) return null;

    const [h, m] = fajrTime.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date;
  },
};

// Initialize
document.addEventListener("DOMContentLoaded", PrayerManager.init);
