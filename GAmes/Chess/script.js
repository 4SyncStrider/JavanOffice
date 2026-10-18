/**
 * Offline chess game implemented with browser-native JavaScript only.
 *
 * Board coordinates use row 0 for rank 8 and row 7 for rank 1. Files use
 * column 0 for a and column 7 for h. Rendering keeps this White-side view fixed.
 */

// ================================
// PIECES AND GAME STATE
// ================================
const CHESS_PIECE_NAMES = {
  k: "King",
  q: "Queen",
  r: "Rook",
  b: "Bishop",
  n: "Knight",
  p: "Pawn",
};
const FILES = "abcdefgh";
const PROMOTION_TYPES = ["q", "r", "b", "n"];

// A piece is { color: "w" | "b", type: "k" | "q" | "r" | "b" | "n" | "p", moved: boolean }.
// A move is { row, col, capture?, castle?, enPassant?, pawnDouble? }.
const state = {
  board: [],
  turn: "w",
  selected: null,
  legalMoves: [],
  enPassant: null,
  gameOver: false,
  matchStatus: "notStarted",
  pendingPromotion: null,
};
const englishRows = [];
const englishCells = Array.from({ length: 8 }, () => []);

const boardElement = document.querySelector("#chessBoard");
const boardBody = boardElement.querySelector("tbody");
const boardAssembly = document.querySelector("#boardAssembly");
const turnStatus = document.querySelector("#turnStatus");
const message = document.querySelector("#message");
const promotionModal = document.querySelector("#promotionModal");
const promotionChoices = document.querySelector("#promotionChoices");
const gameOverModal = document.querySelector("#gameOverModal");
const gameTitle = document.querySelector("#gameTitle");
const switchVariantButton = document.querySelector("#switchVariantButton");
const variantConfirmModal = document.querySelector("#variantConfirmModal");
const gameSetupModal = document.querySelector("#gameSetupModal");
const gameSetupTitle = document.querySelector("#gameSetupTitle");
const gameSetupMessage = document.querySelector("#gameSetupMessage");
const setupError = document.querySelector("#setupError");
const whiteSideButton = document.querySelector("#whiteSideButton");
const blackSideButton = document.querySelector("#blackSideButton");
const cancelSetupButton = document.querySelector("#cancelSetupButton");
const startGameButton = document.querySelector("#startGameButton");
const variantConfirmTitle = document.querySelector("#variantConfirmTitle");
const variantConfirmMessage = document.querySelector("#variantConfirmMessage");
const cancelVariantButton = document.querySelector("#cancelVariantButton");
const confirmVariantButton = document.querySelector("#confirmVariantButton");
const riverLabel = document.querySelector("#riverLabel");
const XIANGQI_PIECES = {
  red: { k: "帥", a: "仕", e: "相", h: "傌", r: "俥", c: "砲", s: "兵" },
  black: { k: "將", a: "士", e: "象", h: "馬", r: "車", c: "炮", s: "卒" },
};
let activeVariant = "english";
let xiangqiState = XiangqiEngine.createInitialState();
let xiangqiMatchStatus = "notStarted";
let xiangqiSelected = null;
let xiangqiLegalMoves = [];
let pendingVariant = null;
let selectedPlayerSide = null;

function createPiece(color, type, moved = false) {
  return { color, type, moved };
}

