"use strict";

// Coordinates are fractions of the writing area so rotation and review preserve the strokes.
function paintHandwriting(canvas, strokes) {
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);
  context.strokeStyle = "#292145";
  context.fillStyle = context.strokeStyle;
  context.lineWidth = height / 72;
  context.lineCap = "round";
  context.lineJoin = "round";

  for (const stroke of strokes) {
    const [first, ...points] = stroke;
    if (!first) continue;
    context.beginPath();
    if (!points.length) {
      context.arc(
        first[0] * width,
        first[1] * height,
        context.lineWidth / 2,
        0,
        Math.PI * 2,
      );
      context.fill();
      continue;
    }
    context.moveTo(first[0] * width, first[1] * height);
    for (const [x, y] of points) context.lineTo(x * width, y * height);
    context.stroke();
  }
}

function createWritingSurface(canvas, getStrokes, canWrite, save) {
  let pointer = null;
  let redrawPending = false;

  function redraw() {
    if (redrawPending) return;
    redrawPending = true;
    requestAnimationFrame(() => {
      redrawPending = false;
      paintHandwriting(canvas, getStrokes());
    });
  }

  function point(event) {
    const rect = canvas.getBoundingClientRect();
    const clamp = (fraction) =>
      Math.round(Math.max(0, Math.min(1, fraction)) * 4096) / 4096;
    return [
      clamp((event.clientX - rect.left) / rect.width),
      clamp((event.clientY - rect.top) / rect.height),
    ];
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      pointer !== null ||
      !canWrite()
    )
      return;
    pointer = event.pointerId;
    canvas.setPointerCapture(pointer);
    getStrokes().push([point(event)]);
    redraw();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (pointer !== event.pointerId || !canWrite()) return;
    const stroke = getStrokes().at(-1);
    const next = point(event);
    const previous = stroke.at(-1);
    if (next[0] === previous[0] && next[1] === previous[1]) return;
    stroke.push(next);
    redraw();
  });

  function stop() {
    const id = pointer;
    pointer = null;
    if (id !== null && canvas.hasPointerCapture(id))
      canvas.releasePointerCapture(id);
  }

  function end(event) {
    if (pointer !== event.pointerId) return;
    stop();
    save();
  }

  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("lostpointercapture", end);
  return { redraw, stop };
}
