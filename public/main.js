let score = 0;
let questions = [];
let numberOfQuestions = 0;
let randomIndex = -1;
let timeLeft = 30;
let timer;

// ========== INDEX PAGE ==========
if (
  window.location.pathname === "/" ||
  window.location.pathname.includes("index.html")
) {
  document.addEventListener("DOMContentLoaded", () => {

    // **New** Start of login check feature added
    // Ensures a user has logged in before accessing the quiz home page
    const user = localStorage.getItem("quizUser");
    if (!user) {
      window.location.href = "login.html"; // redirect if not logged in
      return;
    }
    // End of Login check feature

    const startBtn = document.getElementById("start")

    // Add entrance animations
    document.querySelector("h1").classList.add("animate-entrance");
    document.querySelector(".subtext").classList.add("animate-entrance-delay");

    // Add pulse animation to start button
    if (startBtn) {
      startBtn.classList.add("pulse-animation");
      startBtn.addEventListener("click", () => {
        startBtn.classList.add("zoom-out");
        document.querySelector(".container").classList.add("fade-out");

        // Delay navigation for animation to complete
        setTimeout(() => {
          window.location.href = "/quiz.html";
        }, 500);
      });
    }

    // Add animated background elements
    createAnimatedBackground();
  });
}

// ========== QUIZ PAGE ==========
if (window.location.pathname.includes("quiz.html")) {
  document.addEventListener("DOMContentLoaded", () => {

  // ***New*** Display players name form localStorage
  const playerName = localStorage.getItem("quizUser");
  const nameSpan = document.getElementById("playerName");
  if (nameSpan) {
    nameSpan.textContent = playerName ? playerName  : "Guest";
  }

  // ***New*** Initialize live score display 
  const scoreDisplay = document.getElementById("liveScore");
  if (scoreDisplay) {
    scoreDisplay.textContent = score;
  }

  //***New*** Logout button logic
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("quizUser"); // clear player name
      localStorage.removeItem("score"); // clear score
      localStorage.removeItem("total"); // clear progress
      window.location.href = ("login.html"); // go back to login page
    });
  }

    // Add animated UI elements
    createAnimatedBackground();
    addProgressBar();
    addTimer();

    // Set up the quiz UI with animations
    document.querySelector(".container").classList.add("slide-in");

    fetch("questions.json")
      .then((response) => response.json())
      .then((data) => {
        questions = data;
        showQuestion();
        startTimer();
      });
  });

  function showQuestion() {
    randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
    numberOfQuestions++;

    // Reset timer
    clearInterval(timer);
    timeLeft = 30;
    startTimer();

    // Update progress bar
    updateProgress(numberOfQuestions, 10);

    const buttons = document.querySelectorAll(".choice");
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].disabled = false;
      buttons[i].classList.remove("correct", "incorrect");
      // Reset and add entrance animation to each option
      buttons[i].style.opacity = "0";
      buttons[i].style.transform = "translateY(20px)";
    }

    if (!question) return;

    // Animate question entrance
    const questionElement = document.getElementById("question");
    questionElement.style.opacity = "0";
    questionElement.style.transform = "translateY(-20px)";
    questionElement.innerHTML = numberOfQuestions + ". " + question.question;

    // Fade in question with delay
    setTimeout(() => {
      questionElement.style.opacity = "1";
      questionElement.style.transform = "translateY(0)";
      questionElement.style.transition = "all 0.5s ease";
    }, 100);

    // Assign and animate option buttons with staggered delay
    document.getElementById("A").textContent = question.A;
    document.getElementById("B").textContent = question.B;
    document.getElementById("C").textContent = question.C;
    document.getElementById("D").textContent = question.D;

    // Animate options with staggered delays
    buttons.forEach((button, index) => {
      setTimeout(() => {
        button.style.opacity = "1";
        button.style.transform = "translateY(0)";
        button.style.transition = "all 0.5s ease";
      }, 200 + index * 100);
    });

    document.getElementById("next").style.display = "none";
  }

  document
    .getElementById("A")
    .addEventListener("click", () => checkAnswer("A", randomIndex));
  document
    .getElementById("B")
    .addEventListener("click", () => checkAnswer("B", randomIndex));
  document
    .getElementById("C")
    .addEventListener("click", () => checkAnswer("C", randomIndex));
  document
    .getElementById("D")
    .addEventListener("click", () => checkAnswer("D", randomIndex));

  function checkAnswer(selectedAnswer, index) {
    const chosenQuestion = questions[index];
    const buttons = document.querySelectorAll(".choice");

    // Stop the timer
    clearInterval(timer);

    // Disable all buttons
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }

    if (selectedAnswer == chosenQuestion.answer) {
      // Correct answer animation
      const correctButton = document.getElementById(selectedAnswer);
      correctButton.classList.add("correct");
      correctButton.classList.add("pop-animation");

      // Update and animate score
      score++;

      // ***New*** Update live score display after correct answer
      const scoreDisplay = document.getElementById("liveScore");
      if (scoreDisplay) {
        scoreDisplay.textContent = score;
      }
      animateScoreChange();

      // Show small confetti for correct answer
      if (typeof createConfetti === "function") {
        createConfetti(20, correctButton);
      }
    } else {
      // Wrong answer animations
      document.getElementById(selectedAnswer).classList.add("incorrect");
      document.getElementById(selectedAnswer).classList.add("shake-animation");

      // Show correct answer with delayed highlight
      setTimeout(() => {
        document.getElementById(chosenQuestion.answer).classList.add("correct");
        document
          .getElementById(chosenQuestion.answer)
          .classList.add("pulse-once");
      }, 100);
    }

    // Show next button with animation
    const nextButton = document.getElementById("next");
    nextButton.style.display = "inline";
    nextButton.classList.add("fade-in");
  }

  document.getElementById("next").addEventListener("click", () => {
    if (numberOfQuestions < 10) {
      // Transition to next question with slide animation
      document.querySelector(".container").classList.add("slide-out");

      setTimeout(() => {
        document.querySelector(".container").classList.remove("slide-out");
        document.querySelector(".container").classList.add("slide-in");
        showQuestion();
      }, 300);
    } else {
      // Save score in localStorage for results page
      localStorage.setItem("score", score);
      localStorage.setItem("total", numberOfQuestions);

      //save leaderboard
      const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
      const playerName = localStorage.getItem("quizUser") || "Guest";
      leaderboard.push({name: playerName, score: score });
      localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

      // Transition out animation before redirect
      document.querySelector(".container").classList.add("fade-out");

      setTimeout(() => {
        window.location.href = "/results.html";
      }, 500);
    }
  });
}

