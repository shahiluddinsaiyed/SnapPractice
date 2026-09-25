const result = JSON.parse(sessionStorage.getItem("snappractice_result") || "null");

if (!result) {
  location.href = "index.html";
} else {
  document.getElementById("resultTitle").textContent = result.testName;
  document.getElementById("score").textContent = result.score;
  document.getElementById("totalMarks").textContent = `/ ${result.totalMarks}`;
  document.getElementById("correct").textContent = result.correct;
  document.getElementById("incorrect").textContent = result.incorrect;
  document.getElementById("unattempted").textContent = result.unattempted;
  document.getElementById("accuracy").textContent = `${result.accuracy}%`;

  const m = Math.floor(result.timeTaken / 60);
  const s = result.timeTaken % 60;
  document.getElementById("timeTaken").textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

  document.getElementById("resultMessage").textContent =
    result.score >= result.totalMarks * .75
      ? "Great practice session. Keep improving your speed."
      : "Review your incorrect questions and try another mock.";

  const rows = Object.entries(result.sectionData).map(([name, d]) => `
    <div class="result-row">
      <div>${escapeHtml(name)}</div>
      <div>${d.correct}</div>
      <div>${d.incorrect}</div>
      <div>${d.score.toFixed(2)}</div>
    </div>
  `).join("");

  document.getElementById("sectionResults").innerHTML = `
    <div class="result-row header">
      <div>Section</div><div>Correct</div><div>Wrong</div><div>Score</div>
    </div>
    ${rows}
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}