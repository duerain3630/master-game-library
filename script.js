console.log("script.js loaded");

Papa.parse("data/game_database_master_final.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {
    const games = results.data;
    console.log("Games loaded:", games);

    const grid = document.getElementById("gameGrid");

    games.forEach(game => {
      const card = document.createElement("div");
      card.className = "game-card";

      card.innerHTML = `
        <div class="cover-placeholder"></div>
        <h3>${game.title || "Untitled"}</h3>
        <p>${game.console || game.website || ""}</p>
      `;

      grid.appendChild(card);
    });
  }
});