function emptyBoard() {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function cloneBoard(board) {
  return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
}

// Legal-move checks run on cloned states so an invalid trial move cannot
// modify the position the player is currently viewing.
function cloneState(source) {
  return {
    board: cloneBoard(source.board),
    turn: source.turn,
    enPassant: source.enPassant ? { ...source.enPassant } : null,
  };
}

function otherColor(color) {
  return color === "w" ? "b" : "w";
}

function squareName(row, col) {
  return `${FILES[col]}${8 - row}`;
}

function inBounds(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function createStartingBoard() {
  const board = emptyBoard();
  const backRank = ["r", "n", "b", "q", "k", "b", "n", "r"];
  backRank.forEach((type, col) => {
    board[0][col] = createPiece("b", type);
    board[7][col] = createPiece("w", type);
  });
  for (let col = 0; col < 8; col += 1) {
    board[1][col] = createPiece("b", "p");
    board[6][col] = createPiece("w", "p");
  }
  return board;
}

function createCssChessPiece() {
  const pieceElement = document.createElement("span");
  pieceElement.className = "piece chess-piece";
  pieceElement.hidden = true;
  pieceElement.setAttribute("aria-hidden", "true");
  for (const part of ["crown", "body", "base", "mark"]) {
    const detail = document.createElement("span");
    detail.className = `piece-${part}`;
    pieceElement.appendChild(detail);
  }
  return pieceElement;
}

function updateCssChessPiece(element, piece) {
  element.hidden = !piece;
  element.className = piece
    ? `piece chess-piece ${piece.color === "w" ? "white" : "black"} ${CHESS_PIECE_NAMES[piece.type].toLowerCase()}`
    : "piece chess-piece";
}

function ensureEnglishBoard() {
  if (englishRows.length === 0) {
    for (let row = 0; row < 8; row += 1) {
      const tableRow = document.createElement("tr");
      for (let col = 0; col < 8; col += 1) {
        const cell = document.createElement("td");
        const pieceElement = createCssChessPiece();
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.appendChild(pieceElement);
        cell.addEventListener("click", () => handleSquareClick(row, col));
        englishCells[row].push({ cell, pieceElement });
        tableRow.appendChild(cell);
      }
      englishRows.push(tableRow);
    }
  }
  if (boardBody.firstElementChild !== englishRows[0]) {
    boardBody.replaceChildren(...englishRows);
  }
}

// ================================
// RENDERING AND INTERACTION
// ================================

// The table always renders logical rows 8 through 1. CSS rotates the entire
// assembly for Black, while piece and label text are rotated back upright.
function renderBoard() {
  ensureEnglishBoard();
  boardElement.classList.remove("xiangqi-mode");
  boardAssembly.classList.remove("xiangqi-view");
  riverLabel.hidden = true;
  const checkedKing = findKing(state.board, state.turn);
  const checked = Boolean(checkedKing && isInCheck(state.board, state.turn));
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const { cell, pieceElement } = englishCells[row][col];
      const piece = state.board[row][col];
      const name = squareName(row, col);
      cell.setAttribute(
        "aria-label",
        piece
          ? `${piece.color === "w" ? "White" : "Black"} ${CHESS_PIECE_NAMES[piece.type]} on ${name}`
          : `Chess square ${name}`
      );
      cell.classList.toggle(
        "selected",
        Boolean(state.selected && state.selected.row === row && state.selected.col === col)
      );
      const move = state.legalMoves.find(
        (candidate) => candidate.row === row && candidate.col === col
      );
      cell.classList.toggle("legal-move", Boolean(move && !move.capture));
      cell.classList.toggle("capture-move", Boolean(move?.capture));
      cell.classList.toggle(
        "in-check",
        Boolean(checked && checkedKing.row === row && checkedKing.col === col)
      );
      updateCssChessPiece(pieceElement, piece);
    }
  }
  boardAssembly.classList.remove("black-view");
  boardAssembly.classList.add("white-view");
  const colorName = state.turn === "w" ? "WHITE" : "BLACK";
  turnStatus.textContent = state.gameOver
    ? "GAME OVER"
    : `${colorName} TO ${state.matchStatus === "notStarted" ? "START" : "MOVE"}`;
}

