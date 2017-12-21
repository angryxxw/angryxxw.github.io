// compute the start point of line x, 
// which is in the center of line y
// y_start: where line y starts
// y_length: the length of line y
// x_length: the length of line x
// return: where x should start
function getCenterLine(y_start, y_length, x_length) {
  var y_center = y_start + y_length / 2;
  var x_start = y_center - x_length / 2;
  return Math.floor(x_start);
}

function drawLine(ctx, s_x, s_y, e_x, e_y, style) {
  ctx.save();  
  ctx.translate(0.5,0.5);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(s_x, s_y);
  ctx.lineTo(e_x, e_y);
  ctx.strokeStyle = style;
  ctx.stroke();
  ctx.restore();
}

function drawGrid(ctx, left, top, num, interval) {
  for (var i = 1; i < num; ++i) {
    drawLine(ctx, left+interval*i, top, left+interval*i, top+num*interval, "#FFFFFF");
    drawLine(ctx, left, top+interval*i, left+num*interval, top+interval*i, "#FFFFFF");
  }
}

// style fills style
function drawCircle(ctx, x, y, r, style) {
  ctx.beginPath();
  ctx.fillStyle = style;
  ctx.arc(x, y, r, 0, 2*Math.PI);
  ctx.fill();
}

// draw a rounded rectangle
// cross_r: half of the cross length
function drawRect(ctx, cx, cy, cross_r, rad, fill_style, stroke_style) {
  // rad = Math;
  var x;
  var y;
  var ratio = 0.2;
  var r = cross_r * ratio;
  var short = Math.abs(cross_r * Math.sin(rad));
  var long = Math.abs(cross_r * Math.cos(rad));
  var off_l = Math.abs(r * Math.cos(Math.PI / 4 - Math.abs(rad)));
  var off_s = Math.abs(r * Math.sin(Math.PI / 4 - Math.abs(rad)));

  ctx.beginPath();

  x = cx + short;
  y = cy + long;
  ctx.moveTo(x + off_s, y - off_l);

  x = cx + long;
  y = cy - short;
  ctx.lineTo(x - off_s, y + off_l);
  ctx.arcTo(x, y, x - off_l, y - off_s, r);

  x = cx - short;
  y = cy - long;
  ctx.lineTo(x + off_l, y + off_s);
  ctx.arcTo(x, y, x - off_s, y + off_l, r);

  x = cx - long;
  y = cy + short;
  ctx.lineTo(x + off_s, y - off_l);
  ctx.arcTo(x, y, x + off_l, y + off_s, r)

  x = cx + short;
  y = cy + long;
  ctx.lineTo(x - off_l, y - off_s);
  ctx.arcTo(x, y, x + off_s, y - off_l, r);

  ctx.closePath();

  if (fill_style != null) {
    ctx.fillStyle = fill_style;
    ctx.fill();
  }
  if (stroke_style != null) {
    ctx.strokeStyle = stroke_style;
    ctx.stroke();
  }
}

function disSqr(p1, p2) {
  return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
}

function bump(p1, p2) {
  var dis = disSqr(p1, p2);
  // set 100 to make it looks like "they really bumped"
  return Math.pow(p1.r + p2.r, 2) > dis;
}

function randInt() {
  if (arguments.length === 1) {
    return Math.floor(Math.random() * arguments[0]);
  }
  var gap = arguments[1] - arguments[0];
  return arguments[0] + Math.floor(Math.random() * gap);
}

function judgeDirection(old_x, old_y, new_x, new_y) {
  var x = new_x - old_x;
  var y = new_y - old_y;
  var tan;
  if (x === 0) {
    tan = 100;
  }
  else {
    tan = Math.abs(y / x);
  }
  if (tan > -1 && tan < 1) {
    if (x < 0) {
      return "left";
    }
    else {
      return "right";
    }
  }
  else {
    if (y < 0) {
      return "up";
    }
    else {
      return "down";
    }
  }
}


  
