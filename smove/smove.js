var canvas,
    ctx,
    w = 640, // iphone's width and height (forgotten which version)
    h = 1136,
    ratio = w / h,
    cell_sz = null,
    cell_num = null,
    ship_r = null,
    meteo_num = 1,
    meteo_left = [],
    meteo_right = [],
    meteo_up = [],
    meteo_down = [],
    meteo_collection = [meteo_down, meteo_up, meteo_left, meteo_right],
    meteo_v = null,
    meteo_v_base = 6,
    meteo_r = null,
    meteo_inter = null,
    meteo_inter_base = 1300,
    amination = null,
    creation = null,
    gameover_timer = null,
    candy,
    candy_sz = null,
    candy_v = Math.PI / 400,
    score = 0,
    player = null,
    touch_x,
    touch_y,
    colors = [],
    level = 0,
    best = 0,
    isMobile = null,
    trans_pos = null,
    trans_pos_base = 0.85,
    trans_v = 0.02,
    color_idx = 0;

// ===================== tools ===============================================

function getCellCenter(x, y) {
  var brd_center_x = w / 2;
  var brd_center_y = h / 2;
  var tgt_center_x = brd_center_x - (Math.floor(cell_num / 2) - x) * cell_sz;
  var tgt_center_y = brd_center_y - (Math.floor(cell_num / 2) - y) * cell_sz;
  return [tgt_center_x, tgt_center_y];
}

class Meteo {
  constructor() {
    var direction = arguments[0];
    var line = arguments[1];
    this.r = meteo_r;
    switch (direction) {
      case 0: // left
        this.x = w + meteo_r;
        meteo_left.push(this);
        break;
      case 3: // right
        this.x = 0 - meteo_r;
        meteo_right.push(this);
        break;
      case 2: // up
        this.y = h + meteo_r;
        meteo_up.push(this);
        break;
      case 1: // down
        this.y = 0 - meteo_r;
        meteo_down.push(this);
        break;
      default:
        console.log(direction);
        console.log("Error in metoe constructor (direction).");
    }
    switch (direction) {
      case 0:
      case 3:
        this.y = getCellCenter(0, line)[1];
        break;
      case 2:
      case 1:
        this.x = getCellCenter(line, 0)[0];
        break;
      default:
        console.log(line);
        console.log("Error in metoe constructor (line).");
    }
    if (arguments.length == 2) {
      this.v = meteo_v;
    }
    else {
      this.v = arguments[2];
    }
  }
}

class Ship {
  constructor() {
    [this.x, this.y] = getCellCenter(1, 1);
    this.cx = 1;
    this.cy = 1;
    this.r = ship_r;
    this.color = "#FFFFFF";
  }
}

class Candy {
  constructor(cell_x, cell_y) {
    this.cx = cell_x;
    this.cy = cell_y;
    [this.x, this.y] = getCellCenter(this.cx, this.cy);
    this.rad = 0;
    this.color = "#0000C6";
    this.color_s = "#FFD700";
    this.r = candy_sz;
    this.v = candy_v;
    this.shrink = true;
  }
}

class Color {
  constructor(a, b) {
    this.start = a;
    this.end = b;
  }
}

// ============================ logic ========================================

function createMeteo() {
  var pattern = randInt(level + 1);
  switch (pattern) {
    case 0:
      aPattern();
      break;
    case 1:
      bPattern();
      break;
    case 2:
      cPattern();
      break;
    case 4:
      dPattern();
      break;
  }
}

// a special meteo pattern for level up
function sPattern() {
  for (var i = 0; i < 2; ++i) {
    var m = new Meteo(i, 0);
  }
  for (var i = 2; i < 4; ++i) {
    var m = new Meteo(i, 2);
  }
}

// the base pattern: slow and random direction
function aPattern() {
  var m = new Meteo(randInt(4), randInt(cell_num));
}

function bPattern() {
  // two metoes in opposite dir, different line
  var dir = randInt(4);
  var m1 = new Meteo(dir, 0);
  var m2 = new Meteo(3 - dir, 2);
}

function cPattern() {
  // two metoes in opposite dir, the same line
  var dir = randInt(4);
  var m1 = new Meteo(dir, 1);
  var m2 = new Meteo(3 - dir, 1);
}

function dPattern() {
  var dir = randInt(4);
  var line = randInt(2);
  var m1 = new Meteo(dir, line);
  var m2 = new Meteo(dir, line + 1, meteo_v_base * 1.2);
}

