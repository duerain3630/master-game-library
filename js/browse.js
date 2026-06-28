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
const publisherFilter = document.getElementById("publisherFilter");
const developerFilter = document.getElementById("developerFilter");
const yearFilter = document.getElementById("yearFilter");

// -----------------------------
// LOAD DATABASE
// -----------------------------

    fetch("./database.json")
    .then(res => res.json())
    .then(data => {

        database = data;

        filteredData = database.games; // IMPORTANT

        setupFilters(); // if you have it
        renderList(filteredData); // IMPORTANT (initial render)

        const count = document.getElementById("itemCount");
        count.textContent = `${filteredData.length} items`;
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
// FILTER SETUP
// -----------------------------
function setupFilters() {

    const genres = new Set();
    const publishers = new Set();
    const devs = new Set();
    const year = getYear(g, database);

    database.games.forEach(g => {
        if (g.genre) genres.add(g.genre);
        if (g.publisher) publishers.add(g.publisher);
        if (g.developer) devs.add(g.developer);
        if (year !== "Unknown") years.add(year);
    });

    populateFilter(genreFilter, genres, "genres");
    populateFilter(publisherFilter, publishers, "publishers");
    populateFilter(developerFilter, devs, "developers");
    populateFilter(yearFilter, years);

    genreFilter.addEventListener("change", applyFilters);
    publisherFilter.addEventListener("change", applyFilters);
    developerFilter.addEventListener("change", applyFilters);
    yearFilter.addEventListener("change", applyFilters);
}

// -----------------------------
// FILTER LOGIC
// -----------------------------
function applyFilters() {

    const genre = genreFilter.value;
    const pub = publisherFilter.value;
    const dev = developerFilter.value;
    const year = yearFilter.value;

    filteredData = database.games.filter(g => {

        const matchesYear =
            (year === "all" || getYear(g, database) === year);

        return (
            (genre === "all" || g.genre === genre) &&
            (pub === "all" || g.publisher === pub) &&
            (dev === "all" || g.developer === dev) &&
            matchesYear
        );
    });

    renderList(filteredData);
}

// -----------------------------
// RENDER LIST
// -----------------------------
function renderList(data) {

    const list = document.getElementById("list");

    list.innerHTML = "";

    if (!data || data.length === 0) {
        list.innerHTML = "<p>No results found.</p>";
        return;
    }

    data.forEach(item => {

        const div = document.createElement("div");
        div.className = "browse-item";

        div.innerHTML = `
            <a href="game.html?id=${item.id}">
                ${item.title}
            </a>

            <div class="meta">
                🎲 ${item.genre || "Unknown"} ·
                🏢 ${item.developer || "Unknown"} ·
                📚 ${item.publisher || "Unknown"} ·
                📅 ${getYear(item, database)}
            </div>
        `;

        list.appendChild(div);
    });
}

// -----------------------------
// FILTER HELPERS
// -----------------------------
function populateFilter(select, values, entityType = null) {

    if (!select) return;

    select.innerHTML = `<option value="all">All</option>`;

    Array.from(values)
        .sort()
        .forEach(v => {

            let label = v;

            if (entityType && database[entityType]) {
                const entity = database[entityType].find(e => e.id === v);
                if (entity) label = entity.name;
            }

            select.innerHTML += `
                <option value="${v}">
                    ${label}
                </option>
            `;
        });
}

// -----------------------------
// UTILITIES
// -----------------------------
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getEntityName(type, id) {

    if (!id) return "Unknown";

    const entity = database[type].find(e => e.id === id);
    return entity ? entity.name : id;
}

function getYear(game, db) {
    if (game.year) {
        return String(game.year).replace(".0", "");
    }

    if (game.releases?.length) {
        const release = db.releases.find(r => r.id === game.releases[0]);
        if (release?.year) return String(release.year);
    }

    return "Unknown";
}
