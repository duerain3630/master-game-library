console.log("script.js loaded");

Papa.parse("data/game_database_master_final.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    console.log("CSV loaded:", results.data.length, results.data);

    const grid = document.getElementById("gameGrid");

    if (!grid) {
      console.error("Could not find #gameGrid");
      return;
    }

    results.data.forEach(game => {
      const card = document.createElement("div");
      card.className = "game-card";

      card.innerHTML = `
        <div class="cover-placeholder"></div>
        <h3>${game.title || "Untitled"}</h3>
        <p>${game.console || game.website || ""}</p>
      `;

      grid.appendChild(card);
    });
  },
  error: function(error) {
    console.error("CSV loading error:", error);
  }
});
