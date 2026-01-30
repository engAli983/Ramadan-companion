/**
 * Wird (Quran Tracker) Logic
 */

const TOTAL_PAGES = 604;
const RAMADAN_DAYS = 30; // أو يمكن جعلها ديناميكية حسب المتبقي
const PRAYERS = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"];

document.addEventListener("DOMContentLoaded", () => {
  initWird();
});

function initWird() {
  setupKhatmaSelect();

  // Attempt rollover check immediately, but retry if prayers aren't loaded
  checkAndPerformRollover();

  // Also re-check periodically (e.g. every minute) or rely on main loop
  setInterval(checkAndPerformRollover, 60000);

  calculateAndRenderWird();
}

function setupKhatmaSelect() {
  const khatmaSelect = document.getElementById("khatma-select");
  let khatmaCount = Storage.getKhatmaCount();

  if (khatmaSelect) {
    khatmaSelect.value = khatmaCount;

    khatmaSelect.onchange = (e) => {
      const newValue = parseInt(e.target.value);

      showCustomConfirm(
        "تغيير الختمة سيقوم بإعادة ضبط جدولك الحالي وحذف تقدم اليوم. هل أنت متأكد؟",
        () => {
          // Confirmed
          Storage.setKhatmaCount(newValue);

          const currentProgress = Storage.getWirdProgress();
          Storage.setWirdProgress({
            day: currentProgress.day,
            completed: false,
            lastDate: currentProgress.lastDate,
            prayersCompleted: [false, false, false, false, false],
          });

          calculateAndRenderWird();
          App.showNotification("تم تحديث الخطة بنجاح");
        },
        () => {
          // Cancelled
          khatmaSelect.value = Storage.getKhatmaCount(); // Revert
        },
      );
    };
  }
}

function showCustomConfirm(message, onConfirm, onCancel) {
  const modal = document.getElementById("confirmation-modal");
  const msgEl = document.getElementById("modal-message");
  const confirmBtn = document.getElementById("modal-confirm-btn");
  const cancelBtn = document.getElementById("modal-cancel-btn");

  msgEl.textContent = message;
  modal.classList.add("open");

  // Clean up old listeners (simple way: cloning or single usage assumption.
  // Better: one-time listener that removes itself)

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    onCancel();
    closeModal();
  };

  // Need to remove previous event listeners to avoid stacking
  // Clone nodes to strip listeners is a quick hack for simple Vanilla JS without extensive state management
  const newConfirmBtn = confirmBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);

  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

  newConfirmBtn.addEventListener("click", handleConfirm);
  newCancelBtn.addEventListener("click", handleCancel);
}

function closeModal() {
  document.getElementById("confirmation-modal").classList.remove("open");
}

