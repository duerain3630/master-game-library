<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Year</title>

<style>
body {
    font-family: Arial;
    background: #0f0f14;
    color: white;
    margin: 0;
}

header {
    padding: 20px;
    background: #1a1a24;
}

.container {
    max-width: 900px;
    margin: auto;
    padding: 20px;
}

.card {
    background: #1f1f2b;
    padding: 12px;
    margin: 8px 0;
    border-radius: 8px;
}

a {
    color: #7ab7ff;
    text-decoration: none;
}
</style>
</head>

<body>

<header>
    <a href="index.html">← Home</a>
</header>

<div class="container" id="content">Loading...</div>

<script>
const year = new URLSearchParams(window.location.search).get("id");

fetch("database.json")
.then(res => res.json())
.then(db => {

    const games = db.releases
        .filter(r => r.year == year)
        .map(r => db.games.find(g => g.id === r.game))
        .filter(Boolean);

    document.getElementById("content").innerHTML = `
        <h1>${year}</h1>
        <p><strong>Games:</strong> ${games.length}</p>

        <h3>Games Released</h3>

        ${games.map(g => `
            <div class="card">
                <a href="game.html?id=${g.id}">${g.title}</a>
            </div>
        `).join("")}
    `;
});
</script>

</body>
</html>
