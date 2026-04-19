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

function analyze() {
  if (!window.wasmReady) {
    console.error("WASM not ready yet");
    return;
  }

  const fen = game.fen();

  const ok = Module.ccall(
    'web_set_fen',
    'number',
    ['string'],
    [fen]
  );

  if (!ok) {
    console.error("set fen failed");
    return;
  }

  const jsonStr = Module.ccall(
    'web_analyze_depth',
    'string',
    ['number'],
    [6]
  );

  const result = JSON.parse(jsonStr);

  document.getElementById("bestmove").textContent = result.bestMove ?? "--";
  document.getElementById("score").textContent =
    result.scoreCp !== undefined ? result.scoreCp : "--";

  console.log(result);
}