function renderXiangqiBoard() {
  boardBody.innerHTML = "";
  boardElement.classList.add("xiangqi-mode");
  boardAssembly.classList.remove("black-view");
  boardAssembly.classList.add("white-view");
  boardAssembly.classList.add("xiangqi-view");
  riverLabel.hidden = false;
  const checked = XiangqiEngine.isInCheck(xiangqiState, xiangqiState.turn);
  for (let row = 0; row < 10; row += 1) {
    const tableRow = document.createElement("tr");
    for (let col = 0; col < 9; col += 1) {
      const cell = document.createElement("td");
      const piece = xiangqiState.board[row][col];
      const destination = xiangqiLegalMoves.find((move) => move.row === row && move.col === col);
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.setAttribute(
        "aria-label",
        piece
          ? `${piece.color} ${XIANGQI_PIECES[piece.color][piece.type]}, row ${10 - row}, file ${col + 1}`
          : `Xiangqi square, row ${10 - row}, file ${col + 1}`
      );
      if (xiangqiSelected?.row === row && xiangqiSelected?.col === col)
        cell.classList.add("selected");
      if (destination)
        cell.classList.add(xiangqiState.board[row][col] ? "capture-move" : "legal-move");
      if (checked && piece?.color === xiangqiState.turn && piece.type === "k")
        cell.classList.add("in-check");

      const palaceRow = row < 3 ? row : row > 6 ? row - 7 : -1;
      if (palaceRow >= 0) {
        const palaceCol = col - 3;
        if ((palaceRow === 0 && palaceCol === 0) || (palaceRow === 1 && palaceCol === 1))
          cell.classList.add("palace-down-right");
        if ((palaceRow === 0 && palaceCol === 1) || (palaceRow === 1 && palaceCol === 0))
          cell.classList.add("palace-down-left");
      }

      if (piece) {
        const pieceElement = document.createElement("span");
        pieceElement.className = `piece xiangqi-piece ${piece.color}`;
        pieceElement.textContent = XIANGQI_PIECES[piece.color][piece.type];
        pieceElement.setAttribute("aria-hidden", "true");
        cell.appendChild(pieceElement);
      }
      cell.addEventListener("click", () => handleSquareClick(row, col));
      tableRow.appendChild(cell);
    }
    boardBody.appendChild(tableRow);
  }

  const colorName = xiangqiState.turn === "red" ? "RED" : "BLACK";
  turnStatus.textContent = `${colorName} TO ${xiangqiMatchStatus === "notStarted" ? "START" : "MOVE"}${checked ? " · CHECK" : ""}`;
}

function handleXiangqiSquareClick(row, col) {
  if (xiangqiMatchStatus === "completed") return;
  const piece = xiangqiState.board[row][col];
  const selectedMove = xiangqiLegalMoves.find((move) => move.row === row && move.col === col);
  if (selectedMove && xiangqiSelected) {
    const captured = xiangqiState.board[row][col];
    const mover = xiangqiState.turn === "red" ? "Red" : "Black";
    XiangqiEngine.move(xiangqiState, xiangqiSelected.row, xiangqiSelected.col, row, col);
    xiangqiMatchStatus = "inProgress";
    xiangqiSelected = null;
    xiangqiLegalMoves = [];
    message.textContent = captured
      ? `${mover} captured ${XIANGQI_PIECES[captured.color][captured.type]}.`
      : `${mover} moved.`;
    evaluateXiangqiGameEnd();
    renderXiangqiBoard();
    return;
  }
  if (piece?.color === xiangqiState.turn) {
    xiangqiMatchStatus = "inProgress";
    xiangqiSelected = { row, col };
    xiangqiLegalMoves = XiangqiEngine.getLegalMoves(xiangqiState, row, col);
    message.textContent = xiangqiLegalMoves.length
      ? "Choose a highlighted destination."
      : "That piece has no legal moves.";
  } else {
    xiangqiSelected = null;
    xiangqiLegalMoves = [];
    message.textContent = "Select one of your pieces.";
  }
  renderXiangqiBoard();
}

function evaluateXiangqiGameEnd() {
  const result = XiangqiEngine.getGameResult(xiangqiState);
  if (result.finished) {
    xiangqiMatchStatus = "completed";
    document.querySelector("#gameOverTitle").textContent = result.inCheck
      ? "CHECKMATE"
      : "NO LEGAL MOVES";
    document.querySelector("#gameOverResult").textContent =
      `${result.winner === "red" ? "RED" : "BLACK"} WINS`;
    gameOverModal.hidden = false;
  } else if (result.inCheck) {
    message.textContent = `${xiangqiState.turn === "red" ? "Red" : "Black"} is in check.`;
  }
}

function handleSquareClick(row, col) {
  if (activeVariant === "xiangqi") {
    handleXiangqiSquareClick(row, col);
    return;
  }
  if (state.gameOver || state.pendingPromotion) return;
  const clickedPiece = state.board[row][col];
  const selectedMove = state.legalMoves.find((move) => move.row === row && move.col === col);
  if (selectedMove) {
    executeMove(selectedMove);
    return;
  }
  if (clickedPiece && clickedPiece.color === state.turn) {
    state.matchStatus = "inProgress";
    state.selected = { row, col };
    state.legalMoves = getLegalMoves(state, row, col);
    message.textContent = state.legalMoves.length
      ? "Choose a highlighted destination."
      : "That piece has no legal moves.";
  } else {
    state.selected = null;
    state.legalMoves = [];
    message.textContent = "Select one of your pieces.";
  }
  renderBoard();
}

