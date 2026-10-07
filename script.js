"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

/* =========================
   Firebase
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyDiT1PTvBsswq8TsotPuvrWCX5UCo-FTO4",
  authDomain: "class-portal-1dac0.firebaseapp.com",
  projectId: "class-portal-1dac0",
  storageBucket: "class-portal-1dac0.firebasestorage.app",
  messagingSenderId: "465125032843",
  appId: "1:465125032843:web:2306462ff24a298a2fa58e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================
   الإعدادات
========================= */

const CONFIG = {
  className: "قسم 1L1",
  school: "ثانوية المجاهد المرحوم مول الكاف أحمد",
  year: "السنة الدراسية 2026 / 2027",

  adminEmail: "djilalitheking23@gmail.com",

  /* غيّر هذا الرمز قبل نشر الموقع */
  inviteCode: "1L1-2026",

  maxHomeworkLength: 500,
  maxMessageLength: 500,
  chatCooldown: 3000,
};

/* =========================
   التلاميذ
========================= */

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
  { n: "بن مرخي إيناس", g: "f" },
];

/* =========================
   استعمال الزمن
========================= */

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];

const TT = [
  [
    { s: 8, e: 10, t: "لغة عربية" },
    { s: 10, e: 12, t: "تربية بدنية" },
    { s: 13, e: 14, t: "علوم إسلامية" },
    { s: 14, e: 15, t: "رياضيات" },
    { s: 15, e: 16 },
  ],
  [
    { s: 8, e: 10, t: "لغة فرنسية" },
    { s: 10, e: 12, t: "لغة إنجليزية" },
    { s: 13, e: 14, t: "علوم طبيعية" },
    { s: 14, e: 15, t: "إعلام آلي" },
    { s: 15, e: 16, t: "تاريخ وجغرافيا" },
  ],
  [
    { s: 8, e: 10, t: "لغة عربية" },
    { s: 10, e: 12, t: "رياضيات" },
    { s: 13, e: 15, t: ["علوم", "فيزياء"] },
    { s: 15, e: 16, t: "تاريخ وجغرافيا" },
  ],
  [
    { s: 8, e: 10, t: ["لغة عربية", "إعلام آلي"] },
    { s: 10, e: 12, t: "لغة فرنسية" },
    { s: 13, e: 14, t: "تاريخ وجغرافيا" },
    { s: 14, e: 15, t: "لغة إنجليزية" },
    { s: 15, e: 16, t: "علوم إسلامية" },
  ],
  [
    { s: 8, e: 9, t: "لغة عربية" },
    { s: 9, e: 10, t: "لغة إنجليزية" },
    { s: 10, e: 11, t: "فيزياء" },
    { s: 11, e: 12, t: "تاريخ وجغرافيا" },
    { s: 13, e: 16, t: "لا ندرس مساءً", off: true },
  ],
];

const HEAD = [
  "08–09",
  "09–10",
  "10–11",
  "11–12",
  "12–13:30",
  "13:30–14:30",
  "14:30–15:30",
  "15:30–16:30",
];

const COLORS = {
  "لغة عربية": "#e11d48",
  رياضيات: "#4f46e5",
  علوم: "#16a34a",
  فيزياء: "#0891b2",
  "لغة فرنسية": "#7c3aed",
  "لغة إنجليزية": "#d97706",
  "تاريخ وجغرافيا": "#b45309",
  "علوم إسلامية": "#059669",
  "تربية بدنية": "#ea580c",
  "إعلام آلي": "#0ea5e9",
};

/* =========================
   أدوات عامة
========================= */

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
  if (Array.isArray(subject)) {
    return subject.join(" / ");
  }

  return subject || "—";
}

function hh(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
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
      user.email.toLowerCase() === CONFIG.adminEmail.toLowerCase(),
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

  if (parts.length !== 3) {
    return dateString;
  }

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
    minute: "2-digit",
  });
}

/* =========================
   الصفحة الرئيسية
========================= */

function renderHero() {
  $("year").textContent = CONFIG.year;
  $("className").textContent = CONFIG.className;
  $("school").textContent = CONFIG.school;
}

/* =========================
   بناء الجدول
========================= */