// ========== RESULTS PAGE ==========
if (window.location.pathname.includes("results.html")) {
  document.addEventListener("DOMContentLoaded", () => {
    const scoreElement = document.getElementById("score");
    const restartBtn = document.getElementById("restart");
    const finalScore = localStorage.getItem("score");
    const totalQuestions = localStorage.getItem("total");

    // Create animated background with celebratory elements
    createAnimatedBackground(true);

    // Add entrance animation to results container
    document.querySelector(".container").classList.add("scale-in");

    if (scoreElement && finalScore && totalQuestions) {
      // Animate the score counter
      animateCounter(
        scoreElement,
        0,
        parseInt(finalScore),
        1500,
        `Your Score: ${finalScore}/${totalQuestions}`
      );
      

      // Show different messages based on score
      const messageElement = document.createElement("p");
      messageElement.className = "result-message fade-in-delay";

      const percentage = (finalScore / totalQuestions) * 100;
      if (percentage >= 80) {
        messageElement.textContent = "Excellent! You're a quiz master! 🏆";
        // Launch celebratory confetti for high scores
        if (typeof createConfetti === "function") {
          createConfetti(150);
        }
      } else if (percentage >= 60) {
        messageElement.textContent = "Great job! You know your stuff! 🌟";
      } else if (percentage >= 40) {
        messageElement.textContent = "Not bad! Keep learning! 📚";
      } else {
        messageElement.textContent = "Room for improvement. Try again! 💪";
      }

      scoreElement.parentNode.insertBefore(
        messageElement,
        scoreElement.nextSibling
      );
    }

    if (restartBtn) {
      // Add animation to restart button
      restartBtn.classList.add("pulse-animation");

      restartBtn.addEventListener("click", () => {
        numberOfQuestions = 0;
        randomIndex = -1;
        score = 0;
        localStorage.removeItem("score");
        localStorage.removeItem("total");

        // Fade out animation before redirect
        document.querySelector(".container").classList.add("fade-out");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 500);
      });
    }
  });
}

// Creates animated backgrounds with floating elements
function createAnimatedBackground(isResultPage = false) {
  document.querySelectorAll(".animated-blob, .blob").forEach((element) => {
    element.remove();
  });

  const container = document.querySelector("body");
  const colors = isResultPage
    ? ["#00c9a7", "#00d4ff", "#f1c40f", "#3498db", "#9b59b6"]
    : ["#00c9a7", "#00d4ff", "#f0f0f0"];

  // Create floating blobs in background
  for (let i = 0; i < 3; i++) {
    const blob = document.createElement("div");
    blob.className = "animated-blob"; // Use a different class name
    blob.style.backgroundColor = colors[i % colors.length];
    blob.style.width = `${150 + Math.random() * 150}px`;
    blob.style.height = blob.style.width;
    blob.style.left = `${Math.random() * 100}%`;
    blob.style.top = `${Math.random() * 100}%`;
    blob.style.position = "absolute";
    blob.style.borderRadius = "50%";
    blob.style.filter = "blur(40px)";
    blob.style.opacity = "0.4";
    blob.style.zIndex = "1";
    blob.style.animationDuration = `${20 + Math.random() * 10}s`;
    blob.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(blob);
  }
}

