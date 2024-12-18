const canvas = document.querySelector("canvas"),
      ctx = canvas.getContext("2d"),
      toolBtns = document.querySelectorAll(".tool"),
      colorOptions = document.querySelectorAll(".color-option"),
      colorPicker = document.getElementById("color-picker"),
      opacitySlider = document.getElementById("opacity-slider"),
      symmetrySlider = document.getElementById("symmetry-slider"),
      clearCanvasBtn = document.getElementById("clear-canvas"),
      undoBtn = document.getElementById("undo"),
      redoBtn = document.getElementById("redo"),
      saveImgBtn = document.getElementById("save-img"),
      imageUpload = document.getElementById("image-upload");

let isDrawing = false,
    symmetryPoints = symmetrySlider.value,
    selectedTool = "pen",
    selectedColor = "#FFC300",
    opacity = 1,
    brushSize = 5,
    undoStack = [],
    redoStack = [];

// Initialize canvas with a white background and save the initial state
window.addEventListener("load", () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor;
  saveState();
});

// Load uploaded image onto canvas
imageUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src); // Free memory
      saveState();
    };
  }
});

// Symmetry and color control
symmetrySlider.addEventListener("input", () => {
  symmetryPoints = symmetrySlider.value;
  document.getElementById("symmetry-value").textContent = symmetryPoints;
});

colorPicker.addEventListener("input", () => selectedColor = colorPicker.value);
opacitySlider.addEventListener("input", () => opacity = opacitySlider.value);

// Tool selection and drawing functions
toolBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".tool.active")?.classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;
    brushSize = selectedTool === "brush" ? 10 : selectedTool === "eraser" ? 20 : 5;
  });
});

colorOptions.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".color-option.selected")?.classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window.getComputedStyle(btn).backgroundColor;
  });
});

// Save the canvas state for undo functionality
const saveState = () => {
  undoStack.push(canvas.toDataURL());
  redoStack = [];
};

// Start drawing on the canvas
const startDraw = (e) => {
  isDrawing = true;
  ctx.beginPath();
  if (["pen", "brush", "eraser"].includes(selectedTool)) {
    ctx.moveTo(e.offsetX, e.offsetY);
  } else {
    drawSymmetricShapes(e);
  }
};

// Drawing function to handle drawing on the canvas
const draw = (e) => {
  if (!isDrawing) return;
  ctx.lineWidth = brushSize;
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
  ctx.fillStyle = selectedTool === "eraser" ? "#fff" : selectedColor;

  if (selectedTool === "pen" || selectedTool === "brush" || selectedTool === "eraser") {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else {
    drawSymmetricShapes(e);
  }
};

// Draw shapes with symmetry around the canvas
const drawSymmetricShapes = (e) => {
  const centerX = canvas.width / 2,
        centerY = canvas.height / 2,
        angleStep = (2 * Math.PI) / symmetryPoints;

  for (let i = 0; i < symmetryPoints; i++) {
    const angle = i * angleStep;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.translate(-centerX, -centerY);

    switch (selectedTool) {
      case "circle":
        drawCircle(e);
        break;
      case "star":
        drawStar(e);
        break;
      case "flower":
        drawFlower(e);
        break;
      case "rectangle":
        drawRectangle(e);
        break;
      case "ellipse":
        drawEllipse(e);
        break;
      case "hexagon":
        drawHexagon(e);
        break;
      case "triangle":
        drawTriangle(e);
        break;
    }

    ctx.restore();
  }
};

// Shape drawing functions
const drawCircle = (e) => {
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, 20, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
};

const drawStar = (e) => {
  const spikes = 5, outerRadius = 20, innerRadius = 10;
  let rotation = (Math.PI / 2) * 3;
  let x = e.offsetX, y = e.offsetY;
  ctx.beginPath();
  ctx.moveTo(x, y - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = e.offsetX + Math.cos(rotation) * outerRadius;
    y = e.offsetY + Math.sin(rotation) * outerRadius;
    ctx.lineTo(x, y);
    rotation += Math.PI / spikes;
    x = e.offsetX + Math.cos(rotation) * innerRadius;
    y = e.offsetY + Math.sin(rotation) * innerRadius;
    ctx.lineTo(x, y);
    rotation += Math.PI / spikes;
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const drawFlower = (e) => {
  const petals = 6, radius = 15;
  ctx.beginPath();
  for (let i = 0; i < petals; i++) {
    const theta = (i * Math.PI) / (petals / 2);
    const x = e.offsetX + Math.cos(theta) * radius;
    const y = e.offsetY + Math.sin(theta) * radius;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const drawRectangle = (e) => {
  ctx.beginPath();
  ctx.rect(e.offsetX - 15, e.offsetY - 10, 30, 20);
  ctx.fill();
  ctx.stroke();
};

const drawEllipse = (e) => {
  ctx.beginPath();
  ctx.ellipse(e.offsetX, e.offsetY, 15, 25, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
};

const drawHexagon = (e) => {
  const sides = 6, radius = 15;
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const theta = (i * 2 * Math.PI) / sides;
    const x = e.offsetX + Math.cos(theta) * radius;
    const y = e.offsetY + Math.sin(theta) * radius;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY - 15);
  ctx.lineTo(e.offsetX - 15, e.offsetY + 15);
  ctx.lineTo(e.offsetX + 15, e.offsetY + 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

// Stop drawing and save state
const stopDraw = () => {
  isDrawing = false;
  ctx.beginPath();
  saveState();
};

// Add event listeners for drawing actions
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDraw);

// Clear canvas
clearCanvasBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveState();
});

// Undo and redo functionality
undoBtn.addEventListener("click", () => {
  if (undoStack.length > 1) {
    redoStack.push(undoStack.pop());
    const imgData = new Image();
    imgData.src = undoStack[undoStack.length - 1];
    imgData.onload = () => ctx.drawImage(imgData, 0, 0);
  }
});

redoBtn.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const imgData = new Image();
    imgData.src = redoStack.pop();
    imgData.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgData, 0, 0);
      saveState();
    };
  }
});

// Save canvas as an image
saveImgBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "rangoli.png";
  link.click();
});
