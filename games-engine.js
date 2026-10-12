/**
 * ROLL & ROW RETRO ARCADE - ACTIVE GAMES ENGINE
 * Retained Games: Tic-Tac-Toe Neon, Dots & Boxes Cyber, Card Memory Match, Cyber Calculator.
 * Viswajeet Studio
 */

/* ================= TIC TAC TOE ================= */
const tttBoardEl = document.getElementById('tttBoard');
const tttStatus = document.getElementById('tttStatus');
let tttCells = Array(9).fill(null);
let tttTurn = 'X';
let tttOver = false;
let tttMode = 'pvp';
let scores = {X:0, O:0, D:0};
const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];
function buildTttBoard(){
  tttBoardEl.innerHTML='';
  for(let i=0;i<9;i++){
    const c = document.createElement('div');
    c.className = 'ttt-cell';
    c.dataset.i = i;
    c.addEventListener('click', onTttClick);
    tttBoardEl.appendChild(c);
  }
}
buildTttBoard();
function onTttClick(e){
  const i = +e.currentTarget.dataset.i;
  if(tttOver || tttCells[i]) return;
  if(tttMode==='cpu' && tttTurn==='O') return;
  placeMark(i, tttTurn);
}
function placeMark(i, mark){
  tttCells[i] = mark;
  const cellEl = tttBoardEl.children[i];
  cellEl.textContent = mark;
  cellEl.classList.add(mark.toLowerCase());
  const result = checkWin();
  if(result){
    tttOver = true;
    if(result.win){
      result.line.forEach(idx=>tttBoardEl.children[idx].classList.add('win'));
      scores[result.mark]++;
      tttStatus.textContent = `${result.mark} wins the round!`;
    } else {
      scores.D++;
      tttStatus.textContent = "It's a draw.";
    }
    updateScores();
    return;
  }
  tttTurn = tttTurn==='X' ? 'O' : 'X';
  tttStatus.textContent = `${tttTurn}'s turn`;
  if(tttMode==='cpu' && tttTurn==='O' && !tttOver){
    setTimeout(cpuMove, 450);
  }
}
function checkWin(){
  for(const line of wins){
    const [a,b,c] = line;
    if(tttCells[a] && tttCells[a]===tttCells[b] && tttCells[a]===tttCells[c]){
      return {win:true, mark:tttCells[a], line};
    }
  }
  if(tttCells.every(v=>v)) return {win:false};
  return null;
}
function cpuMove(){
  if(tttOver) return;
  const empty = tttCells.map((v,i)=>v?null:i).filter(v=>v!==null);
  const tryFind = (mark)=>{
    for(const line of wins){
      const vals = line.map(i=>tttCells[i]);
      const marks = vals.filter(v=>v===mark).length;
      const blanks = line.filter(i=>!tttCells[i]);
      if(marks===2 && blanks.length===1) return blanks[0];
    }
    return null;
  };
  let choice = tryFind('O');
  if(choice===null) choice = tryFind('X');
  if(choice===null && !tttCells[4]) choice = 4;
  if(choice===null){
    const corners = [0,2,6,8].filter(i=>!tttCells[i]);
    if(corners.length) choice = corners[Math.floor(Math.random()*corners.length)];
  }
  if(choice===null) choice = empty[Math.floor(Math.random()*empty.length)];
  placeMark(choice, 'O');
}
function updateScores(){
  document.getElementById('scoreX').textContent = scores.X;
  document.getElementById('scoreO').textContent = scores.O;
  document.getElementById('scoreD').textContent = scores.D;
}
document.getElementById('tttReset').addEventListener('click', ()=>{
  tttCells = Array(9).fill(null);
  tttTurn = 'X';
  tttOver = false;
  buildTttBoard();
  tttStatus.textContent = "X's turn";
});
document.getElementById('tttMode').addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  document.querySelectorAll('#tttMode button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  tttMode = btn.dataset.mode;
  tttCells = Array(9).fill(null);
  tttTurn = 'X';
  tttOver = false;
  buildTttBoard();
  tttStatus.textContent = "X's turn";
});



/* ================= DOTS AND BOXES ================= */
let dotsGridSize = 6; 
let dotsCellSize = 70; 
let dotsDotSize = 16; 
let dotsLineThickness = 16; 

