const params = new URLSearchParams(location.search);
const testId = params.get("test");
const test = TESTS.find(t => t.id === testId) || TESTS[0];

const stateKey = `snappractice_${test.id}`;
let saved = sessionStorage.getItem(stateKey);
let state = saved ? JSON.parse(saved) : {
  answers: {},
  review: {},
  visited: {},
  startedAt: Date.now(),
  currentIndex: 0,
  selectedSection: test.sections[0]
};

if (!state.startedAt) state.startedAt = Date.now();

const sectionList = document.getElementById("sectionList");
const palette = document.getElementById("palette");
const questionText = document.getElementById("questionText");
const optionsBox = document.getElementById("options");
const questionNumber = document.getElementById("questionNumber");
const questionCounter = document.getElementById("questionCounter");
const currentSection = document.getElementById("currentSection");
const marksInfo = document.getElementById("marksInfo");
const timerEl = document.getElementById("timer");
const examTitle = document.getElementById("examTitle");

examTitle.textContent = test.name;

function saveState() {
  sessionStorage.setItem(stateKey, JSON.stringify(state));
}

function sectionQuestions(section) {
  return test.questions.map((q, i) => ({...q, originalIndex: i}))
    .filter(q => q.section === section);
}

function visibleQuestions() {
  return sectionQuestions(state.selectedSection);
}

function currentQuestion() {
  const list = visibleQuestions();
  return list[state.currentIndex] || list[0];
}

function setSection(section) {
  state.selectedSection = section;
  state.currentIndex = 0;
  saveState();
  renderAll();
}

function renderSections() {
  sectionList.innerHTML = test.sections.map(section => `
    <button class="section-btn ${section === state.selectedSection ? "active" : ""}" data-section="${escapeHtml(section)}">
      ${escapeHtml(section)}
    </button>
  `).join("");

  sectionList.querySelectorAll(".section-btn").forEach(btn => {
    btn.addEventListener("click", () => setSection(btn.dataset.section));
  });
}

function renderPalette() {
  const all = visibleQuestions();
  palette.innerHTML = all.map((q, idx) => {
    const key = String(q.originalIndex);
    const classes = [
      idx === state.currentIndex ? "current" : "",
      state.answers[key] !== undefined ? "answered" : "",
      state.review[key] ? "review" : ""
    ].filter(Boolean).join(" ");
    return `<button class="${classes}" data-index="${idx}">${idx + 1}</button>`;
  }).join("");

  palette.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      state.currentIndex = Number(btn.dataset.index);
      saveState();
      renderAll();
    });
  });
}

function renderQuestion() {
  const q = currentQuestion();
  if (!q) return;

  const key = String(q.originalIndex);
  state.visited[key] = true;

  questionNumber.textContent = state.currentIndex + 1;
  questionCounter.textContent = `${state.currentIndex + 1} of ${visibleQuestions().length}`;
  currentSection.textContent = q.section;
  marksInfo.textContent = `+${q.marks} / -${q.negative}`;
  questionText.textContent = q.text;

  optionsBox.innerHTML = q.options.map((option, i) => `
    <label class="option ${state.answers[key] === i ? "selected" : ""}">
      <input type="radio" name="answer" value="${i}" ${state.answers[key] === i ? "checked" : ""}>
      <span class="option-label">${String.fromCharCode(65+i)}.</span>
      <span>${escapeHtml(option)}</span>
    </label>
  `).join("");

  optionsBox.querySelectorAll("input").forEach(input => {
    input.addEventListener("change", () => {
      state.answers[key] = Number(input.value);
      saveState();
      renderQuestion();
      renderPalette();
    });
  });

  document.getElementById("prevBtn").disabled = state.currentIndex === 0;
  document.getElementById("nextBtn").textContent =
    state.currentIndex === visibleQuestions().length - 1 ? "Save & Next →" : "Save & Next →";

  document.getElementById("reviewBtn").textContent =
    state.review[key] ? "Remove Review" : "Mark for Review";

  saveState();
}

function renderAll() {
  renderSections();
  renderQuestion();
  renderPalette();
}

function next() {
  const list = visibleQuestions();
  if (state.currentIndex < list.length - 1) {
    state.currentIndex++;
    saveState();
    renderAll();
  } else {
    const sectionIndex = test.sections.indexOf(state.selectedSection);
    if (sectionIndex < test.sections.length - 1) {
      setSection(test.sections[sectionIndex + 1]);
    } else {
      openSubmitModal();
    }
  }
}

