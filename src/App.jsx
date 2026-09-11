import { useState } from "react";
import "./App.css";

function App() {
  const [showCreate, setShowCreate] = useState(false);

  const [formData, setFormData] = useState({
    occasion: "",
    name: "",
    mysteryType: "",
    characters: "",
    personalDetails: "",
    difficulty: "Medium",
  });

  const [generated, setGenerated] = useState(false);
  const [mystery, setMystery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Game state
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [hintsUsed, setHintsUsed] = useState({});
  const [score, setScore] = useState(100);
  const [gameComplete, setGameComplete] = useState(false);

  // Final accusation state
  const [accusationResult, setAccusationResult] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleDifficulty = (difficulty) => {
    setFormData((previous) => ({
      ...previous,
      difficulty,
    }));
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://mystery-lab-api.onrender.com/api/generate-mystery",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to generate mystery."
        );
      }

      setMystery(data.mystery);
      setGenerated(true);

      // Reset game state
      setCurrentPuzzle(0);
      setAnswers({});
      setFeedback({});
      setHintsUsed({});
      setScore(100);
      setGameComplete(false);
      setAccusationResult(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resetMystery = () => {
    setGenerated(false);
    setMystery(null);
    setError("");
    setCurrentPuzzle(0);
    setAnswers({});
    setFeedback({});
    setHintsUsed({});
    setScore(100);
    setGameComplete(false);
    setAccusationResult(null);
  };

  const handleAnswerChange = (index, value) => {
    setAnswers((previous) => ({
      ...previous,
      [index]: value,
    }));

    setFeedback((previous) => ({
      ...previous,
      [index]: null,
    }));
  };

  const submitAnswer = (index) => {
    if (!mystery?.puzzles?.[index]) {
      return;
    }

    const puzzle = mystery.puzzles[index];

    const playerAnswer = (answers[index] || "")
      .trim()
      .toLowerCase();

    const correctAnswer = String(puzzle.answer || "")
      .trim()
      .toLowerCase();

    if (!playerAnswer) {
      setFeedback((previous) => ({
        ...previous,
        [index]: {
          correct: false,
          message: "Enter an answer first.",
        },
      }));

      return;
    }

    const isCorrect = playerAnswer === correctAnswer;

    if (isCorrect) {
      setFeedback((previous) => ({
        ...previous,
        [index]: {
          correct: true,
          message: "Correct! The clue is unlocked.",
        },
      }));

      if (index < mystery.puzzles.length - 1) {
        setTimeout(() => {
          setCurrentPuzzle(index + 1);
        }, 700);
      } else {
        setTimeout(() => {
          setGameComplete(true);
        }, 700);
      }
    } else {
      setFeedback((previous) => ({
        ...previous,
        [index]: {
          correct: false,
          message: "Not quite. Try again.",
        },
      }));
    }
  };

  const handleUseHint = (index) => {
    if (!mystery?.puzzles?.[index]) {
      return;
    }

    if (hintsUsed[index]) {
      return;
    }

    setHintsUsed((previous) => ({
      ...previous,
      [index]: true,
    }));

    setScore((previous) => Math.max(0, previous - 10));
  };

  const handleAccusation = (suspect) => {
    const correct =
      suspect.name.trim().toLowerCase() ===
      mystery.solution?.culprit?.trim().toLowerCase();

    if (correct) {
      setAccusationResult({
        correct: true,
        suspect: suspect.name,
        explanation:
          mystery.solution?.explanation ||
          "The clues point directly to this suspect.",
      });
    } else {
      setAccusationResult({
        correct: false,
        suspect: suspect.name,
      });
    }
  };

  if (generated && mystery) {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="logo">MYSTERY LAB</div>

          <button
            className="nav-button"
            onClick={resetMystery}
          >
            ← Back
          </button>
        </nav>

        <main className="create-page mystery-result">
          <div className="create-header">
            <div className="badge">🔎 CASE FILE</div>

            <h1>{mystery.title}</h1>

            <p>{mystery.opening}</p>
          </div>

          {/* Score */}
          <div className="game-score">
            <span>CASE SCORE</span>
            <strong>{score}</strong>
          </div>

          <section className="form-card">
            {/* Objective */}
            <h2>🎯 Your Objective</h2>
            <p>{mystery.objective}</p>

            {/* Suspects */}
            <h2>🕵️ Suspects</h2>

            {mystery.suspects?.map((suspect, index) => (
              <div
                className="suspect-card"
                key={index}
              >
                <h3>{suspect.name}</h3>

                <p>
                  <strong>Role:</strong> {suspect.role}
                </p>

                <p>{suspect.description}</p>

                <p>
                  <strong>Possible motive:</strong>{" "}
                  {suspect.motive}
                </p>
              </div>
            ))}

            {/* Clues */}
            <h2>🔍 Clues</h2>

            {mystery.clues?.map((clue, index) => (
              <div
                className="suspect-card"
                key={index}
              >
                <h3>{clue.title}</h3>

                <p>{clue.description}</p>

                <p>
                  <strong>Importance:</strong>{" "}
                  {clue.importance}
                </p>
              </div>
            ))}

            {/* Puzzles */}
            <h2>🧩 Puzzles</h2>

            <p>
              Solve each puzzle to unlock the next part of
              the case.
            </p>

            {mystery.puzzles?.map((puzzle, index) => {
              const unlocked = index <= currentPuzzle;
              const solved = feedback[index]?.correct;
              const hintVisible = hintsUsed[index];

              return (
                <div
                  className={`puzzle-card ${
                    unlocked ? "unlocked" : "locked"
                  } ${solved ? "solved" : ""}`}
                  key={index}
                >
                  <div className="puzzle-header">
                    <span>Puzzle {index + 1}</span>

                    {solved && (
                      <span className="puzzle-status">
                        ✓ SOLVED
                      </span>
                    )}

                    {!unlocked && (
                      <span className="puzzle-status">
                        🔒 LOCKED
                      </span>
                    )}
                  </div>

                  <h3>{puzzle.question}</h3>

                  {unlocked ? (
                    <>
                      <div className="answer-area">
                        <input
                          type="text"
                          placeholder="Enter your answer..."
                          value={answers[index] || ""}
                          onChange={(event) =>
                            handleAnswerChange(
                              index,
                              event.target.value
                            )
                          }
                          disabled={solved}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              submitAnswer(index);
                            }
                          }}
                        />

                        <button
                          className="answer-button"
                          onClick={() =>
                            submitAnswer(index)
                          }
                          disabled={solved}
                        >
                          {solved
                            ? "Solved ✓"
                            : "Submit Answer"}
                        </button>
                      </div>

                      <button
                        className="hint-button"
                        onClick={() =>
                          handleUseHint(index)
                        }
                        disabled={hintVisible || solved}
                      >
                        {hintVisible
                          ? "💡 Hint Revealed"
                          : "💡 Need a Hint? (-10 points)"}
                      </button>

                      {hintVisible && (
                        <div className="hint-box">
                          <strong>Hint:</strong>{" "}
                          {puzzle.hint}
                        </div>
                      )}

                      {feedback[index] && (
                        <div
                          className={`answer-feedback ${
                            feedback[index].correct
                              ? "correct"
                              : "incorrect"
                          }`}
                        >
                          {feedback[index].correct
                            ? "✓"
                            : "✕"}{" "}
                          {feedback[index].message}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="locked-message">
                      🔒 Solve the previous puzzle to unlock
                      this one.
                    </div>
                  )}
                </div>
              );
            })}

            {/* Final Case */}
            {gameComplete && (
              <div className="case-complete">
                <div className="badge">
                  🏆 CASE COMPLETE
                </div>

                <h2>Excellent Detective Work!</h2>

                <p>
                  You solved all the puzzles. Now it's time
                  to identify the person responsible.
                </p>

                <div className="final-score">
                  Final Score:{" "}
                  <strong>{score}</strong>/100
                </div>

                <h2>🕵️ Who is responsible?</h2>

                <div className="final-suspects">
                  {mystery.suspects?.map(
                    (suspect, index) => (
                      <button
                        key={index}
                        className="final-suspect-button"
                        onClick={() =>
                          handleAccusation(suspect)
                        }
                      >
                        {suspect.name}
                      </button>
                    )
                  )}
                </div>

                {/* Accusation Result */}
                {accusationResult && (
                  <div
                    className={`accusation-result ${
                      accusationResult.correct
                        ? "accusation-correct"
                        : "accusation-wrong"
                    }`}
                  >
                    {accusationResult.correct ? (
                      <>
                        <div className="result-icon">
                          🏆
                        </div>

                        <div className="result-label">
                          CASE SOLVED
                        </div>

                        <h2>
                          {accusationResult.suspect.toUpperCase()}{" "}
                          IS RESPONSIBLE
                        </h2>

                        <p>
                          {accusationResult.explanation}
                        </p>

                        <div className="result-score">
                          FINAL SCORE
                          <strong>
                            {score}/100
                          </strong>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="result-icon">
                          ✕
                        </div>

                        <div className="result-label">
                          INCORRECT ACCUSATION
                        </div>

                        <h2>
                          {accusationResult.suspect}{" "}
                          isn't responsible.
                        </h2>

                        <p>
                          The evidence doesn't support
                          this accusation. Review the
                          clues and make another choice.
                        </p>

                        <button
                          className="try-again-button"
                          onClick={() =>
                            setAccusationResult(null)
                          }
                        >
                          Try Again
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          <button
            className="generate-button"
            onClick={resetMystery}
          >
            ← Create Another Mystery
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">MYSTERY LAB</div>

        <button
          className="nav-button"
          onClick={() => setShowCreate(true)}
        >
          Create Mystery
        </button>
      </nav>

      {!showCreate ? (
        <main className="hero">
          <div className="badge">
            🕵️ AI-POWERED MYSTERY GAMES
          </div>

          <h1>
            Every mystery
            <br />
            is personal.
          </h1>

          <p>
            Create a unique interactive mystery using your
            friends, stories, inside jokes and imagination.
            Then let the detective work begin.
          </p>

          <button
            className="start-button"
            onClick={() => setShowCreate(true)}
          >
            Create Your Mystery →
          </button>
        </main>
      ) : (
        <main className="create-page">
          <div className="create-header">
            <div className="badge">🔎 CREATE YOUR CASE</div>

            <h1>Build a Mystery</h1>

            <p>
              Give us a few details and AI will create a
              unique mystery for you.
            </p>
          </div>

          <form
            className="form-card"
            onSubmit={handleGenerate}
          >
            <div className="form-group">
              <label>Occasion</label>

              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select an occasion
                </option>

                <option value="Birthday">
                  Birthday
                </option>

                <option value="Farewell">
                  Farewell
                </option>

                <option value="Anniversary">
                  Anniversary
                </option>

                <option value="Party">
                  Party
                </option>

                <option value="Just for Fun">
                  Just for Fun
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Who is the mystery about?
              </label>

              <input
                type="text"
                name="name"
                placeholder="e.g. Sabreen"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Mystery Type</label>

              <select
                name="mysteryType"
                value={formData.mysteryType}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select mystery type
                </option>

                <option value="Secret Identity">
                  Secret Identity
                </option>

                <option value="Missing Person">
                  Missing Person
                </option>

                <option value="Theft">
                  Theft
                </option>

                <option value="Hidden Treasure">
                  Hidden Treasure
                </option>

                <option value="Secret Message">
                  Secret Message
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Characters</label>

              <textarea
                name="characters"
                placeholder="Tell us about the people involved..."
                value={formData.characters}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Personal Details & Inside Jokes
              </label>

              <textarea
                name="personalDetails"
                placeholder="Favorite things, funny memories, inside jokes..."
                value={formData.personalDetails}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Difficulty</label>

              <div className="difficulty-options">
                {["Easy", "Medium", "Hard"].map(
                  (difficulty) => (
                    <button
                      type="button"
                      key={difficulty}
                      className={
                        formData.difficulty === difficulty
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        handleDifficulty(difficulty)
                      }
                    >
                      {difficulty}
                    </button>
                  )
                )}
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              className="generate-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating Your Mystery..."
                : "Generate Mystery →"}
            </button>
          </form>
        </main>
      )}
    </div>
  );
}

export default App;