// ================================
// MOVE GENERATION AND CHESS RULES
// ================================

// Pseudo-legal moves follow the piece's movement rules. getLegalMoves then
// removes moves that would leave that piece's king in check.
function getLegalMoves(source, row, col) {
  const piece = source.board[row][col];
  if (!piece || piece.color !== source.turn) return [];
  return getPseudoMoves(source, row, col).filter((move) => {
    const next = cloneState(source);
    next.from = { row, col };
    applyMove(next, move, "q");
    return !isInCheck(next.board, piece.color);
  });
}

function getAllLegalMoves(source, color) {
  const originalTurn = source.turn;
  source.turn = color;
  const moves = [];
  for (let row = 0; row < 8; row += 1)
    for (let col = 0; col < 8; col += 1) moves.push(...getLegalMoves(source, row, col));
  source.turn = originalTurn;
  return moves;
}

function addMove(moves, stateToRead, row, col, targetRow, targetCol, extra = {}) {
  if (!inBounds(targetRow, targetCol)) return;
  const target = stateToRead.board[targetRow][targetCol];
  if (!target) {
    moves.push({ row: targetRow, col: targetCol, ...extra });
  } else if (target.color !== stateToRead.board[row][col].color && target.type !== "k") {
    moves.push({ row: targetRow, col: targetCol, capture: true, ...extra });
  }
}

function getPseudoMoves(source, row, col, attacksOnly = false) {
  const piece = source.board[row][col];
  if (!piece) return [];
  const moves = [];
  const direction = piece.color === "w" ? -1 : 1;

  // Pawns move forward but only capture diagonally.
  if (piece.type === "p" && !attacksOnly) {
    const one = row + direction;
    if (inBounds(one, col) && !source.board[one][col]) {
      moves.push({ row: one, col });
      const two = row + direction * 2;
      if (!piece.moved && !source.board[two][col]) {
        moves.push({ row: two, col, pawnDouble: true });
      }
    }
  }

  if (piece.type === "p") {
    for (const fileDelta of [-1, 1]) {
      const targetRow = row + direction;
      const targetCol = col + fileDelta;
      if (!inBounds(targetRow, targetCol)) continue;
      const target = source.board[targetRow][targetCol];
      if (target && target.color !== piece.color && target.type !== "k") {
        moves.push({ row: targetRow, col: targetCol, capture: true });
      }
      if (
        !attacksOnly &&
        source.enPassant &&
        source.enPassant.row === targetRow &&
        source.enPassant.col === targetCol
      ) {
        moves.push({ row: targetRow, col: targetCol, capture: true, enPassant: true });
      }
    }
  }

  if (piece.type === "n") {
    const knightSteps = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];
    for (const [rowDelta, colDelta] of knightSteps) {
      addMove(moves, source, row, col, row + rowDelta, col + colDelta);
    }
  }

  if (["b", "r", "q"].includes(piece.type)) {
    const directions =
      piece.type === "b"
        ? [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
          ]
        : piece.type === "r"
          ? [
              [-1, 0],
              [1, 0],
              [0, -1],
              [0, 1],
            ]
          : [
              [-1, -1],
              [-1, 1],
              [1, -1],
              [1, 1],
              [-1, 0],
              [1, 0],
              [0, -1],
              [0, 1],
            ];

    for (const [rowDelta, colDelta] of directions) {
      let targetRow = row + rowDelta;
      let targetCol = col + colDelta;
      while (inBounds(targetRow, targetCol)) {
        const target = source.board[targetRow][targetCol];
        if (!target) {
          moves.push({ row: targetRow, col: targetCol });
        } else {
          if (target.color !== piece.color && target.type !== "k") {
            moves.push({ row: targetRow, col: targetCol, capture: true });
          }
          break;
        }
        targetRow += rowDelta;
        targetCol += colDelta;
      }
    }
  }

  if (piece.type === "k") {
    const kingSteps = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    for (const [rowDelta, colDelta] of kingSteps) {
      addMove(moves, source, row, col, row + rowDelta, col + colDelta);
    }

    // Castling is only available to an unmoved king and rook. The king may
    // not start in check, cross an attacked square, or land in check.
    if (!attacksOnly && !piece.moved && !isInCheck(source.board, piece.color)) {
      for (const side of ["king", "queen"]) {
        const rookCol = side === "king" ? 7 : 0;
        const step = side === "king" ? 1 : -1;
        const rook = source.board[row][rookCol];
        const clear = side === "king" ? [5, 6] : [1, 2, 3];
        const safe = side === "king" ? [5, 6] : [3, 2];
        const pathIsClear = clear.every((targetCol) => !source.board[row][targetCol]);
        const pathIsSafe = safe.every(
          (targetCol) => !isSquareAttacked(source.board, row, targetCol, otherColor(piece.color))
        );
        if (
          rook &&
          rook.color === piece.color &&
          rook.type === "r" &&
          !rook.moved &&
          pathIsClear &&
          pathIsSafe
        ) {
          moves.push({ row, col: col + step * 2, castle: side });
        }
      }
    }
  }
  return moves;
}

