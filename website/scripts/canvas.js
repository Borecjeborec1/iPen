const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let prevX = 0;
let prevY = 0;
let isDown = false;

const particles = [];
const maxParticles = 50;

function Particle(x, y, size, hue) {
  this.x = x;
  this.y = y;
  this.size = size;
  this.hue = hue;
  this.vx = Math.random() * 2 - 1;
  this.vy = Math.random() * 2 - 1;
}

Particle.prototype.update = function () {
  this.x += this.vx;
  this.y += this.vy;
  this.size -= 0.1;
};

function drawFluidElement(x, y, dx, dy) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate element size based on cursor movement speed
  const speed = Math.sqrt(dx * dx + dy * dy);
  let size = Math.min(100, speed);

  // Calculate rotation angle based on cursor movement direction
  const angle = Math.atan2(dy, dx);

  // Set fill color based on cursor position
  const hue = (x / canvas.width) * 360;
  ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

  // Change shape to ellipse for fast movement
  if (speed > 10) {
    size *= 2;
    ctx.beginPath();
    ctx.ellipse(x, y, size, size / 2, angle, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  // Add particles for visual effect
  if (particles.length < maxParticles && speed > 5) {
    const numParticles = Math.floor(speed / 3);
    const hueStep = 360 / numParticles;

    for (let i = 0; i < numParticles; i++) {
      const particleHue = (hue + i * hueStep) % 360;
      const particleSize = Math.random() * size;
      particles.push(new Particle(x, y, particleSize, particleHue));
    }
  }

  // Update and draw particles
  particles.forEach((particle, index) => {
    particle.update();
    if (particle.size <= 0) {
      particles.splice(index, 1);
    } else {
      ctx.fillStyle = `hsl(${particle.hue}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    }
  });

  // Request animation frame for smooth animation
  if (isDown) {
    requestAnimationFrame(() => drawFluidElement(x, y, dx, dy));
  }
}



function handleCanvasResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (window.innerWidth < 800) {
    document.querySelector(".container h1").innerText = "Welcome to iPen"

  } else {
    document.querySelector(".container h1").innerText = "Welcome to iPen: Unleash Your Creative Potential!"
  }
}
handleCanvasResize()
window.addEventListener('resize', handleCanvasResize);

document.addEventListener("touchmove", e => {
  var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
  var touch = evt.touches[0] || evt.changedTouches[0];
  if (isDown) {
    const dx = touch.pageX - prevX;
    const dy = touch.pageY - prevY;
    drawFluidElement(touch.pageX, touch.pageY, dx, dy);
    prevX = touch.pageX;
    prevY = touch.pageY;
  }
});

document.addEventListener("touchstart", e => {
  var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
  var touch = evt.touches[0] || evt.changedTouches[0];
  prevX = touch.pageX;
  prevY = touch.pageY;
  drawFluidElement(e.clientX, e.clientY, 0, 0);
  isDown = true;
});

document.addEventListener("touchend", e => {
  isDown = false;
});
document.addEventListener("mousemove", e => {
  if (isDown) {
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    drawFluidElement(e.clientX, e.clientY, dx, dy);
    prevX = e.clientX;
    prevY = e.clientY;
  }
});

document.addEventListener("mousedown", e => {
  prevX = e.clientX;
  prevY = e.clientY;
  drawFluidElement(e.clientX, e.clientY, 0, 0);
  isDown = true;
});

document.addEventListener("mouseup", e => {
  isDown = false;
});
