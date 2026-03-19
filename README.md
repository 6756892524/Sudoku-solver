🧩 Sudoku Solver Web Application :

A responsive, client-side Sudoku Solver built using HTML, CSS, and JavaScript, featuring real-time input validation and an optimized backtracking algorithm for solving puzzles efficiently.

📌 Overview

This project is a browser-based Sudoku application designed to provide an interactive puzzle-solving experience. It incorporates dynamic board generation, user input validation, and algorithmic problem-solving techniques.

🚀 Key Features

1.Automated Sudoku Solver
Implements a backtracking algorithm to compute valid solutions.

2.Dynamic Difficulty Selection
Supports multiple levels (Easy, Medium) with real-time board regeneration.

3.Input Validation & Error Handling
Detects invalid entries and prevents duplicate values in rows, columns, and subgrids.

4.Timer Integration
Tracks gameplay duration with accurate reset functionality.

5.Game Controls
Includes Solve, Reset, and New Game actions for improved usability.

6.Responsive Design
Optimized for both desktop and mobile interfaces.

🛠️ Tech Stack

1.Frontend: HTML5, CSS3, JavaScript (ES6)

2.Core Logic: Backtracking Algorithm

3.Design: Responsive layout using CSS Grid/Flexbox

🧠 Algorithmic Approach

1.The solver is based on the Backtracking Technique, which:

2.Identifies empty cells in the grid

3.Attempts valid numbers (1–9)

4.Verifies constraints (row, column, 3×3 subgrid)

5.Recursively explores solutions and backtracks when constraints fail

🐞 Issues Resolved

1.Difficulty Selection Bug
Fixed event handling to regenerate puzzles on dropdown change.

2.Timer Reset Bug
Ensured proper use of clearInterval() and reset display state.

3.Solver Validation Issue
Added pre-check for invalid/duplicate inputs before execution.

📂 Project Structure
sudoku-solver/
│── index.html
│── style.css
│── script.js
│── README.md
▶️ Setup & Usage

Clone the repository:

git clone 
Open index.html in any modern web browser.
