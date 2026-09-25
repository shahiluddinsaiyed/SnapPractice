SNAPPRACTICE - PERSONAL MOCK TEST WEBSITE

This is a simple front-end-only exam practice website.
No login, no admin panel, no database.

HOW TO USE IN VISUAL STUDIO:
1. Create/open a folder in Visual Studio.
2. Copy index.html, test.html, result.html, css folder and js folder into it.
3. Open index.html in a browser. You can also use Visual Studio's web/static file workflow.

HOW TO ADD YOUR OWN TESTS:
Open js/data.js.

Copy an existing test object and change:
- id
- name
- type ("mock" or "pyq")
- description
- duration
- marks
- sections
- questions

For each question:
section: must exactly match one section name.
text: question
options: four options
answer: 0=A, 1=B, 2=C, 3=D
marks: marks for correct answer
negative: negative marks for wrong answer
explanation: solution/explanation shown later if you extend the result page.

IMPORTANT:
The included questions are sample placeholders. Replace them with your own questions/papers.

FEATURES:
- Multiple mock tests
- Previous papers
- Test selection
- Countdown timer
- Auto submit at 00:00
- Section switching
- Question palette
- Answer selection
- Clear response
- Mark for review
- Negative marking
- Result calculation
- Section-wise result
- Responsive mobile layout

No server/database is required for the basic version.
