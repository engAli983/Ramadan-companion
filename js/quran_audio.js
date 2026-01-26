/**
 * Quran Audio Page Logic
 * Features:
 * 1. Ayah of the Day (Audio + Text)
 * 2. Main Player (Reciter + Surah)
 * 3. Quick Access (Popular Surahs)
 */

document.addEventListener("DOMContentLoaded", () => {
  initFeaturedAyah();
  initMainPlayer();
  initFeaturedReciters();
});

/* --- 1. Featured Ayah (Ayah of the Day) --- */
const dailyAyahText = document.getElementById("dailyAyahText");
const dailySurahName = document.getElementById("dailySurahName");
const dailyAudioPlayer = document.getElementById("dailyAudioPlayer");
const playDailyBtn = document.getElementById("playDailyAyah");
const refreshDailyBtn = document.getElementById("refreshDailyAyah");

function initFeaturedAyah() {
  loadRandomAyah();

  playDailyBtn.addEventListener("click", () => {
    if (dailyAudioPlayer.paused) {
      dailyAudioPlayer.play();
      playDailyBtn.textContent = "⏸️";
    } else {
      dailyAudioPlayer.pause();
      playDailyBtn.textContent = "▶️";
    }
  });

  dailyAudioPlayer.addEventListener("ended", () => {
    playDailyBtn.textContent = "▶️";
  });

  refreshDailyBtn.addEventListener("click", loadRandomAyah);
}

function loadRandomAyah() {
  // Random Ayah ID between 1 and 6236
  const randomId = Math.floor(Math.random() * 6236) + 1;

  // Fetch from AlQuran.cloud (Edition: Alafasy for audio)
  playDailyBtn.disabled = true;
  dailyAyahText.textContent = "جاري التحميل...";

  fetch(`https://api.alquran.cloud/v1/ayah/${randomId}/ar.alafasy`)
    .then((res) => res.json())
    .then((data) => {
      const ayah = data.data;
      dailyAyahText.textContent = ayah.text;
      dailySurahName.textContent = `سورة ${ayah.surah.name} - آية ${ayah.numberInSurah}`;
      dailyAudioPlayer.src = ayah.audio;
      playDailyBtn.disabled = false;
      playDailyBtn.textContent = "▶️";
    })
    .catch((err) => {
      console.error(err);
      dailyAyahText.textContent = "حدث خطأ في تحميل الآية.";
    });
}

/* --- 2. Main Player Logic --- */
// Curated list of high-quality reciters
const reciters = [
  {
    id: "husr",
    name: "محمود خليل الحصري",
    server: "https://server13.mp3quran.net/husr/",
  },
  {
    id: "minsh",
    name: "محمد صديق المنشاوي",
    server: "https://server10.mp3quran.net/minsh/",
  },
  {
    id: "basit",
    name: "عبد الباسط عبد الصمد",
    server: "https://server7.mp3quran.net/basit/",
  },
  {
    id: "yasser",
    name: "ياسر الدوسري",
    server: "https://server11.mp3quran.net/yasser/",
  },
  {
    id: "qtm",
    name: "ناصر القطامي",
    server: "https://server6.mp3quran.net/qtm/",
  },
  {
    id: "afs",
    name: "مشاري العفاسي",
    server: "https://server8.mp3quran.net/afs/",
  },
  {
    id: "shur",
    name: "سعود الشريم",
    server: "https://server7.mp3quran.net/shur/",
  },
  {
    id: "sud",
    name: "عبد الرحمن السديس",
    server: "https://server11.mp3quran.net/sds/",
  },
  {
    id: "ahmad_nu",
    name: "أحمد نعينع",
    server: "https://server11.mp3quran.net/ahmad_nu/",
  },
];

