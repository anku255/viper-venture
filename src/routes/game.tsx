import React, { useState, useEffect } from "react";

const initialBoard = [
  { x: 90, y: 0 },
  { x: 80, y: 0 },
  { x: 70, y: 0 },
  { x: 60, y: 0 },
  { x: 50, y: 0 },
  { x: 40, y: 0 },
  { x: 30, y: 0 },
  { x: 20, y: 0 },
];

const STEP_SIZE = 10;

type Coordinate = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

function getRandomFoodCoordinate(): Coordinate {
  const x = Math.floor(Math.random() * 60) * 10;
  const y = Math.floor(Math.random() * 40) * 10;
  return { x, y };
}

// Game Board Component
const GameBoard: React.FC = () => {
  const [board, setBoard] =
    useState<Array<Coordinate>>(initialBoard);
  const [food, setFood] = useState<Coordinate>(getRandomFoodCoordinate())
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);


  function updateBoard() {
    // Check boundary condition, if snake hits boundary, end game
    const head = board[0];
    if (
      direction === 'LEFT' && head.x <= 0 ||
      direction === 'RIGHT' && head.x >= 600 - STEP_SIZE ||
      direction === 'UP' && head.y <= 0 ||
      direction === 'DOWN' && head.y >= 400 - STEP_SIZE
    ) {
      console.log('Game Over')
      setIsPaused(true);
      return;
    }

    // Check if snake bit itself, if so, end game
    const hasSnakeBitItself = board.slice(1).some((box) => {
      return box.x === head.x && box.y === head.y;
    });

    if (hasSnakeBitItself) {
      console.log('Game Over')
      setIsPaused(true);
      return;
    }
    // Check if snake ate food, if so, add to snake and generate new food, update score
    const hasEatenFood = head.x === food.x && head.y === food.y;
    if (hasEatenFood) {
      setBoard((b) => [head, ...b]);
      setScore((s) => s + 10);
      setFood(getRandomFoodCoordinate());
    }


    //Move snake
    let dx = 0;
    let dy = 0;

    if (direction === "RIGHT") dx = STEP_SIZE;
    if (direction === "LEFT") dx = -STEP_SIZE;
    if (direction === "UP") dy = -STEP_SIZE;
    if (direction === "DOWN") dy = STEP_SIZE;

    setBoard((b) => {
      const head = { x: b[0].x + dx, y: b[0].y + dy };
      return [head, ...b.slice(0, b.length - 1)];
    });
  }

  function handleKeyPress(e: KeyboardEvent) {
    if (e.code === "Space") {
      setIsPaused((p) => !p);
      return;
    }

    if (isPaused) return;

    switch (e.code) {
      case "ArrowUp":
        if (direction !== "DOWN") setDirection("UP");
        break;
      case "ArrowDown":
        if (direction !== "UP") setDirection("DOWN");
        break;
      case "ArrowLeft":
        if (direction !== "RIGHT") setDirection("LEFT");
        break;
      case "ArrowRight":
        if (direction !== "LEFT") setDirection("RIGHT");
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  });

  useEffect(() => {
    let intervalId: number;
    if (!isPaused) {
      intervalId = setTimeout(updateBoard, 100);
    }
    return () => {
      if (intervalId) {
        clearTimeout(intervalId!);
      }
    };
  });

  return (
    <div>
       {/* Render score */}
      <div className="flex justify-end w-600">
        <div className="text-xl">Score: {score}</div>
      </div>
      <div className="relative bg-black w-600 h-400">
       
        {board.map((box, i) => (
          <div
            key={i}
            className="absolute bg-green-500"
            style={{ top: box.y, left: box.x, width: 10, height: 10 }}
          />
        ))}
        <div
          className="absolute bg-red-500"
          style={{ top: food.y, left: food.x, width: 10, height: 10 }}
        />
      </div>
    </div>
  );
};

export function Game() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-yellow-600">
      <h1 className="mb-4 text-4xl">Snake Game</h1>
      <GameBoard />
    </div>
  );
}
