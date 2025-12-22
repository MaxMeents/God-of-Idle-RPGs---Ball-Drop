/**
 * Game.js - Entry Point
 */

window.addEventListener('load', () => {
    // Basic Initialization
    Juice.init();
    Physics.init();
    UI.init();

    // Main Loop for Juice/VFX
    function update() {
        Juice.update();
        Juice.draw();
        requestAnimationFrame(update);
    }

    update();

    console.log("God of Idle RPGs - Ball Drop - Started");
});
