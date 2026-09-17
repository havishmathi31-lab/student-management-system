// ---------- Student Management System ----------
// Data is persisted in the browser's localStorage, so it survives refreshes
// but stays local to this browser (no backend/database required).

const STORAGE_KEY = "sms_students";

let students = loadStudents();
let editingId = null;

// ---------- Storage helpers ----------
function loadStudents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load students:", e);
    return [];
  }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function uid() {
  return "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}

// ---------- DOM refs ----------
const form = document.getElementById("studentForm");
const tableBody = document.getElementById("tableBody");
const emptyState = document.getElementById("emptyState");
const searchBox = document.getElementById("searchBox");
const sortBy = document.getElementById("sortBy");
const statsEl = document.getElementById("stats");
const toast = document.getElementById("toast");
const cancelEditBtn = document.getElementById("cancelEdit");
const submitBtn = document.getElementById("submitBtn");
const formTitle = document.getElementById("formTitle");

// ---------- Rendering ----------
function render() {
  const query = searchBox.value.trim().toLowerCase();
  const sortKey = sortBy.value;

  let visible = students.filter((s) => {
    if (!query) return true;
    return (
      s.name.toLowerCase().includes(query) ||
      s.rollNo.toLowerCase().includes(query) ||
      s.grade.toLowerCase().includes(query)
    );
  });

  visible.sort((a, b) => {
    if (sortKey === "attendance") return b.attendance - a.attendance;
    return String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, { numeric: true });
  });

  tableBody.innerHTML = "";
  emptyState.hidden = students.length !== 0;

  visible.forEach((s) => {
    const tr = document.createElement("tr");

    const attendancePillClass =
      s.attendance >= 85 ? "good" : s.attendance >= 60 ? "warn" : "low";

    tr.innerHTML = `
      <td class="name-cell">
        <strong>${escapeHtml(s.name)}</strong>
        ${s.notes ? `<span style="color:var(--muted);font-size:12px;">${escapeHtml(s.notes)}</span>` : ""}
      </td>
      <td>${escapeHtml(s.rollNo)}</td>
      <td>${escapeHtml(s.grade)}</td>
      <td><span class="pill ${attendancePillClass}">${s.attendance}%</span></td>
      <td>
        ${s.email ? `<div>${escapeHtml(s.email)}</div>` : ""}
        ${s.phone ? `<div style="color:var(--muted);">${escapeHtml(s.phone)}</div>` : ""}
      </td>
      <td>
        <div class="row-actions">
          <button class="icon-btn edit" data-id="${s.id}">Edit</button>
          <button class="icon-btn delete" data-id="${s.id}">Delete</button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  statsEl.innerHTML = `<b>${students.length}</b> student${students.length === 1 ? "" : "s"} total`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ---------- Form handling ----------
function resetForm() {
  form.reset();
  document.getElementById("attendance").value = 100;
  document.getElementById("studentId").value = "";
  editingId = null;
  formTitle.textContent = "Add student";
  submitBtn.textContent = "Add student";
  cancelEditBtn.hidden = true;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value.trim(),
    rollNo: document.getElementById("rollNo").value.trim(),
    grade: document.getElementById("grade").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    attendance: Number(document.getElementById("attendance").value) || 0,
    notes: document.getElementById("notes").value.trim(),
  };

  if (!data.name || !data.rollNo || !data.grade) {
    showToast("Please fill in name, roll number, and class.");
    return;
  }

  if (editingId) {
    const idx = students.findIndex((s) => s.id === editingId);
    if (idx !== -1) students[idx] = { ...students[idx], ...data };
    showToast("Student updated.");
  } else {
    // Prevent duplicate roll numbers
    if (students.some((s) => s.rollNo.toLowerCase() === data.rollNo.toLowerCase())) {
      showToast("That roll number already exists.");
      return;
    }
    students.push({ id: uid(), ...data });
    showToast("Student added.");
  }

  saveStudents();
  resetForm();
  render();
});

cancelEditBtn.addEventListener("click", resetForm);

tableBody.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("edit")) {
    const s = students.find((st) => st.id === id);
    if (!s) return;
    editingId = id;
    document.getElementById("studentId").value = s.id;
    document.getElementById("name").value = s.name;
    document.getElementById("rollNo").value = s.rollNo;
    document.getElementById("grade").value = s.grade;
    document.getElementById("email").value = s.email || "";
    document.getElementById("phone").value = s.phone || "";
    document.getElementById("attendance").value = s.attendance;
    document.getElementById("notes").value = s.notes || "";
    formTitle.textContent = "Edit student";
    submitBtn.textContent = "Save changes";
    cancelEditBtn.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (e.target.classList.contains("delete")) {
    const s = students.find((st) => st.id === id);
    if (!s) return;
    if (confirm(`Remove ${s.name} from the records?`)) {
      students = students.filter((st) => st.id !== id);
      saveStudents();
      if (editingId === id) resetForm();
      render();
      showToast("Student removed.");
    }
  }
});

searchBox.addEventListener("input", render);
sortBy.addEventListener("change", render);

// ---------- Toast ----------
let toastTimer = null;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---------- Init ----------
render();
