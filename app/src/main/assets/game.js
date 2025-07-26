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
    // Touch events for mobile drag and drop
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Mouse events for testing
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    // Piece preview drag start
    for (let i = 1; i <= 3; i++) {
        const piece = document.getElementById(`piece${i}`);
        piece.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDragFromPreview(i - 1, e);
        }, { passive: false });
        piece.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startDragFromPreview(i - 1, e);
        });
    }
    
    // Prevent default touch behaviors
    document.addEventListener('touchstart', (e) => {
        if (e.target === canvas || e.target.classList.contains('piece-preview')) {
            e.preventDefault();
        }
    }, { passive: false });
    document.addEventListener('touchmove', (e) => {
        if (isDragging) e.preventDefault();
    }, { passive: false });
}

function startDragFromPreview(pieceIndex, e) {
    if (currentPieces[pieceIndex] && !currentPieces[pieceIndex].used) {
        selectedPiece = pieceIndex;
        isDragging = true;
        dragPiece = {
            shape: currentPieces[pieceIndex].shape,
            color: currentPieces[pieceIndex].color
        };
        
        // Get initial position
        const pos = e.touches ? getTouchPos(e) : getMousePos(e);
        dragPosition = { x: pos.x, y: pos.y };
        
        // Calculate offset from piece center
        const pieceWidth = dragPiece.shape[0].length * (canvas.width / BOARD_WIDTH);
        const pieceHeight = dragPiece.shape.length * (canvas.height / BOARD_HEIGHT);
        dragOffset = {
            x: pieceWidth / 2,
            y: pieceHeight / 2
        };
        
        // Visual feedback
        document.querySelectorAll('.piece-preview').forEach(p => p.classList.remove('selected'));
        document.getElementById(`piece${pieceIndex + 1}`).classList.add('selected');
        document.getElementById(`piece${pieceIndex + 1}`).style.opacity = '0.5';
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
    // Only start drag if not already dragging from preview
    if (!isDragging) {
        handleInputStart(pos.x, pos.y);
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (isDragging) {
        const pos = getTouchPos(e);
        handleInputMove(pos.x, pos.y);
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (isDragging) {
        const pos = e.changedTouches ? 
            { x: e.changedTouches[0].clientX - canvas.getBoundingClientRect().left,
              y: e.changedTouches[0].clientY - canvas.getBoundingClientRect().top } :
            dragPosition;
        handleInputEnd(pos.x, pos.y);
    }
}

function handleMouseDown(e) {
    const pos = getMousePos(e);
    if (!isDragging) {
        handleInputStart(pos.x, pos.y);
    }
}

function handleMouseMove(e) {
    if (isDragging) {
        const pos = getMousePos(e);
        handleInputMove(pos.x, pos.y);
    }
}

function handleMouseUp(e) {
    if (isDragging) {
        const pos = getMousePos(e);
        handleInputEnd(pos.x, pos.y);
    }
}

function handleInputStart(x, y) {
    // This function is now mainly for starting drag from canvas
    // Most drag starts will come from startDragFromPreview
}

function handleInputMove(x, y) {
    if (isDragging && dragPiece) {
        // Update drag position
        dragPosition = { x: x, y: y };
        
        // Redraw game with drag preview
        drawGame();
        drawDragPreview();
    }
}

function handleInputEnd(x, y) {
    if (isDragging && dragPiece && selectedPiece !== null) {
        // Try to place the piece at the drop position
        const boardPos = screenToBoardCoordinates(x - dragOffset.x, y - dragOffset.y);
        
        if (canPlacePiece(dragPiece.shape, boardPos.row, boardPos.col)) {
            placePieceOnBoard(dragPiece.shape, dragPiece.color, boardPos.row, boardPos.col);
            
            // Mark piece as used
            currentPieces[selectedPiece].used = true;
            document.getElementById(`piece${selectedPiece + 1}`).style.opacity = '0.3';
            
            // Clear completed lines
            clearCompletedLines();
            
            // Check if all pieces are used
            if (currentPieces.every(p => p.used)) {
                generateNewPieces();
            }
            
            // Check for game over
            checkGameOver();
        }
        
        // Reset drag state
        isDragging = false;
        dragPiece = null;
        selectedPiece = null;
        
        // Reset piece preview opacity
        document.querySelectorAll('.piece-preview').forEach(p => {
            p.style.opacity = '1';
            p.classList.remove('selected');
        });
        
        // Redraw without drag preview
        drawGame();
    }
}

function drawDragPreview() {
    if (!isDragging || !dragPiece) return;
    
    const cellWidth = canvas.width / BOARD_WIDTH;
    const cellHeight = canvas.height / BOARD_HEIGHT;
    
    // Calculate board position for placement preview
    const boardPos = screenToBoardCoordinates(dragPosition.x - dragOffset.x, dragPosition.y - dragOffset.y);
    
    // Draw placement preview on board (semi-transparent)
    if (canPlacePiece(dragPiece.shape, boardPos.row, boardPos.col)) {
        ctx.globalAlpha = 0.5;
        for (let row = 0; row < dragPiece.shape.length; row++) {
            for (let col = 0; col < dragPiece.shape[0].length; col++) {
                if (dragPiece.shape[row][col]) {
                    const x = (boardPos.col + col) * cellWidth;
                    const y = (boardPos.row + row) * cellHeight;
                    
                    if (boardPos.row + row >= 0 && boardPos.row + row < BOARD_HEIGHT &&
                        boardPos.col + col >= 0 && boardPos.col + col < BOARD_WIDTH) {
                        ctx.fillStyle = dragPiece.color;
                        ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1);
                    }
                }
            }
        }
        ctx.globalAlpha = 1.0;
    }
    
    // Draw the dragging piece following the finger/mouse
    ctx.globalAlpha = 0.8;
    for (let row = 0; row < dragPiece.shape.length; row++) {
        for (let col = 0; col < dragPiece.shape[0].length; col++) {
            if (dragPiece.shape[row][col]) {
                const x = dragPosition.x - dragOffset.x + (col * cellWidth);
                const y = dragPosition.y - dragOffset.y + (row * cellHeight);
                
                ctx.fillStyle = dragPiece.color;
                ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1);
                
                // Add border for better visibility
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cellWidth - 1, cellHeight - 1);
            }
        }
    }
    ctx.globalAlpha = 1.0;
}

