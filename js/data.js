let currentYear = '2025';

document.addEventListener('DOMContentLoaded', () => {
    renderPaper(currentYear);

    // Search event listener
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        if (searchTerm === '') {
            renderPaper(currentYear);
        } else {
            filterQuestions(searchTerm);
        }
    });
});

function switchYear(year) {
    currentYear = year;
    
    // Update active tab UI
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(year)) {
            btn.classList.add('active');
        }
    });

    renderPaper(year);
}

function renderPaper(year) {
    const container = document.getElementById('paperContainer');
    container.innerHTML = '';

    const yearData = snapPapersData[year];
    if (!yearData) return;

    for (const [sectionName, questions] of Object.entries(yearData)) {
        const sectionTitle = document.createElement('h2');
        sectionTitle.className = 'section-header';
        sectionTitle.textContent = sectionName;
        container.appendChild(sectionTitle);

        questions.forEach(q => {
            container.appendChild(createQuestionCard(q));
        });
    }
}

function createQuestionCard(q) {
    const card = document.createElement('div');
    card.className = 'question-card';

    const title = document.createElement('div');
    title.className = 'question-title';
    title.textContent = `${q.id}. ${q.question}`;
    card.appendChild(title);

    if (q.options && q.options.length > 0) {
        const optionsList = document.createElement('ul');
        optionsList.className = 'options-list';
        q.options.forEach(opt => {
            const li = document.createElement('li');
            li.textContent = opt;
            optionsList.appendChild(li);
        });
        card.appendChild(optionsList);
    }

    return card;
}

function filterQuestions(term) {
    const container = document.getElementById('paperContainer');
    container.innerHTML = '';

    let matchCount = 0;

    for (const [year, sections] of Object.entries(snapPapersData)) {
        for (const [sectionName, questions] of Object.entries(sections)) {
            questions.forEach(q => {
                const matchesQuestion = q.question.toLowerCase().includes(term);
                const matchesOptions = q.options.some(opt => opt.toLowerCase().includes(term));

                if (matchesQuestion || matchesOptions) {
                    matchCount++;
                    const card = createQuestionCard(q);
                    
                    // Tag card with origin paper
                    const tag = document.createElement('small');
                    tag.style.color = '#2563eb';
                    tag.style.fontWeight = 'bold';
                    tag.textContent = `[SNAP ${year} - ${sectionName}]`;
                    card.prepend(tag);

                    container.appendChild(card);
                }
            });
        }
    }

    if (matchCount === 0) {
        container.innerHTML = '<p style="text-align:center; padding:2rem; color:#64748b;">No matching questions found.</p>';
    }
}