// Surah Names List (Static for speed)
const surahNames = [
  "الفاتحة",
  "البقرة",
  "آل عمران",
  "النساء",
  "المائدة",
  "الأنعام",
  "الأعراف",
  "الأنفال",
  "التوبة",
  "يونس",
  "هود",
  "يوسف",
  "الرعد",
  "إبراهيم",
  "الحجر",
  "النحل",
  "الإسراء",
  "الكهف",
  "مريم",
  "طه",
  "الأنبياء",
  "الحج",
  "المؤمنون",
  "النور",
  "الفرقان",
  "الشعراء",
  "النمل",
  "القصص",
  "العنكبوت",
  "الروم",
  "لقمان",
  "السجدة",
  "الأحزاب",
  "سبأ",
  "فاطر",
  "يس",
  "الصافات",
  "ص",
  "الزمر",
  "غافر",
  "فصلت",
  "الشورى",
  "الزخرف",
  "الدخان",
  "الجاثية",
  "الأحقاف",
  "محمد",
  "الفتح",
  "الحجرات",
  "ق",
  "الذاريات",
  "الطور",
  "النجم",
  "القمر",
  "الرحمن",
  "الواقعة",
  "الحديد",
  "المجادلة",
  "الحشر",
  "الممتحنة",
  "الصف",
  "الجمعة",
  "المنافقون",
  "التغابن",
  "الطلاق",
  "التحريم",
  "الملك",
  "القلم",
  "الحاقة",
  "المعارج",
  "نوح",
  "الجن",
  "المزمل",
  "المدثر",
  "القيامة",
  "الإنسان",
  "المرسلات",
  "النبأ",
  "النازعات",
  "عبس",
  "التكوير",
  "الانفطار",
  "المطففين",
  "الانشقاق",
  "البروج",
  "الطارق",
  "الأعلى",
  "الغاشية",
  "الفجر",
  "البلد",
  "الشمس",
  "الليل",
  "الضحى",
  "الشرح",
  "التين",
  "العلق",
  "القدر",
  "البينة",
  "الزلزلة",
  "العاديات",
  "القارعة",
  "التكاثر",
  "العصر",
  "الهمزة",
  "الفيل",
  "قريش",
  "الماعون",
  "الكوثر",
  "الكافرون",
  "النصر",
  "المسد",
  "الإخلاص",
  "الفلق",
  "الناس",
];

const reciterSelect = document.getElementById("reciterSelect");
const surahSelect = document.getElementById("surahSelect");
const mainAudioPlayer = document.getElementById("mainAudioPlayer");
const audioInterface = document.getElementById("audioInterface");
const currentSurahDisplay = document.getElementById("currentSurahDisplay");
const currentReciterDisplay = document.getElementById("currentReciterDisplay");

function initMainPlayer() {
  // Populate Reciters
  reciterSelect.innerHTML =
    '<option value="" disabled selected>اختر القارئ</option>';
  reciters.forEach((reciter) => {
    const option = document.createElement("option");
    option.value = reciter.id;
    option.textContent = reciter.name;
    reciterSelect.appendChild(option);
  });

  // Populate Surahs
  surahSelect.innerHTML =
    '<option value="" disabled selected>اختر السورة</option>';
  surahNames.forEach((name, index) => {
    const option = document.createElement("option");
    option.value = index + 1; // 1-based
    option.textContent = `${index + 1}. ${name}`;
    surahSelect.appendChild(option);
  });

  // Event Listeners
  reciterSelect.addEventListener("change", playSelection);
  surahSelect.addEventListener("change", playSelection);
}

function playSelection() {
  const reciterId = reciterSelect.value;
  const surahId = surahSelect.value;

  if (!reciterId || !surahId) return;

  // Show Interface
  audioInterface.classList.remove("hidden");

  // Find Data
  const reciter = reciters.find((r) => r.id === reciterId);
  const surahName = surahNames[surahId - 1];

  // Update UI
  currentSurahDisplay.textContent = `سورة ${surahName}`;
  currentReciterDisplay.textContent = `القارئ: ${reciter.name}`;

  // Construct URL: server + 001.mp3 (padded)
  const paddedSurah = String(surahId).padStart(3, "0");
  const url = `${reciter.server}${paddedSurah}.mp3`;

  mainAudioPlayer.src = url;
  mainAudioPlayer.play();

  // Smooth scroll to player on mobile
  if (window.innerWidth < 768) {
    audioInterface.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Global function for Quick Access Cards
window.playSurah = function (surahId) {
  // Default to Mishary (afs) if not selected, or current selection
  if (!reciterSelect.value) {
    reciterSelect.value = "afs";
  }

  surahSelect.value = surahId;

  // Scroll to player
  const playerSection = document.getElementById("mainPlayerSection");
  playerSection.scrollIntoView({ behavior: "smooth" });

  playSelection();
};

/* --- 3. Featured Reciters (Chips) --- */
const featuredRecitersDiv = document.getElementById("featuredReciters");

// function initFeaturedReciters() {
//   reciters.forEach((reciter) => {
//     const chip = document.createElement("div");
//     chip.className = "reciter-chip";
//     // Placeholder image or first letter
//     const letter = reciter.name.split(" ")[0][0];
//     chip.innerHTML = `
//             <div class="reciter-img" style="display:flex;align-items:center;justify-content:center;font-size:0.8rem;background:#cbd5e1">${letter}</div>
//             <span>${reciter.name}</span>
//         `;

//     chip.addEventListener("click", () => {
//       // Remove active from others
//       document
//         .querySelectorAll(".reciter-chip")
//         .forEach((c) => c.classList.remove("active"));
//       chip.classList.add("active");

//       // Set select
//       reciterSelect.value = reciter.id;

//       // If surah selected, play
//       if (surahSelect.value) {
//         playSelection();
//       }
//     });

//     featuredRecitersDiv.appendChild(chip);
//   });
// }
