(() => {
  const ROWS = 10;
  const COLUMNS = 9;
  const RED = "red";
  const BLACK = "black";
  const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  function opponent(color) {
    return color === RED ? BLACK : RED;
  }

  function inBounds(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLUMNS;
  }

  function inPalace(color, row, col) {
    return col >= 3 && col <= 5 && (color === RED ? row >= 7 : row <= 2);
  }

  function createInitialState() {
    const board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));
    const backRank = ["r", "h", "e", "a", "k", "a", "e", "h", "r"];
    backRank.forEach((type, col) => {
      board[0][col] = { color: BLACK, type };
      board[9][col] = { color: RED, type };
    });
    for (const col of [1, 7]) {
      board[2][col] = { color: BLACK, type: "c" };
      board[7][col] = { color: RED, type: "c" };
    }
    for (const col of [0, 2, 4, 6, 8]) {
      board[3][col] = { color: BLACK, type: "s" };
      board[6][col] = { color: RED, type: "s" };
    }
    return { board, turn: RED, captured: { red: [], black: [] } };
  }

  function cloneBoard(board) {
    return board.map(row => row.map(piece => piece ? { ...piece } : null));
  }

  function addDestination(state, moves, row, col, color) {
    if (!inBounds(row, col)) return;
    const target = state.board[row][col];
    if (!target || target.color !== color) moves.push({ row, col });
  }

  function pseudoMoves(state, row, col) {
    const piece = state.board[row][col];
    if (!piece) return [];
    const moves = [];
    const add = (targetRow, targetCol) => addDestination(state, moves, targetRow, targetCol, piece.color);

    if (piece.type === "k") {
      for (const [rowStep, colStep] of DIRECTIONS) {
        const targetRow = row + rowStep;
        const targetCol = col + colStep;
        if (inPalace(piece.color, targetRow, targetCol)) add(targetRow, targetCol);
      }
      for (let targetRow = row + (piece.color === RED ? -1 : 1); inBounds(targetRow, col); targetRow += piece.color === RED ? -1 : 1) {
        const target = state.board[targetRow][col];
        if (target) {
          if (target.type === "k" && target.color !== piece.color) moves.push({ row: targetRow, col });
          break;
        }
      }
      return moves;
    }

    if (piece.type === "a") {
      for (const [rowStep, colStep] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        const targetRow = row + rowStep;
        const targetCol = col + colStep;
        if (inPalace(piece.color, targetRow, targetCol)) add(targetRow, targetCol);
      }
      return moves;
    }

    if (piece.type === "e") {
      for (const [rowStep, colStep] of [[-2, -2], [-2, 2], [2, -2], [2, 2]]) {
        const targetRow = row + rowStep;
        const targetCol = col + colStep;
        const staysHome = piece.color === RED ? targetRow >= 5 : targetRow <= 4;
        if (inBounds(targetRow, targetCol) && staysHome && !state.board[row + rowStep / 2][col + colStep / 2]) add(targetRow, targetCol);
      }
      return moves;
    }

    if (piece.type === "h") {
      for (const [rowStep, colStep] of [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [1, -2], [-1, 2], [1, 2]]) {
        const legRow = row + (Math.abs(rowStep) === 2 ? Math.sign(rowStep) : 0);
        const legCol = col + (Math.abs(colStep) === 2 ? Math.sign(colStep) : 0);
        const targetRow = row + rowStep;
        const targetCol = col + colStep;
        if (inBounds(targetRow, targetCol) && !state.board[legRow][legCol]) add(targetRow, targetCol);
      }
      return moves;
    }

    if (piece.type === "s") {
      const forward = piece.color === RED ? -1 : 1;
      add(row + forward, col);
      const crossedRiver = piece.color === RED ? row <= 4 : row >= 5;
      if (crossedRiver) {
        add(row, col - 1);
        add(row, col + 1);
      }
      return moves;
    }

    if (piece.type === "r" || piece.type === "c") {
      for (const [rowStep, colStep] of DIRECTIONS) {
        let targetRow = row + rowStep;
        let targetCol = col + colStep;
        let screenFound = false;
        while (inBounds(targetRow, targetCol)) {
          const target = state.board[targetRow][targetCol];
          if (piece.type === "r") {
            if (!target) moves.push({ row: targetRow, col: targetCol });
            else {
              if (target.color !== piece.color) moves.push({ row: targetRow, col: targetCol });
              break;
            }
          } else if (!screenFound) {
            if (!target) moves.push({ row: targetRow, col: targetCol });
            else screenFound = true;
          } else if (target) {
            if (target.color !== piece.color) moves.push({ row: targetRow, col: targetCol });
            break;
          }
          targetRow += rowStep;
          targetCol += colStep;
        }
      }
      return moves;
    }

    return moves;
  }

  function findGeneral(board, color) {
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLUMNS; col += 1) {
        if (board[row][col]?.color === color && board[row][col].type === "k") return { row, col };
      }
    }
    return null;
  }

  function isInCheck(state, color) {
    const general = findGeneral(state.board, color);
    if (!general) return true;
    const attacker = opponent(color);
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLUMNS; col += 1) {
        const piece = state.board[row][col];
        if (piece?.color === attacker && pseudoMoves(state, row, col).some(move => move.row === general.row && move.col === general.col)) return true;
      }
    }
    return false;
  }

  function getLegalMoves(state, row, col) {
    const piece = state.board[row]?.[col];
    if (!piece || piece.color !== state.turn) return [];
    return pseudoMoves(state, row, col).filter(move => {
      if (state.board[move.row][move.col]?.type === "k") return false;
      const next = { board: cloneBoard(state.board), turn: state.turn };
      next.board[move.row][move.col] = next.board[row][col];
      next.board[row][col] = null;
      return !isInCheck(next, piece.color);
    });
  }

  function getGameResult(state) {
    const inCheck = isInCheck(state, state.turn);
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLUMNS; col += 1) {
        if (state.board[row][col]?.color === state.turn && getLegalMoves(state, row, col).length) {
          return { finished: false, inCheck };
        }
      }
    }
    return { finished: true, inCheck, winner: opponent(state.turn) };
  }

  function move(state, fromRow, fromCol, toRow, toCol) {
    if (!getLegalMoves(state, fromRow, fromCol).some(target => target.row === toRow && target.col === toCol)) return false;
    const piece = state.board[fromRow][fromCol];
    const captured = state.board[toRow][toCol];
    if (captured) state.captured[state.turn].push(captured);
    state.board[toRow][toCol] = piece;
    state.board[fromRow][fromCol] = null;
    state.turn = opponent(state.turn);
    return true;
  }

  window.XiangqiEngine = { createInitialState, getLegalMoves, getGameResult, isInCheck, move };
})();