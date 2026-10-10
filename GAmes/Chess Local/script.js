/**
 * Offline chess game implemented with browser-native JavaScript only.
 *
 * Board coordinates use row 0 for rank 8 and row 7 for rank 1. Files use
 * column 0 for a and column 7 for h. The internal coordinates never change
 * when the board is shown from Black's perspective.
 */

// ================================
// USER CONFIGURATION
// ================================
const PIECE_STYLE = "emoji";
// Options: "emoji" or "letter"

// ================================
// PIECES AND GAME STATE
// ================================
const PIECES = {
  emoji: { w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" }, b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "" } },
  letter: { w: { k: "K", q: "Q", r: "R", b: "B", n: "N", p: "P" }, b: { k: "k", q: "q", r: "r", b: "b", n: "n", p: "p" } }
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
  pendingPromotion: null
};

const boardElement = document.querySelector("#chessBoard");
const boardBody = boardElement.querySelector("tbody");
const boardAssembly = document.querySelector("#boardAssembly");
const turnStatus = document.querySelector("#turnStatus");
const message = document.querySelector("#message");
const promotionModal = document.querySelector("#promotionModal");
const promotionChoices = document.querySelector("#promotionChoices");
const gameOverModal = document.querySelector("#gameOverModal");

function createPiece(color, type, moved = false) {
  return { color, type, moved };
}

function emptyBoard() {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function cloneBoard(board) {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
}

// Legal-move checks run on cloned states so an invalid trial move cannot
// modify the position the player is currently viewing.
function cloneState(source) {
  return {
    board: cloneBoard(source.board),
    turn: source.turn,
    enPassant: source.enPassant ? { ...source.enPassant } : null
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

// ================================
// RENDERING AND INTERACTION
// ================================

// The table always renders logical rows 8 through 1. CSS rotates the entire
// assembly for Black, while piece and label text are rotated back upright.
function renderBoard() {
  boardBody.innerHTML = "";
  const checkedKing = findKing(state.board, state.turn);
  for (let row = 0; row < 8; row += 1) {
    const tableRow = document.createElement("tr");
    for (let col = 0; col < 8; col += 1) {
      const cell = document.createElement("td");
      const piece = state.board[row][col];
      const name = squareName(row, col);
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.setAttribute("aria-label", piece ? `${piece.color === "w" ? "White" : "Black"} ${piece.type} on ${name}` : `Chess square ${name}`);
      if (state.selected && state.selected.row === row && state.selected.col === col) cell.classList.add("selected");
      const move = state.legalMoves.find(candidate => candidate.row === row && candidate.col === col);
      if (move) cell.classList.add(move.capture ? "capture-move" : "legal-move");
      if (checkedKing && checkedKing.row === row && checkedKing.col === col && isInCheck(state.board, state.turn)) cell.classList.add("in-check");
      if (piece) {
        const pieceElement = document.createElement("span");
        pieceElement.className = "piece";
        pieceElement.textContent = PIECES[PIECE_STYLE][piece.color][piece.type];
        pieceElement.setAttribute("aria-hidden", "true");
        cell.appendChild(pieceElement);
      }
      cell.addEventListener("click", () => handleSquareClick(row, col));
      tableRow.appendChild(cell);
    }
    boardBody.appendChild(tableRow);
  }
  boardAssembly.classList.toggle("black-view", state.turn === "b");
  boardAssembly.classList.toggle("white-view", state.turn === "w");
  turnStatus.textContent = state.gameOver ? "GAME OVER" : `${state.turn === "w" ? "WHITE" : "BLACK"} TO MOVE`;
}

function handleSquareClick(row, col) {
  if (state.gameOver || state.pendingPromotion) return;
  const clickedPiece = state.board[row][col];
  const selectedMove = state.legalMoves.find(move => move.row === row && move.col === col);
  if (selectedMove) { executeMove(selectedMove); return; }
  if (clickedPiece && clickedPiece.color === state.turn) {
    state.selected = { row, col };
    state.legalMoves = getLegalMoves(state, row, col);
    message.textContent = state.legalMoves.length ? "Choose a highlighted destination." : "That piece has no legal moves.";
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
  return getPseudoMoves(source, row, col).filter(move => {
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
  for (let row = 0; row < 8; row += 1) for (let col = 0; col < 8; col += 1) moves.push(...getLegalMoves(source, row, col));
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
      if (!attacksOnly && source.enPassant && source.enPassant.row === targetRow && source.enPassant.col === targetCol) {
        moves.push({ row: targetRow, col: targetCol, capture: true, enPassant: true });
      }
    }
  }

  if (piece.type === "n") {
    const knightSteps = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [rowDelta, colDelta] of knightSteps) {
      addMove(moves, source, row, col, row + rowDelta, col + colDelta);
    }
  }

  if (["b", "r", "q"].includes(piece.type)) {
    const directions = piece.type === "b"
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.type === "r"
        ? [[-1, 0], [1, 0], [0, -1], [0, 1]]
        : [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];

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
    const kingSteps = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
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
        const pathIsClear = clear.every(targetCol => !source.board[row][targetCol]);
        const pathIsSafe = safe.every(targetCol => !isSquareAttacked(source.board, row, targetCol, otherColor(piece.color)));
        if (rook && rook.color === piece.color && rook.type === "r" && !rook.moved && pathIsClear && pathIsSafe) {
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
      if (piece.type === "n" && ((absoluteRow === 2 && absoluteCol === 1) || (absoluteRow === 1 && absoluteCol === 2))) return true;
      if (piece.type === "k" && absoluteRow <= 1 && absoluteCol <= 1 && (absoluteRow || absoluteCol)) return true;

      const diagonal = absoluteRow === absoluteCol && absoluteRow > 0;
      const straight = (rowDelta === 0) !== (colDelta === 0);
      const attacksLine = (piece.type === "b" && diagonal) || (piece.type === "r" && straight) || (piece.type === "q" && (diagonal || straight));
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
  targetState.enPassant = move.pawnDouble ? { row: (from.row + move.row) / 2, col: from.col } : null;
  return targetState;
}

function executeMove(move) {
  const next = cloneState(state);
  next.from = state.selected;

  // Promotion pauses the turn until the player chooses the new piece.
  if (state.board[state.selected.row][state.selected.col].type === "p" && (move.row === 0 || move.row === 7)) {
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
    button.innerHTML = `<span class="promotion-piece">${PIECES[PIECE_STYLE][color][type]}</span>${{ q: "Queen", r: "Rook", b: "Bishop", n: "Knight" }[type]}`;
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
  document.querySelector("#gameOverTitle").textContent = inCheck ? "CHECKMATE" : "STALEMATE";
  document.querySelector("#gameOverResult").textContent = inCheck ? `${state.turn === "w" ? "BLACK" : "WHITE"} WINS` : "DRAW";
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
  state.pendingPromotion = null;
  promotionModal.hidden = true;
  gameOverModal.hidden = true;
  message.textContent = "Select a piece to see legal moves.";
  renderBoard();
}

document.querySelector("#resetButton").addEventListener("click", resetGame);
document.querySelector("#modalResetButton").addEventListener("click", resetGame);
resetGame();
