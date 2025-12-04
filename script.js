// === WORD LISTS BY DIFFICULTY ===
const WORD_LISTS = {
  easy: [
    { word: "cat",   hint: "A small house pet that says meow." },
    { word: "dog",   hint: "Often called a human's best friend." },
    { word: "tree",  hint: "A tall plant with a trunk and branches." },
    { word: "bird",  hint: "An animal that usually has feathers and can fly." },
    { word: "moon",  hint: "You can see it in the night sky." },
    { word: "sun",   hint: "The star at the center of our solar system." },
    { word: "house", hint: "A place where people live." },
    { word: "water", hint: "You drink it every day." },
    { word: "pizza", hint: "A popular food with cheese and toppings." },
    { word: "game",  hint: "Something people play for fun." }
  ],
  medium: [
    { word: "planet",  hint: "Earth is one of these." },
    { word: "rocket",  hint: "Used to travel into space." },
    { word: "winter",  hint: "The coldest season of the year." },
    { word: "summer",  hint: "The warmest season of the year." },
    { word: "garden",  hint: "A place where you grow plants." },
    { word: "jungle",  hint: "A thick forest in a tropical area." },
    { word: "window",  hint: "You look through this in a wall." },
    { word: "dragon",  hint: "A mythical, fire-breathing creature." },
    { word: "castle",  hint: "A large building where kings and queens might live." },
    { word: "pirate",  hint: "A sailor who steals treasure." },
    { word: "switch",  hint: "You flip this to turn something on or off." },
    { word: "decimal", hint: "A number with a dot in it, like 3.14." },
    { word: "sample",  hint: "A small part that represents the whole." }
  ],
  hard: [
    { word: "mystery",  hint: "A story where you don't know the answer until the end." },
    { word: "rhythm",   hint: "A beat pattern in music; this word has no regular vowels." },
    { word: "oxygen",   hint: "A gas you breathe to stay alive." },
    { word: "galaxy",   hint: "A massive group of stars, like the Milky Way." },
    { word: "phantom",  hint: "Another word for a ghost." },
    { word: "complex",  hint: "The opposite of simple." },
    { word: "zealous",  hint: "Very enthusiastic or passionate." },
    { word: "jukebox",  hint: "A machine that plays music when you put in coins." },
    { word: "vortex",   hint: "A spinning mass of water or air." },
    { word: "pixelate", hint: "What happens to images when you zoom in too far." },
    { word: "hardware", hint: "The physical parts of a computer." },
    { word: "software", hint: "Programs that run on a computer." }
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
