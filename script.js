// === WORD LISTS BY DIFFICULTY ===
const WORD_LISTS = {
  easy: [
    "cat",
    "dog",
    "tree",
    "bird",
    "moon",
    "sun",
    "house",
    "water",
    "pizza",
    "game"
  ],
  medium: [
    "planet",
    "rocket",
    "winter",
    "summer",
    "garden",
    "jungle",
    "window",
    "dragon",
    "castle",
    "pirate",
    "switch",
    "decimal",
    "sample"
  ],
  hard: [
    "mystery",
    "rhythm",
    "oxygen",
    "galaxy",
    "phantom",
    "complex",
    "zealous",
    "jukebox",
    "vortex",
    "pixelate",
    "hardware",
    "software"
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

// Start a new round
function startNewGame() {
  const diff = difficultySelect.value;
  const words = WORD_LISTS[diff];

  // Choose random word
  secretWord = words[Math.floor(Math.random() * words.length)].toLowerCase();

  revealedLetters = Array(secretWord.length).fill("_");
  usedLetters = new Set();
  wrongGuesses = 0;
  maxWrong = MAX_WRONG[diff];
  gameOver = false;

  updateWordDisplay();
  updateUsedLettersDisplay();
  updateAttemptsDisplay();
  setStatus("Game started! Pick a letter.", "neutral");

  resetKeyboard();
  resetHangmanAnimations();
  hideAllBodyParts();
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
        `Nope! "${letter.toUpperCase()}" is not in the word. ${remaining} wrong guess${
          remaining === 1 ? "" : "es"
        } left.`,
        "bad"
      );
    }
  }

  updateUsedLettersDisplay();
}

// Reveal matching letters in the word
function revealLetter(letter) {
  for (let i = 0; i < secretWord.length; i++) {
    if (secretWord[i] === letter) {
      revealedLetters[i] = letter.toUpperCase();
    }
  }
  updateWordDisplay();
}

// Update the word display
function updateWordDisplay() {
  wordDisplayEl.textContent = revealedLetters.join(" ");
}

// Update used letters display
function updateUsedLettersDisplay() {
  if (usedLetters.size === 0) {
    usedLettersEl.textContent = "Used letters: –";
    return;
  }
  const letters = Array.from(usedLetters)
    .sort()
    .map((l) => l.toUpperCase())
    .join(" ");
  usedLettersEl.textContent = "Used letters: " + letters;
}

// Attempts display
function updateAttemptsDisplay() {
  attemptsDisplayEl.textContent = `Attempts: ${wrongGuesses} / ${maxWrong}`;
}

// Status text with simple color hint
function setStatus(text, type = "neutral") {
  statusEl.textContent = text;
  statusEl.style.color =
    type === "good"
      ? "#4ade80"
      : type === "bad"
      ? "#f97373"
      : "#d1d5db";
}

// Disable one key
function disableKey(letter) {
  const btn = keyboardEl.querySelector(`.key-btn[data-letter="${letter}"]`);
  if (btn) {
    btn.classList.add("disabled");
    btn.disabled = true;
  }
}

// Reset keyboard to all enabled
function resetKeyboard() {
  const keys = keyboardEl.querySelectorAll(".key-btn");
  keys.forEach((btn) => {
    btn.classList.remove("disabled");
    btn.disabled = false;
  });
}

// Show hangman piece
function revealBodyPart(step) {
  // We use step-1 because steps start at 1, array at 0.
  const idx = step - 1;
  if (bodyParts[idx]) {
    bodyParts[idx].classList.add("visible");
  }
}

// Hide all body parts
function hideAllBodyParts() {
  bodyParts.forEach((part) => part.classList.remove("visible"));
}

// Handle win
function handleWin() {
  gameOver = true;
  setStatus(
    `You win! The word was "${secretWord.toUpperCase()}". Press Enter or "New Game" to play again.`,
    "good"
  );
  hangmanWinAnimation();
  playSound("win");
}

// Handle lose
function handleLose() {
  gameOver = true;
  // reveal all letters
  revealedLetters = secretWord.toUpperCase().split("");
  updateWordDisplay();

  setStatus(
    `Game over! The word was "${secretWord.toUpperCase()}". Press Enter or "New Game" to try again.`,
    "bad"
  );
  hangmanLoseAnimation();
  playSound("lose");
}

// Flash effect for game container
function flash(type) {
  const cls = type === "correct" ? "flash-correct" : "flash-wrong";
  gameContainer.classList.remove("flash-correct", "flash-wrong");
  void gameContainer.offsetWidth; // force reflow so animation replays
  gameContainer.classList.add(cls);
}

// Hangman animations
function wiggleHangman() {
  hangmanEl.classList.remove("wiggle");
  void hangmanEl.offsetWidth;
  hangmanEl.classList.add("wiggle");
}

function hangmanWinAnimation() {
  hangmanEl.classList.remove("lose");
  hangmanEl.classList.add("win");
}

function hangmanLoseAnimation() {
  hangmanEl.classList.remove("win");
  hangmanEl.classList.add("lose");
}

function resetHangmanAnimations() {
  hangmanEl.classList.remove("win", "lose", "wiggle");
}

// Play sound helper
function playSound(name) {
  const sound = sfx[name];
  if (!sound) return;
  // Rewind and play
  sound.currentTime = 0;
  sound.play().catch(() => {
    // ignore errors if autoplay is blocked
  });
}
