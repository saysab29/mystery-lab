# 🕵️ Mystery Lab

### AI-Powered Personalized Mystery Games

Mystery Lab is an AI-powered web application that creates personalized,
interactive mystery games using your friends, stories, inside jokes,
favorite things, and special occasions.

Players solve puzzles, uncover clues, and ultimately identify the person
responsible.

## 🌐 Live Demo

https://mystery-lab-five.vercel.app/

## ✨ Features

- 🤖 AI-generated personalized mysteries
- 🕵️ Multiple suspects and unique storylines
- 🧩 Interactive puzzle progression
- 🔍 Clues that help solve the mystery
- 💡 Hint system
- 🎯 Difficulty levels
- 🏆 Scoring system
- 🕵️ Final culprit accusation
- 🎉 Personalized stories for birthdays, farewells, anniversaries,
  parties, and more

## 🎮 How It Works

1. Choose an occasion
2. Enter the person the mystery is about
3. Select a mystery type
4. Add characters
5. Add personal details and inside jokes
6. Choose a difficulty
7. Generate the mystery
8. Solve the puzzles
9. Identify the culprit
10. Solve the case 🎉

## 🏗️ Architecture

```text
React + Vite
     │
     ▼
Vercel
     │
     ▼
Node.js + Express API
     │
     ▼
Render
     │


🛠️ Tech Stack
Frontend
React
Vite
JavaScript
CSS
Backend
Node.js
Express.js
CORS
dotenv
AI
Google Gemini API
@google/genai
Deployment
Vercel — Frontend
Render — Backend
GitHub — Source Control
📁 Project Structure
mystery-lab/
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── server/
│   └── server.cjs
│
├── public/
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
🚀 Run Locally
1. Clone the repository
git clone https://github.com/saysab29/mystery-lab.git
2. Enter the project
cd mystery-lab
3. Install dependencies
npm install
4. Configure the Gemini API

Create a .env file in the project root:

GEMINI_API_KEY=your_gemini_api_key
5. Start the backend
node server/server.cjs

The backend will run on:

http://localhost:3001
6. Start the frontend

Open another terminal and run:

npm run dev

The frontend will run on:

http://localhost:5173
🔐 Environment Variables

The backend requires:

GEMINI_API_KEY

Never commit your .env file or expose your Gemini API key publicly.

Make sure .env is included in .gitignore.

🚧 Project Status

Mystery Lab is currently an MVP.

Completed
 Personalized mystery generation
 Gemini AI integration
 Interactive puzzle flow
 Puzzle scoring
 Hint system
 Final accusation
 Node.js/Express backend
 Production deployment
 Public live demo
Planned
 Secure server-side puzzle validation
 User authentication
 Save and replay mysteries
 Shareable mystery links
 Multiplayer mode
 Payments and premium mysteries
 Custom domain
 Analytics
 Mobile optimization
🎯 Vision

Mystery Lab aims to make personalized mystery games easy to create for
birthdays, parties, anniversaries, farewells, team events, and
just-for-fun experiences.

Instead of buying a fixed mystery game, users can create a mystery based
on their own people, memories, jokes, stories, and special moments.

👩‍💻 Author

Built by SaySab.

📄 License

This project is currently for development and demonstration purposes.
