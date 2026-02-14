
let clicks = 0;
let movement = 0;
let idle = 0;

if (typeof window !== "undefined") {
  window.addEventListener("click", () => clicks++);
  window.addEventListener("mousemove", () => movement++);
}

export function trackPlayer() {
  idle = movement === 0 ? idle + 1 : 0;

  const metrics = {
    clicks,
    movement,
    idle,
  };

  clicks = 0;
  movement = 0;

  return metrics;
}