function previous() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    saveState();
    renderAll();
  }
}

function clearAnswer() {
  const q = currentQuestion();
  if (!q) return;
  delete state.answers[String(q.originalIndex)];
  saveState();
  renderAll();
}

function toggleReview() {
  const q = currentQuestion();
  const key = String(q.originalIndex);
  state.review[key] = !state.review[key];
  saveState();
  renderAll();
}

function calculateRemaining() {
  const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
  return Math.max(0, test.duration * 60 - elapsed);
}

function updateTimer() {
  const remaining = calculateRemaining();
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  timerEl.textContent = `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;

  if (remaining <= 60) timerEl.classList.add("timer-danger");

  if (remaining <= 0) {
    clearInterval(timerInterval);
    finishTest(true);
  }
}

function openSubmitModal() {
  document.getElementById("submitModal").classList.remove("hidden");
}
function closeSubmitModal() {
  document.getElementById("submitModal").classList.add("hidden");
}

function finishTest(auto = false) {
  closeSubmitModal();
  const result = calculateResult();
  sessionStorage.setItem("snappractice_result", JSON.stringify(result));
  sessionStorage.removeItem(stateKey);
  location.href = "result.html";
}

function calculateResult() {
  let score = 0, correct = 0, incorrect = 0, unattempted = 0;
  const sectionData = {};

  test.questions.forEach((q, i) => {
    if (!sectionData[q.section]) sectionData[q.section] = {correct:0, incorrect:0, unattempted:0, score:0};
    const key = String(i);
    const selected = state.answers[key];

    if (selected === undefined) {
      unattempted++;
      sectionData[q.section].unattempted++;
    } else if (selected === q.answer) {
      correct++;
      score += q.marks;
      sectionData[q.section].correct++;
      sectionData[q.section].score += q.marks;
    } else {
      incorrect++;
      score -= q.negative;
      sectionData[q.section].incorrect++;
      sectionData[q.section].score -= q.negative;
    }
  });

  const attempted = correct + incorrect;
  const accuracy = attempted ? (correct / attempted) * 100 : 0;
  const timeTaken = Math.min(test.duration * 60, Math.floor((Date.now() - state.startedAt) / 1000));

  return {
    testName: test.name,
    score: Number(score.toFixed(2)),
    totalMarks: test.questions.reduce((s,q) => s + q.marks, 0),
    correct, incorrect, unattempted,
    accuracy: Number(accuracy.toFixed(1)),
    timeTaken,
    sectionData
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

document.getElementById("prevBtn").addEventListener("click", previous);
document.getElementById("nextBtn").addEventListener("click", next);
document.getElementById("clearBtn").addEventListener("click", clearAnswer);
document.getElementById("reviewBtn").addEventListener("click", toggleReview);
document.getElementById("submitBtn").addEventListener("click", openSubmitModal);

document.getElementById("confirmSubmit").addEventListener("click", () => finishTest(false));
document.getElementById("cancelSubmit").addEventListener("click", closeSubmitModal);

const sectionModal = document.getElementById("sectionModal");
let pendingSection = state.selectedSection;

function openSectionModal() {
  pendingSection = state.selectedSection;
  document.getElementById("modalSections").innerHTML = test.sections.map(s => `
    <button class="modal-section ${s === pendingSection ? "selected" : ""}" data-section="${escapeHtml(s)}">${escapeHtml(s)}</button>
  `).join("");

  document.querySelectorAll(".modal-section").forEach(btn => {
    btn.addEventListener("click", () => {
      pendingSection = btn.dataset.section;
      document.querySelectorAll(".modal-section").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  sectionModal.classList.remove("hidden");
}
function closeSectionModal() {
  sectionModal.classList.add("hidden");
}

document.getElementById("changeSectionBtn").addEventListener("click", openSectionModal);
document.getElementById("sectionMenuBtn").addEventListener("click", openSectionModal);
document.getElementById("closeModal").addEventListener("click", closeSectionModal);
document.getElementById("cancelModal").addEventListener("click", closeSectionModal);
document.getElementById("confirmSection").addEventListener("click", () => {
  setSection(pendingSection);
  closeSectionModal();
});

window.addEventListener("beforeunload", saveState);

renderAll();
updateTimer();
const timerInterval = setInterval(updateTimer, 1000);