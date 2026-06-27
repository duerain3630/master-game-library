Papa.parse("data/game_database_master_final.csv", {
  download: true,
  header: true,
  complete: function(results) {
    console.log(results.data);
  }
});

console.log("script.js loaded");
