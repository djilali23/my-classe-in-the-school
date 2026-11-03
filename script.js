
"use strict";

/* =========================================
   1. Firebase imports
========================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================
   2. Firebase configuration
========================================= */

const firebaseConfig = {
  apiKey: "AIzaSyDiT1PTvBsswq8TsotPuvrWCX5UCo-FTO4",
  authDomain: "class-portal-1dac0.firebaseapp.com",
  projectId: "class-portal-1dac0",
  storageBucket: "class-portal-1dac0.firebasestorage.app",
  messagingSenderId: "465125032843",
  appId: "1:465125032843:web:2306462ff24a298a2fa58e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* =========================================
   3. إعدادات الموقع
========================================= */

const CONFIG = {
  className: "قسم 1L1",
  school: "ثانوية المجاهد المرحوم مول الكاف أحمد",
  year: "السنة الدراسية 2026 / 2027",

  adminEmail: "djilalitheking23@gmail.com",

  inviteCode: "1L1-2026",

  maxHomeworkLength: 500,
  maxMessageLength: 500,
  chatCooldown: 3000
};


/* =========================================
   4. قائمة التلاميذ
========================================= */

const STUDENTS = [
  { n: "رحيم جيلالي" },
  { n: "العنتري عبد الرحمان" },
  { n: "رحو علاء الدين" },
  { n: "جبار عبد الإله" },
  { n: "شامخة واليد" },
  { n: "بلجة عبد الباسط" },
  { n: "بو خبزة عبد الحق شارف" },
  { n: "بن عدة سماعيل" },
  { n: "بو شاقور رهف هديل", g: "f" },
  { n: "طاوش إيمان", g: "f" },
  { n: "بو عبد الله العالية", g: "f" },
  { n: "منور ملاك", g: "f" },
  { n: "بوذة ملاك إيناس", g: "f" },
  { n: "رحال ملاك", g: "f" },
  { n: "محمود نصيرة", g: "f" },
  { n: "بن قانة أية", g: "f" },
  { n: "عامر عامرهاجر", g: "f" },
  { n: "بن سعدة خولة", g: "f" },
  { n: "بن مرخي إيناس", g: "f" }
];


/* =========================================
   5. استعمال الزمن
========================================= */

const DAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس"
];

const SLOTS = [
  { s: 480, e: 540, label: "08:00–09:00" },
  { s: 540, e: 600, label: "09:00–10:00" },
  { s: 600, e: 660, label: "10:00–11:00" },
  { s: 660, e: 720, label: "11:00–12:00" },
  { s: 720, e: 810, label: "12:00–13:30", break: true },
  { s: 810, e: 870, label: "13:30–14:30" },
  { s: 870, e: 930, label: "14:30–15:30" },
  { s: 930, e: 990, label: "15:30–16:30" }
];

const TT = [
  // الأحد
  [
    { s: 480, e: 600, t: "لغة عربية" },
    { s: 600, e: 720, t: "تربية بدنية" },
    { s: 810, e: 870, t: "علوم إسلامية" },
    { s: 870, e: 930, t: "رياضيات" },
    { s: 930, e: 990 }
  ],

  // الإثنين
  [
    { s: 480, e: 600, t: "لغة فرنسية" },
    { s: 600, e: 720, t: "لغة إنجليزية" },
    { s: 810, e: 870, t: "علوم طبيعية" },
    { s: 870, e: 930, t: "إعلام آلي" },
    { s: 930, e: 990, t: "تاريخ وجغرافيا" }
  ],

  // الثلاثاء
  [
    { s: 480, e: 600, t: "لغة عربية" },
    { s: 600, e: 720, t: "رياضيات" },
    {
      s: 810,
      e: 930,
      t: ["علوم", "فيزياء"],
      group: true
    },
    { s: 930, e: 990, t: "تاريخ وجغرافيا" }
  ],

  // الأربعاء
  [
    {
      s: 480,
      e: 600,
      t: ["لغة عربية", "إعلام آلي"],
      group: true
    },
    { s: 600, e: 720, t: "لغة فرنسية" },
    { s: 810, e: 870, t: "تاريخ وجغرافيا" },
    { s: 870, e: 930, t: "لغة إنجليزية" },
    { s: 930, e: 990, t: "علوم إسلامية" }
  ],

  // الخميس
  [
    { s: 480, e: 540, t: "لغة عربية" },
    { s: 540, e: 600, t: "لغة إنجليزية" },
    { s: 600, e: 660, t: "فيزياء" },
    { s: 660, e: 720, t: "تاريخ وجغرافيا" },
    {
      s: 810,
      e: 990,
      t: "لا ندرس مساءً",
      off: true
    }
  ]
];