let dotsHorizontalLines = [];
let dotsVerticalLines = [];
let dotsBoxes = [];
let dotsCurrentPlayer = 1;
let dotsScores = { 1: 0, 2: 0 };
let dotsTotalBoxes = (dotsGridSize - 1) * (dotsGridSize - 1);
let dotsPlayingVsBot = false;

const dotsBoardEl = document.getElementById('dots-board');

function dotsChangeTheme(theme) {
  const wrapper = document.getElementById('dotsWrapper');
  wrapper.setAttribute('data-theme', theme);
}

function dotsInitGame(vsBot) {
  dotsPlayingVsBot = vsBot;
  document.getElementById('dots-p2-name').innerText = vsBot ? "AI Bot" : "Player 2";

  dotsBoardEl.innerHTML = '';
  dotsHorizontalLines = Array.from({ length: dotsGridSize }, () => Array(dotsGridSize - 1).fill(false));
  dotsVerticalLines = Array.from({ length: dotsGridSize - 1 }, () => Array(dotsGridSize).fill(false));
  dotsBoxes = Array.from({ length: dotsGridSize - 1 }, () => Array(dotsGridSize - 1).fill(0));
  
  dotsCurrentPlayer = 1;
  dotsScores = { 1: 0, 2: 0 };
  dotsUpdateScoreUI();
  document.getElementById('dotsWinnerModal').classList.remove('show');

  const boardWidth = (dotsGridSize - 1) * dotsCellSize;
  dotsBoardEl.style.width = `${boardWidth}px`;
  dotsBoardEl.style.height = `${boardWidth}px`;

  dotsCreateElements();
}

function dotsCreateElements() {
  const offset = dotsDotSize / 2;

  for (let r = 0; r < dotsGridSize - 1; r++) {
    for (let c = 0; c < dotsGridSize - 1; c++) {
      const box = document.createElement('div');
      box.classList.add('dots-box');
      box.id = `dots-box-${r}-${c}`;
      box.style.top = `${r * dotsCellSize + offset}px`;
      box.style.left = `${c * dotsCellSize + offset}px`;
      box.style.width = `${dotsCellSize}px`;
      box.style.height = `${dotsCellSize}px`;
      dotsBoardEl.appendChild(box);
    }
  }

  for (let r = 0; r < dotsGridSize; r++) {
    for (let c = 0; c < dotsGridSize - 1; c++) {
      const line = document.createElement('div');
      line.classList.add('dots-line');
      line.id = `dots-h-${r}-${c}`;
      line.style.top = `${r * dotsCellSize + offset - dotsLineThickness / 2}px`;
      line.style.left = `${c * dotsCellSize + offset}px`;
      line.style.width = `${dotsCellSize}px`;
      line.style.height = `${dotsLineThickness}px`;
      line.addEventListener('click', () => dotsHandleLineClick('h', r, c, line));
      dotsBoardEl.appendChild(line);
    }
  }

  for (let r = 0; r < dotsGridSize - 1; r++) {
    for (let c = 0; c < dotsGridSize; c++) {
      const line = document.createElement('div');
      line.classList.add('dots-line');
      line.id = `dots-v-${r}-${c}`;
      line.style.top = `${r * dotsCellSize + offset}px`;
      line.style.left = `${c * dotsCellSize + offset - dotsLineThickness / 2}px`;
      line.style.width = `${dotsLineThickness}px`;
      line.style.height = `${dotsCellSize}px`;
      line.addEventListener('click', () => dotsHandleLineClick('v', r, c, line));
      dotsBoardEl.appendChild(line);
    }
  }

  for (let r = 0; r < dotsGridSize; r++) {
    for (let c = 0; c < dotsGridSize; c++) {
      const dot = document.createElement('div');
      dot.classList.add('dots-dot');
      dot.style.width = `${dotsDotSize}px`;
      dot.style.height = `${dotsDotSize}px`;
      dot.style.top = `${r * dotsCellSize}px`;
      dot.style.left = `${c * dotsCellSize}px`;
      dotsBoardEl.appendChild(dot);
    }
  }
}

