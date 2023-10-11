import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import React, { useEffect, useReducer } from "react";
import { Database } from "../types/database.types";
import {
  Action,
  GameDifficulty,
  gameReducer,
  initialGameState,
} from "../utils/game-reducer";
import { getUserHighScore, saveScoreInDB } from "../utils";

export function Game() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const client = useSupabaseClient<Database>();
  const user = useUser();

  useEffect(() => {
    if (user) {
      getUserHighScore({ client, userId: user.id }).then((score) =>
        dispatch({ type: "SET_HIGH_SCORE", payload: score })
      );
    }
  }, [user, client]);

  useEffect(() => {
    if (user && state.isGameOver) {
      saveScoreInDB({ client, userId: user.id, score: state.score });
    }
  }, [client, user, state.isGameOver, state.score]);

  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      dispatch({ type: "KEY_PRESS", payload: e.code });
    }

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [dispatch]);

  useEffect(() => {
    const interval = { EASY: 120, MEDIUM: 70, HARD: 50 }[state.difficulty];
    const intervalId = setInterval(
      () => dispatch({ type: "MOVE_SNAKE" }),
      interval
    );
    return () => {
      if (intervalId) {
        clearTimeout(intervalId!);
      }
    };
  }, [state.difficulty]);

  const { score, highestScore, board, food, isPaused, isGameOver } = state;

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
            <GamePausedOverlay
              resumeGame={() => dispatch({ type: "TOGGLE_PAUSE" })}
            />
          )}
          {isGameOver && (
            <GameOverOverlay
              restartGame={() => dispatch({ type: "RESTART_GAME" })}
            />
          )}
        </div>
        <GameDifficultyButtons
          currentDifficulty={state.difficulty}
          dispatch={dispatch}
        />
      </div>
    </div>
  );
}

function GameDifficultyButtons({
  currentDifficulty,
  dispatch,
}: {
  currentDifficulty: GameDifficulty;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="flex justify-around mt-4 w-600">
      <GameDifficultyButton
        currentDifficulty={currentDifficulty}
        difficulty="EASY"
        updateDifficulty={() =>
          dispatch({ type: "UPDATE_DIFFICULTY", payload: "EASY" })
        }
      >
        Easy
      </GameDifficultyButton>
      <GameDifficultyButton
        currentDifficulty={currentDifficulty}
        difficulty="MEDIUM"
        updateDifficulty={() =>
          dispatch({ type: "UPDATE_DIFFICULTY", payload: "MEDIUM" })
        }
      >
        Medium
      </GameDifficultyButton>
      <GameDifficultyButton
        currentDifficulty={currentDifficulty}
        difficulty="HARD"
        updateDifficulty={() =>
          dispatch({ type: "UPDATE_DIFFICULTY", payload: "HARD" })
        }
      >
        Hard
      </GameDifficultyButton>
    </div>
  );
}

function GameDifficultyButton({
  children,
  currentDifficulty,
  difficulty,
  updateDifficulty,
}: {
  children: string;
  currentDifficulty: GameDifficulty;
  difficulty: GameDifficulty;
  updateDifficulty: () => void;
}) {
  return (
    <button
      className={`p-0 m-0 text-2xl uppercase bg-transparent border-none focus:outline-none ${
        currentDifficulty === difficulty ? "underline" : ""
      }`}
      onClick={updateDifficulty}
    >
      {children}
    </button>
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
