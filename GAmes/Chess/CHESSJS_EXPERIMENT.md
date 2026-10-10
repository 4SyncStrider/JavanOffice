# chess.js experiment notes

This file records the isolated evaluation done on the `experiment/chessjs-swap` branch.

## Goal

Test whether `chess.js` can replace the current English chess implementation without disrupting the existing JavanOffice app.

## What the project currently does

The active chess screen in this repository is not a simple board wrapper. It implements:

- English Chess rules with custom move validation
- Xiangqi support in the same board UI
- variant switching between English Chess and Chinese Chess
- custom modal flow for state-preserving switching
- board state preservation when the user cancels a variant change

That means the existing engine is intentionally broader than a standard chess engine.

## What `chess.js` provides

`chess.js` is a standard legal-move engine for standard chess only. It is excellent for:

- legal move generation
- turn tracking
- FEN serialization
- check, checkmate, draw detection
- standard promotion, castling, and en passant rules

It does not natively provide:

- Xiangqi rules or board geometry
- the current multi-variant UI flow
- custom modal logic for preserving or resetting a match
- custom board states that are already built into this app

## Observed differences

1. The custom app stores a browser-native board state and UI logic for both variants.
2. `chess.js` stores a single standard-chess position using FEN and a move API.
3. The app supports a two-variant game picker; `chess.js` assumes one standard game model.
4. The custom implementation already handles promotion and game-end states built into the page flow.
5. Replacing the current English Chess engine would require reworking the UI integration rather than just swapping one function.

## Verdict

`chess.js` is valid as a standard English chess engine, but it is not a drop-in replacement for the current project architecture. The custom implementation remains a better fit for this app because the project includes a second playable variant and a custom state-preserving switch flow.

## Validation output

The experiment was verified with a Node script against the installed dependency. The output confirms the library initializes correctly and exposes a standard chess game state:

```text
fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
moves 20
turn w
inCheck false
```

This indicates the package works correctly for standard chess, but not directly for this app's multi-variant design. In the installed chess.js version, the relevant API names are `inCheck`, `isCheckmate`, `isDraw`, and `isGameOver`.