function dotsHandleLineClick(type, r, c, element, isBotAction = false) {
  if (dotsPlayingVsBot && dotsCurrentPlayer === 2 && !isBotAction) return;
  if (type === 'h' && dotsHorizontalLines[r][c]) return;
  if (type === 'v' && dotsVerticalLines[r][c]) return;

  if (type === 'h') dotsHorizontalLines[r][c] = true;
  else dotsVerticalLines[r][c] = true;

  element.classList.add('claimed', `p${dotsCurrentPlayer}`);

  let boxCompleted = dotsCheckBoxes(type, r, c);

  if (boxCompleted) {
    if (dotsScores[1] + dotsScores[2] === dotsTotalBoxes) {
      dotsEndGame();
    } else if (dotsPlayingVsBot && dotsCurrentPlayer === 2) {
      setTimeout(dotsMakeBotMove, 800); 
    }
  } else {
    dotsCurrentPlayer = dotsCurrentPlayer === 1 ? 2 : 1;
    dotsUpdateScoreUI();
    
    if (dotsPlayingVsBot && dotsCurrentPlayer === 2) {
      setTimeout(dotsMakeBotMove, 800); 
    }
  }
}

function dotsCheckBoxes(type, r, c) {
  let scored = false;
  if (type === 'h') {
    if (r > 0) scored = dotsEvaluateBox(r - 1, c) || scored;
    if (r < dotsGridSize - 1) scored = dotsEvaluateBox(r, c) || scored;
  } else if (type === 'v') {
    if (c > 0) scored = dotsEvaluateBox(r, c - 1) || scored;
    if (c < dotsGridSize - 1) scored = dotsEvaluateBox(r, c) || scored;
  }
  return scored;
}

function dotsEvaluateBox(r, c) {
  if (dotsHorizontalLines[r][c] && dotsHorizontalLines[r + 1][c] && dotsVerticalLines[r][c] && dotsVerticalLines[r][c + 1]) {
    if (dotsBoxes[r][c] !== 0) return false;

    dotsBoxes[r][c] = dotsCurrentPlayer;
    dotsScores[dotsCurrentPlayer]++;
    
    const boxEl = document.getElementById(`dots-box-${r}-${c}`);
    boxEl.classList.add(`p${dotsCurrentPlayer}`);
    
    document.getElementById(`dots-score${dotsCurrentPlayer}`).innerText = dotsScores[dotsCurrentPlayer];
    return true;
  }
  return false;
}

function dotsUpdateScoreUI() {
  const p1Panel = document.getElementById('dots-p1-panel');
  const p2Panel = document.getElementById('dots-p2-panel');

  if (dotsCurrentPlayer === 1) {
    p1Panel.classList.add('active-p1');
    p2Panel.classList.remove('active-p2');
  } else {
    p2Panel.classList.add('active-p2');
    p1Panel.classList.remove('active-p1');
  }
}

function dotsCountLines(r, c) {
  let count = 0;
  if (dotsHorizontalLines[r][c]) count++;
  if (dotsHorizontalLines[r + 1][c]) count++;
  if (dotsVerticalLines[r][c]) count++;
  if (dotsVerticalLines[r][c + 1]) count++;
  return count;
}

function dotsMakeBotMove() {
  if (dotsCurrentPlayer !== 2) return;
  if (dotsScores[1] + dotsScores[2] === dotsTotalBoxes) return; 

  let emptyLines = [];
  
  for (let r = 0; r < dotsGridSize; r++) {
    for (let c = 0; c < dotsGridSize - 1; c++) {
      if (!dotsHorizontalLines[r][c]) emptyLines.push({ type: 'h', r, c });
    }
  }
  for (let r = 0; r < dotsGridSize - 1; r++) {
    for (let c = 0; c < dotsGridSize; c++) {
      if (!dotsVerticalLines[r][c]) emptyLines.push({ type: 'v', r, c });
    }
  }

  if (emptyLines.length === 0) return;

  let chosenLine = null;
  let safeLines = [];

  for (let line of emptyLines) {
    if (line.type === 'h') {
      if (line.r > 0 && dotsCountLines(line.r - 1, line.c) === 3) chosenLine = line;
      if (line.r < dotsGridSize - 1 && dotsCountLines(line.r, line.c) === 3) chosenLine = line;
    } else {
      if (line.c > 0 && dotsCountLines(line.r, line.c - 1) === 3) chosenLine = line;
      if (line.c < dotsGridSize - 1 && dotsCountLines(line.r, line.c) === 3) chosenLine = line;
    }
    if (chosenLine) break; 
  }

  if (!chosenLine) {
    for (let line of emptyLines) {
      let isSafe = true;
      if (line.type === 'h') {
        if (line.r > 0 && dotsCountLines(line.r - 1, line.c) === 2) isSafe = false;
        if (line.r < dotsGridSize - 1 && dotsCountLines(line.r, line.c) === 2) isSafe = false;
      } else {
        if (line.c > 0 && dotsCountLines(line.r, line.c - 1) === 2) isSafe = false;
        if (line.c < dotsGridSize - 1 && dotsCountLines(line.r, line.c) === 2) isSafe = false;
      }
      if (isSafe) safeLines.push(line);
    }

    if (safeLines.length > 0) {
      chosenLine = safeLines[Math.floor(Math.random() * safeLines.length)]; 
    } else {
      chosenLine = emptyLines[Math.floor(Math.random() * emptyLines.length)]; 
    }
  }

  let elementId = chosenLine.type === 'h' ? `dots-h-${chosenLine.r}-${chosenLine.c}` : `dots-v-${chosenLine.r}-${chosenLine.c}`;
  let el = document.getElementById(elementId);
  dotsHandleLineClick(chosenLine.type, chosenLine.r, chosenLine.c, el, true);
}

