// Game configuration
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 16;
const CELL_SIZE = 30;
const PREVIEW_CELL_SIZE = 10;

// Game state
let board = [];
let score = 0;
let linesCleared = 0;
let currentPieces = [];
let selectedPiece = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let gameOver = false;

// Canvas elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const linesElement = document.getElementById('linesValue');

// Piece definitions
const PIECE_TYPES = {
    SINGLE: [[1]],
    
    DOUBLE_2x2: [
        [1, 1],
        [1, 1]
    ],
    
    LINE_1x4: [[1, 1, 1, 1]],
    
    LINE_1x5: [[1, 1, 1, 1, 1]],
    
    SQUARE_3x3: [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ],
    
    // Standard Tetris pieces
    I_PIECE: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    
    O_PIECE: [
        [1, 1],
        [1, 1]
    ],
    
    T_PIECE: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    
    S_PIECE: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    
    Z_PIECE: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    
    J_PIECE: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    
    L_PIECE: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ]
};

// Piece colors
const PIECE_COLORS = {
    SINGLE: '#FF6B6B',
    DOUBLE_2x2: '#4ECDC4',
    LINE_1x4: '#45B7D1',
    LINE_1x5: '#96CEB4',
    SQUARE_3x3: '#FFEAA7',
    I_PIECE: '#00CED1',
    O_PIECE: '#FFD700',
    T_PIECE: '#9370DB',
    S_PIECE: '#32CD32',
    Z_PIECE: '#FF4500',
    J_PIECE: '#1E90FF',
    L_PIECE: '#FF8C00'
};

// Initialize game
function initGame() {
    // Initialize board
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    
    // Resize canvas based on screen size
    resizeCanvas();
    
    // Generate initial pieces
    generateNewPieces();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start game loop
    gameLoop();
}

function resizeCanvas() {
    const container = document.querySelector('.game-board');
    const maxWidth = container.clientWidth - 40;
    const maxHeight = container.clientHeight - 40;
    
    const aspectRatio = BOARD_WIDTH / BOARD_HEIGHT;
    let canvasWidth, canvasHeight;
    
    if (maxWidth / maxHeight > aspectRatio) {
        canvasHeight = maxHeight;
        canvasWidth = canvasHeight * aspectRatio;
    } else {
        canvasWidth = maxWidth;
        canvasHeight = canvasWidth / aspectRatio;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

function generateNewPieces() {
    const pieceTypes = Object.keys(PIECE_TYPES);
    currentPieces = [];
    
    for (let i = 0; i < 3; i++) {
        const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        currentPieces.push({
            type: randomType,
            shape: PIECE_TYPES[randomType],
            color: PIECE_COLORS[randomType],
            used: false
        });
    }
    
    updatePiecePreviews();
}

function updatePiecePreviews() {
    for (let i = 0; i < 3; i++) {
        const preview = document.getElementById(`piece${i + 1}`);
        const canvas = preview.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (currentPieces[i] && !currentPieces[i].used) {
            drawPiecePreview(ctx, currentPieces[i], canvas.width, canvas.height);
            preview.classList.remove('used');
        } else {
            preview.classList.add('used');
        }
    }
}

function drawPiecePreview(ctx, piece, canvasWidth, canvasHeight) {
    const shape = piece.shape;
    const rows = shape.length;
    const cols = shape[0].length;
    
    const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows) * 0.8;
    const offsetX = (canvasWidth - cols * cellSize) / 2;
    const offsetY = (canvasHeight - rows * cellSize) / 2;
    
    ctx.fillStyle = piece.color;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (shape[row][col]) {
                const x = offsetX + col * cellSize;
                const y = offsetY + row * cellSize;
                
                ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                
                // Add highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(x, y, cellSize - 1, cellSize / 4);
                ctx.fillStyle = piece.color;
            }
        }
    }
}

function setupEventListeners() {
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Mouse events for testing
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    // Piece selection
    for (let i = 1; i <= 3; i++) {
        const piece = document.getElementById(`piece${i}`);
        piece.addEventListener('click', () => selectPiece(i - 1));
        piece.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectPiece(i - 1);
        });
    }
    
    // Prevent default touch behaviors
    document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
}

