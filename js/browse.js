const typeIcons = {
    games: "🎮",
    platforms: "🕹",
    developers: "🏢",
    publishers: "📚",
    genres: "🎲",
    franchises: "🧬",
    years: "📅"
};

const params = new URLSearchParams(window.location.search);

const type = params.get("type");

fetch("./database.json")
.then(response => response.json())
.then(database => {

    const title = document.getElementById("pageTitle");
    const count = document.getElementById("itemCount");
    const list = document.getElementById("list");

    const genreFilter = document.getElementById("genreFilter");
    const developerFilter = document.getElementById("developerFilter");
    const yearFilter = document.getElementById("yearFilter");

    if (type === "games") {

    const genres = new Set();
    const devs = new Set();
    const years = new Set();

    database.games.forEach(g => {
        if (g.genre) genres.add(g.genre);
        if (g.developer) devs.add(g.developer);
        if (g.year) years.add(g.year);
    });

    genres.forEach(g => genreFilter.innerHTML += `<option>${g}</option>`);
    devs.forEach(d => developerFilter.innerHTML += `<option>${d}</option>`);
    years.forEach(y => yearFilter.innerHTML += `<option>${y}</option>`);
    }    
    
    if (!database[type]) {

        title.textContent = "Not Found";
        return;

    }

    const icon = typeIcons[type] || "";
    
    title.textContent = `${icon} ${type.charAt(0).toUpperCase() + type.slice(1)}`;

    count.textContent =
        database[type].length + " items";

    database[type].forEach(item => {

        const div = document.createElement("div");

        div.className = "browse-item";

        if (type === "games") {

            div.innerHTML = `
                <a href="game.html?id=${item.id}">${item.title}</a>
            
                <div class="meta">
                    🎲 ${item.genre || "Unknown"} · 🏢 ${item.developer || "Unknown"} · 📅 ${item.year || "?"}
                </div>
            `;

        }

        else {

            div.innerHTML =
                `<a href="entity.html?type=${type.slice(0,-1)}&id=${item.id}">
                    ${item.name || item.year}
                </a>`;

        }

        list.appendChild(div);

    });

});
