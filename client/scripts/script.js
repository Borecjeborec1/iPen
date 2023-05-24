const itemSizeText = document.getElementById("itemSizeText")
const canvas = document.getElementById("mainCanvas")
const ctx = canvas.getContext("2d")
const { height, width } = await __Pequena__.getScreenInfo()
canvas.width = width
canvas.height = height
let pos = { x: 0, y: 0 };
let startPos = { x: 0, y: 0 }
let prevCircleX = 0;
let prevCircleY = 0;

let isShiftDown = false

let activeItem = "pen"
let itemSize = 5
let itemColor = "red"


function handleDrag(x, y) {
  if (activeItem == "rubber")
    drawRubber(x, y)
  else if (activeItem == "laser")
    drawLaser(x, y)
  else if (activeItem == "pen")
    drawPen(x, y)
  else if (activeItem == "circle")
    drawCircle(x, y)
  else if (activeItem == "triangle")
    drawTriangle(x, y)
  else if (activeItem == "square")
    drawSquare(x, y)
  else if (activeItem == "rectangle")
    drawRectangle(x, y)
}

function drawPen(x, y) {
  ctx.beginPath();

  ctx.lineWidth = itemSize;
  ctx.lineCap = 'round';
  ctx.strokeStyle = itemColor;
  if (isShiftDown) {
    ctx.moveTo(startPos.x, startPos.y);
    console.log(x, y)
    console.log(startPos.x, startPos.y)
    let difX = x - startPos.x
    let difY = y - startPos.y
    if (difY > difX)
      ctx.lineTo(startPos.x, y);
    else
      ctx.lineTo(x, startPos.y);
  } else {
    ctx.moveTo(pos.x, pos.y);
    setPosition(x, y);
    ctx.lineTo(pos.x, pos.y);
  }
  ctx.stroke();
}

function drawRubber(x, y) {
  ctx.clearRect(x - itemSize * 2, y - itemSize * 2, itemSize * 2 * 2, itemSize * 2 * 2);
}
let laserColor = 50
function drawLaser(x, y) {
  const laserDuration = 2000;

  ctx.lineWidth = itemSize;
  ctx.strokeStyle = `rgba(${~~laserColor},${~~laserColor * 2},${~~laserColor}, 0.6)`;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  setPosition(x, y);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  laserColor += .2
  setTimeout(() => {
    ctx.clearRect(x - ((itemSize + 2) * 1.5), y - ((itemSize + 2) * 1.5), ((itemSize + 2) * 1.5) * 2, ((itemSize + 2) * 1.5) * 2);
    laserColor -= .2
  }, laserDuration);
}


function drawCircle(x, y) {
  const radius = Math.abs(x - startPos.x) / 2;

  if (prevCircleX !== 0 && prevCircleY !== 0) {
    ctx.clearRect(prevCircleX - radius - ((itemSize + 2) * 1.5), prevCircleY - radius - ((itemSize + 2) * 1.5), radius * 2 + ((itemSize + 2) * 1.5) * 2, radius * 2 + ((itemSize + 2) * 1.5) * 2);
  }

  ctx.strokeStyle = itemColor;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();

  prevCircleX = x;
  prevCircleY = y;
}

function drawTriangle(x, y) {
  const sideLength = Math.abs(x - startPos.x);

  if (prevCircleX !== 0 && prevCircleY !== 0) {
    const height = (Math.sqrt(3) / 2) * sideLength;
    const topY = startPos.y - (height / 3);
    const bottomY = startPos.y + (2 * height) / 3;

    const minX = Math.min(startPos.x - sideLength / 2, startPos.x + sideLength / 2, startPos.x);
    const minY = Math.min(topY, bottomY);
    const maxX = Math.max(startPos.x - sideLength / 2, startPos.x + sideLength / 2, startPos.x);
    const maxY = Math.max(topY, bottomY);

    ctx.clearRect(minX - ((itemSize + 2) * 1.5), minY - ((itemSize + 2) * 1.5), maxX - minX + ((itemSize + 2) * 1.5) * 2, maxY - minY + ((itemSize + 2) * 1.5) * 2);
  }

  const height = (Math.sqrt(3) / 2) * sideLength;
  const topY = startPos.y - (height / 3);
  const bottomY = startPos.y + (2 * height) / 3;

  ctx.strokeStyle = itemColor;
  ctx.lineWidth = itemSize;
  ctx.beginPath();
  ctx.moveTo(startPos.x, topY);
  ctx.lineTo(startPos.x + sideLength / 2, bottomY);
  ctx.lineTo(startPos.x - sideLength / 2, bottomY);
  ctx.closePath();
  ctx.stroke();

  prevCircleX = startPos.x;
  prevCircleY = startPos.y;
}

function drawSquare(x, y) {
  const size = Math.abs(x - startPos.x);
  ctx.clearRect(startPos.x - ((itemSize + 2) * 1.5), startPos.y - ((itemSize + 2) * 1.5), size + ((itemSize + 2) * 1.5) * 2, size + ((itemSize + 2) * 1.5) * 2);
  ctx.strokeStyle = itemColor;
  ctx.lineWidth = itemSize;
  ctx.strokeRect(startPos.x, startPos.y, size, size);
}

function drawRectangle(x, y) {
  const width = x - startPos.x;
  const height = y - startPos.y;

  let clearX, clearY, clearWidth, clearHeight;

  if (width < 0 && height < 0) {
    clearX = x - ((itemSize + 2) * 1.5);
    clearY = y - ((itemSize + 2) * 1.5);
    clearWidth = Math.abs(width) + ((itemSize + 2) * 1.5) * 2;
    clearHeight = Math.abs(height) + ((itemSize + 2) * 1.5) * 2;
  } else if (width < 0) {
    clearX = x - ((itemSize + 2) * 1.5);
    clearY = startPos.y - ((itemSize + 2) * 1.5);
    clearWidth = Math.abs(width) + ((itemSize + 2) * 1.5) * 2;
    clearHeight = height + ((itemSize + 2) * 1.5) * 2;
  } else if (height < 0) {
    clearX = startPos.x - ((itemSize + 2) * 1.5);
    clearY = y - ((itemSize + 2) * 1.5);
    clearWidth = width + ((itemSize + 2) * 1.5) * 2;
    clearHeight = Math.abs(height) + ((itemSize + 2) * 1.5) * 2;
  } else {
    clearX = startPos.x - ((itemSize + 2) * 1.5);
    clearY = startPos.y - ((itemSize + 2) * 1.5);
    clearWidth = width + ((itemSize + 2) * 1.5) * 2;
    clearHeight = height + ((itemSize + 2) * 1.5) * 2;
  }

  ctx.clearRect(clearX, clearY, clearWidth, clearHeight);
  ctx.lineWidth = itemSize;
  ctx.strokeStyle = itemColor;
  ctx.strokeRect(startPos.x, startPos.y, width, height);
}


function clearAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}


function setSize(isAdding) {
  itemSize += itemSize > 0 ? (isAdding ? 1 : -1) : 1
  itemSizeText.innerText = itemSize
}

function setPosition(x, y) {
  pos = { x, y }
}

function setStart(x, y) {
  startPos = { x, y }
}



function setShift(bool) {
  isShiftDown = bool
}

function setItem(item) {
  activeItem = item
}