function calculateAndRenderWird() {
  const khatmaCount = Storage.getKhatmaCount();

  // Pages per day calculation
  const pagesPerDay = Math.ceil((TOTAL_PAGES * khatmaCount) / RAMADAN_DAYS);

  // Get Progress
  let progress = Storage.getWirdProgress();

  // Ensure data structure supports array
  if (!progress.prayersCompleted || !Array.isArray(progress.prayersCompleted)) {
    progress.prayersCompleted = [false, false, false, false, false];
  }

  // Determine Current logical day
  // ملاحظة: لا تقم بزيادة اليوم هنا بصرياً حتى لا يختلط الأمر على المستخدم
  let currentDay = progress.day;

  if (currentDay > 30) {
    showCompletion();
    return;
  }

  // --- التعديل الجديد يبدأ من هنا ---

  // 1. التعامل مع حالة الإتمام اليومي
  const dailySummaryEl = document.getElementById("daily-pages-summary");
  const currentDayEl = document.getElementById("current-day-display");

  if (progress.completed) {
    // حالة الإتمام: تغيير النصوص وتلوينها
    dailySummaryEl.innerHTML = `<span style="color: var(--color-primary)">🎉 أحسنت صنعاً!</span>`;
    currentDayEl.textContent = `لقد أتممت وردك لليوم (${currentDay})`;
    currentDayEl.style.color = "var(--color-primary)";
    currentDayEl.style.fontWeight = "bold";
  } else {
    // الحالة العادية
    const isRamadan = checkIsRamadan();
    const dayLabel = isRamadan
      ? `اليوم ${currentDay} من رمضان`
      : `اليوم ${currentDay} من الختمة`;

    dailySummaryEl.textContent = `${pagesPerDay} صفحة اليوم`;
    currentDayEl.textContent = dayLabel;
    // إعادة الستايل للأصل
    currentDayEl.style.color = "";
    currentDayEl.style.fontWeight = "";
  }
  // --- نهاية التعديل البصري ---

  // Render Prayer List
  const prayerList = document.getElementById("prayer-list");
  prayerList.innerHTML = "";

  // Calculate Ranges
  const dayStartPage = (((currentDay - 1) * pagesPerDay) % TOTAL_PAGES) + 1;
  const pagesPerPrayer = Math.floor(pagesPerDay / 5);
  const remainder = pagesPerDay % 5;

  let currentStart = dayStartPage;

  PRAYERS.forEach((prayerName, index) => {
    let count = pagesPerPrayer + (index < remainder ? 1 : 0);
    let currentEnd = currentStart + count - 1;
    if (currentEnd > TOTAL_PAGES) currentEnd = TOTAL_PAGES;

    const isDone = progress.prayersCompleted[index] || false;

    const row = document.createElement("div");
    row.className = `prayer-row ${isDone ? "active" : ""}`;

    row.innerHTML = `
            <div>
                <strong class="prayer-name">${prayerName}</strong>
                <span class="text-muted page-range">ص ${currentStart} - ${currentEnd}</span>
            </div>
            <button class="btn btn-sm ${isDone ? "btn-primary" : "btn-secondary"}" 
                onclick="togglePrayer(${index})">
                ${isDone ? "✅ تم" : "إتمام"}
            </button>
        `;

    prayerList.appendChild(row);

    currentStart = currentEnd + 1;
  });

  // Update Progress Bar
  const prayersDoneCount = progress.prayersCompleted.filter(Boolean).length;
  // تحسين دقة شريط التقدم ليعكس اليوم الحالي فقط
  const percent = (prayersDoneCount / 5) * 100;
  document.getElementById("wird-progress-bar").style.width = `${percent}%`;

  checkAndShowWarnings(progress);
}

function checkIsRamadan() {
  const today = new Date();
  const currentYear = today.getFullYear();
  // Estimation: Feb 18, 2026 is approx start.
  // Allowing generous window or precise check if library available.
  // Using simple date range for now as per project constraints.
  const start = new Date(currentYear, 1, 18); // Feb 18
  const end = new Date(currentYear, 2, 20); // ~30 days later

  return today >= start && today <= end;
}

function checkAndShowWarnings(progress) {
  const alertsContainer = document.getElementById("wird-alerts");
  if (!alertsContainer) return; // Should allow creating it dynamically or ensure HTML exists

  alertsContainer.innerHTML = ""; // Clear previous

  const todayStr = new Date().toDateString();
  const lastDateStr = progress.lastDate;

  // 1. Incomplete Alert: If user has SOME progress for *current day* but not finished, and it's NOT just starting
  // Actually user requirement: "If a day passed without doing pages" OR "did less than required".

  if (lastDateStr) {
    const lastDate = new Date(lastDateStr);
    const today = new Date(todayStr);

    // Diff in days (ignoring time)
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If last update was > 1 day ago (so yesterday is skipped), AND not completed
    // E.g. Last update Monday. Today Wednesday. Missed Tuesday.
    if (diffDays > 1 && !progress.completed) {
      const div = document.createElement("div");
      div.className = "wird-alert alert-danger";
      div.innerHTML = `⚠️ <strong>تنبيه:</strong> فاتك يوم أو أكثر دون إتمام الورد. حاول التعويض!`;
      alertsContainer.appendChild(div);
    } else if (diffDays >= 1 && !progress.completed) {
      // Started yesterday but didn't finish?
      const prayersDone = progress.prayersCompleted.filter(Boolean).length;
      if (prayersDone > 0 && prayersDone < 5) {
        const div = document.createElement("div");
        div.className = "wird-alert alert-warning";
        div.innerHTML = `⏳ <strong>تذكير:</strong> لم تكمل ورد الأمس (${prayersDone} من 5).`;
        alertsContainer.appendChild(div);
      }
    }
  }
}