/* =========================================
   6. ألوان المواد
========================================= */

const COLORS = {
  "لغة عربية": "#e11d48",
  "رياضيات": "#4f46e5",
  "علوم": "#16a34a",
  "علوم طبيعية": "#16a34a",
  "فيزياء": "#0891b2",
  "لغة فرنسية": "#7c3aed",
  "لغة إنجليزية": "#d97706",
  "تاريخ وجغرافيا": "#b45309",
  "علوم إسلامية": "#059669",
  "تربية بدنية": "#ea580c",
  "إعلام آلي": "#0ea5e9"
};

/* =========================================
   7. أدوات عامة
========================================= */

const $ = (id) => document.getElementById(id);

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function color(subject) {
  return COLORS[subject] || "#4f46e5";
}

function label(subject) {
  return Array.isArray(subject)
    ? subject.join(" / ")
    : subject || "—";
}

function hh(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return (
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0")
  );
}

function normalizeUsername(value) {
  return value.trim().toLowerCase();
}

function isValidUsername(username) {
  return /^[a-z0-9_]{3,24}$/.test(username);
}

function authEmailFromIdentifier(value) {
  const identifier = value.trim().toLowerCase();

  if (identifier.includes("@")) {
    return identifier;
  }

  return `${normalizeUsername(identifier)}@class.local`;
}

function isAdminUser(user = auth.currentUser) {
  return Boolean(
    user &&
    user.email &&
    user.email.toLowerCase() === CONFIG.adminEmail.toLowerCase()
  );
}

function todayString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  if (!dateString) return "";

  const parts = dateString.split("-");

  if (parts.length !== 3) return dateString;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function timestampToDate(timestamp) {
  if (!timestamp) return null;

  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }

  if (timestamp instanceof Date) {
    return timestamp;
  }

  return null;
}

