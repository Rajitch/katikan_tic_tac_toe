(() => {
  "use strict";

  const WIN_LINES = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  const STORAGE_KEY = "tic-tac-toe-v1";

  const state = {
    board: Array(9).fill(""),
    current: "X",
    gameOver: false,
    winningLine: [],
    scores: { X: 0, O: 0, draws: 0 },
    mode: "computer",
    difficulty: "medium",
    starter: "human",
    computerThinking: false
  };

  const $ = (id) => document.getElementById(id);
  const boardEl = $("board");
  const statusEl = $("status");
  const modeEl = $("mode");
  const difficultyEl = $("difficulty");
  const starterEl = $("starter");
  const difficultyGroup = $("difficultyGroup");
  const resultDialog = $("resultDialog");
  const resultTitle = $("resultTitle");
  const resultMessage = $("resultMessage");

  function loadPersistentData() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.scores && Number.isInteger(saved.scores.X) &&
          Number.isInteger(saved.scores.O) && Number.isInteger(saved.scores.draws)) {
        state.scores = saved.scores;
      }
      if (saved.theme === "light" || saved.theme === "dark") {
        document.documentElement.dataset.theme = saved.theme;
      }
    } catch (_) {}
  }

  function savePersistentData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        scores: state.scores,
        theme: document.documentElement.dataset.theme || "dark"
      }));
    } catch (_) {}
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    state.board.forEach((value, index) => {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.type = "button";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", value ? `Cell ${index + 1}: ${value}` : `Cell ${index + 1}: empty`);
      cell.textContent = value;
      cell.disabled = Boolean(value) || state.gameOver || state.computerThinking;
      if (value) cell.classList.add(value.toLowerCase());
      if (state.winningLine.includes(index)) cell.classList.add("win");
      cell.addEventListener("click", () => handleMove(index));
      boardEl.appendChild(cell);
    });
  }

  function updateScores() {
    $("xScore").textContent = state.scores.X;
    $("oScore").textContent = state.scores.O;
    $("drawScore").textContent = state.scores.draws;
  }

  function updateNames() {
    if (state.mode === "local") {
      $("xName").textContent = "Player 1";
      $("oName").textContent = "Player 2";
    } else {
      $("xName").textContent = "You";
      $("oName").textContent = "Computer";
    }
  }

  function updateControls() {
    difficultyGroup.hidden = state.mode !== "computer";
    starterEl.disabled = state.mode !== "computer";
    updateNames();
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function checkWinner(board) {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line };
      }
    }
    if (board.every(Boolean)) return { winner: "draw", line: [] };
    return null;
  }

  function endGame(result) {
    state.gameOver = true;
    state.winningLine = result.line || [];

    if (result.winner === "draw") {
      state.scores.draws++;
      setStatus("Draw game");
      showResult("Draw!", "Nobody gets the point this round.");
    } else {
      state.scores[result.winner]++;
      const winnerName = state.mode === "local"
        ? (result.winner === "X" ? "Player 1" : "Player 2")
        : (result.winner === "X" ? "You" : "Computer");
      setStatus(`${winnerName} wins — ${result.winner}`);
      showResult(`${winnerName} wins!`, `Three ${result.winner}s in a row.`);
    }

    savePersistentData();
    updateScores();
    renderBoard();
  }

  function showResult(title, message) {
    resultTitle.textContent = title;
    resultMessage.textContent = message;
    if (typeof resultDialog.showModal === "function") {
      resultDialog.showModal();
    } else {
      alert(`${title}\n${message}`);
    }
  }

  function handleMove(index) {
    if (state.gameOver || state.computerThinking || state.board[index]) return;
    if (state.mode === "computer" && state.current !== "X") return;

    state.board[index] = state.current;
    const result = checkWinner(state.board);
    if (result) {
      endGame(result);
      return;
    }

    state.current = state.current === "X" ? "O" : "X";
    renderBoard();

    if (state.mode === "local") {
      setStatus(`Player ${state.current === "X" ? "1" : "2"} turn — ${state.current}`);
    } else if (state.current === "O") {
      setStatus("Computer is thinking…");
      state.computerThinking = true;
      renderBoard();
      window.setTimeout(computerMove, 320);
    }
  }

  function emptyCells(board) {
    return board.map((v, i) => v ? null : i).filter(i => i !== null);
  }

  function findWinningMove(board, mark) {
    for (const index of emptyCells(board)) {
      board[index] = mark;
      const result = checkWinner(board);
      board[index] = "";
      if (result && result.winner === mark) return index;
    }
    return null;
  }

  function randomMove(board) {
    const cells = emptyCells(board);
    return cells.length ? cells[Math.floor(Math.random() * cells.length)] : null;
  }

  function mediumMove(board) {
    const win = findWinningMove(board, "O");
    if (win !== null) return win;

    const block = findWinningMove(board, "X");
    if (block !== null) return block;

    if (!board[4]) return 4;

    const corners = [0, 2, 6, 8].filter(i => !board[i]);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

    return randomMove(board);
  }

  function minimax(board, maximizing) {
    const result = checkWinner(board);
    if (result) {
      if (result.winner === "O") return 10;
      if (result.winner === "X") return -10;
      return 0;
    }

    if (maximizing) {
      let best = -Infinity;
      for (const index of emptyCells(board)) {
        board[index] = "O";
        best = Math.max(best, minimax(board, false));
        board[index] = "";
      }
      return best;
    }

    let best = Infinity;
    for (const index of emptyCells(board)) {
      board[index] = "X";
      best = Math.min(best, minimax(board, true));
      board[index] = "";
    }
    return best;
  }

  function hardMove(board) {
    let bestScore = -Infinity;
    let bestMove = null;

    for (const index of emptyCells(board)) {
      board[index] = "O";
      const score = minimax(board, false);
      board[index] = "";
      if (score > bestScore) {
        bestScore = score;
        bestMove = index;
      }
    }
    return bestMove;
  }

  function computerMove() {
    if (state.gameOver || state.mode !== "computer") return;

    let move;
    if (state.difficulty === "easy") {
      move = Math.random() < 0.65 ? randomMove(state.board) : mediumMove(state.board);
    } else if (state.difficulty === "hard") {
      move = hardMove(state.board);
    } else {
      move = mediumMove(state.board);
    }

    if (move !== null && move !== undefined) state.board[move] = "O";
    state.computerThinking = false;

    const result = checkWinner(state.board);
    if (result) {
      endGame(result);
      return;
    }

    state.current = "X";
    setStatus("Your turn — X");
    renderBoard();
  }

  function newGame() {
    if (resultDialog.open) resultDialog.close();

    state.board = Array(9).fill("");
    state.current = "X";
    state.gameOver = false;
    state.winningLine = [];
    state.computerThinking = false;

    updateControls();
    renderBoard();

    if (state.mode === "local") {
      setStatus("Player 1 turn — X");
    } else if (state.starter === "computer") {
      setStatus("Computer is thinking…");
      state.computerThinking = true;
      renderBoard();
      window.setTimeout(computerMove, 320);
    } else {
      setStatus("Your turn — X");
    }
  }

  modeEl.addEventListener("change", () => {
    state.mode = modeEl.value;
    newGame();
  });

  difficultyEl.addEventListener("change", () => {
    state.difficulty = difficultyEl.value;
    newGame();
  });

  starterEl.addEventListener("change", () => {
    state.starter = starterEl.value;
    newGame();
  });

  $("newGame").addEventListener("click", newGame);
  $("dialogNewGame").addEventListener("click", newGame);

  $("resetScore").addEventListener("click", () => {
    state.scores = { X: 0, O: 0, draws: 0 };
    savePersistentData();
    updateScores();
    newGame();
  });

  $("themeToggle").addEventListener("click", () => {
    const current = document.documentElement.dataset.theme || "dark";
    document.documentElement.dataset.theme = current === "dark" ? "light" : "dark";
    $("themeToggle").textContent = current === "dark" ? "☀" : "☾";
    savePersistentData();
  });

  resultDialog.addEventListener("click", (event) => {
    if (event.target === resultDialog) resultDialog.close();
  });

  loadPersistentData();
  state.mode = modeEl.value;
  state.difficulty = difficultyEl.value;
  state.starter = starterEl.value;
  $("year").textContent = new Date().getFullYear();
  $("themeToggle").textContent =
    (document.documentElement.dataset.theme || "dark") === "dark" ? "☾" : "☀";
  updateScores();
  updateControls();
  newGame();
})();