function dotsEndGame() {
  const modal = document.getElementById('dotsWinnerModal');
  const winnerText = document.getElementById('dotsWinnerText');

  if (dotsScores[1] > dotsScores[2]) {
    winnerText.innerText = 'Player 1 Wins!';
    winnerText.style.color = 'var(--dots-p1-color)';
  } else if (dotsScores[2] > dotsScores[1]) {
    winnerText.innerText = dotsPlayingVsBot ? 'AI Bot Wins!' : 'Player 2 Wins!';
    winnerText.style.color = 'var(--dots-p2-color)';
  } else {
    winnerText.innerText = 'It\'s a Tie!';
    winnerText.style.color = 'var(--dots-text-main)';
  }

  modal.classList.add('show');
}

// Init Dots and Boxes game on load
dotsInitGame(false);




/* ================= CARD MATCHING GAME (MEMORY) ================= */
const memoryGameBoard = document.getElementById('memory-game-board');
const memoryStartBtn = document.getElementById('memory-start-btn');
const memoryStatusMessage = document.getElementById('memory-status-message');
const memoryP1Panel = document.getElementById('memory-p1-panel');
const memoryP2Panel = document.getElementById('memory-p2-panel');
const memoryP1ScoreDisplay = document.getElementById('memory-p1-score');
const memoryP2ScoreDisplay = document.getElementById('memory-p2-score');

const memoryEmojiPool = [
    '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
    '🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆',
    '🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋',
    '🐌','🐞','🐜','🦟','🐢','🐍','🦎','🦖','🦕','🐙',
    '🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🦈'
];

let memoryCards = [];
let memoryFlippedCards = [];
let memoryCurrentPlayer = 1;
let memoryScores = { 1: 0, 2: 0 };
let memoryLockBoard = true; 
let memoryTotalPairs = 0;
let memoryMatchedPairs = 0;
let memoryCountdownInterval;

function memoryStartGame() {
    clearInterval(memoryCountdownInterval);
    
    const size = parseInt(document.getElementById('memory-grid-size').value);
    memoryTotalPairs = (size * size) / 2;
    
    document.getElementById('view-memory').style.setProperty('--memory-grid-size', size);
    
    memoryGameBoard.innerHTML = '';
    memoryFlippedCards = [];
    memoryCurrentPlayer = 1;
    memoryScores = { 1: 0, 2: 0 };
    memoryMatchedPairs = 0;
    memoryLockBoard = true; 
    
    memoryUpdateUI();

    let selectedEmojis = memoryEmojiPool.slice(0, memoryTotalPairs);
    memoryCards = [...selectedEmojis, ...selectedEmojis];
    memoryShuffle(memoryCards);

    memoryCards.forEach((symbol) => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.symbol = symbol;
        
        card.innerHTML = `
            <div class="memory-card-back"></div>
            <div class="memory-card-face">${symbol}</div>
        `;
        
        card.addEventListener('click', memoryFlipCard);
        memoryGameBoard.appendChild(card);
    });

    memoryStartPreview(size);
}

