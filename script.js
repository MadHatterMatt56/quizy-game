// === WORD LISTS BY DIFFICULTY ===
const WORD_LISTS = {
  easy: [
    { word: "cat", question: "What says meow?" },
    { word: "dog", question: "What barks?" },
    { word: "tree", question: "What has branches?" },
    { word: "bird", question: "What usually flies?" },
    { word: "moon", question: "What appears at night in the sky?" },
    { word: "sun", question: "What shines during the day?" },
    { word: "house", question: "What do people live inside?" },
    { word: "water", question: "What do humans drink?" },
    { word: "pizza", question: "What food is cheesy and round?" },
    { word: "game", question: "What do people play for fun?" }
  ],
  medium: [
    { word: "planet", question: "Earth is one of these. What is it?" },
    { word: "rocket", question: "What travels into space?" },
    { word: "winter", question: "What is the coldest season?" },
    { word: "summer", question: "What is the warmest season?" },
    { word: "garden", question: "Where do you grow flowers?" },
    { word: "jungle", question: "A tropical forest is called what?" },
    { word: "window", question: "You look through this in a wall. What is it?" },
    { word: "dragon", question: "A fire-breathing creature is called what?" },
    { word: "castle", question: "A king or queen lives in a what?" },
    { word: "pirate", question: "A treasure thief on the sea is called what?" },
    { word: "switch", question: "What do you flip to turn something on/off?" },
    { word: "decimal", question: "A number with a dot is called what?" },
    { word: "sample", question: "A small part of something bigger is called what?" }
  ],
  hard: [
    { word: "mystery", question: "A story with an unknown ending is called what?" },
    { word: "rhythm", question: "Music has a beat called what?" },
    { word: "oxygen", question: "Humans must breathe what gas?" },
    { word: "galaxy", question: "The Milky Way is a what?" },
    { word: "phantom", question: "Another word for ghost is what?" },
    { word: "complex", question: "The opposite of simple is what?" },
    { word: "zealous", question: "Someone very enthusiastic is what?" },
    { word: "jukebox", question: "A coin-operated music machine is what?" },
    { word: "vortex", question: "A spinning mass of air or water is called what?" },
    { word: "pixelate", question: "An image becomes blocky when it does what?" },
    { word: "hardware", question: "Computer parts you can touch are called what?" },
    { word: "software", question: "Computer programs are called what?" }
  ]
};

// Max wrong guesses by difficulty
const MAX_WRONG = {
  easy: 8,
  medium: 6,
  hard: 5
};

// === DOM ELEMENTS ===
const difficultySelect = document.getElementById("difficulty");
const wordDisplayEl = document.getElementById("wordDisplay");
const statusEl = document.getElementById("status");
const usedLettersEl = document.getElementById("usedLetters");
const keyboardEl = document.getElementById("keyboard");
const attemptsDisplayEl = document.getElementById("attemptsDisplay");
const newGameBtn = document.getElementById("newGameBtn");
const gameContainer = document.getElementById("gameContainer");
const hangmanEl = document.getElementById("hangman");
const bodyParts = Array.from(document.querySelectorAll(".bodypart"));
const questionHintEl = document.getElementById("questionHint");

// Sound effects
const sfx = {
  correct: document.getElementById("sfx-correct"),
  wrong: document.getElementById("sfx-wrong"),
  win: document.getElementById("sfx-win"),
  lose: document.getElementById("sfx-lose"),
  click: document.getElementById("sfx-click")
};

// === GAME STATE ===
let secretWord = "";
let revealedLetters = [];
let usedLetters = new Set();
let wrongGuesses = 0;
let maxWrong = MAX_WRONG.medium;
let gameOver = false;
let currentQuestion = "";

// === INITIAL SETUP ===
createKeyboard();
attachListeners();
startNewGame();

// === FUNCTIONS ===

// Create on-screen keyboard
function createKeyboard() {
  keyboardEl.innerHTML = "";
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  alphabet.forEach((letter) => {
    const btn = document.createElement("button");
    btn.className = "key-btn";
    btn.textContent = letter;
    btn.dataset.letter = letter;
    btn.addEventListener("click", () => handleLetter(letter));
    keyboardEl.appendChild(btn);
  });
}

// Event listeners
function attachListeners() {
  newGameBtn.addEventListener("click", () => {
    playSound("click");
    startNewGame();
  });

  difficultySelect.addEventListener("change", () => {
    playSound("click");
    startNewGame();
  });

  // Keyboard support
  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;

    const key = e.key.toLowerCase();
    if (key >= "a" && key <= "z") {
      handleLetter(key);
    }
    if (key === "Enter" && gameOver) {
      startNewGame();
    }
  });
}

// Start new game
function startNewGame() {
  const diff = difficultySelect.value;
  const list = WORD_LISTS[diff];

  const choice = list[Math.floor(Math.random() * list.length)];

  secretWord = choice.word.toLowerCase();
  currentQuestion = choice.question;

  revealedLetters = Array(secretWord.length).fill("_");
  usedLetters = new Set();
  wrongGuesses = 0;
  maxWrong = MAX_WRONG[diff];
  gameOver = false;

  updateWordDisplay();
  updateUsedLettersDisplay();
  updateAttemptsDisplay();
  updateQuestionHint();
  setStatus("Game started! Pick a letter.", "neutral");

  resetKeyboard();
  resetHangmanAnimations();
  hideAllBodyParts();
}

// Update question hint
function updateQuestionHint() {
  questionHintEl.textContent = "Question: " + currentQuestion;
}

// Handle a letter guess
function handleLetter(letter) {
  if (gameOver) return;
  if (usedLetters.has(letter)) return;

  usedLetters.add(letter);
  disableKey(letter);

  const isCorrect = secretWord.includes(letter);

  if (isCorrect) {
    revealLetter(letter);
    flash("correct");
    playSound("correct");

    if (!revealedLetters.includes("_")) {
      handleWin();
    } else {
      setStatus(`Nice! "${letter.toUpperCase()}" is in the word.`, "good");
    }
  } else {
    wrongGuesses++;
    revealBodyPart(wrongGuesses);
    flash("wrong");
    wiggleHangman();
    playSound("wrong");
    updateAttemptsDisplay();

    if (wrongGuesses >= maxWrong) {
      handleLose();
    } else {
      const remaining = maxWrong - wrongGuesses;
      setStatus(
        `Nope! "${letter.toUpperCase()}" is not in the word. ${remaining} wrong guess${remaining === 1 ? "" : "es"} left.`,
        "bad"
      );
    }
  }

  updateUsedLettersDisplay();
}

// Reveal correct letters
function revealLetter(letter) {
  for (let i = 0; i < secretWord.length; i++) {
    if (secretWord[i] === letter) {
      revealedLetters[i] = letter.toUpperCase();
    }
  }
  updateWordDisplay();
}

// Update word display
function updateWordDisplay() {
  wordDisplayEl.textContent = revealedLetters.join(" ");
}

// Update used letters display
function updateUsedLettersDisplay() {
  if (usedLetters.size === 0) {
    usedLettersEl.textContent = "Used letters: –";
    return;
  }
  usedLettersEl.textContent =
    "Used letters: " +
    Array.from(usedLetters)
      .sort()
      .map((l) => l.toUpperCase())
      .join(" ");
}

// Update attempts display
function updateAttemptsDisplay() {
  attemptsDisplayEl.textContent = `Attempts: ${wrongGuesses} / ${maxWrong}`;
}

// Status message
function
