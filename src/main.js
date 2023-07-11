/**
 * surface fluid simulation
 * from: https://www.youtube.com/watch?v=hswBi5wcqAA
 *
 * TODO:
 *  - use deviceorientation or mousemove
 */
const cols = Array.from({ length: 100 }, () => ({
  height: 100,
  velocity: 0,
}));

const applyHeights = () => {
  document.querySelector("#shape").setAttribute(
    "points",
    "85,190 15,190 " +
      cols
        .map(({ height }, index) => `${index},${height}`)
        .slice(5, 95)
        .join(" ")
  );
};

applyHeights();

const s /* col width */ = 1;
const c /* wave speed */ = 0.1;
const k = c ** 2 / s ** 2;
const velDamping = 0.3;

const stabilityCheck = (deltaTime) => {
  if (deltaTime * c < s) {
    return;
  }
  console.error("simulation unstable", {
    "deltaTime * c": deltaTime * c,
    s: s,
  });
};

const lerp = (a, b, t) => (b - a) * t + a;
const unlerp = (a, b, t) => (t - a) / (b - a);
const remap = (a1, b1, a2, b2, t) => lerp(a2, b2, unlerp(a1, b1, t));

let a = 0;
addEventListener("mousemove", (e) => {
  a = -remap(0, window.innerWidth, -1, 1, e.x);
  document.querySelector(
    "#glass"
  ).style.transform = `translate(-50%, -50%) rotate(${-45 * a}deg)`;
});

const simstep = (deltaTime) => {
  for (let index = 0; index < cols.length; index++) {
    const curr = cols[index];
    const prev = cols[index - 1] ?? curr;
    const next = cols[index + 1] ?? curr;
    const accel = k * (prev.height + next.height - 2 * curr.height);
    curr.velocity += deltaTime * accel;
  }

  if (a != null) {
    for (let index = 0; index < cols.length; index++) {
      const curr = cols[index];
      const wantedHeight = remap(
        -1,
        1,
        5,
        195,
        a * remap(0, cols.length, -1, 1, index)
      );
      const accel = k * (wantedHeight - curr.height) * 0.001;
      curr.velocity += deltaTime * accel;
    }
  }

  const vd = Math.max(0.0, 1.0 - (velDamping * deltaTime) / 1000);

  for (let index = 0; index < cols.length; index++) {
    const curr = cols[index];
    curr.velocity *= vd;
    curr.height += deltaTime * curr.velocity;
  }

  stabilityCheck(deltaTime);

  applyHeights();
};

const renderer = (render) => {
  const timeTrigger = requestAnimationFrame;
  // const timeTrigger = (fn) => setTimeout(() => fn(new Date().getTime()), 5000);

  let lastTime = null;

  let playing = true;

  const step = (time) => {
    if (time != null && lastTime != null) {
      const delta = time - lastTime;

      render(delta, time);
    }

    lastTime = time;

    if (playing) {
      timeTrigger(step);
    }
  };

  addEventListener("visibilitychange", (event) => {
    if (document.visibilityState === "visible" && !playing) {
      playing = true;
      step();
    } else {
      playing = false;
      lastTime = null;
    }
  });

  step();
};

renderer(simstep);