// Progress bar update function
function addProgressBar() {
  if (!document.querySelector(".progress-container")) {
    const quizContainer = document.querySelector(".container");
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";

    progressContainer.appendChild(progressBar);
    quizContainer.insertBefore(progressContainer, quizContainer.firstChild);
  }
}

function updateProgress(current, total) {
  const progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    const percentage = (current / total) * 100;
    progressBar.style.width = `${percentage}%`;
  }
}

// Timer functions
function addTimer() {
  if (!document.querySelector(".timer-container")) {
    const quizContainer = document.querySelector(".container");
    const timerContainer = document.createElement("div");
    timerContainer.className = "timer-container";

    const timerElement = document.createElement("div");
    timerElement.className = "timer";
    timerElement.textContent = "30";

    timerContainer.appendChild(timerElement);
    quizContainer.insertBefore(timerContainer, quizContainer.firstChild);
  }
}

function startTimer() {
  const timerElement = document.querySelector(".timer");
  if (!timerElement) return;

  clearInterval(timer);
  timeLeft = 30;
  updateTimerDisplay();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timer);
      // Auto-select wrong answer when time is up
      const currentQuestion = questions[randomIndex];
      let wrongOption = "A";
      if (currentQuestion.answer === "A") wrongOption = "B";

      // Simulate a click on a wrong option
      checkAnswer(wrongOption, randomIndex);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerElement = document.querySelector(".timer");
  if (timerElement) {
    timerElement.textContent = timeLeft;

    // Add warning colors when time is running out
    if (timeLeft <= 5) {
      timerElement.style.color = "#f44336";
      timerElement.classList.add("pulse-animation");
    } else if (timeLeft <= 10) {
      timerElement.style.color = "#ff9800";
      timerElement.classList.remove("pulse-animation");
    } else {
      timerElement.style.color = "#00c9a7";
      timerElement.classList.remove("pulse-animation");
    }
  }
}

// Score animation
function animateScoreChange() {
  // Create a score pop-up element if not exists
  if (!document.querySelector(".score-popup")) {
    const scorePopup = document.createElement("div");
    scorePopup.className = "score-popup";
    scorePopup.textContent = "+1";
    document.querySelector(".container").appendChild(scorePopup);
  }

  const popup = document.querySelector(".score-popup");
  popup.style.opacity = "1";
  popup.style.transform = "translateY(0) scale(1.5)";

  setTimeout(() => {
    popup.style.opacity = "0";
    popup.style.transform = "translateY(-50px) scale(1)";
  }, 800);
}

// Counter animation for results page
function animateCounter(element, start, end, duration, finalText) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentCount = Math.floor(progress * (end - start) + start);

    if (currentCount < end) {
      element.textContent = `Your Score: ${currentCount}/${
        finalText.split("/")[1]
      }`;
      window.requestAnimationFrame(step);
    } else {
      element.textContent = finalText;
      element.classList.add("score-highlight");
    }
  };
  window.requestAnimationFrame(step);
}

// Confetti animation for celebrations
function createConfetti(count = 100, sourceElement = null) {
  const container = document.body;

  // Get position for targeted confetti if source element provided
  let rect = null;
  if (sourceElement) {
    rect = sourceElement.getBoundingClientRect();
  }

  const colors = ["#00c9a7", "#00d4ff", "#f1c40f", "#3498db", "#9b59b6"];

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    // Random properties
    const size = Math.random() * 10 + 5;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    // Position confetti
    if (sourceElement && rect) {
      // Start confetti from the element position
      confetti.style.left = `${
        rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width
      }px`;
      confetti.style.top = `${rect.top + rect.height / 2}px`;
    } else {
      // Random position across the screen
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = `-10px`;
    }

    // Animation properties
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(confetti);

    // Animate falling
    const animationDuration = Math.random() * 3 + 2;
    confetti.animate(
      [
        { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
        {
          transform: `translate(${(Math.random() - 0.5) * 200}px, ${
            window.innerHeight
          }px) rotate(${Math.random() * 720}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: animationDuration * 1000,
        easing: "cubic-bezier(0.215, 0.61, 0.355, 1)",
      }
    ).onfinish = () => container.removeChild(confetti);
  }
}
