const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ================================
// HEALTH CHECK
// ================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Mystery Lab backend is running!",
  });
});

// ================================
// GENERATE MYSTERY
// ================================

app.post("/api/generate-mystery", async (req, res) => {
  console.log("Received mystery generation request");

  try {
    const {
      occasion,
      name,
      mysteryType,
      characters,
      personalDetails,
      difficulty,
    } = req.body;

    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (!name || !characters) {
      return res.status(400).json({
        success: false,
        message: "Name and characters are required.",
      });
    }

    // -------------------------------
    // AI PROMPT
    // -------------------------------

    const prompt = `
You are the AI mystery writer for Mystery Lab.

Create an original, fun, solvable interactive mystery game.

The game is intended for friends, parties, birthdays, anniversaries,
farewells, and other social occasions.

================================
USER DETAILS
================================

Occasion:
${occasion || "General"}

Person the mystery is about:
${name}

Mystery type:
${mysteryType || "Secret Identity"}

Characters:
${characters}

Personal details and inside jokes:
${personalDetails || "None provided"}

Difficulty:
${difficulty || "Medium"}

================================
IMPORTANT STORY RULES
================================

1. Create exactly ONE correct final solution.

2. The culprit MUST be one of the characters provided by the user.

3. NEVER invent a new suspect who was not included in the user's
   character list.

4. Do not accidentally change character names.

5. Use the provided character names consistently throughout the entire
   mystery.

6. Use the provided personal details naturally.

7. The mystery must be solvable using the supplied clues.

8. Every important conclusion must have evidence supporting it.

9. Include some misleading but fair clues.

10. Do not reveal the culprit in the opening story.

11. Do not make the answer dependent on information that was never
    provided to the player.

12. Avoid extremely obscure trivia.

13. Avoid answers that have dozens of possible interpretations.

14. Puzzle answers should be short and easy for a player to enter.

15. Puzzle questions must have ONE clearly intended answer.

16. The puzzles should progressively reveal information that helps
    identify the culprit.

17. Make the mystery entertaining and personal rather than generic.

18. Keep the content suitable for a general audience.

19. Do not include real-world criminal instructions.

================================
PUZZLE RULES
================================

Create 3 to 5 puzzles.

Each puzzle must contain:

- question
- answer
- acceptedAnswers
- hints

The "answer" is the primary answer.

"acceptedAnswers" must contain reasonable alternative answers that
mean essentially the same thing.

For example:

answer:
"purple ink"

acceptedAnswers:
[
  "purple ink",
  "purple ink mark",
  "purple ink stain",
  "ink mark"
]

Do NOT include unrelated answers.

================================
PROGRESSIVE HINT SYSTEM
================================

Every puzzle must contain exactly THREE hints.

Hint 1:
A subtle clue that helps the player think in the right direction.

Hint 2:
A stronger clue that narrows down the answer.

Hint 3:
A very strong clue that makes the answer reasonably clear without
directly stating the answer word-for-word.

The three hints should progressively increase in helpfulness.

Example:

hints: [
  "Look closely at the evidence near the guestbook.",
  "The guestbook manager used a distinctive writing tool.",
  "The mark on the hand matches residue from the purple gel pen."
]

Do not make all three hints essentially identical.

================================
GAME FLOW
================================

Puzzle 1 should introduce an important piece of evidence.

Puzzle 2 should connect two pieces of evidence.

Puzzle 3 should help identify the likely culprit.

If you create more puzzles, they should continue building toward
the final solution.

The final accusation should be answerable from the clues and puzzles.

================================
CHARACTER CONSISTENCY
================================

The provided characters are authoritative.

Do not replace, rename, or invent characters.

If the user gives:

Sabreen, Aisha, Rahul, Priya and Sahil

then only those people should appear as suspects.

================================
JSON REQUIREMENT
================================

Return ONLY valid JSON.

Do not include markdown.

Do not include code fences.

Use exactly this structure:

{
  "title": "Mystery title",

  "opening": "Opening story",

  "objective": "What the detective needs to discover",

  "suspects": [
    {
      "name": "Exact character name",
      "role": "Role",
      "description": "Short description",
      "motive": "Possible motive"
    }
  ],

  "clues": [
    {
      "title": "Clue title",
      "description": "What the detective discovers",
      "importance": "low"
    }
  ],

  "puzzles": [
    {
      "question": "Puzzle question",
      "answer": "Primary correct answer",
      "acceptedAnswers": [
        "Primary correct answer",
        "Reasonable alternative answer"
      ],
      "hints": [
        "Subtle hint",
        "Stronger hint",
        "Very strong hint"
      ]
    }
  ],

  "solution": {
    "culprit": "Exact suspect name",
    "explanation": "Detailed explanation showing how the clues prove the culprit"
  },

  "ending": "Final reveal and satisfying ending"
}

================================
QUALITY CHECK BEFORE RETURNING
================================

Before returning the JSON, internally verify:

- Exactly one culprit exists.
- The culprit is one of the provided characters.
- Every suspect name matches the supplied character names.
- Every puzzle has one clear answer.
- Every puzzle has exactly three progressively stronger hints.
- acceptedAnswers contain only reasonable equivalents.
- The clues support the solution.
- The puzzles support the solution.
- The final solution does not contradict any clue.
- No invented character is used as a suspect.
- No solution is revealed in the opening.
- The JSON is valid.
`;


    // -------------------------------
    // GEMINI REQUEST
    // -------------------------------

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    // -------------------------------
    // PARSE AI RESPONSE
    // -------------------------------

    const mystery = JSON.parse(response.text);

    // -------------------------------
    // BASIC SERVER VALIDATION
    // -------------------------------

    if (
      !mystery.title ||
      !mystery.opening ||
      !mystery.objective ||
      !Array.isArray(mystery.suspects) ||
      !Array.isArray(mystery.clues) ||
      !Array.isArray(mystery.puzzles) ||
      !mystery.solution
    ) {
      throw new Error(
        "AI returned an incomplete mystery structure."
      );
    }

    if (!mystery.solution.culprit) {
      throw new Error(
        "AI mystery does not contain a culprit."
      );
    }

    // -------------------------------
    // VALIDATE PUZZLES
    // -------------------------------

    mystery.puzzles = mystery.puzzles.map(
      (puzzle, index) => {
        if (
          !puzzle.question ||
          !puzzle.answer
        ) {
          throw new Error(
            `Puzzle ${index + 1} is missing a question or answer.`
          );
        }

        // Ensure acceptedAnswers exists
        if (!Array.isArray(puzzle.acceptedAnswers)) {
          puzzle.acceptedAnswers = [];
        }

        // Always include the primary answer
        if (
          !puzzle.acceptedAnswers.some(
            (answer) =>
              String(answer).trim().toLowerCase() ===
              String(puzzle.answer).trim().toLowerCase()
          )
        ) {
          puzzle.acceptedAnswers.unshift(
            puzzle.answer
          );
        }

        // Ensure hints exists
        if (!Array.isArray(puzzle.hints)) {
          puzzle.hints = [];
        }

        // Guarantee three hint slots
        while (puzzle.hints.length < 3) {
          puzzle.hints.push(
            "Review the clues carefully and look for the evidence that connects to this puzzle."
          );
        }

        // Only keep three hints
        puzzle.hints = puzzle.hints.slice(0, 3);

        return puzzle;
      }
    );

    // -------------------------------
    // LOG SUCCESS
    // -------------------------------

    console.log(
      "Mystery generated successfully:",
      mystery.title
    );

    // -------------------------------
    // SEND RESPONSE
    // -------------------------------

    res.json({
      success: true,
      mystery,
    });

  } catch (error) {
    console.error("Mystery generation error:");
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to generate mystery.",
    });
  }
});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Mystery Lab backend running on port ${PORT}`
  );
});