function formatTime(timestamp) {
  const date = timestampToDate(timestamp);

  if (!date) return "";

  return date.toLocaleTimeString("ar-DZ", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function setStatus(element, message, type = "") {
  if (!element) return;

  element.textContent = message;
  element.className = "form-status";

  if (type) {
    element.classList.add(type);
  }
}

function clearStatus(element) {
  if (!element) return;

  element.textContent = "";
  element.className = "form-status";
}

function firebaseErrorMessage(error) {
  const code = error?.code || "";

  const messages = {
    "auth/invalid-credential":
      "اسم المستخدم أو كلمة المرور غير صحيحة.",

    "auth/invalid-login-credentials":
      "اسم المستخدم أو كلمة المرور غير صحيحة.",

    "auth/wrong-password":
      "كلمة المرور غير صحيحة.",

    "auth/user-not-found":
      "الحساب غير موجود.",

    "auth/email-already-in-use":
      "اسم المستخدم مستعمل من قبل.",

    "auth/weak-password":
      "كلمة المرور ضعيفة. استعمل 6 أحرف على الأقل.",

    "auth/too-many-requests":
      "تمت محاولات كثيرة. حاول لاحقًا.",

    "auth/network-request-failed":
      "تعذر الاتصال بالإنترنت.",

    "auth/operation-not-allowed":
      "تسجيل الدخول بهذه الطريقة غير مفعّل في Firebase.",

    "auth/invalid-email":
      "بيانات الحساب غير صالحة.",

    "permission-denied":
      "ليست لديك صلاحية لتنفيذ هذه العملية."
  };

  return messages[code] ||
    "حدث خطأ غير متوقع. حاول مرة أخرى.";
}


/* =========================================
   8. الصفحة الرئيسية
========================================= */

function renderHero() {
  $("year").textContent = CONFIG.year;
  $("className").textContent = CONFIG.className;
  $("school").textContent = CONFIG.school;
}


/* =========================================
   9. بناء جدول استعمال الزمن
========================================= */

function buildGroupHTML(lesson) {
  const first = lesson.t[0];
  const second = lesson.t[1];

  return `
    <div class="group-title">
      <span>حصة أفواج</span>
      <small>تبادل في الساعة الثانية</small>
    </div>

    <div class="group-hours">

      <div class="group-hour">
        <span class="hour-label">الساعة الأولى</span>

        <div class="group-pair">
          <span class="group-subject"
            style="--subject-color:${color(first)}">
            <small>الفوج الأول</small>
            <strong>${esc(first)}</strong>
          </span>

          <span class="group-subject"
            style="--subject-color:${color(second)}">
            <small>الفوج الثاني</small>
            <strong>${esc(second)}</strong>
          </span>
        </div>
      </div>

      <div class="group-hour">
        <span class="hour-label">الساعة الثانية</span>

        <div class="group-pair">
          <span class="group-subject"
            style="--subject-color:${color(second)}">
            <small>الفوج الأول</small>
            <strong>${esc(second)}</strong>
          </span>

          <span class="group-subject"
            style="--subject-color:${color(first)}">
            <small>الفوج الثاني</small>
            <strong>${esc(first)}</strong>
          </span>
        </div>
      </div>

    </div>
  `;
}


function buildTable() {
  const table = $("table");

  let html = `
    <thead>
      <tr>
        <th class="day-head">اليوم</th>
  `;

  for (const slot of SLOTS) {
    html += `
      <th class="${slot.break ? "break-head" : ""}">
        ${slot.label}
      </th>
    `;
  }

  html += "</tr></thead><tbody>";

  DAYS.forEach((day, dayIndex) => {
    const lessons = TT[dayIndex] || [];

    html += `
      <tr data-day="${dayIndex}">
        <th class="day-cell">${esc(day)}</th>
    `;

    for (let i = 0; i < SLOTS.length;) {
      const slot = SLOTS[i];

      if (slot.break) {
        html += `
          <td class="break-cell">
            <span>استراحة</span>
          </td>
        `;

        i++;
        continue;
      }

      const lesson = lessons.find(
        (item) =>
          item.s <= slot.s &&
          item.e >= slot.e
      );

      if (!lesson) {
        html += `<td class="empty-slot">—</td>`;
        i++;
        continue;
      }

      const covered = SLOTS.slice(i).filter(
        (part) =>
          !part.break &&
          part.s >= lesson.s &&
          part.e <= lesson.e
      );

      const colspan = Math.max(1, covered.length);

      const commonAttrs = `
        colspan="${colspan}"
        data-day="${dayIndex}"
        data-start="${lesson.s}"
        data-end="${lesson.e}"
      `;

      if (lesson.off) {
        html += `
          <td class="lesson off" ${commonAttrs}>
            <span class="off-mark">✓</span>
            <strong>${esc(lesson.t)}</strong>
          </td>
        `;
      } else if (lesson.group) {
        html += `
          <td
            class="lesson group-lesson group"
            ${commonAttrs}
            style="--lesson-color:${color(lesson.t[0])}"
          >
            ${buildGroupHTML(lesson)}
          </td>
        `;
      } else {
        html += `
          <td
            class="lesson"
            ${commonAttrs}
            style="--lesson-color:${color(lesson.t)}"
          >
            <span class="lesson-time">
              ${hh(lesson.s)} – ${hh(lesson.e)}
            </span>

            <strong>${esc(lesson.t)}</strong>
          </td>
        `;
      }

      i += colspan;
    }

    html += "</tr>";
  });

  html += "</tbody>";
  table.innerHTML = html;
}


/* =========================================
   10. تحديد الحصة الحالية
========================================= */

function markNow() {
  const now = new Date();
  const dayIndex = now.getDay();

  document.querySelectorAll(".today")
    .forEach((el) => el.classList.remove("today"));

  document.querySelectorAll(".current")
    .forEach((el) => el.classList.remove("current"));

  // الدراسة من الأحد إلى الخميس
  if (dayIndex > 4) return;

  const row = document.querySelector(
    `tr[data-day="${dayIndex}"]`
  );

  if (row) {
    row.classList.add("today");
  }

  const minutes =
    now.getHours() * 60 + now.getMinutes();

  const lesson = TT[dayIndex].find(
    (item) =>
      !item.off &&
      minutes >= item.s &&
      minutes < item.e
  );

  if (!lesson) return;

  const cell = document.querySelector(
    `td.lesson[data-day="${dayIndex}"][data-start="${lesson.s}"]`
  );

  if (cell) {
    cell.classList.add("current");
  }
}


/* =========================================
   11. الحصة القادمة
========================================= */

function updateNext() {
  const now = new Date();
  const dayIndex = now.getDay();

  if (dayIndex > 4) {
    $("nextLabel").textContent = "العطلة";
    $("nextSubject").textContent = "لا توجد حصص اليوم";
    $("nextTime").textContent = "";
    $("nextCount").textContent = "";
    return;
  }

  const minutes =
    now.getHours() * 60 + now.getMinutes();

  const lessons = TT[dayIndex] || [];

  const current = lessons.find(
    (lesson) =>
      !lesson.off &&
      minutes >= lesson.s &&
      minutes < lesson.e
  );

  if (current) {
    const remaining = current.e - minutes;

    $("nextLabel").textContent = "الحصة الحالية";
    $("nextSubject").textContent = label(current.t);

    $("nextTime").textContent =
      `${hh(current.s)} — ${hh(current.e)}`;

    const hours = Math.floor(remaining / 60);
    const mins = remaining % 60;

    $("nextCount").textContent =
      hours > 0
        ? `متبقي ${hours}س ${mins}د`
        : `متبقي ${mins} دقيقة`;

    return;
  }

  const next = lessons.find(
    (lesson) =>
      !lesson.off &&
      minutes < lesson.s
  );

  if (next) {
    const remaining = next.s - minutes;

    $("nextLabel").textContent = "الحصة القادمة";
    $("nextSubject").textContent = label(next.t);

    $("nextTime").textContent =
      `${hh(next.s)} — ${hh(next.e)}`;

    const hours = Math.floor(remaining / 60);
    const mins = remaining % 60;

    $("nextCount").textContent =
      hours > 0
        ? `تبدأ بعد ${hours}س ${mins}د`
        : `تبدأ بعد ${mins} دقيقة`;

    return;
  }

  $("nextLabel").textContent = "اليوم";
  $("nextSubject").textContent = "انتهت حصص اليوم";
  $("nextTime").textContent = "";
  $("nextCount").textContent = "نتمنى لكم يومًا موفقًا 🌟";
               }
     
/* =========================================
   12. قائمة التلاميذ
========================================= */

const ICONS = {
  m: `
    <svg viewBox="0 0 24 24" width="24" height="24"
      aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
      />
    </svg>
  `,

  f: `
    <svg viewBox="0 0 24 24" width="24" height="24"
      aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-1 2h2v4h3v2h-3v3h-2v-3H8v-2h3v-4Z"
      />
    </svg>
  `
};


function renderStudents(list = STUDENTS) {
  $("studentCount").textContent = list.length;

  $("people").innerHTML = list
    .map(
      (student) => `
        <article class="person">
          <div class="person-icon">
            ${student.g === "f" ? ICONS.f : ICONS.m}
          </div>

          <span class="person-name">
            ${esc(student.n)}
          </span>
        </article>
      `
    )
    .join("");

  $("empty").hidden = list.length !== 0;
}


function filterStudents() {
  const value = $("search").value.trim().toLowerCase();

  const filtered = STUDENTS.filter((student) =>
    student.n.toLowerCase().includes(value)
  );

  renderStudents(filtered);
}


/* =========================================
   13. الوضع الليلي
========================================= */

function setupTheme() {
  const saved = localStorage.getItem("theme");

  if (saved === "dark") {
    document.body.classList.add("dark");
    $("theme").textContent = "☀️";
  } else {
    $("theme").textContent = "☾";
  }

  $("theme").addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const dark = document.body.classList.contains("dark");

    localStorage.setItem(
      "theme",
      dark ? "dark" : "light"
    );

    $("theme").textContent = dark ? "☀️" : "☾";
  });
}


