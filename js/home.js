const grid = document.getElementById("testGrid");

function renderTests(filter = "all") {
  const tests = TESTS.filter(t => filter === "all" || t.type === filter);
  grid.innerHTML = tests.map(test => `
    <article class="test-card">
      <span class="test-type">${test.type === "pyq" ? "PREVIOUS PAPER" : "MOCK TEST"}</span>
      <h2>${test.name}</h2>
      <p>${test.description}</p>
      <div class="test-info">
        <span>⏱ ${test.duration} min</span>
        <span>❓ ${test.questions.length} Q</span>
        <span>★ ${test.marks} marks</span>
      </div>
      <a class="start-btn" href="test.html?test=${encodeURIComponent(test.id)}">START TEST →</a>
    </article>
  `).join("");
}

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTests(btn.dataset.filter);
  });
});

renderTests();