function buildTable() {
  const table = $("table");

  let html = "<thead><tr>";
  html += "<th>اليوم</th>";

  for (const h of HEAD) {
    html += `<th>${esc(h)}</th>`;
  }

  html += "</tr></thead><tbody>";

  DAYS.forEach((day, dayIndex) => {
    const lessons = TT[dayIndex] || [];

    html += `<tr data-day="${dayIndex}">`;
    html += `<td>${esc(day)}</td>`;

    for (let slot = 0; slot < HEAD.length; slot++) {
      const start = 8 + slot;
      const end = start + 1;

      const lesson = lessons.find(
        (item) => item.s <= start && item.e >= end,
      );

      if (!lesson) {
        html += "<td>—</td>";
        continue;
      }

      if (lesson.off) {
        html += `<td class="lesson off" style="--lesson-color:${color(
          label(lesson.t),
        )}">لا ندرس مساءً</td>`;
        continue;
      }

      const subject = label(lesson.t);
      const subjectColor = Array.isArray(lesson.t)
        ? color(lesson.t[0])
        : color(lesson.t);

      const isStart = lesson.s === start;
      const isEnd = lesson.e === end;

      html += `
        <td
          class="lesson ${isStart ? "lesson-start" : ""} ${
            isEnd ? "lesson-end" : ""
          }"
          style="--lesson-color:${subjectColor}"
          data-day="${dayIndex}"
          data-start="${lesson.s}"
          data-end="${lesson.e}"
        >
          ${isStart ? `<strong>${esc(subject)}</strong>` : ""}
        </td>
      `;
    }

    html += "</tr>";
  });

  html += "</tbody>";

  table.innerHTML = html;
}

/* =========================
   تحديد اليوم والحصة
========================= */

function markNow() {
  const now = new Date();
  const day = now.getDay();

  const dayIndex = day === 0 ? 0 : day - 1;

  document.querySelectorAll(".today").forEach((el) => {
    el.classList.remove("today");
  });

  document.querySelectorAll(".current").forEach((el) => {
    el.classList.remove("current");
  });

  const row = document.querySelector(
    `tr[data-day="${dayIndex}"]`,
  );

  if (row) {
    row.classList.add("today");

    const firstCell = row.querySelector("td");

    if (firstCell) {
      firstCell.classList.add("today");
    }
  }

  if (dayIndex < 0 || dayIndex >= TT.length) {
    return;
  }

  const minutes = now.getHours() * 60 + now.getMinutes();

  const lesson = TT[dayIndex].find((item) => {
    const start = item.s * 60;
    const end = item.e * 60;

    return minutes >= start && minutes < end;
  });

  if (!lesson || lesson.off) {
    return;
  }

  document
    .querySelectorAll(
      `td.lesson[data-day="${dayIndex}"]`,
    )
    .forEach((cell) => {
      const start = Number(cell.dataset.start);
      const end = Number(cell.dataset.end);

      if (minutes >= start * 60 && minutes < end * 60) {
        cell.classList.add("current");
      }
    });
}

/* =========================
   الحصة القادمة
========================= */

function allLessons() {
  const result = [];

  DAYS.forEach((day, dayIndex) => {
    for (const lesson of TT[dayIndex] || []) {
      if (lesson.off || !lesson.t) continue;

      result.push({
        day,
        dayIndex,
        start: lesson.s,
        end: lesson.e,
        subject: lesson.t,
      });
    }
  });

  return result;
}

function dur(start, end) {
  return Math.max(0, end * 60 - start * 60);
}