function togglePrayer(index) {
  let progress = Storage.getWirdProgress();
  if (!progress.prayersCompleted)
    progress.prayersCompleted = [false, false, false, false, false];

  // Toggle
  progress.prayersCompleted[index] = !progress.prayersCompleted[index];
  // Update last interaction date whenever they check something off
  // This helps us know they were active today
  progress.lastDate = new Date().toDateString();

  // Check if ALL done
  const allDone = progress.prayersCompleted.every(Boolean);

  if (allDone && !progress.completed) {
    progress.completed = true;
    App.showNotification("🎉 أحسنت! أتممت ورد اليوم كاملاً.");
  } else if (!allDone) {
    progress.completed = false;
  }

  Storage.setWirdProgress(progress);
  calculateAndRenderWird();
}

function renderProgress() {
  // handled inside calculateAndRenderWird
}

function showCompletion() {
  document.getElementById("wird-content").innerHTML = `
        <div class="text-center">
            <h2>🎉 مبارك!</h2>
            <p>أتممت الختمة بفضل الله.</p>
            <button class="btn btn-primary" onclick="resetWird()">بدء ختمة جديدة</button>
        </div>
    `;
}

function resetWird() {
  if (confirm("هل أنت متأكد من بدء ختمة جديدة؟")) {
    Storage.setWirdProgress({ day: 1, completed: false, lastDate: null });
    window.location.reload();
  }
}

function openQuran() {
  window.location.href = "quran.html";
}

/**
 * LOGIC: Wird Rollover
 * Rule: Day changes 10 minutes before Fajr.
 */
function checkAndPerformRollover() {
  const now = new Date();

  // 1. فحص بسيط للتاريخ: هل تاريخ الجهاز اختلف عن آخر تاريخ محفوظ؟
  // هذا الفحص يعمل كخط دفاع أول في حال فشل جلب مواقيت الصلاة
  const storedDateStr = Storage.getLastWirdDate();

  // نحسب "تاريخ اليوم المنطقي" بناءً على الفجر
  // إذا لم تتوفر مواقيت الصلاة، نستخدم نظام الـ 12 منتصف الليل مؤقتاً لتجنب التعليق
  let currentWirdDateStr = now.toDateString();

  if (window.PrayerManager) {
    const fajrDate = PrayerManager.getFajrDate();

    // إذا كانت مواقيت الصلاة قديمة (تخص أمس أو ما قبله)، يجب تحديث الصفحة لجلب مواقيت جديدة
    if (fajrDate) {
      const diffDays = (now - fajrDate) / (1000 * 60 * 60 * 24);
      if (diffDays > 1 || diffDays < -1) {
        console.log("Detected stale prayer times. Reloading...");
        window.location.reload(); // إعادة تحميل لجلب مواقيت اليوم الصحيحة
        return;
      }

      // منطق الفجر - 10 دقائق
      const cutoffTime = new Date(fajrDate);
      cutoffTime.setMinutes(cutoffTime.getMinutes() - 10);

      let logicalDateObj = new Date();
      if (now < cutoffTime) {
        // ما زلنا نعتبر في اليوم السابق (لأن الفجر لم يؤذن بعد)
        logicalDateObj.setDate(logicalDateObj.getDate() - 1);
      }
      currentWirdDateStr = logicalDateObj.toDateString();
    }
  }

  // 2. أول مرة يفتح التطبيق
  if (!storedDateStr) {
    Storage.setLastWirdDate(currentWirdDateStr);
    return;
  }

  // 3. الكشف عن التغيير
  if (currentWirdDateStr !== storedDateStr) {
    console.log(
      `[Wird] New Day Detected: ${storedDateStr} -> ${currentWirdDateStr}`,
    );

    let progress = Storage.getWirdProgress();

    // تحديث البيانات لليوم الجديد
    const newProgress = {
      day: progress.day + 1, // الانتقال لليوم التالي
      completed: false, // إزالة علامة الإتمام
      prayersCompleted: [false, false, false, false, false], // تصفير الصلوات
      lastDate: new Date().toDateString(),
    };

    // حفظ البيانات الجديدة
    Storage.setWirdProgress(newProgress);
    Storage.setLastWirdDate(currentWirdDateStr);

    // إرسال تنبيه وتحديث الواجهة
    App.showNotification("📅 بدأ يوم جديد! تم تحديث الورد.");

    // تشغيل صوت بسيط أو اهتزاز إذا أردت (اختياري)
    if (navigator.vibrate) navigator.vibrate(200);

    calculateAndRenderWird();
  }
}