function screenToBoardCoordinates(screenX, screenY) {
    const cellWidth = canvas.width / BOARD_WIDTH;
    const cellHeight = canvas.height / BOARD_HEIGHT;
    
    const col = Math.floor(screenX / cellWidth);
    const row = Math.floor(screenY / cellHeight);
    
    return { row: Math.max(0, Math.min(row, BOARD_HEIGHT - 1)), 
             col: Math.max(0, Math.min(col, BOARD_WIDTH - 1)) };
}

function placePieceOnBoard(shape, color, startRow, startCol) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[0].length; col++) {
            if (shape[row][col]) {
                const boardRow = startRow + row;
                const boardCol = startCol + col;
                if (boardRow >= 0 && boardRow < BOARD_HEIGHT && 
                    boardCol >= 0 && boardCol < BOARD_WIDTH) {
                    board[boardRow][boardCol] = color;
                }
            }
        }
    }
    
    // Update score
    const pieceSize = shape.flat().filter(cell => cell).length;
    score += pieceSize;
    updateScore();
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

function drawGame() {
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
}

function gameLoop() {
    if (!gameOver) {
        drawGame();
        if (isDragging) {
            drawDragPreview();
        }
        requestAnimationFrame(gameLoop);
    }
}

// Start the game when page loads
window.addEventListener('load', initGame);
window.addEventListener('resize', resizeCanvas);