/* =========================================
   14. التنقل بين أقسام الموقع
========================================= */

function setupNavigation() {
  if (!("IntersectionObserver" in window)) return;

  const sections = document.querySelectorAll(
    "main > section"
  );

  const links = document.querySelectorAll(".links a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        links.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    },
    {
      rootMargin: "-25% 0px -65% 0px"
    }
  );

  sections.forEach((section) => observer.observe(section));
}


/* =========================================
   15. الحساب وتسجيل الدخول
========================================= */

let authMode = "login";
let currentUser = null;
let currentUserName = "عضو القسم";

let homeworkUnsubscribe = null;
let chatUnsubscribe = null;

let lastChatSend = 0;


function setAuthMode(mode) {
  authMode = mode;

  const isLogin = mode === "login";

  $("loginTab").classList.toggle("active", isLogin);
  $("signupTab").classList.toggle("active", !isLogin);

  $("loginTab").setAttribute(
    "aria-selected",
    String(isLogin)
  );

  $("signupTab").setAttribute(
    "aria-selected",
    String(!isLogin)
  );

  $("inviteField").hidden = isLogin;

  $("identifierLabel").textContent = isLogin
    ? "اسم المستخدم أو البريد الإلكتروني"
    : "اسم المستخدم";

  $("authIdentifier").placeholder = isLogin
    ? "اسم المستخدم"
    : "مثال: djilali_23";

  $("authPassword").autocomplete = isLogin
    ? "current-password"
    : "new-password";

  $("authSubmit").textContent = isLogin
    ? "تسجيل الدخول"
    : "إنشاء الحساب";

  clearStatus($("authStatus"));
    }