function updateNext() {
  const now = new Date();
  const day = now.getDay();

  const dayIndex = day === 0 ? 0 : day - 1;

  if (dayIndex < 0 || dayIndex >= DAYS.length) {
    $("nextLabel").textContent = "الحالة";
    $("nextSubject").textContent = "لا توجد حصص اليوم";
    $("nextTime").textContent = "";
    $("nextCount").textContent = "";

    return;
  }

  const minutes = now.getHours() * 60 + now.getMinutes();

  const lessons = TT[dayIndex] || [];

  const current = lessons.find((lesson) => {
    return (
      !lesson.off &&
      minutes >= lesson.s * 60 &&
      minutes < lesson.e * 60
    );
  });

  if (current) {
    const remaining = current.e * 60 - minutes;

    $("nextLabel").textContent = "الحصة الحالية";
    $("nextSubject").textContent = label(current.t);
    $("nextTime").textContent = `${hh(current.s)} — ${hh(current.e)}`;

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
      minutes < lesson.s * 60,
  );

  if (next) {
    const remaining = next.s * 60 - minutes;

    $("nextLabel").textContent = "الحصة القادمة";
    $("nextSubject").textContent = label(next.t);
    $("nextTime").textContent = `${hh(next.s)} — ${hh(next.e)}`;

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

/* =========================
   قائمة التلاميذ
========================= */

const ICONS = {
  m: `
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
      />
    </svg>
  `,
  f: `
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-1 2h2v4h3v2h-3v3h-2v-3H8v-2h3v-4Z"
      />
    </svg>
  `,
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
      `,
    )
    .join("");

  $("empty").hidden = list.length !== 0;
}

function filterStudents() {
  const value = $("search").value
    .trim()
    .toLowerCase();

  const filtered = STUDENTS.filter((student) =>
    student.n.toLowerCase().includes(value),
  );

  renderStudents(filtered);
}

/* =========================
   الوضع الليلي
========================= */

function setupTheme() {
  const saved = localStorage.getItem("theme");

  if (saved === "dark") {
    document.body.classList.add("dark");
    $("theme").textContent = "☀️";
  }

  $("theme").addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const dark = document.body.classList.contains("dark");

    localStorage.setItem(
      "theme",
      dark ? "dark" : "light",
    );

    $("theme").textContent = dark ? "☀️" : "🌙";
  });
}

/* =========================
   التنقل
========================= */

function setupNavigation() {
  const sections = document.querySelectorAll(
    "main > section",
  );

  const links = document.querySelectorAll(
    ".links a",
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        links.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") ===
              `#${entry.target.id}`,
          );
        });
      });
    },
    {
      rootMargin: "-25% 0px -65% 0px",
    },
  );

  sections.forEach((section) =>
    observer.observe(section),
  );
}

/* =========================
   الحساب
========================= */

let authMode = "login";
let currentUser = null;
let currentUserName = "عضو القسم";

let homeworkUnsubscribe = null;
let chatUnsubscribe = null;

function setAuthMode(mode) {
  authMode = mode;

  const isLogin = mode === "login";

  $("loginTab").classList.toggle(
    "active",
    isLogin,
  );

  $("signupTab").classList.toggle(
    "active",
    !isLogin,
  );

  $("loginTab").setAttribute(
    "aria-selected",
    String(isLogin),
  );

  $("signupTab").setAttribute(
    "aria-selected",
    String(!isLogin),
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

function setStatus(element, message, type = "") {
  element.textContent = message;
  element.className = "form-status";

  if (type) {
    element.classList.add(type);
  }
}

function clearStatus(element) {
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
  };

  return (
    messages[code] ||
    "حدث خطأ غير متوقع. حاول مرة أخرى."
  );
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const identifier = $("authIdentifier").value.trim();
  const password = $("authPassword").value;

  clearStatus($("authStatus"));

  if (!identifier || !password) {
    setStatus(
      $("authStatus"),
      "املأ جميع الخانات.",
      "error",
    );

    return;
  }

  const button = $("authSubmit");
  button.disabled = true;

  try {
    if (authMode === "signup") {
      const username = normalizeUsername(identifier);

      if (!isValidUsername(username)) {
        setStatus(
          $("authStatus"),
          "اسم المستخدم يجب أن يكون من 3 إلى 24 حرفًا، ويحتوي على حروف إنجليزية أو أرقام أو _ فقط.",
          "error",
        );

        return;
      }

      if (password.length < 6) {
        setStatus(
          $("authStatus"),
          "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل.",
          "error",
        );

        return;
      }

      const invite = $("inviteCode").value.trim();

      if (invite !== CONFIG.inviteCode) {
        setStatus(
          $("authStatus"),
          "رمز الدعوة غير صحيح.",
          "error",
        );

        return;
      }

      const email = `${username}@class.local`;

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );

      await setDoc(
        doc(db, "users", credential.user.uid),
        {
          username,
          displayName: username,
          createdAt: serverTimestamp(),
        },
      );

      setStatus(
        $("authStatus"),
        "تم إنشاء الحساب بنجاح.",
        "success",
      );
    } else {
      const email =
        authEmailFromIdentifier(identifier);

      await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      setStatus(
        $("authStatus"),
        "تم تسجيل الدخول.",
        "success",
      );
    }
  } catch (error) {
    console.error(error);

    setStatus(
      $("authStatus"),
      firebaseErrorMessage(error),
      "error",
    );
  } finally {
    button.disabled = false;
  }
}