function moveMeteo() {
  var flag = false;
  for (let m of meteo_left) {
    m.x -= m.v;
    flag = bump(m, player) || flag;
  }
  for (let m of meteo_right) {
    m.x += m.v;
    flag = bump(m, player) || flag;
  }
  for (let m of meteo_up) {
    m.y -= m.v;
    flag = bump(m, player) || flag;
  }
  for (let m of meteo_down) {
    m.y += m.v;
    flag = bump(m, player) || flag;
  }
  if (meteo_down.length !== 0 && meteo_down[0].y > h + meteo_r) {
    meteo_down.shift();
  }
  if (meteo_up.length !== 0 && meteo_up[0].y < 0 - meteo_r) {
    meteo_up.shift();
  }
  if (meteo_left.length !== 0 && meteo_left[0].x < 0 - meteo_r) {
    meteo_left.shift();
  }
  if (meteo_right.length !== 0 && meteo_right[0].x > w + meteo_r) {
    meteo_right.shift();
  }
  return flag;
}

function eatCandy() {
  score += 1;
  if (score % 10 === 0) {
    uplevel();
  }
  var x;
  var y;
  while (true) {
    x = randInt(0, cell_num);
    y = randInt(0, cell_num);
    if (x !== player.cx || y !== player.cy) {
      if (score == 9) {
        // if we have 5x5 cells now, make sure it won't appear
        // at the edges, which will appeear soon
        if (x != 0 && x != 4 && y != 0 && y != 4) {
          break;
        }
      }
      else {
        break;
      }
    }
  }
  candy = new Candy(x, y);
}

function uplevel() {
  ++level;
  window.clearInterval(creation);
  meteo_v = meteo_v * 1.1;
  meteo_inter *= 0.9;
  trans_pos = 0.86; // start background color transition
  window.setTimeout(sPattern, 1000);
  window.setTimeout(function() {
    creation = window.setInterval(createMeteo, meteo_inter);
  }, 2000);
  if (cell_num != 3) {
    cell_num = 3;
    --player.cx;
    --player.cy;
  }
}

function keyDown(e) {
  if (player === null) {
    return;
  }
  var key = e.which;
  switch (key) {
    case 38: // up
      if (player.cy > 0) {
        --player.cy;
      }
      break;
    case 40: // down
      if (player.cy < cell_num - 1) {
        ++player.cy;
      }
      break;
    case 37: // left
      if (player.cx > 0) {
        --player.cx;
      }
      break;
    case 39: // right
      if (player.cx < cell_num - 1) {
        ++player.cx;
      }
      break;
    default:
      break; 
  }
  [player.x, player.y] = getCellCenter(player.cx, player.cy);
  if (player.cx === candy.cx && player.cy === candy.cy) {
    eatCandy();
  }
  // console.info(player.cx, player.cy);
  // console.info(player.x, player.y);
}

function setupColor() {
  colors.push(new Color("#FFA07A", "#FF1493"));
  colors.push(new Color("#7AFEC6", "#FFA07A"));
  colors.push(new Color("#9370DB", "#7AFEC6"));
  colors.push(new Color("#00BFFF", "#9370DB"));
  colors.push(new Color("#FF7F50", "#00BFFF"));
  colors.push(new Color("#8FBC8F", "#FF7F50"));
  colors.push(new Color("#9370DB", "#8FBC8F"));
  colors.push(new Color("#B0E0E6", "#9370DB"));
                        //  up       bottom
}

function setupMobile() {
  window.addEventListener('touchstart', function(e) {
    var touch = e.targetTouches[0];
    touch_x = touch.screenX;
    touch_y = touch.screenY;
  });
  window.addEventListener('touchend', function(e) {
    var touch = e.changedTouches[0];
    var dir = judgeDirection(touch_x, touch_y, touch.screenX, touch.screenY);
    var e = new Object();
    // fake key down event
    switch (dir) {
      case "left":
        e.which = 37;
        break;
      case "right":
        e.which = 39;
        break;
      case "up":
        e.which = 38;
        break;
      case "down":
        e.which = 40;
        break;
      default:
        console.log("Error in direction judgement.")
        break;
    }
    keyDown(e);
  });
  window.addEventListener('touchmove', function(e) {
    if (e.cancelable) {
      e.preventDefault();
    }
  }, false);
}

function setupDrawing() {
  try {
    document.createEvent("TouchEvent");
    isMobile = true;
  }
  catch(e) {
    isMobile = false;
  }

  h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  if (isMobile) {
    w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  }
  else {
    w = h * ratio;
  }
  canvas = document.getElementById("main");
  canvas.height = h;
  canvas.width = w;
  cell_sz = w / 6;
  meteo_r = cell_sz * 0.3,
  ship_r = cell_sz * 0.25,
  candy_sz = cell_sz * 0.25,
  ctx = canvas.getContext("2d");
  trans_pos = 0.8;
}