function isSquareAttacked(board, row, col, byColor) {
  const direction = byColor === "w" ? -1 : 1;
  for (let sourceRow = 0; sourceRow < 8; sourceRow += 1) {
    for (let sourceCol = 0; sourceCol < 8; sourceCol += 1) {
      const piece = board[sourceRow][sourceCol];
      if (!piece || piece.color !== byColor) continue;

      const rowDelta = row - sourceRow;
      const colDelta = col - sourceCol;
      const absoluteRow = Math.abs(rowDelta);
      const absoluteCol = Math.abs(colDelta);
      if (piece.type === "p" && rowDelta === direction && absoluteCol === 1) return true;
      if (
        piece.type === "n" &&
        ((absoluteRow === 2 && absoluteCol === 1) || (absoluteRow === 1 && absoluteCol === 2))
      )
        return true;
      if (
        piece.type === "k" &&
        absoluteRow <= 1 &&
        absoluteCol <= 1 &&
        (absoluteRow || absoluteCol)
      )
        return true;

      const diagonal = absoluteRow === absoluteCol && absoluteRow > 0;
      const straight = (rowDelta === 0) !== (colDelta === 0);
      const attacksLine =
        (piece.type === "b" && diagonal) ||
        (piece.type === "r" && straight) ||
        (piece.type === "q" && (diagonal || straight));
      if (!attacksLine) continue;

      const stepRow = Math.sign(rowDelta);
      const stepCol = Math.sign(colDelta);
      let checkRow = sourceRow + stepRow;
      let checkCol = sourceCol + stepCol;
      let pathIsClear = true;
      while (checkRow !== row || checkCol !== col) {
        if (board[checkRow][checkCol]) {
          pathIsClear = false;
          break;
        }
        checkRow += stepRow;
        checkCol += stepCol;
      }
      if (pathIsClear) return true;
    }
  }
  return false;
}

function findKing(board, color) {
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if (board[row][col]?.color === color && board[row][col].type === "k") {
        return { row, col };
      }
    }
  }
  return null;
}

function isInCheck(board, color) {
  const king = findKing(board, color);
  return king ? isSquareAttacked(board, king.row, king.col, otherColor(color)) : true;
}

// Apply a move to a cloned state. The temporary `from` coordinate is supplied
// by move validation; normal moves use the currently selected UI square.
function applyMove(targetState, move, promotionType = "q") {
  const from = targetState.from || state.selected;
  const piece = targetState.board[from.row][from.col];
  targetState.board[from.row][from.col] = null;

  // En passant captures the pawn beside the destination, not on it.
  if (move.enPassant) targetState.board[from.row][move.col] = null;

  if (move.castle) {
    const rookFromCol = move.castle === "king" ? 7 : 0;
    const rookToCol = move.castle === "king" ? 5 : 3;
    targetState.board[from.row][rookToCol] = targetState.board[from.row][rookFromCol];
    targetState.board[from.row][rookFromCol] = null;
    targetState.board[from.row][rookToCol].moved = true;
  }
  piece.moved = true;
  if (piece.type === "p" && (move.row === 0 || move.row === 7)) piece.type = promotionType;
  targetState.board[move.row][move.col] = piece;
  targetState.enPassant = move.pawnDouble
    ? { row: (from.row + move.row) / 2, col: from.col }
    : null;
  return targetState;
}

