type Coordinate = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type GameDifficulty = "EASY" | "MEDIUM" | "HARD";
export type GameState = typeof initialGameState;

const initialBoard = [
  { x: 90, y: 50 },
  { x: 80, y: 50 },
  { x: 70, y: 50 },
];

const STEP_SIZE = 10;
const BOARD_WIDTH = 600;
const BOARD_HEIGHT = 400;

export const initialGameState = {
  board: initialBoard,
  food: getRandomFoodCoordinate(),
  direction: "RIGHT" as Direction,
  isPaused: false,
  isGameOver: false,
  score: 0,
  highestScore: -1,
  difficulty: "MEDIUM" as GameDifficulty,
};

export type Action =
  | { type: "MOVE_SNAKE" }
  | { type: "SET_HIGH_SCORE"; payload: number }
  | { type: "RESTART_GAME" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "KEY_PRESS"; payload: string }
  | { type: "UPDATE_DIFFICULTY"; payload: GameDifficulty };

function getRandomFoodCoordinate(): Coordinate {
  const x = Math.floor(Math.random() * 60) * 10;
  const y = Math.floor(Math.random() * 40) * 10;
  return { x, y };
}

function hasSnakeHitBoundary(head: Coordinate, direction: Direction) {
  return (
    (direction === "LEFT" && head.x <= 0) ||
    (direction === "RIGHT" && head.x >= BOARD_WIDTH - STEP_SIZE) ||
    (direction === "UP" && head.y <= 0) ||
    (direction === "DOWN" && head.y >= BOARD_HEIGHT - STEP_SIZE)
  );
}

function hasSnakeBitItself(head: Coordinate, board: Array<Coordinate>) {
  return board.slice(1).some((box) => box.x === head.x && box.y === head.y);
}

function getHeadAfterSnakeMoves(head: Coordinate, direction: Direction) {
  let dx = 0;
  let dy = 0;

  if (direction === "RIGHT") dx = STEP_SIZE;
  if (direction === "LEFT") dx = -STEP_SIZE;
  if (direction === "UP") dy = -STEP_SIZE;
  if (direction === "DOWN") dy = STEP_SIZE;

  return { x: head.x + dx, y: head.y + dy };
}

function getBoardAfterSnakeMoves(
  board: Array<Coordinate>,
  direction: Direction
) {
  const head = board[0];
  const newHead = getHeadAfterSnakeMoves(head, direction);
  return [newHead, ...board.slice(0, board.length - 1)];
}

export function gameReducer(
  state: typeof initialGameState,
  action: Action
): GameState {
  switch (action.type) {
    case "MOVE_SNAKE": {
      if (state.isPaused) return state;

      const { board, direction } = state;
      const head = board[0];
      if (
        hasSnakeHitBoundary(head, direction) ||
        hasSnakeBitItself(head, board)
      ) {
        return {
          ...state,
          isGameOver: true,
          isPaused: true,
          highestScore: Math.max(state.score, state.highestScore),
        };
      }

      const hasEatenFood = head.x === state.food.x && head.y === state.food.y;

      if (hasEatenFood) {
        return {
          ...state,
          board: [getHeadAfterSnakeMoves(head, state.direction), ...board],
          score: state.score + 10,
          food: getRandomFoodCoordinate(),
        };
      }

      return { ...state, board: getBoardAfterSnakeMoves(board, direction) };
    }
    case "SET_HIGH_SCORE": {
      return { ...state, highestScore: action.payload };
    }
    case "RESTART_GAME": {
      return initialGameState;
    }
    case "TOGGLE_PAUSE": {
      return { ...state, isPaused: !state.isPaused };
    }
    case "KEY_PRESS": {
      const key = action.payload;

      if (key === "Space") return { ...state, isPaused: !state.isPaused };

      if (state.isPaused) return state;

      // NOTE: We are also updating the board as we can't allow user to change the direction twice with the same board. This can cause the snake to bite itself.
      if (key === "ArrowUp" && state.direction !== "DOWN")
        return {
          ...state,
          direction: "UP",
          board: getBoardAfterSnakeMoves(state.board, "UP"),
        };
      if (key === "ArrowDown" && state.direction !== "UP")
        return {
          ...state,
          direction: "DOWN",
          board: getBoardAfterSnakeMoves(state.board, "DOWN"),
        };
      if (key === "ArrowLeft" && state.direction !== "RIGHT")
        return {
          ...state,
          direction: "LEFT",
          board: getBoardAfterSnakeMoves(state.board, "LEFT"),
        };
      if (key === "ArrowRight" && state.direction !== "LEFT")
        return {
          ...state,
          direction: "RIGHT",
          board: getBoardAfterSnakeMoves(state.board, "RIGHT"),
        };
      return state;
    }

    case "UPDATE_DIFFICULTY": {
      return { ...state, difficulty: action.payload };
    }
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}
