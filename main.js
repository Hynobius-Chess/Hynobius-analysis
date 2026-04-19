let board = null;
let game = new Chess();

let moves = [];
let currentMove = 0;

// 初始化棋盤
window.onload = function () {
    board = Chessboard('board', {
        position: 'start',
        pieceTheme: 'lib/chessboardjs-1.0.0/img/chesspieces/wikipedia/{piece}.png'
    });

    const observer = new ResizeObserver(() => {
        board.resize();
    });

    observer.observe(
        document.getElementById('board-wrap')
    );
};

// 載入 PGN
function loadPGN() {
    const pgn = document.getElementById("pgnInput").value;

    game.reset();
    game.load_pgn(pgn);

    moves = game.history();
    currentMove = 0;

    game.reset();
    updateBoard();
    renderMoves();
}

// 顯示棋譜
function renderMoves() {
    let html = "";
    for (let i = 0; i < moves.length; i++) {
        html += (i + 1) + ". " + moves[i] + "<br>";
    }
    document.getElementById("moves").innerHTML = html;
}

// Prev / Next move by arrow keys
document.addEventListener("keydown", function (event) {
    const tag = document.activeElement.tagName;

    if (tag === "TEXTAREA" || tag === "INPUT") {
        return;
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevMove();
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        nextMove();
    }
});

// 前一步
function prevMove() {
    if (currentMove === 0) return;

    game.undo();
    currentMove--;
    updateBoard();
    analyze();
}

// 下一步
function nextMove() {
    if (currentMove >= moves.length) return;

    game.move(moves[currentMove]);
    currentMove++;
    updateBoard();
    analyze();
}

// 更新棋盤 + FEN
function updateBoard() {
    board.position(game.fen());
    document.getElementById("fen").textContent = game.fen();
}

const engineWorker = new Worker("engine-worker.js");

let workerReady = false;
let analyzeVersion = 0;
let analyzeTimer = null;

engineWorker.onmessage = function (event) {
    const data = event.data;

    if (data.type === "ready") {
        workerReady = true;
        console.log("worker wasm ready");
        return;
    }

    const { version, result } = data;

    if (version !== analyzeVersion) return;

    document.getElementById("bestmove").textContent = result.bestMove ?? "--";
    document.getElementById("pv").textContent = result.pv ?? "--";
};

function analyze() {
    if (!window.wasmReady) {
        console.error("WASM not ready yet");
        return;
    }

    clearTimeout(analyzeTimer);

    const fen = game.fen();
    const version = ++analyzeVersion;

    analyzeTimer = setTimeout(() => {
        engineWorker.postMessage({
        type: "analyze",
        fen,
        depth: 4,
        version
        });
    }, 120);
}