let habits = [];
let currentDate = new Date();

// Week always starts Monday
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(startDate) {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    return day;
  });
}

function formatDate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isToday(date) {
  return date.toDateString() === new Date().toDateString();
}

function calculateStreak(habit, today = new Date()) {
  const todayStr = formatDate(today);
  let streak = 0;
  const cursor = new Date(today);

  // if today isn't checked, start counting from yesterday
  if (!habit.checkmarks[todayStr]) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (habit.checkmarks[formatDate(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function saveData() {
  localStorage.setItem("habitTracker", JSON.stringify({ habits }));
}

function loadData() {
  const saved = localStorage.getItem("habitTracker");
  if (saved) {
    habits = JSON.parse(saved).habits || [];
  }

  if (habits.length === 0) {
    habits.push({
      id: Date.now().toString(),
      name: "Exercise",
      checkmarks: {},
    });
    saveData();
  }
}

function toggleCheckmark(habitId, date) {
  const habit = habits.find((h) => h.id === habitId);
  if (!habit) return;

  // block anything more than a week out
  const limit = new Date();
  limit.setDate(limit.getDate() + 7);
  if (date > limit) return;

  const dateStr = formatDate(date);
  habit.checkmarks[dateStr] = !habit.checkmarks[dateStr];
  saveData();
  render();
}

function addHabit(name) {
  if (!name.trim()) return;
  habits.push({ id: Date.now().toString(), name: name.trim(), checkmarks: {} });
  saveData();
  render();
}

function deleteHabit(id) {
  habits = habits.filter((h) => h.id !== id);
  saveData();
  render();
}

function renameHabit(id, newName) {
  const habit = habits.find((h) => h.id === id);
  if (habit && newName.trim()) {
    habit.name = newName.trim();
    saveData();
    render();
  }
}

function goPrevWeek() {
  currentDate.setDate(currentDate.getDate() - 7);
  render();
}

function goNextWeek() {
  const nextWeek = getStartOfWeek(currentDate);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // don't go past the current week
  if (nextWeek > getStartOfWeek(new Date())) return;

  currentDate = nextWeek;
  render();
}

function goToCurrentWeek() {
  currentDate = new Date();
  render();
}

function escapeHtml(str) {
  return str.replace(
    /[&<>]/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[m],
  );
}

function render() {
  const weekStart = getStartOfWeek(currentDate);
  const weekDays = getWeekDays(weekStart);
  const today = new Date();

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const fmt = { month: "short", day: "numeric" };
  document.getElementById("weekRange").innerText =
    `${weekStart.toLocaleDateString(undefined, fmt)} – ${weekEnd.toLocaleDateString(undefined, fmt)}`;

  const grid = document.getElementById("habitGrid");
  const emptyState = document.getElementById("emptyState");
  const gridWrapper = document.querySelector(".grid-wrapper");

  if (habits.length === 0) {
    gridWrapper.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  gridWrapper.style.display = "block";
  emptyState.style.display = "none";

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const headers = weekDays
    .map(
      (day, i) => `
    <div class="day-header ${isToday(day) ? "today-header" : ""}">
      ${dayNames[i]}<br>
      <span style="font-weight:normal;font-size:0.75rem">${day.getDate()}</span>
    </div>
  `,
    )
    .join("");

  const rows = habits
    .map((habit) => {
      const streak = calculateStreak(habit, today);

      const cells = weekDays
        .map((day) => {
          const dateStr = formatDate(day);
          const checked = habit.checkmarks[dateStr] || false;
          const future = day > today && !isToday(day);
          return `
        <div class="day-cell ${isToday(day) ? "today" : ""}">
          <input type="checkbox" class="checkbox"
            data-habit="${habit.id}"
            data-date="${dateStr}"
            ${checked ? "checked" : ""}
            ${future ? "disabled" : ""}>
        </div>
      `;
        })
        .join("");

      return `
      <div class="habit-row" data-habit-id="${habit.id}">
        <div class="habit-label-cell">
          <span class="habit-name">${escapeHtml(habit.name)}</span>
          <span class="streak-badge">🔥 ${streak}</span>
          <div class="habit-actions">
            <button class="edit-habit" data-edit="${habit.id}" aria-label="Edit">✏️</button>
            <button class="delete-habit" data-delete="${habit.id}" aria-label="Delete">🗑️</button>
          </div>
        </div>
        ${cells}
      </div>
    `;
    })
    .join("");

  grid.innerHTML = `
    <div class="grid-header">
      <div class="habit-label-header">Habit / Streak</div>
      ${headers}
    </div>
    ${rows}
  `;

  // events
  grid.querySelectorAll(".checkbox").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      e.stopPropagation();
      toggleCheckmark(cb.dataset.habit, new Date(cb.dataset.date));
    });
  });

  grid.querySelectorAll(".delete-habit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Delete this habit? All progress will be lost.")) {
        deleteHabit(btn.dataset.delete);
      }
    });
  });

  grid.querySelectorAll(".edit-habit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const habit = habits.find((h) => h.id === btn.dataset.edit);
      const newName = prompt("Rename habit:", habit.name);
      if (newName?.trim()) renameHabit(habit.id, newName);
    });
  });
}

function init() {
  loadData();
  render();

  const input = document.getElementById("habitNameInput");

  document.getElementById("addHabitBtn").addEventListener("click", () => {
    if (input.value.trim()) {
      addHabit(input.value);
      input.value = "";
    }
  });

  document
    .getElementById("emptyAddBtn")
    .addEventListener("click", () => input.focus());
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") document.getElementById("addHabitBtn").click();
  });

  document.getElementById("prevWeekBtn").addEventListener("click", goPrevWeek);
  document.getElementById("nextWeekBtn").addEventListener("click", goNextWeek);
  document
    .getElementById("todayBtn")
    .addEventListener("click", goToCurrentWeek);
}

init();