function memoryStartPreview(size) {
    memoryStartBtn.disabled = true;
    let timeLeft = size; 
    
    memoryStatusMessage.innerHTML = `Memorize the cards! <span style="color: #ff4757;">(${timeLeft}s)</span>`;

    const allCards = document.querySelectorAll('.memory-card');
    
    setTimeout(() => {
        allCards.forEach(card => card.classList.add('flipped'));
    }, 100);

    memoryCountdownInterval = setInterval(() => {
        timeLeft--;
        
        if (timeLeft > 0) {
            memoryStatusMessage.innerHTML = `Memorize the cards! <span style="color: #ff4757;">(${timeLeft}s)</span>`;
        } else {
            clearInterval(memoryCountdownInterval);
            allCards.forEach(card => card.classList.remove('flipped'));
            memoryLockBoard = false;
            memoryStartBtn.disabled = false;
            
            memoryStatusMessage.innerText = "Player 1's Turn";
            memoryStatusMessage.style.color = "var(--p1-color)";
        }
    }, 1000);
}

function memoryShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function memoryFlipCard() {
    if (memoryLockBoard) return;
    if (this === memoryFlippedCards[0]) return;
    if (this.classList.contains('matched-p1') || this.classList.contains('matched-p2')) return;

    this.classList.add('flipped');
    memoryFlippedCards.push(this);

    if (memoryFlippedCards.length === 2) {
        memoryCheckForMatch();
    }
}

function memoryCheckForMatch() {
    const isMatch = memoryFlippedCards[0].dataset.symbol === memoryFlippedCards[1].dataset.symbol;

    if (isMatch) {
        memoryHandleMatch();
    } else {
        memoryHandleMismatch();
    }
}

function memoryHandleMatch() {
    memoryLockBoard = true;
    
    setTimeout(() => {
        memoryFlippedCards[0].classList.add(`matched-p${memoryCurrentPlayer}`);
        memoryFlippedCards[1].classList.add(`matched-p${memoryCurrentPlayer}`);
        
        memoryScores[memoryCurrentPlayer]++;
        memoryMatchedPairs++;
        memoryUpdateUI();
        
        memoryFlippedCards = [];
        
        if (memoryMatchedPairs === memoryTotalPairs) {
            memoryDeclareWinner();
        } else {
            memoryStatusMessage.innerText = `Player ${memoryCurrentPlayer} got a match! Go again.`;
            memoryLockBoard = false;
        }
    }, 500);
}

function memoryHandleMismatch() {
    memoryLockBoard = true;

    setTimeout(() => {
        memoryFlippedCards[0].classList.remove('flipped');
        memoryFlippedCards[1].classList.remove('flipped');
        
        memoryCurrentPlayer = memoryCurrentPlayer === 1 ? 2 : 1;
        memoryFlippedCards = [];
        memoryLockBoard = false;
        
        memoryUpdateUI();
        memoryStatusMessage.innerText = `Player ${memoryCurrentPlayer}'s Turn`;
        memoryStatusMessage.style.color = memoryCurrentPlayer === 1 ? "var(--p1-color)" : "var(--p2-color)";
        
    }, 1000);
}

function memoryUpdateUI() {
    memoryP1ScoreDisplay.innerText = memoryScores[1];
    memoryP2ScoreDisplay.innerText = memoryScores[2];
    
    if (memoryCurrentPlayer === 1) {
        memoryP1Panel.classList.add('memory-active-p1');
        memoryP2Panel.classList.remove('memory-active-p2');
    } else {
        memoryP2Panel.classList.add('memory-active-p2');
        memoryP1Panel.classList.remove('memory-active-p1');
    }
}

function memoryDeclareWinner() {
    let winText = "";
    let color = "#4cd137"; 

    if (memoryScores[1] > memoryScores[2]) {
        winText = "Player 1 Wins!";
        color = "var(--p1-color)";
    } else if (memoryScores[2] > memoryScores[1]) {
        winText = "Player 2 Wins!";
        color = "var(--p2-color)";
    } else {
        winText = "It's a Tie!";
        color = "var(--gold)";
    }

    memoryStatusMessage.innerText = `Game Over! ${winText}`;
    memoryStatusMessage.style.color = color;
    memoryP1Panel.classList.add('memory-active-p1');
    memoryP2Panel.classList.add('memory-active-p2');
}

// Start memory game setup logic
memoryStartGame();




/* ================= AUDIO BEEP HELPER ================= */
let _audioCtx = null;
function unlockAudio() {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
  } catch(e) {}
  document.removeEventListener('click', unlockAudio);
  document.removeEventListener('keydown', unlockAudio);
}
document.addEventListener('click', unlockAudio);
document.addEventListener('keydown', unlockAudio);

