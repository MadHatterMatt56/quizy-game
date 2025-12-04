// script.js - Word Guessing Game

// Words for the game
const words = ["clean", "elite", "curb", "powerwash", "window", "service", "remove"];
let selectedWord = "";
let displayWord = [];
let wrongLetters = [];
let attemptsLeft = 6;

const wordDisplayEl = document.getElementById("wordDisplay");
const wrongLettersEl = document.getElementById("wrongLetters");
const attemptsEl = document.getElementById("attempts");
const messageEl = document.getElementById("message");
const letterInput = document.getElementById("letterInput");
const guessBtn = document.getElementById("guessBtn");
const resetBtn = document.getElementById("resetBtn");

function startGame() {
    selectedWord = words[Math.floor(Math.random() * words.length)];
    displayWord = Array(selectedWord.length).fill("_");
    wrongLetters = [];
    attemptsLeft = 6;

    updateDisplay();
    messageEl.textContent = "";
}

function guessLetter() {
    const letter = (letterInput.value || "").toLowerCase().trim();
    letterInput.value = "";
    letterInput.focus();

    if (!letter.match(/^[a-z]$/) || letter.length !== 1) {
        messageEl.textContent = "Enter a valid letter!";
        return;
    }

    if (displayWord.includes(letter) || wrongLetters.includes(letter)) {
        messageEl.textContent = "You already guessed that!";
        return;
    }

    if (selectedWord.includes(letter)) {
        for (let i = 0; i < selectedWord.length; i++) {
            if (selectedWord[i] === letter) {
                displayWord[i] = letter;
            }
        }
        messageEl.textContent = "Correct!";
    } else {
        wrongLetters.push(letter);
        attemptsLeft--;
        messageEl.textContent = "Wrong!";
    }

    updateDisplay();
    checkGameState();
}

function updateDisplay() {
    wordDisplayEl.textContent = displayWord.join(" ");
    wrongLettersEl.textContent = wrongLetters.join(" ");
    attemptsEl.textContent = attemptsLeft;
}

function checkGameState() {
    if (!displayWord.includes("_")) {
        messageEl.textContent = "You WIN!";
        disableInput();
    } else if (attemptsLeft <= 0) {
        messageEl.textContent = "Game Over! Word was: " + selectedWord;
        // reveal word
        wordDisplayEl.textContent = selectedWord.split("").join(" ");
        disableInput();
    }
}

function disableInput() {
    letterInput.disabled = true;
    guessBtn.disabled = true;
}

function enableInput() {
    letterInput.disabled = false;
    guessBtn.disabled = false;
    letterInput.focus();
}

function resetGame() {
    enableInput();
    startGame();
}

// Attach event listeners after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    guessBtn.addEventListener("click", guessLetter);
    resetBtn.addEventListener("click", resetGame);
    letterInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") guessLetter();
    });

    startGame();
});