function executeMove(move) {
  const next = cloneState(state);
  next.from = state.selected;

  // Promotion pauses the turn until the player chooses the new piece.
  if (
    state.board[state.selected.row][state.selected.col].type === "p" &&
    (move.row === 0 || move.row === 7)
  ) {
    applyMove(next, move, "q");
    state.pendingPromotion = { next, move };
    showPromotionChoices(state.turn);
    return;
  }
  applyMove(next, move);
  finishMove(next);
}

function finishMove(next) {
  state.board = next.board;
  state.enPassant = next.enPassant;
  state.turn = otherColor(state.turn);
  state.selected = null;
  state.legalMoves = [];
  message.textContent = "Select a piece to see legal moves.";
  renderBoard();
  evaluateGameEnd();
}

// ================================
// PROMOTION, CHECKMATE, AND RESET
// ================================

// Promotion uses a custom modal instead of a browser prompt so it works well
// with keyboard and touch input and can display the configured piece style.
function showPromotionChoices(color) {
  promotionChoices.innerHTML = "";
  for (const type of PROMOTION_TYPES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "promotion-choice";
    const pieceElement = createCssChessPiece();
    updateCssChessPiece(pieceElement, { color, type });
    pieceElement.classList.add("promotion-piece");
    button.appendChild(pieceElement);
    button.appendChild(document.createTextNode(CHESS_PIECE_NAMES[type]));
    button.addEventListener("click", () => {
      const promotion = state.pendingPromotion;
      promotion.next.board[promotion.move.row][promotion.move.col].type = type;
      state.pendingPromotion = null;
      promotionModal.hidden = true;
      finishMove(promotion.next);
    });
    promotionChoices.appendChild(button);
  }
  promotionModal.hidden = false;
  promotionChoices.querySelector("button").focus();
}

// A position ends only when the side to move has no legal moves. Whether its
// king is attacked distinguishes checkmate from stalemate.
function evaluateGameEnd() {
  const legalMoves = getAllLegalMoves(state, state.turn);
  if (legalMoves.length) return;
  state.gameOver = true;
  const inCheck = isInCheck(state.board, state.turn);
  state.matchStatus = "completed";
  document.querySelector("#gameOverTitle").textContent = inCheck ? "CHECKMATE" : "STALEMATE";
  document.querySelector("#gameOverResult").textContent = inCheck
    ? `${state.turn === "w" ? "BLACK" : "WHITE"} WINS`
    : "DRAW";
  gameOverModal.hidden = false;
  renderBoard();
}

// Reset every piece of transient state, including perspective and modal state.
function resetGame() {
  state.board = createStartingBoard();
  state.turn = "w";
  state.selected = null;
  state.legalMoves = [];
  state.enPassant = null;
  state.gameOver = false;
  state.matchStatus = "notStarted";
  state.pendingPromotion = null;
  promotionModal.hidden = true;
  gameOverModal.hidden = true;
  message.textContent = "Select a piece to see legal moves.";
  renderBoard();
}

function updateVariantInterface() {
  const isEnglish = activeVariant === "english";
  gameTitle.textContent = isEnglish ? "ENGLISH CHESS" : "CHINESE CHESS · 中国象棋";
  document.title = isEnglish ? "English Chess | JavanOffice" : "Chinese Chess | JavanOffice";
  switchVariantButton.textContent = isEnglish
    ? "Switch to Chinese Chess"
    : "Switch to English Chess";
  boardElement.setAttribute(
    "aria-label",
    isEnglish ? "English chess board" : "Chinese chess board"
  );
}

function showGameSetup() {
  const isEnglish = activeVariant === "english";
  selectedPlayerSide = null;
  promotionModal.hidden = true;
  gameOverModal.hidden = true;
  gameSetupTitle.textContent = isEnglish ? "Choose your side" : "选择你的棋方";
  gameSetupMessage.textContent = isEnglish
    ? "Choose which side to play as. White will remain at the bottom of the board."
    : "请选择你要执的一方。棋盘始终保持红方在下。";
  whiteSideButton.textContent = isEnglish ? "White" : "Red · 红方";
  blackSideButton.textContent = isEnglish ? "Black" : "Black · 黑方";
  whiteSideButton.setAttribute("aria-pressed", "false");
  blackSideButton.setAttribute("aria-pressed", "false");
  setupError.hidden = true;
  setupError.textContent = "";
  gameSetupModal.hidden = false;
  whiteSideButton.focus();
}