async function loadUserProfile(user) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  try {
    const snapshot = await new Promise(
      (resolve, reject) => {
        const unsubscribe = onSnapshot(
          userRef,
          (snap) => {
            unsubscribe();
            resolve(snap);
          },
          reject,
        );
      },
    );

    if (snapshot.exists()) {
      const data = snapshot.data();

      currentUserName =
        data.displayName ||
        data.username ||
        user.email?.split("@")[0] ||
        "عضو القسم";

      return;
    }

    const fallbackName =
      user.email?.toLowerCase() ===
      CONFIG.adminEmail.toLowerCase()
        ? "مدير القسم"
        : user.email?.split("@")[0] ||
          "عضو القسم";

    currentUserName = fallbackName;

    await setDoc(
      userRef,
      {
        username:
          user.email?.split("@")[0] ||
          "member",
        displayName: fallbackName,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error(
      "تعذر تحميل ملف المستخدم:",
      error,
    );

    currentUserName =
      user.email?.split("@")[0] ||
      "عضو القسم";
  }
}

async function updateAccountUI(user) {
  const loggedIn = Boolean(user);

  $("authLoggedOut").hidden = loggedIn;
  $("authLoggedIn").hidden = !loggedIn;

  $("homeworkNav").hidden = !loggedIn;
  $("chatNav").hidden = !loggedIn;

  $("homework").hidden = !loggedIn;
  $("chat").hidden = !loggedIn;

  if (!loggedIn) {
    $("accountName").textContent = "";
    $("accountRole").textContent = "";
    return;
  }

  $("accountName").textContent =
    currentUserName;

  if (isAdminUser(user)) {
    $("accountRole").textContent =
      "مدير القسم";
    $("accountRole").classList.add(
      "admin-role",
    );
  } else {
    $("accountRole").textContent =
      "عضو في القسم";
    $("accountRole").classList.remove(
      "admin-role",
    );
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
}

/* =========================
   الواجبات
========================= */

function getSubjects() {
  const subjects = new Set();

  for (const day of TT) {
    for (const lesson of day) {
      if (lesson.off || !lesson.t) continue;

      const values = Array.isArray(lesson.t)
        ? lesson.t
        : [lesson.t];

      for (const subject of values) {
        if (subject !== "لا ندرس مساءً") {
          subjects.add(subject);
        }
      }
    }
  }

  return [...subjects];
}

function populateHomeworkSubjects() {
  const select = $("homeworkSubject");

  select.innerHTML = "";

  for (const subject of getSubjects()) {
    const option =
      document.createElement("option");

    option.value = subject;
    option.textContent = subject;

    select.appendChild(option);
  }
}

function setupHomeworkForm() {
  $("homeworkDueDate").min = todayString();

  $("homeworkText").addEventListener(
    "input",
    () => {
      $("homeworkCharCount").textContent =
        `${$("homeworkText").value.length} / ${CONFIG.maxHomeworkLength}`;
    },
  );

  $("homeworkForm").addEventListener(
    "submit",
    addHomework,
  );
}

async function addHomework(event) {
  event.preventDefault();

  if (!currentUser) {
    return;
  }

  const subject =
    $("homeworkSubject").value.trim();

  const text =
    $("homeworkText").value.trim();

  const dueDate =
    $("homeworkDueDate").value;

  clearStatus($("homeworkStatus"));

  if (!subject || !text || !dueDate) {
    setStatus(
      $("homeworkStatus"),
      "املأ جميع الخانات.",
      "error",
    );

    return;
  }

  if (text.length > CONFIG.maxHomeworkLength) {
    setStatus(
      $("homeworkStatus"),
      "الواجب طويل جدًا.",
      "error",
    );

    return;
  }

  if (dueDate < todayString()) {
    setStatus(
      $("homeworkStatus"),
      "لا يمكن إضافة واجب بتاريخ قديم.",
      "error",
    );

    return;
  }

  const button =
    $("homeworkForm").querySelector(
      "button[type='submit']",
    );

  button.disabled = true;

  try {
    await addDoc(
      collection(db, "homework"),
      {
        subject,
        text,
        dueDate,
        authorName: currentUserName,
        authorUid: currentUser.uid,
        createdAt: serverTimestamp(),
      },
    );

    $("homeworkText").value = "";
    $("homeworkDueDate").value = "";
    $("homeworkCharCount").textContent =
      "0 / 500";

    setStatus(
      $("homeworkStatus"),
      "تمت إضافة الواجب.",
      "success",
    );
  } catch (error) {
    console.error(error);

    setStatus(
      $("homeworkStatus"),
      "تعذر إضافة الواجب. تحقق من اتصال Firebase.",
      "error",
    );
  } finally {
    button.disabled = false;
  }
}

function renderHomework(snapshot) {
  const list = $("homeworkList");

  list.innerHTML = "";

  const docs = snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter(
      (item) =>
        item.dueDate &&
        item.dueDate >= todayString(),
    )
    .sort((a, b) =>
      a.dueDate.localeCompare(b.dueDate),
    );

  $("homeworkEmpty").hidden =
    docs.length !== 0;

  for (const homework of docs) {
    const article =
      document.createElement("article");

    article.className = "homework-item";

    const top =
      document.createElement("div");

    top.className = "homework-top";

    const subject =
      document.createElement("strong");

    subject.className =
      "homework-subject";

    subject.textContent =
      homework.subject;

    const due =
      document.createElement("span");

    due.className = "homework-due";

    if (homework.dueDate === todayString()) {
      due.classList.add("today");
      due.textContent = "اليوم";
    } else {
      due.textContent =
        formatDate(homework.dueDate);
    }

    top.append(subject, due);

    const text =
      document.createElement("p");

    text.className = "homework-text";
    text.textContent = homework.text;

    const meta =
      document.createElement("div");

    meta.className = "homework-meta";

    const author =
      document.createElement("span");

    author.textContent =
      `بواسطة ${homework.authorName || "عضو القسم"}`;

    meta.appendChild(author);

    const canDelete =
      currentUser &&
      (homework.authorUid ===
        currentUser.uid ||
        isAdminUser(currentUser));

    if (canDelete) {
      const deleteButton =
        document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className =
        "delete-btn";
      deleteButton.textContent =
        "حذف";

      deleteButton.addEventListener(
        "click",
        () =>
          deleteHomework(
            homework.id,
          ),
      );

      meta.appendChild(deleteButton);
    }

    article.append(top, text, meta);
    list.appendChild(article);
  }
}

async function deleteHomework(id) {
  if (!currentUser || !id) return;

  const confirmed = window.confirm(
    "هل تريد حذف هذا الواجب؟",
  );

  if (!confirmed) return;

  try {
    await deleteDoc(
      doc(db, "homework", id),
    );
  } catch (error) {
    console.error(error);

    setStatus(
      $("homeworkStatus"),
      "تعذر حذف الواجب.",
      "error",
    );
  }
}

function subscribeHomework() {
  if (homeworkUnsubscribe) {
    homeworkUnsubscribe();
    homeworkUnsubscribe = null;
  }

  if (!currentUser) return;

  const q = query(
    collection(db, "homework"),
    where(
      "dueDate",
      ">=",
      todayString(),
    ),
    orderBy("dueDate", "asc"),
  );

  homeworkUnsubscribe = onSnapshot(
    q,
    (snapshot) => {
      renderHomework(snapshot);
    },
    (error) => {
      console.error(error);

      $("homeworkEmpty").hidden = false;
      $("homeworkEmpty").textContent =
        "تعذر تحميل الواجبات.";
    },
  );
}

/* =========================
   الدردشة
========================= */

let lastMessageTime = 0;

function setupChat() {
  $("chatInput").addEventListener(
    "input",
    autoResizeChatInput,
  );

  $("chatForm").addEventListener(
    "submit",
    sendMessage,
  );
}

function autoResizeChatInput() {
  const input = $("chatInput");

  input.style.height = "auto";
  input.style.height =
    `${Math.min(input.scrollHeight, 130)}px`;
}

async function sendMessage(event) {
  event.preventDefault();

  if (!currentUser) return;

  const now = Date.now();

  if (
    now - lastMessageTime <
    CONFIG.chatCooldown
  ) {
    setStatus(
      $("chatStatus"),
      "انتظر قليلًا قبل إرسال رسالة أخرى.",
      "error",
    );

    return;
  }

  const text =
    $("chatInput").value.trim();

  clearStatus($("chatStatus"));

  if (!text) {
    return;
  }

  if (text.length > CONFIG.maxMessageLength) {
    setStatus(
      $("chatStatus"),
      "الرسالة طويلة جدًا.",
      "error",
    );

    return;
  }

  const button = $("chatSend");
  button.disabled = true;

  try {
    await addDoc(
      collection(db, "messages"),
      {
        text,
        authorName: currentUserName,
        authorUid: currentUser.uid,
        createdAt: serverTimestamp(),
      },
    );

    lastMessageTime = Date.now();

    $("chatInput").value = "";
    $("chatInput").style.height = "auto";
  } catch (error) {
    console.error(error);

    setStatus(
      $("chatStatus"),
      "تعذر إرسال الرسالة.",
      "error",
    );
  } finally {
    button.disabled = false;
  }
}

function renderChat(snapshot) {
  const container =
    $("chatMessages");

  container.innerHTML = "";

  if (snapshot.empty) {
    const empty =
      document.createElement("div");

    empty.className = "chat-empty";
    empty.textContent =
      "لا توجد رسائل بعد. كن أول من يكتب 👋";

    container.appendChild(empty);

    return;
  }

  const messages = [...snapshot.docs]
    .reverse();

  for (const item of messages) {
    const message = item.data();

    const wrapper =
      document.createElement("div");

    wrapper.className = "chat-message";

    if (
      currentUser &&
      message.authorUid ===
        currentUser.uid
    ) {
      wrapper.classList.add("mine");
    }

    const bubble =
      document.createElement("div");

    bubble.className = "chat-bubble";
    bubble.textContent = message.text;

    const meta =
      document.createElement("div");

    meta.className = "chat-meta";

    const name =
      document.createElement("span");

    name.className = "chat-name";
    name.textContent =
      message.authorName ||
      "عضو القسم";

    meta.appendChild(name);

    const time =
      document.createElement("span");

    time.textContent =
      formatTime(message.createdAt);

    meta.appendChild(time);

    const canDelete =
      currentUser &&
      (message.authorUid ===
        currentUser.uid ||
        isAdminUser(currentUser));

    if (canDelete) {
      const deleteButton =
        document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className =
        "chat-delete";
      deleteButton.textContent =
        "حذف";

      deleteButton.addEventListener(
        "click",
        () => deleteMessage(item.id),
      );

      meta.appendChild(deleteButton);
    }

    wrapper.append(bubble, meta);
    container.appendChild(wrapper);
  }

  requestAnimationFrame(() => {
    container.scrollTop =
      container.scrollHeight;
  });
}

async function deleteMessage(id) {
  if (!currentUser || !id) return;

  const confirmed = window.confirm(
    "هل تريد حذف هذه الرسالة؟",
  );

  if (!confirmed) return;

  try {
    await deleteDoc(
      doc(db, "messages", id),
    );
  } catch (error) {
    console.error(error);

    setStatus(
      $("chatStatus"),
      "تعذر حذف الرسالة.",
      "error",
    );
  }
}

function subscribeChat() {
  if (chatUnsubscribe) {
    chatUnsubscribe();
    chatUnsubscribe = null;
  }

  if (!currentUser) return;

  const q = query(
    collection(db, "messages"),
    orderBy("createdAt", "desc"),
    limit(80),
  );

  chatUnsubscribe = onSnapshot(
    q,
    (snapshot) => {
      renderChat(snapshot);
    },
    (error) => {
      console.error(error);

      $("chatMessages").innerHTML = "";

      const errorMessage =
        document.createElement("div");

      errorMessage.className =
        "chat-empty";

      errorMessage.textContent =
        "تعذر تحميل الدردشة.";

      $("chatMessages").appendChild(
        errorMessage,
      );
    },
  );
}

/* =========================
   مراقبة تسجيل الدخول
========================= */

function setupAuthState() {
  onAuthStateChanged(
    auth,
    async (user) => {
      currentUser = user;

      if (!user) {
        currentUserName = "عضو القسم";

        if (homeworkUnsubscribe) {
          homeworkUnsubscribe();
          homeworkUnsubscribe = null;
        }

        if (chatUnsubscribe) {
          chatUnsubscribe();
          chatUnsubscribe = null;
        }

        await updateAccountUI(null);

        return;
      }

      await loadUserProfile(user);
      await updateAccountUI(user);

      subscribeHomework();
      subscribeChat();
    },
  );
}

/* =========================
   الأحداث
========================= */

$("search").addEventListener(
  "input",
  filterStudents,
);

$("loginTab").addEventListener(
  "click",
  () => setAuthMode("login"),
);

$("signupTab").addEventListener(
  "click",
  () => setAuthMode("signup"),
);

$("authForm").addEventListener(
  "submit",
  handleAuthSubmit,
);

$("logoutBtn").addEventListener(
  "click",
  handleLogout,
);

/* =========================
   التشغيل
========================= */

renderHero();
buildTable();
renderStudents();
markNow();
updateNext();

populateHomeworkSubjects();
setupHomeworkForm();
setupChat();
setupTheme();
setupNavigation();
setupAuthState();

setInterval(() => {
  markNow();
  updateNext();
}, 30000);