// ==========================================
//  CHAT SYSTEM
// ==========================================

function renderChat(messages) {
  const container = $("chat-messages");
  if (!container) return;

  if (!messages.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">💬</span>
        <p>لا توجد رسائل بعد. كن أول من يرسل رسالة!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = messages.map(message => {
    const isMine = message.uid === currentUser?.uid;
    const isAdmin = message.isAdmin === true;

    return `
      <div class="chat-message ${isMine ? "mine" : ""}">
        <div class="message-header">
          <strong>${esc(message.username || "عضو القسم")}</strong>
          ${isAdmin ? `<span class="admin-label">مشرف</span>` : ""}
          <span class="message-time">
            ${formatTime(message.createdAt)}
          </span>
        </div>

        <div class="message-content">${esc(message.text || "")}</div>

        ${
          isMine || isAdminUser()
            ? `<button class="delete-message"
                data-delete-message="${esc(message.id)}"
                type="button">حذف</button>`
            : ""
        }
      </div>
    `;
  }).join("");

  container.scrollTop = container.scrollHeight;
}

function setupChat() {
  if (chatUnsubscribe) {
    chatUnsubscribe();
    chatUnsubscribe = null;
  }

  const messagesQuery = query(
    collection(db, "messages"),
    orderBy("createdAt", "asc"),
    limit(100)
  );

  chatUnsubscribe = onSnapshot(messagesQuery, snapshot => {
    const messages = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));

    renderChat(messages);
  }, error => {
    console.error("Chat error:", error);
    setStatus("chat-status", "تعذر تحميل المحادثة.", "error");
  });
}

