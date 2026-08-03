(() => {
  const STORAGE_KEY = "ruedaDeCitas_activities";
  const DEFAULT_SOURCE = "activities.json";

  const SEGMENT_COLORS = ["#e14f3d", "#f2a93b", "#2c6e64", "#ff7e9d"];

  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const ticketList = document.getElementById("ticketList");
  const addForm = document.getElementById("addForm");
  const newActivityInput = document.getElementById("newActivity");
  const spinBtn = document.getElementById("spinBtn");
  const hint = document.getElementById("hint");
  const exportBtn = document.getElementById("exportBtn");
  const resetBtn = document.getElementById("resetBtn");

  const winnerModal = document.getElementById("winnerModal");
  const winnerText = document.getElementById("winnerText");
  const doneBtn = document.getElementById("doneBtn");
  const spinAgainBtn = document.getElementById("spinAgainBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");

  let activities = [];
  let currentRotation = 0;
  let spinning = false;
  let lastWinnerIndex = null;

  // ---------- Persistence ----------

  function loadActivities() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          activities = parsed;
          render();
          return;
        }
      } catch (e) {
        /* fall through to fetch defaults */
      }
    }
    fetchDefaults();
  }

  function fetchDefaults() {
    fetch(DEFAULT_SOURCE)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        activities = Array.isArray(data) ? data : [];
        saveActivities();
        render();
      })
      .catch(() => {
        activities = [];
        render();
      });
  }

  function saveActivities() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }

  // ---------- Rendering: ticket list ----------

  function render() {
    ticketList.innerHTML = "";

    if (activities.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = "Aún no hay boletos en la rueda. Agregá la primera actividad para empezar a jugar.";
      ticketList.appendChild(empty);
    } else {
      activities.forEach((activity, index) => {
        const li = document.createElement("li");
        li.className = "ticket";

        const span = document.createElement("span");
        span.textContent = activity;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "✕";
        btn.setAttribute("aria-label", `Quitar "${activity}"`);
        btn.addEventListener("click", () => removeActivity(index));

        li.appendChild(span);
        li.appendChild(btn);
        ticketList.appendChild(li);
      });
    }

    const canSpin = activities.length >= 2;
    spinBtn.disabled = !canSpin || spinning;
    hint.textContent = canSpin
      ? `${activities.length} actividades listas para girar.`
      : "Agregá al menos 2 actividades para poder girar.";

    drawWheel();
  }

  function removeActivity(index) {
    activities.splice(index, 1);
    saveActivities();
    render();
  }

  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = newActivityInput.value.trim();
    if (!value) return;
    activities.push(value);
    saveActivities();
    newActivityInput.value = "";
    render();
  });

  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(activities, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activities.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  resetBtn.addEventListener("click", () => {
    const confirmed = confirm(
      "Esto va a reemplazar la lista actual por la lista original del archivo activities.json. ¿Continuar?"
    );
    if (confirmed) fetchDefaults();
  });

  // ---------- Wheel drawing ----------

  function drawWheel() {
    const size = canvas.width;
    const radius = size / 2;
    ctx.clearRect(0, 0, size, size);

    if (activities.length === 0) {
      ctx.fillStyle = "#fff0d6";
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const n = activities.length;
    const segAngle = (Math.PI * 2) / n;

    activities.forEach((activity, i) => {
      const start = i * segAngle;
      const end = start + segAngle;
      const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];

      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(start + segAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff6e9";
      ctx.font = "600 22px Fredoka, sans-serif";
      const label = truncateLabel(ctx, activity, radius - 40);
      ctx.fillText(label, radius - 26, 0);
      ctx.restore();
    });
  }

  function truncateLabel(context, text, maxWidth) {
    if (context.measureText(text).width <= maxWidth) return text;
    let truncated = text;
    while (truncated.length > 1 && context.measureText(truncated + "…").width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + "…";
  }

  // ---------- Spin logic ----------

  function spin() {
    if (spinning || activities.length < 2) return;
    spinning = true;
    spinBtn.disabled = true;

    const n = activities.length;
    const segAngleDeg = 360 / n;
    const winnerIndex = Math.floor(Math.random() * n);

    const targetAngleMod = (360 - (winnerIndex * segAngleDeg + segAngleDeg / 2) + 360) % 360;
    const spins = 5 + Math.floor(Math.random() * 3);
    const currentMod = ((currentRotation % 360) + 360) % 360;
    const extra = (targetAngleMod - currentMod + 360) % 360;

    currentRotation += spins * 360 + extra;
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    lastWinnerIndex = winnerIndex;

    const onEnd = () => {
      canvas.removeEventListener("transitionend", onEnd);
      spinning = false;
      spinBtn.disabled = activities.length < 2;
      showWinner(winnerIndex);
    };
    canvas.addEventListener("transitionend", onEnd);
  }

  spinBtn.addEventListener("click", spin);

  // ---------- Winner modal ----------

  function showWinner(index) {
    const activity = activities[index];
    if (!activity) return;
    winnerText.textContent = activity;
    winnerModal.hidden = false;
  }

  function hideModal() {
    winnerModal.hidden = true;
  }

  closeModalBtn.addEventListener("click", hideModal);

  spinAgainBtn.addEventListener("click", () => {
    hideModal();
    spin();
  });

  doneBtn.addEventListener("click", () => {
    if (lastWinnerIndex !== null && activities[lastWinnerIndex] !== undefined) {
      removeActivity(lastWinnerIndex);
      lastWinnerIndex = null;
    }
    hideModal();
  });

  winnerModal.addEventListener("click", (e) => {
    if (e.target === winnerModal) hideModal();
  });

  // ---------- Init ----------

  loadActivities();
})();
