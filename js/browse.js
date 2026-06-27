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

let database = null;
let filteredData = [];

// DOM elements
const list = document.getElementById("list");
const title = document.getElementById("pageTitle");
const count = document.getElementById("itemCount");

// Filters (only exist on games page)
const genreFilter = document.getElementById("genreFilter");
const developerFilter = document.getElementById("developerFilter");
const yearFilter = document.getElementById("yearFilter");

// -----------------------------
// LOAD DATABASE
// -----------------------------
fetch("./database.json")
    .then(res => res.json())
    .then(data => {

        database = data;

        if (!database[type]) {
            title.textContent = "Not Found";
            return;
        }

        setupPage();
        renderList(database[type]);

    });

// -----------------------------
// PAGE SETUP
// -----------------------------
function setupPage() {

    const icon = typeIcons[type] || "";
    title.textContent = `${icon} ${capitalize(type)}`;

    filteredData = database[type];
    count.textContent = `${filteredData.length} items`;

    if (type === "games") {
        setupFilters();
    }
}

// -----------------------------
// FILTER SETUP (GAMES ONLY)
// -----------------------------
function setupFilters() {

    const genres = new Set();
    const devs = new Set();
    const years = new Set();

    database.games.forEach(g => {
        if (g.genre) genres.add(g.genre);
        if (g.developer) devs.add(g.developer);
        if (g.year) years.add(g.year);
    });

    populateFilter(genreFilter, genres);
    populateFilter(developerFilter, devs);
    populateFilter(yearFilter, years);

    genreFilter.addEventListener("change", applyFilters);
    developerFilter.addEventListener("change", applyFilters);
    yearFilter.addEventListener("change", applyFilters);
}

// -----------------------------
// FILTER LOGIC
// -----------------------------
function applyFilters() {

    const genre = genreFilter.value;
    const dev = developerFilter.value;
    const year = yearFilter.value;

    filteredData = database.games.filter(g => {

        return (
            (genre === "all" || g.genre === genre) &&
            (dev === "all" || g.developer === dev) &&
            (year === "all" || g.year === year)
        );

    });

    renderList(filteredData);
}

// -----------------------------
// RENDER LIST
// -----------------------------
function renderList(data) {

    list.innerHTML = "";
    count.textContent = `${data.length} items`;

    data.forEach(item => {

        const div = document.createElement("div");
        div.className = "browse-item";

        if (type === "games") {

            div.innerHTML = `
                <a href="game.html?id=${item.id}">
                    ${item.title}
                </a>

                <div class="meta">
                    🎲 ${item.genre || "Unknown"} · 
                    🏢 ${item.developer || "Unknown"} · 
                    📅 ${item.year || "?"}
                </div>
            `;

        } else {

            div.innerHTML = `
                <a href="entity.html?type=${type.slice(0,-1)}&id=${item.id}">
                    ${item.name || item.year}
                </a>
            `;
        }

        list.appendChild(div);
    });
}

// -----------------------------
// FILTER HELPERS
// -----------------------------
function populateFilter(select, values) {

    if (!select) return;

    select.innerHTML = `<option value="all">All</option>`;

    Array.from(values)
        .sort()
        .forEach(v => {
            select.innerHTML += `<option value="${v}">${v}</option>`;
        });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