function selectPiece(index) {
    if (currentPieces[index] && !currentPieces[index].used) {
        // Remove previous selection
        document.querySelectorAll('.piece-preview').forEach(p => p.classList.remove('selected'));
        
        selectedPiece = index;
        document.getElementById(`piece${index + 1}`).classList.add('selected');
    }
}

function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function handleTouchStart(e) {
    e.preventDefault();
    const pos = getTouchPos(e);
    handleInputStart(pos.x, pos.y);
}

function handleTouchMove(e) {
    e.preventDefault();
    const pos = getTouchPos(e);
    handleInputMove(pos.x, pos.y);
}

function handleTouchEnd(e) {
    e.preventDefault();
    handleInputEnd();
}

function handleMouseDown(e) {
    const pos = getMousePos(e);
    handleInputStart(pos.x, pos.y);
}

function handleMouseMove(e) {
    const pos = getMousePos(e);
    handleInputMove(pos.x, pos.y);
}

function handleMouseUp(e) {
    handleInputEnd();
}

function handleInputStart(x, y) {
    if (selectedPiece !== null && !currentPieces[selectedPiece].used) {
        isDragging = true;
    }
}

function handleInputMove(x, y) {
    if (isDragging && selectedPiece !== null) {
        // Update hover position for visual feedback
        const boardPos = screenToBoardCoordinates(x, y);
        drawGame(boardPos);
    }
}

function handleInputEnd() {
    if (isDragging && selectedPiece !== null) {
        const rect = canvas.getBoundingClientRect();
        // Try to place the piece
        placePiece();
    }
    isDragging = false;
}

function screenToBoardCoordinates(screenX, screenY) {
    const cellWidth = canvas.width / BOARD_WIDTH;
    const cellHeight = canvas.height / BOARD_HEIGHT;
    
    const col = Math.floor(screenX / cellWidth);
    const row = Math.floor(screenY / cellHeight);
    
    return { row, col };
}

function placePiece() {
    if (selectedPiece === null) return;
    
    const rect = canvas.getBoundingClientRect();
    const piece = currentPieces[selectedPiece];
    
    // Get the last mouse/touch position
    const lastEvent = event;
    let pos;
    
    if (lastEvent.touches || lastEvent.changedTouches) {
        pos = getTouchPos(lastEvent);
    } else {
        pos = getMousePos(lastEvent);
    }
    
    const boardPos = screenToBoardCoordinates(pos.x, pos.y);
    
    if (canPlacePiece(piece.shape, boardPos.row, boardPos.col)) {
        // Place the piece on the board
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[0].length; col++) {
                if (piece.shape[row][col]) {
                    const boardRow = boardPos.row + row;
                    const boardCol = boardPos.col + col;
                    if (boardRow >= 0 && boardRow < BOARD_HEIGHT && boardCol >= 0 && boardCol < BOARD_WIDTH) {
                        board[boardRow][boardCol] = piece.color;
                    }
                }
            }
        }
        
        // Mark piece as used
        piece.used = true;
        selectedPiece = null;
        
        // Update score
        const cellsPlaced = piece.shape.flat().filter(cell => cell === 1).length;
        score += cellsPlaced;
        
        // Check for completed lines
        checkCompletedLines();
        
        // Update UI
        updatePiecePreviews();
        updateScore();
        
        // Remove selection
        document.querySelectorAll('.piece-preview').forEach(p => p.classList.remove('selected'));
        
        // Check if all pieces are used
        if (currentPieces.every(p => p.used)) {
            generateNewPieces();
        }
        
        // Check for game over
        checkGameOver();
    }
}