async function handleChatSubmit(event) {
  event.preventDefault();

  if (!currentUser) return;

  const input = $("chat-input");
  const text = input?.value.trim();

  if (!text) return;

  if (text.length > CONFIG.maxMessageLength) {
    setStatus("chat-status", "الرسالة طويلة جدًا.", "error");
    return;
  }

  const now = Date.now();

  if (now - lastChatSend < CONFIG.chatCooldown) {
    setStatus("chat-status", "انتظر قليلًا قبل إرسال رسالة أخرى.", "error");
    return;
  }

  const button = $("chat-submit");
  if (button) button.disabled = true;

  try {
    lastChatSend = now;

    await addDoc(collection(db, "messages"), {
      uid: currentUser.uid,
      username: currentUserName,
      text,
      isAdmin: isAdminUser(),
      createdAt: serverTimestamp()
    });

    input.value = "";
    clearStatus("chat-status");

  } catch (error) {
    console.error(error);
    setStatus("chat-status", firebaseErrorMessage(error), "error");
  } finally {
    if (button) button.disabled = false;
  }
}

async function deleteMessage(id) {
  if (!currentUser || !id) return;

  try {
    const messageRef = doc(db, "messages", id);
    const messageSnap = await getDoc(messageRef);

    if (!messageSnap.exists()) return;

    const message = messageSnap.data();

    if (
      message.uid !== currentUser.uid &&
      !isAdminUser()
    ) {
      setStatus("chat-status", "ليس لديك صلاحية حذف هذه الرسالة.", "error");
      return;
    }

    await deleteDoc(messageRef);

  } catch (error) {
    console.error(error);
    setStatus("chat-status", "تعذر حذف الرسالة.", "error");
  }
}


// ==========================================
//  EVENT LISTENERS
// ==========================================

function setupEventListeners() {

  // Authentication
  const authForm = $("auth-form");
  if (authForm) {
    authForm.addEventListener("submit", handleAuthSubmit);
  }

  const loginButton = $("show-login");
  if (loginButton) {
    loginButton.addEventListener("click", () => setAuthMode("login"));
  }

  const signupButton = $("show-signup");
  if (signupButton) {
    signupButton.addEventListener("click", () => setAuthMode("signup"));
  }

  const logoutButton = $("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }

  // Homework
  const homeworkForm = $("homework-form");
  if (homeworkForm) {
    homeworkForm.addEventListener("submit", handleHomeworkSubmit);
  }

  const homeworkList = $("homework-list");
  if (homeworkList) {
    homeworkList.addEventListener("click", event => {
      const button = event.target.closest("[data-delete-homework]");
      if (!button) return;

      deleteHomework(button.dataset.deleteHomework);
    });
  }

  // Chat
  const chatForm = $("chat-form");
  if (chatForm) {
    chatForm.addEventListener("submit", handleChatSubmit);
  }

  const chatMessages = $("chat-messages");
  if (chatMessages) {
    chatMessages.addEventListener("click", event => {
      const button = event.target.closest("[data-delete-message]");
      if (!button) return;

      deleteMessage(button.dataset.deleteMessage);
    });
  }

  // Students search
  const searchInput = $("student-search");
  if (searchInput) {
    searchInput.addEventListener("input", filterStudents);
  }

  // Theme
  const themeButton = $("theme-toggle");
  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.dataset.theme || "light";

      const newTheme =
        currentTheme === "dark" ? "light" : "dark";

      localStorage.setItem("class-portal-theme", newTheme);
      document.documentElement.dataset.theme = newTheme;
    });
  }

  // Navigation
  document.querySelectorAll("[data-section]").forEach(button => {
    button.addEventListener("click", () => {
      const section = button.dataset.section;
      if (section) setupNavigation(section);
    });
  });
}


// ==========================================
//  START THE WEBSITE
// ==========================================

function startSite() {
  renderHero();
  buildGroupHTML();
  buildTable();
  markNow();
  updateNext();

  renderStudents();
  setupTheme();
  setupNavigation();

  setupHomeworkSubjects();
  setupHomework();

  setupEventListeners();

  onAuthStateChanged(auth, user => {
    handleAuthState(user);
  });
}


// ==========================================
//  INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", startSite);
