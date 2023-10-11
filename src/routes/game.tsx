import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import React, { useEffect, useReducer } from "react";
import { Database } from "../types/database.types";
import {
  Action,
  GameDifficulty,
  gameReducer,
  initialGameState,
} from "../utils/game-reducer";
import { getUserHighScore, playDieSound, saveScoreInDB } from "../utils";

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
      state.isSoundEnabled &&  playDieSound();
      saveScoreInDB({ client, userId: user.id, score: state.score });
    }
  }, [client, user, state.isSoundEnabled, state.isGameOver, state.score]);

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
    <div className="relative flex flex-col items-center w-screen h-screen pt-32 font-game">
      <h1 className="mb-8 text-6xl font-bold text-green-300">Viper Venture</h1>
      <SoundButton isSoundEnabled={state.isSoundEnabled} toggleSound={() => dispatch({ type: 'TOGGLE_SOUND'})} />
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

function SoundButton({
  isSoundEnabled,
  toggleSound,
}: {
  isSoundEnabled: boolean;
  toggleSound: () => void;
}) {
  return (
    <button className="absolute p-0 bg-transparent border-none top-4 left-4 focus:outline-none" onClick={toggleSound}>
      {isSoundEnabled ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"
          />
        </svg>
      )}
    </button>
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