function canPlacePiece(shape, startRow, startCol) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[0].length; col++) {
            if (shape[row][col]) {
                const boardRow = startRow + row;
                const boardCol = startCol + col;
                
                // Check boundaries
                if (boardRow < 0 || boardRow >= BOARD_HEIGHT || 
                    boardCol < 0 || boardCol >= BOARD_WIDTH) {
                    return false;
                }
                
                // Check if cell is already occupied
                if (board[boardRow][boardCol] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

function checkCompletedLines() {
    const completedRows = [];
    const completedCols = [];
    
    // Check rows
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        if (board[row].every(cell => cell !== 0)) {
            completedRows.push(row);
        }
    }
    
    // Check columns
    for (let col = 0; col < BOARD_WIDTH; col++) {
        let isComplete = true;
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            if (board[row][col] === 0) {
                isComplete = false;
                break;
            }
        }
        if (isComplete) {
            completedCols.push(col);
        }
    }
    
    // Clear completed lines
    let cellsCleared = 0;
    
    // Clear rows
    completedRows.forEach(row => {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            if (board[row][col] !== 0) {
                board[row][col] = 0;
                cellsCleared++;
            }
        }
    });
    
    // Clear columns
    completedCols.forEach(col => {
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            if (board[row][col] !== 0) {
                board[row][col] = 0;
                cellsCleared++;
            }
        }
    });
    
    if (cellsCleared > 0) {
        score += cellsCleared;
        linesCleared += completedRows.length + completedCols.length;
        
        // Bonus for multiple lines
        if (completedRows.length + completedCols.length > 1) {
            score += (completedRows.length + completedCols.length) * 10;
        }
    }
}

function checkGameOver() {
    // Check if any remaining piece can be placed anywhere on the board
    const availablePieces = currentPieces.filter(p => !p.used);
    
    for (const piece of availablePieces) {
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            for (let col = 0; col < BOARD_WIDTH; col++) {
                if (canPlacePiece(piece.shape, row, col)) {
                    return; // Game can continue
                }
            }
        }
    }
    
    // No moves possible - game over
    gameOver = true;
    showGameOver();
}

function showGameOver() {
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLines').textContent = linesCleared;
    document.getElementById('gameOverlay').style.display = 'flex';
}

function restartGame() {
    gameOver = false;
    score = 0;
    linesCleared = 0;
    selectedPiece = null;
    isDragging = false;
    
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    generateNewPieces();
    updateScore();
    
    document.getElementById('gameOverlay').style.display = 'none';
    document.querySelectorAll('.piece-preview').forEach(p => p.classList.remove('selected'));
}

function updateScore() {
    scoreElement.textContent = score;
    linesElement.textContent = linesCleared;
}

function drawGame(hoverPos = null) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cellWidth = canvas.width / BOARD_WIDTH;
    const cellHeight = canvas.height / BOARD_HEIGHT;
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    for (let row = 0; row <= BOARD_HEIGHT; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * cellHeight);
        ctx.lineTo(canvas.width, row * cellHeight);
        ctx.stroke();
    }
    
    for (let col = 0; col <= BOARD_WIDTH; col++) {
        ctx.beginPath();
        ctx.moveTo(col * cellWidth, 0);
        ctx.lineTo(col * cellWidth, canvas.height);
        ctx.stroke();
    }
    
    // Draw placed pieces
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            if (board[row][col] !== 0) {
                ctx.fillStyle = board[row][col];
                ctx.fillRect(col * cellWidth + 1, row * cellHeight + 1, 
                           cellWidth - 2, cellHeight - 2);
                
                // Add highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(col * cellWidth + 1, row * cellHeight + 1, 
                           cellWidth - 2, cellHeight / 4);
            }
        }
    }
    
    // Draw hover preview
    if (hoverPos && selectedPiece !== null && !currentPieces[selectedPiece].used) {
        const piece = currentPieces[selectedPiece];
        if (canPlacePiece(piece.shape, hoverPos.row, hoverPos.col)) {
            ctx.fillStyle = piece.color;
            ctx.globalAlpha = 0.5;
            
            for (let row = 0; row < piece.shape.length; row++) {
                for (let col = 0; col < piece.shape[0].length; col++) {
                    if (piece.shape[row][col]) {
                        const boardRow = hoverPos.row + row;
                        const boardCol = hoverPos.col + col;
                        
                        if (boardRow >= 0 && boardRow < BOARD_HEIGHT && 
                            boardCol >= 0 && boardCol < BOARD_WIDTH) {
                            ctx.fillRect(boardCol * cellWidth + 1, boardRow * cellHeight + 1,
                                       cellWidth - 2, cellHeight - 2);
                        }
                    }
                }
            }
            
            ctx.globalAlpha = 1.0;
        }
    }
}

function gameLoop() {
    if (!gameOver) {
        drawGame();
        requestAnimationFrame(gameLoop);
    }
}

// Start the game when page loads
window.addEventListener('load', initGame);
window.addEventListener('resize', resizeCanvas);
