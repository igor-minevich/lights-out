const modeSwitch = document.getElementById("mode_switch");

let currentMode = "editing"; // default state

modeSwitch.addEventListener("click", () => {
    const isPlaying = modeSwitch.classList.toggle("playing");

    currentMode = isPlaying ? "playing" : "editing";

    modeSwitch.setAttribute("aria-pressed", isPlaying);

    console.log("Current mode:", currentMode);
});

