/**
 * Game.js - Entry Point (PixiJS Edition)
 */

window.addEventListener('load', async () => {
    // 1. Initialize Renderer (PixiJS Application)
    await Renderer.init();

    // 2. Initialize Physics (Matter.js)
    Physics.init();

    // 3. Initialize UI & Juice
    Juice.init();
    UI.init();

    // 4. Main Loop
    Renderer.app.ticker.add(() => {
        // Update Physics-Sprite Sync
        Renderer.update(Physics.balls);

        // Update Juice (Particles, Popups, Shake)
        Juice.update();
    });

    console.log("God of Idle RPGs - Ball Drop - PixiJS Engine Running");
});