function beep(freq=880, duration=180, delay=0){
  try{
    if(!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const t0 = _audioCtx.currentTime + delay;
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.25, t0+0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0+duration/1000);
    osc.connect(gain).connect(_audioCtx.destination);
    osc.start(t0);
    osc.stop(t0+duration/1000+0.02);
  }catch(e){ }
}

/* ================= CALCULATOR ================= */
const calcPrevEl = document.getElementById('calcPrev');
const calcCurrEl = document.getElementById('calcCurr');
let calc = { curr:'0', prev:'', op:null, resetNext:false };
function calcFormat(numStr){
  if(numStr==='' || numStr==='-') return numStr;
  const n = parseFloat(numStr);
  if(isNaN(n)) return '0';
  if(!isFinite(n)) return 'Error';
  let str = numStr.includes('.') ? numStr : n.toString();
  if(Math.abs(n) >= 1e12) str = n.toExponential(4);
  return str;
}
function calcRender(){
  if (calcCurrEl) calcCurrEl.textContent = calcFormat(calc.curr);
  if (calcPrevEl) calcPrevEl.textContent = calc.prev ? `${calc.prev} ${calc.op||''}` : '\u00A0';
}
function calcClear(){ calc = { curr:'0', prev:'', op:null, resetNext:false }; calcRender(); }
function calcDigit(d){
  if(calc.resetNext){ calc.curr = ''; calc.resetNext = false; }
  if(d==='.' && calc.curr.includes('.')) return;
  if(calc.curr==='0' && d!=='.') calc.curr = d;
  else calc.curr += d;
  calcRender();
}
function calcBackspace(){
  if(calc.resetNext) return;
  calc.curr = calc.curr.slice(0,-1);
  if(calc.curr===''||calc.curr==='-') calc.curr = '0';
  calcRender();
}
function calcSign(){
  if(calc.curr==='0') return;
  calc.curr = calc.curr.startsWith('-') ? calc.curr.slice(1) : '-'+calc.curr;
  calcRender();
}
function calcPercent(){
  calc.curr = String(parseFloat(calc.curr||'0')/100);
  calcRender();
}
function calcCompute(a,b,op){
  a = parseFloat(a); b = parseFloat(b);
  let result;
  switch(op){
    case '+': result = a+b; break;
    case '−': result = a-b; break;
    case '×': result = a*b; break;
    case '÷': result = b===0 ? NaN : a/b; break;
    default: return b;
  }
  return parseFloat(result.toPrecision(12));
}
function calcChooseOp(op){
  if(calc.op && !calc.resetNext){
    calc.curr = String(calcCompute(calc.prev, calc.curr, calc.op));
  }
  calc.prev = calc.curr;
  calc.op = op;
  calc.resetNext = true;
  calcRender();
}
function calcEquals(){
  if(!calc.op) return;
  calc.curr = String(calcCompute(calc.prev, calc.curr, calc.op));
  calc.prev = '';
  calc.op = null;
  calc.resetNext = true;
  calcRender();
}
const _cg = document.getElementById('calcGrid');
if (_cg) _cg.addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  if(btn.dataset.digit!==undefined) calcDigit(btn.dataset.digit);
  else if(btn.dataset.op) calcChooseOp(btn.dataset.op);
  else if(btn.dataset.act==='clear') calcClear();
  else if(btn.dataset.act==='back') calcBackspace();
  else if(btn.dataset.act==='sign') calcSign();
  else if(btn.dataset.act==='percent') calcPercent();
  else if(btn.dataset.act==='equals') calcEquals();
});
const _cr = document.getElementById('calcResetBtn');
if (_cr) _cr.addEventListener('click', calcClear);
document.addEventListener('keydown', (e)=>{
  const view = document.getElementById('view-calc');
  if(!view.classList.contains('active')) return;
  if(e.key>=  '0' && e.key<='9') calcDigit(e.key);
  else if(e.key==='.') calcDigit('.');
  else if(e.key==='+') calcChooseOp('+');
  else if(e.key==='-') calcChooseOp('−');
  else if(e.key==='*') calcChooseOp('×');
  else if(e.key==='/'){ e.preventDefault(); calcChooseOp('÷'); }
  else if(e.key==='Enter' || e.key==='='){ e.preventDefault(); calcEquals(); }
  else if(e.key==='Backspace') calcBackspace();
  else if(e.key==='Escape') calcClear();
  else if(e.key==='%') calcPercent();
});
calcRender();