function selectPlayerSide(side) {
  selectedPlayerSide = side;
  whiteSideButton.setAttribute(
    "aria-pressed",
    String(side === (activeVariant === "english" ? "w" : "red"))
  );
  blackSideButton.setAttribute(
    "aria-pressed",
    String(side === (activeVariant === "english" ? "b" : "black"))
  );
  setupError.hidden = true;
}

function startNewGame() {
  if (!selectedPlayerSide) {
    setupError.textContent = "Choose a side before starting the game.";
    setupError.hidden = false;
    whiteSideButton.focus();
    return;
  }

  gameSetupModal.hidden = true;
  if (activeVariant === "english") {
    resetGame();
    state.matchStatus = "inProgress";
    message.textContent = "White to move.";
    renderBoard();
    return;
  }
  xiangqiState = XiangqiEngine.createInitialState();
  xiangqiMatchStatus = "inProgress";
  xiangqiSelected = null;
  xiangqiLegalMoves = [];
  promotionModal.hidden = true;
  gameOverModal.hidden = true;
  message.textContent = "Red to move.";
  renderXiangqiBoard();
}

function switchVariant(variant) {
  activeVariant = variant;
  resetGame();
  xiangqiState = XiangqiEngine.createInitialState();
  xiangqiMatchStatus = "notStarted";
  xiangqiSelected = null;
  xiangqiLegalMoves = [];
  updateVariantInterface();
  if (activeVariant === "xiangqi") renderXiangqiBoard();
  showGameSetup();
}

function closeVariantConfirmation(returnFocus = true) {
  variantConfirmModal.hidden = true;
  pendingVariant = null;
  document.removeEventListener("keydown", handleVariantDialogKeydown);
  if (returnFocus) switchVariantButton.focus();
}

function handleVariantDialogKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeVariantConfirmation();
    return;
  }
  if (event.key === "Tab") {
    const focusedElement = document.activeElement;
    event.preventDefault();
    const nextButton = event.shiftKey
      ? focusedElement === cancelVariantButton
        ? confirmVariantButton
        : cancelVariantButton
      : focusedElement === confirmVariantButton
        ? cancelVariantButton
        : confirmVariantButton;
    nextButton.focus();
  }
}

function requestVariantSwitch() {
  if (!variantConfirmModal.hidden) return;
  const target = activeVariant === "english" ? "xiangqi" : "english";
  const matchStatus = activeVariant === "english" ? state.matchStatus : xiangqiMatchStatus;
  if (matchStatus !== "inProgress") {
    switchVariant(target);
    return;
  }

  const targetName = target === "english" ? "English Chess" : "Chinese Chess";
  const currentName = activeVariant === "english" ? "An English Chess" : "A Chinese Chess";
  pendingVariant = target;
  variantConfirmTitle.textContent = `Switch to ${targetName}?`;
  variantConfirmMessage.textContent = `${currentName} match is currently in progress. Switching games will end the current match and discard its current board position. Do you want to continue?`;
  variantConfirmModal.hidden = false;
  cancelVariantButton.focus();
  document.addEventListener("keydown", handleVariantDialogKeydown);
}

document.querySelector("#resetButton").addEventListener("click", showGameSetup);
document.querySelector("#modalResetButton").addEventListener("click", showGameSetup);
document.querySelector("#gameOverSwitchButton").addEventListener("click", requestVariantSwitch);
switchVariantButton.addEventListener("click", requestVariantSwitch);
cancelVariantButton.addEventListener("click", () => closeVariantConfirmation());
confirmVariantButton.addEventListener("click", () => {
  if (!pendingVariant) return;
  const target = pendingVariant;
  closeVariantConfirmation(false);
  switchVariant(target);
  switchVariantButton.focus();
});
variantConfirmModal.addEventListener("click", (event) => {
  if (event.target === variantConfirmModal) closeVariantConfirmation();
});
whiteSideButton.addEventListener("click", () =>
  selectPlayerSide(activeVariant === "english" ? "w" : "red")
);
blackSideButton.addEventListener("click", () =>
  selectPlayerSide(activeVariant === "english" ? "b" : "black")
);
startGameButton.addEventListener("click", startNewGame);
cancelSetupButton.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

updateVariantInterface();
showGameSetup();
