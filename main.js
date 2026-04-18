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

// 前一步
function prevMove() {
    if (currentMove === 0) return;

    game.undo();
    currentMove--;
    updateBoard();
}

// 下一步
function nextMove() {
    if (currentMove >= moves.length) return;

    game.move(moves[currentMove]);
    currentMove++;
    updateBoard();
}

// 更新棋盤 + FEN
function updateBoard() {
    board.position(game.fen());
    document.getElementById("fen").textContent = game.fen();
}

// 🔥 這裡是未來接引擎的地方
function analyze() {
    const fen = game.fen();

    // ===== 暫時假資料 =====
    document.getElementById("score").textContent = "+0.34";
    document.getElementById("bestmove").textContent = "e2e4";
    document.getElementById("pv").textContent = "e2e4 e7e5 g1f3";

    // ===== 未來你要做的 =====
    // let result = engine.analyze(fen, depth=10);
    // document.getElementById("score").textContent = result.score;
    // document.getElementById("bestmove").textContent = result.bestmove;
    // document.getElementById("pv").textContent = result.pv;
}