import {
  SupabaseClient,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { Database } from "../types/database.types";

const initialBoard = [
  { x: 90, y: 50 },
  { x: 80, y: 50 },
  { x: 70, y: 50 },
];

const STEP_SIZE = 10;
const BOARD_WIDTH = 600;
const BOARD_HEIGHT = 400;

type Coordinate = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type GameLevel = "EASY" | "MEDIUM" | "HARD";


function getRandomFoodCoordinate(): Coordinate {
  const x = Math.floor(Math.random() * 60) * 10;
  const y = Math.floor(Math.random() * 40) * 10;
  return { x, y };
}

async function getUserHighScore({
  client,
  userId,
}: {
  client: SupabaseClient<Database>;
  userId: string;
}) {
  const { data } = await client
    .from("scores")
    .select("score")
    .eq("user_id", userId)
    .order("score", { ascending: false })
    .limit(1);

  return data?.[0]?.score ?? 0;
}

async function saveScoreInDb({
  client,
  userId,
  score,
}: {
  client: SupabaseClient<Database>;
  userId: string;
  score: number;
}) {
  const { error } = await client
    .from("scores")
    .insert({ user_id: userId, score });
  if (error) {
    console.log("Error updating highest score", error);
  }
}

export function Game() {
  const [board, setBoard] = useState<Array<Coordinate>>(initialBoard);
  const [food, setFood] = useState<Coordinate>(getRandomFoodCoordinate());
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState<number>(-1);
  const client = useSupabaseClient<Database>();
  const user = useUser();

  useEffect(() => {
    if (user) {
      getUserHighScore({ client, userId: user.id }).then((score) =>
        setHighestScore(score)
      );
    }
  }, [user, client]);

  function handleGameOver() {
    setIsPaused(true);
    setIsGameOver(true);
    if (user) {
      saveScoreInDb({ client, userId: user.id, score });
      if (score > highestScore) setHighestScore(score);
    }
  }

  function restartGame() {
    setBoard(initialBoard);
    setScore(0);
    setIsPaused(false);
    setIsGameOver(false);
  }

  function updateBoard() {
    // Check boundary condition, if snake hits boundary, end game
    const head = board[0];
    if (
      (direction === "LEFT" && head.x <= 0) ||
      (direction === "RIGHT" && head.x >= 600 - STEP_SIZE) ||
      (direction === "UP" && head.y <= 0) ||
      (direction === "DOWN" && head.y >= 400 - STEP_SIZE)
    ) {
      console.log({
        direction,
        x: head.x,
        y: head.y,
      });
      handleGameOver();
      return;
    }

    // Check if snake bit itself, if so, end game
    const hasSnakeBitItself = board.slice(1).some((box) => {
      return box.x === head.x && box.y === head.y;
    });

    if (hasSnakeBitItself) {
      console.log({
        direction,
        x: head.x,
        y: head.y,
        board,
      });
      handleGameOver();
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
      intervalId = setTimeout(updateBoard, 70);
    }
    return () => {
      if (intervalId) {
        clearTimeout(intervalId!);
      }
    };
  });

  return (
    <div className="flex flex-col items-center w-screen h-screen pt-32 font-game">
      <h1 className="mb-8 text-6xl font-bold text-green-300">Viper Venture</h1>
      <div>
        <div className="flex justify-between w-600">
          <div className="text-xl">
            Highest Score: {highestScore === -1 ? "-" : highestScore}
          </div>
          <div className="text-xl">Score: {score}</div>
        </div>
        <div className="box-content relative bg-yellow-200 border-4 border-amber-900 w-600 h-400">
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

          {isPaused && !isGameOver && (
            <GamePausedOverlay resumeGame={() => setIsPaused(false)} />
          )}
          {isGameOver && <GameOverOverlay restartGame={() => restartGame()} />}
        </div>
        <div className="flex justify-around mt-4 w-600">
          <button className="p-0 m-0 text-2xl underline uppercase bg-transparent border-none focus:outline-none">
            Easy
          </button>
          <button className="p-0 m-0 text-2xl uppercase bg-transparent border-none focus:outline-none">
            Medium
          </button>
          <button className="p-0 m-0 text-2xl uppercase bg-transparent border-none focus:outline-none">
            Hard
          </button>
        </div>
      </div>
    </div>
  );
}

function GamePausedOverlay({ resumeGame }: { resumeGame: () => void }) {
  return (
    <div className="absolute top-0 left-0 z-10 flex items-center justify-center w-full h-full bg-yellow-900 bg-opacity-50">
      <div className="flex flex-col items-center justify-center w-full h-full rounded-lg">
        <h1 className="mb-4 text-5xl font-bold text-amber-900">Paused</h1>
        <button
          className="border-none focus:outline-none bg-amber-700 hover:bg-amber-500"
          onClick={resumeGame}
        >
          Resume
        </button>
      </div>
    </div>
  );
}

function GameOverOverlay({ restartGame }: { restartGame: () => void }) {
  return (
    <div className="absolute top-0 left-0 z-10 flex items-center justify-center w-full h-full bg-yellow-900 bg-opacity-50">
      <div className="flex flex-col items-center justify-center w-full h-full rounded-lg">
        <h1 className="mb-4 text-5xl font-bold text-amber-900">Game Over</h1>
        <button
          className="border-none focus:outline-none bg-amber-700 hover:bg-amber-500"
          onClick={restartGame}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