function getCookie(){  
    var arr = document.cookie.match(new RegExp("(^| )"+"best"+"=([^;]*)(;|$)"));  
    if (arr !== null) {  
      best = +(unescape(arr[2]));
    }
    else {  
      best = 0;
    }  
}  

function init() {
  setupDrawing();
  document.onkeydown = keyDown;
  if (isMobile) {
    setupMobile();
  }
  setupColor();
  drawStart();
  getCookie();
}

function gameOver() {
  window.clearInterval(amination);
  window.clearInterval(creation);
  if (score > best) {
    best = score;
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = "best=" + escape(best) + ";expires=" + exp.toGMTString();
  }
  gameover_timer = null;
  drawOver();
}

function pause() {
  window.clearInterval(amination);
  window.clearInterval(creation);
  amination = null;
  creation = null;
}

function start() {
  cell_num = 5;
  meteo_num = 1;
  meteo_left = [];
  meteo_right = [];
  meteo_up = [];
  meteo_down = [];
  meteo_collection = [meteo_down, meteo_up, meteo_left, meteo_right];
  meteo_v = meteo_v_base;
  meteo_inter = meteo_inter_base;
  amination = window.setInterval(update, 25);
  creation = window.setInterval(createMeteo, meteo_inter);
  player = new Ship();
  candy = new Candy(0, 0);
  candy.rad = Math.PI / 4;
  score = 0;
  level = 0;
  color_idx = 0;
  document.getElementById("over").setAttribute("class", "invisible");
  document.getElementById("begin").setAttribute("class", "invisible");
}

function update() {
  var flag = moveMeteo();
  // first draw out why is game over
  // then alert
  drawAll();
  if (flag && gameover_timer === null) {
    gameover_timer = window.setTimeout(gameOver, 10);
  }
}

// ========================== drawings ======================================

function drawBoard() {
  var brd_sz = cell_sz * cell_num;
  var brd_left = getCenterLine(0, w, brd_sz);
  var brd_top = getCenterLine(0, h, brd_sz);
  drawGrid(ctx, brd_left, brd_top, cell_num, cell_sz);
  // sqrt(2) / 2 + 0.1
  drawRect(ctx, w/2, h/2, brd_sz*0.70710678, -Math.PI/4, null, "#FFFFFF"); 
}

function drawPlayer() {
  drawCircle(ctx, player.x, player.y, player.r, player.color);
}

function drawMeteo() {
  for (let team of meteo_collection) {
    for (let m of team) {
      drawCircle(ctx, m.x, m.y, m.r, "#000000");
    }
  }
}

function drawCandy() {
  if (score % 10 === 9) {
    drawRect(ctx, candy.x, candy.y, candy.r, candy.rad, candy.color_s, null);
  }
  else {
    drawRect(ctx, candy.x, candy.y, candy.r, candy.rad, candy.color, null);
  }
  candy.rad -= candy_v;
  if (candy.rad <= -Math.PI / 4) {
    candy.rad += Math.PI / 2;
  }
  if (candy.shrink) {
    candy.r *= 0.995;
    // 0.60577 = 0.995 ^ 100
    if (candy.r < candy_sz * 0.60577) {
      candy.shrink = false;
    }
  }
  else {
    candy.r /= 0.995;
    if (candy.r > candy_sz) {
      candy.shrink = true;
    }
  }
}

function drawInfo() {
  ctx.textBaseline="top";
  ctx.fillStyle = "#FFFFFF";

  ctx.font="25px Helvetica";
  ctx.fillText("BEST " + best, 10, 10);

  ctx.font="75px Helvetica";
  ctx.fillText(score + "", 10, 35);
}

function drawBckgrnd() {
  var grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, colors[color_idx].start);
  grd.addColorStop(trans_pos, colors[color_idx].start);
  grd.addColorStop(1, colors[color_idx].end);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
  if (Math.abs(trans_pos - 0.8) > 0.01 && color_idx != colors.length) {
    trans_pos += trans_v;
  }
  if (trans_pos >= 1) {
    trans_pos = 0;
    if (color_idx < colors.length - 1) {
      ++color_idx;
    }
  }
}

function drawOver() {
  document.getElementById("over").setAttribute("class", "visible");
  document.getElementById("score").innerHTML = score + "";
}

function drawStart() {
  drawBckgrnd();
  drawBoard();
  document.getElementById("begin").setAttribute("class", "visible");
}

function drawAll() {
  canvas.height = canvas.height;
  drawBckgrnd();
  drawBoard();
  drawCandy();
  drawPlayer();
  drawInfo();
  drawMeteo();
}



