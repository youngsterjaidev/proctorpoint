// --- MOCK DATA ---
// In a real application, this would be fetched from a backend API.
const quizData = {
    title: "Python Basics",
    timeLimit: 300, // 5 minutes in seconds
    questions: [
        {
            questionText: "What function is used to print output to the console?",
            options: ["console.log()", "print()", "echo()", "output()"],
            correctAnswerIndex: 1
        },
        {
            questionText: "How do you start a single-line comment in Python?",
            options: ["//", "/*", "#", "<!--"],
            correctAnswerIndex: 2
        },
        {
            questionText: "Which data type is used to store a sequence of characters?",
            options: ["int", "list", "str", "char"],
            correctAnswerIndex: 2
        },
        {
            questionText: "What is the result of 10 / 3 in Python 3?",
            options: ["3", "3.333...", "3.0", "Error"],
            correctAnswerIndex: 1
        }
    ]
};

// --- DOM ELEMENT REFERENCES ---
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

const startBtn = document.getElementById('start-btn');
const timerEl = document.getElementById('timer');
const questionTextEl = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');

const scoreTextEl = document.getElementById('score-text');
const cheatingFlagsTextEl = document.getElementById('cheating-flags-text');
const retryBtn = document.getElementById('retry-btn');


// --- STATE VARIABLES ---
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval;
let timeLeft;
let cheatingFlags = 0;


// --- EVENT LISTENERS ---
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', showNextQuestion);
prevBtn.addEventListener('click', showPreviousQuestion);
submitBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to submit?")) {
        submitQuiz();
    }
});
retryBtn.addEventListener('click', () => {
    // In a real app, this might fetch a new quiz. Here, it just resets.
    resultsScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
});

// --- FUNCTIONS ---

function startQuiz() {
    // Initialize state
    currentQuestionIndex = 0;
    cheatingFlags = 0;
    userAnswers = new Array(quizData.questions.length).fill(null);
    
    // Switch screens
    welcomeScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    // Setup anti-cheating
    setupAntiCheating();

    // Start timer and load first question
    startTimer();
    loadQuestion();
}

function loadQuestion() {
    const question = quizData.questions[currentQuestionIndex];
    questionTextEl.textContent = question.questionText;
    
    optionsContainer.innerHTML = ''; // Clear previous options
    
    question.options.forEach((option, index) => {
        const optionEl = document.createElement('label');
        optionEl.innerHTML = `
            <input type="radio" name="option" value="${index}">
            ${option}
        `;
        // Check the radio button if an answer was previously selected
        if (userAnswers[currentQuestionIndex] === index) {
            optionEl.querySelector('input').checked = true;
        }
        optionsContainer.appendChild(optionEl);
    });

    // Store selected answer
    optionsContainer.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', (e) => {
            userAnswers[currentQuestionIndex] = parseInt(e.target.value);
        });
    });

    updateNavigationButtons();
}

function updateNavigationButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === quizData.questions.length - 1;
}

function showNextQuestion() {
    if (currentQuestionIndex < quizData.questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function startTimer() {
    timeLeft = quizData.timeLimit;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time's up!");
            submitQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function submitQuiz() {
    clearInterval(timerInterval);
    removeAntiCheating();

    let score = 0;
    quizData.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctAnswerIndex) {
            score++;
        }
    });
    
    const totalQuestions = quizData.questions.length;
    scoreTextEl.textContent = `Your final score is: ${score} out of ${totalQuestions} (${((score/totalQuestions)*100).toFixed(2)}%)`;
    cheatingFlagsTextEl.textContent = `Suspicious activity flags: ${cheatingFlags}`;

    quizScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
}


// --- ANTI-CHEATING IMPLEMENTATION ---

function flagCheating(event) {
    console.warn("Suspicious activity detected:", event.type);
    cheatingFlags++;
    // Optional: Add a visual warning for the student
    alert("Warning :", cheatingFlags);
    if(cheatingFlags === 3) {
        submitQuiz()
    }
}

function setupAntiCheating() {
    // 1. Request Fullscreen
    document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });

    // 2. Disable Copy/Paste
    document.addEventListener('copy', flagCheating);
    document.addEventListener('paste', flagCheating);
    document.addEventListener('cut', flagCheating);

    // 3. Detect leaving the tab
    document.addEventListener('visibilitychange', flagCheating);
    window.addEventListener('blur', flagCheating);
}

function removeAntiCheating() {
    // Exit fullscreen if active
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    // Remove event listeners to prevent them from firing on the results page
    document.removeEventListener('copy', flagCheating);
    document.removeEventListener('paste', flagCheating);
    document.removeEventListener('cut', flagCheating);
    document.removeEventListener('visibilitychange', flagCheating);
    window.removeEventListener('blur', flagCheating);
}