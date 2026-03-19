document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('sudoku-grid');
    const solveBtn = document.getElementById('solve');
    const resetBtn = document.getElementById('reset');
    const newGameBtn = document.getElementById('new-game');
    const hintBtn = document.getElementById('hint');
    const difficultySelect = document.getElementById('difficulty');
    const timerDisplay = document.getElementById('timer');
    const messageDisplay = document.getElementById('message');

    let sudoku = Array(9).fill().map(() => Array(9).fill(0));
    let timer;
    let startTime;
    let isSolving = false;
    let isTimerStarted = false;
    let selectedCell = null;
    let hintsUsed = 0;
    const originalSudoku = Array(9).fill().map(() => Array(9).fill(0));

    // Initialize the grid
    function initGrid() {
        grid.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = '1';
            input.inputMode = 'numeric';
            input.addEventListener('input', handleInput);
            input.addEventListener('keydown', handleKeyDown);
            input.addEventListener('paste', handlePaste);
            input.addEventListener('focus', handleCellFocus);
            input.addEventListener('click', handleCellClick);
            cell.appendChild(input);
            grid.appendChild(cell);
        }
    }

    // Handle cell focus - highlight related cells
    function handleCellFocus(e) {
        startTimerOnFirstInteraction();
        const index = Array.from(grid.querySelectorAll('input')).indexOf(e.target);
        const row = Math.floor(index / 9);
        const col = index % 9;
        highlightRelatedCells(row, col);
    }

    // Handle cell click - for better UX
    function handleCellClick(e) {
        startTimerOnFirstInteraction();
        const index = Array.from(grid.querySelectorAll('input')).indexOf(e.target);
        const row = Math.floor(index / 9);
        const col = index % 9;
        highlightRelatedCells(row, col);
    }

    // Highlight cells in the same row, column, and box
    function highlightRelatedCells(row, col) {
        const cells = grid.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.remove('highlight', 'selected'));

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;

        // Highlight selected cell
        cells[row * 9 + col].classList.add('selected');

        // Highlight related cells
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if ((i === row || j === col || (i >= boxRow && i < boxRow + 3 && j >= boxCol && j < boxCol + 3)) && !(i === row && j === col)) {
                    cells[i * 9 + j].classList.add('highlight');
                }
            }
        }
    }

    // Start timer on first user interaction
    function startTimerOnFirstInteraction() {
        if (!isTimerStarted) {
            isTimerStarted = true;
            startTimer();
        }
    }

    // Handle paste events
    function handlePaste(e) {
        e.preventDefault();
        return false;
    }

    // Handle input validation
    function handleInput(e) {
        startTimerOnFirstInteraction();
        const value = e.target.value;
        if (!/^[1-9]?$/.test(value)) {
            e.target.value = '';
        }
        validateGrid();
        checkCompletion();
    }

    // Handle keyboard navigation
    function handleKeyDown(e) {
        const inputs = Array.from(grid.querySelectorAll('input'));
        const currentIndex = inputs.indexOf(e.target);
        let nextIndex;

        // Handle Delete/Backspace to clear cell
        if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target.parentElement.classList.contains('fixed')) {
            e.preventDefault();
            e.target.value = '';
            validateGrid();
            return;
        }

        switch (e.key) {
            case 'ArrowUp':
                nextIndex = currentIndex - 9;
                break;
            case 'ArrowDown':
                nextIndex = currentIndex + 9;
                break;
            case 'ArrowLeft':
                nextIndex = currentIndex - 1;
                break;
            case 'ArrowRight':
                nextIndex = currentIndex + 1;
                break;
            case 'Enter':
                nextIndex = currentIndex + 1;
                break;
            default:
                return;
        }

        if (nextIndex >= 0 && nextIndex < 81) {
            e.preventDefault();
            inputs[nextIndex].focus();
        }
    }

    // Validate the entire grid
    function validateGrid() {
        const inputs = grid.querySelectorAll('input');
        inputs.forEach(input => input.parentElement.classList.remove('error'));

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const value = parseInt(inputs[i * 9 + j].value) || 0;
                if (value !== 0) {
                    if (!isValid(i, j, value, inputs)) {
                        inputs[i * 9 + j].parentElement.classList.add('error');
                    }
                }
            }
        }
    }

    // Check if a value is valid at a given position
    function isValid(row, col, num, inputs) {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (j !== col && parseInt(inputs[row * 9 + j].value) === num) {
                return false;
            }
        }

        // Check column
        for (let i = 0; i < 9; i++) {
            if (i !== row && parseInt(inputs[i * 9 + col].value) === num) {
                return false;
            }
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if ((i !== row || j !== col) && parseInt(inputs[i * 9 + j].value) === num) {
                    return false;
                }
            }
        }

        return true;
    }

    // Solve the Sudoku puzzle using backtracking
    function solveSudoku(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValidPlacement(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (solveSudoku(grid)) {
                                return true;
                            }
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Check if a number can be placed at a given position
    function isValidPlacement(grid, row, col, num) {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (grid[row][j] === num) {
                return false;
            }
        }

        // Check column
        for (let i = 0; i < 9; i++) {
            if (grid[i][col] === num) {
                return false;
            }
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (grid[i][j] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    // Generate a new puzzle based on difficulty
    function generatePuzzle(difficulty) {
        // Start with an empty grid
        sudoku = Array(9).fill().map(() => Array(9).fill(0));

        // Fill the diagonal 3x3 boxes first (they don't affect each other)
        fillDiagonalBoxes();

        // Fill the remaining cells
        solveSudoku(sudoku);

        // Remove numbers based on difficulty
        const cellsToRemove = {
            easy: 40,
            medium: 50,
            hard: 60
        };

        const toRemove = cellsToRemove[difficulty];
        let removed = 0;
        while (removed < toRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (sudoku[row][col] !== 0) {
                sudoku[row][col] = 0;
                removed++;
            }
        }

        displayPuzzle();
    }

    // Fill the diagonal 3x3 boxes
    function fillDiagonalBoxes() {
        for (let box = 0; box < 9; box += 3) {
            fillBox(box, box);
        }
    }

    // Fill a 3x3 box
    function fillBox(row, col) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffleArray(nums);
        let index = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                sudoku[row + i][col + j] = nums[index++];
            }
        }
    }

    // Shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Display the puzzle in the grid
    function displayPuzzle() {
        const inputs = grid.querySelectorAll('input');
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const value = sudoku[i][j];
                const input = inputs[i * 9 + j];
                const cell = input.parentElement;

                input.value = value === 0 ? '' : value;

                if (value !== 0) {
                    input.disabled = true;
                    cell.classList.add('fixed');
                } else {
                    input.disabled = false;
                    cell.classList.remove('fixed');
                }
                cell.classList.remove('highlight', 'selected');
            }
        }
        // Store original puzzle for reference
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                originalSudoku[i][j] = sudoku[i][j];
            }
        }
        validateGrid();
        isTimerStarted = false;
        hintsUsed = 0;
        resetTimer();
    }

    // Check if puzzle is completed
    function checkCompletion() {
        const inputs = grid.querySelectorAll('input');
        let allFilled = true;
        let isValid = true;

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const value = parseInt(inputs[i * 9 + j].value) || 0;
                if (value === 0) {
                    allFilled = false;
                }
            }
        }

        if (allFilled) {
            // Check if solution is valid
            if (validateNoDuplicates()) {
                clearInterval(timer);
                showMessage('🎉 Congratulations! Puzzle completed!', 'success');
                return true;
            }
        }
        return false;
    }

    // Display message with styling
    function showMessage(text, type = 'info') {
        messageDisplay.textContent = text;
        messageDisplay.className = type;
    }

    // Validate for duplicate numbers in user input
    function validateNoDuplicates() {
        const inputs = grid.querySelectorAll('input');
        const tempSudoku = Array(9).fill().map(() => Array(9).fill(0));

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const value = parseInt(inputs[i * 9 + j].value) || 0;
                if (value !== 0) {
                    tempSudoku[i][j] = value;
                }
            }
        }

        // Check rows
        for (let i = 0; i < 9; i++) {
            const seen = new Set();
            for (let j = 0; j < 9; j++) {
                if (tempSudoku[i][j] !== 0) {
                    if (seen.has(tempSudoku[i][j])) return false;
                    seen.add(tempSudoku[i][j]);
                }
            }
        }

        // Check columns
        for (let j = 0; j < 9; j++) {
            const seen = new Set();
            for (let i = 0; i < 9; i++) {
                if (tempSudoku[i][j] !== 0) {
                    if (seen.has(tempSudoku[i][j])) return false;
                    seen.add(tempSudoku[i][j]);
                }
            }
        }

        // Check 3x3 boxes
        for (let boxRow = 0; boxRow < 9; boxRow += 3) {
            for (let boxCol = 0; boxCol < 9; boxCol += 3) {
                const seen = new Set();
                for (let i = boxRow; i < boxRow + 3; i++) {
                    for (let j = boxCol; j < boxCol + 3; j++) {
                        if (tempSudoku[i][j] !== 0) {
                            if (seen.has(tempSudoku[i][j])) return false;
                            seen.add(tempSudoku[i][j]);
                        }
                    }
                }
            }
        }

        return true;
    }

    // Solve button event
    solveBtn.addEventListener('click', () => {
        if (isSolving) return;

        // Validate user input for duplicates first
        if (!validateNoDuplicates()) {
            showMessage('Error: Duplicate numbers detected in your input!', 'error');
            return;
        }

        isSolving = true;
        showMessage('Solving...', 'info');

        // Get current grid state and create a deep copy for solving
        const inputs = grid.querySelectorAll('input');
        const solverGrid = Array(9).fill().map(() => Array(9).fill(0));
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                solverGrid[i][j] = parseInt(inputs[i * 9 + j].value) || 0;
            }
        }

        // Solve the puzzle
        setTimeout(() => {
            if (solveSudoku(solverGrid)) {
                sudoku = solverGrid;
                displayPuzzle();
                showMessage('🎉 Puzzle solved!', 'success');
            } else {
                showMessage('❌ No solution exists for this puzzle.', 'error');
            }
            isSolving = false;
        }, 100); // Small delay to show "Solving..." message
    });

    // Reset button event
    resetBtn.addEventListener('click', () => {
        displayPuzzle();
        showMessage('♻️ Puzzle reset!', 'success');
        clearInterval(timer);
        resetTimer();
    });

    // Difficulty change event
    difficultySelect.addEventListener('change', () => {
        clearInterval(timer);
        const difficulty = difficultySelect.value;
        generatePuzzle(difficulty);
        showMessage('', '');
    });

    // New game button event
    newGameBtn.addEventListener('click', () => {
        clearInterval(timer);
        const difficulty = difficultySelect.value;
        generatePuzzle(difficulty);
        hintsUsed = 0;
        showMessage('✨ New game started! Start typing to begin.', 'success');
    });

    // Hint button event
    hintBtn.addEventListener('click', () => {
        if (isSolving) {
            showMessage('⏳ Wait while solving...', 'error');
            return;
        }

        const inputs = grid.querySelectorAll('input');
        const emptyIndices = [];

        // Find all empty cells
        for (let i = 0; i < 81; i++) {
            if (inputs[i].value === '' && !inputs[i].disabled) {
                emptyIndices.push(i);
            }
        }

        if (emptyIndices.length === 0) {
            showMessage('✅ No empty cells!', 'success');
            return;
        }

        // Get a random empty cell
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const row = Math.floor(randomIndex / 9);
        const col = randomIndex % 9;

        // Find the answer using backtracking
        const tempGrid = Array(9).fill().map(() => Array(9).fill(0));
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                tempGrid[i][j] = parseInt(inputs[i * 9 + j].value) || 0;
            }
        }

        // Try each number to find valid answer
        for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(tempGrid, row, col, num)) {
                inputs[randomIndex].value = num;
                hintsUsed++;
                startTimerOnFirstInteraction();
                showMessage(`💡 Hint provided! (${hintsUsed} hints used)`, 'success');
                validateGrid();
                checkCompletion();
                return;
            }
        }

        showMessage('❌ No valid hint available for this cell.', 'error');
    });

    // Timer functions
    function startTimer() {
        clearInterval(timer);
        startTime = Date.now();
        timer = setInterval(updateTimer, 100);
        isTimerStarted = true;
    }

    function resetTimer() {
        clearInterval(timer);
        timerDisplay.textContent = 'Time: 00:00';
        startTime = null;
        isTimerStarted = false;
    }

    function updateTimer() {
        if (startTime !== null) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            timerDisplay.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Initialize the app
    initGrid();
    generatePuzzle('easy');
    showMessage('👋 Click on a cell or start typing to begin!', 'success');
});