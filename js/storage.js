/**
 * Storage Helper Module
 * Handles all interactions with localStorage
 */

const Storage = {
  // Keys
  KEYS: {
    INTENTION: "ramadan_intention",
    WIRD_PROGRESS: "ramadan_wird_progress",
    KHATMA_COUNT: "ramadan_khatma_count",
    LAST_VISIT: "ramadan_last_visit",
    CACHED_AYAH: "ramadan_daily_ayah",
    CACHED_DHIKR: "ramadan_daily_dhikr",
    WIRD_DATE: "ramadan_wird_logical_date", // New key for the specific "10 min before Fajr" logic
  },

  // Save data
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Error saving to localStorage", e);
    }
  },

  // Get data
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error("Error reading from localStorage", e);
      return defaultValue;
    }
  },

  // Specific Getters/Setters for clean API
  setIntention: (text) => Storage.set(Storage.KEYS.INTENTION, text),
  getIntention: () => Storage.get(Storage.KEYS.INTENTION, ""),

  setKhatmaCount: (count) => Storage.set(Storage.KEYS.KHATMA_COUNT, count),
  getKhatmaCount: () => Storage.get(Storage.KEYS.KHATMA_COUNT, 1),

  setWirdProgress: (progress) =>
    Storage.set(Storage.KEYS.WIRD_PROGRESS, progress),
  setWirdProgress: (progress) =>
    Storage.set(Storage.KEYS.WIRD_PROGRESS, progress),
  getWirdProgress: () =>
    Storage.get(Storage.KEYS.WIRD_PROGRESS, {
      day: 1,
      completed: false,
      lastDate: null,
      startDate: null,
      prayersCompleted: [false, false, false, false, false],
      lastPageRead: 0, // <--- هذا هو المتغير الجديد المهم
    }),

  // New Settings for Redistribute feature
  setWirdSettings: (settings) => Storage.set("ramadan_wird_settings", settings),
  getWirdSettings: () =>
    Storage.get("ramadan_wird_settings", {
      customPagesPerDay: null,
      dismissedAlertDate: null,
    }),

  setDailyAyah: (ayahData) => Storage.set(Storage.KEYS.CACHED_AYAH, ayahData),
  getDailyAyah: () => Storage.get(Storage.KEYS.CACHED_AYAH),

  setLastWirdDate: (dateStr) => Storage.set(Storage.KEYS.WIRD_DATE, dateStr),
  getLastWirdDate: () => Storage.get(Storage.KEYS.WIRD_DATE, null),

  // Check if it's a new day
  isNewDay: () => {
    const lastDate = Storage.get(Storage.KEYS.LAST_VISIT);
    const today = new Date().toDateString();
    return lastDate !== today;
  },

  updateLastVisit: () => {
    Storage.set(Storage.KEYS.LAST_VISIT, new Date().toDateString());
  },
};

// Expose to window
window.Storage = Storage;
