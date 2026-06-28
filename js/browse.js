const params = new URLSearchParams(window.location.search);
const type = params.get("type");

let database = null;
let filteredData = [];

/* -----------------------------
   DOM
----------------------------- */
const list = document.getElementById("list");
const title = document.getElementById("pageTitle");
const count = document.getElementById("itemCount");

const genreFilter = document.getElementById("genreFilter");
const publisherFilter = document.getElementById("publisherFilter");
const developerFilter = document.getElementById("developerFilter");
const yearFilter = document.getElementById("yearFilter");

/* -----------------------------
   LOAD DATA
----------------------------- */
fetch("./database.json")
    .then(res => res.json())
    .then(db => {

        database = db;

        const params = new URLSearchParams(window.location.search);
        const type = params.get("type") || "games";

        setupPage(type);
        setupFilters();
        applyFilters();

       document.getElementById("app").style.visibility = "visible";
       document.getElementById("loading").style.display = "none";
       document.getElementById("app").style.display = "block";
    });

/* -----------------------------
   PAGE SETUP
----------------------------- */
function setupPage(type) {

    const iconMap = {
        games: "🎮",
        platforms: "🕹",
        developers: "🏢",
        publishers: "📚",
        genres: "🎲",
        franchises: "🧬",
        years: "📅"
    };

    const icon = iconMap[type] || "📁";

    document.getElementById("pageTitle").textContent =
        `${icon} ${type.charAt(0).toUpperCase() + type.slice(1)}`;

    filteredData = database.games;
}

/* -----------------------------
   FILTER SETUP
----------------------------- */
function setupFilters() {
    const genres = new Set();
    const publishers = new Set();
    const developers = new Set();
    const years = new Set();

    database.games.forEach(g => {
        if (g.genre) genres.add(g.genre);
        if (g.publisher) publishers.add(g.publisher);
        if (g.developer) developers.add(g.developer);
        if (getYear(g)) years.add(getYear(g));
    });

    populateFilter(genreFilter, genres);
    populateFilter(publisherFilter, publishers);
    populateFilter(developerFilter, developers);
    populateFilter(yearFilter, years);

    genreFilter.addEventListener("change", applyFilters);
    publisherFilter.addEventListener("change", applyFilters);
    developerFilter.addEventListener("change", applyFilters);
    yearFilter.addEventListener("change", applyFilters);
}

/* -----------------------------
   FILTER LOGIC
----------------------------- */
function applyFilters() {
    const genre = genreFilter.value;
    const pub = publisherFilter.value;
    const dev = developerFilter.value;
    const year = yearFilter.value;

    filteredData = database.games.filter(g => {
        return (
            (genre === "all" || g.genre === genre) &&
            (pub === "all" || g.publisher === pub) &&
            (dev === "all" || g.developer === dev) &&
            (year === "all" || getYear(g) === year)
        );
    });

    renderList(filteredData);
}

/* -----------------------------
   RENDER LIST (A–Z GROUPED)
----------------------------- */
function renderList(data) {
    list.innerHTML = "";

    if (!data.length) {
        list.innerHTML = "<p>No results found.</p>";
        count.textContent = "0 items";
        return;
    }

    // sort alphabetically
    data.sort((a, b) => a.title.localeCompare(b.title));

    count.textContent = `${data.length} items`;

    let currentLetter = "";

    data.forEach(game => {
        const letter = getLetter(game.title);

        if (letter !== currentLetter) {
            currentLetter = letter;

            const heading = document.createElement("div");
            heading.className = "letter-heading";
            heading.id = `letter-${letter}`;
            heading.innerHTML = `<h2>${letter}</h2>`;
            list.appendChild(heading);
        }

        const div = document.createElement("div");
        div.className = "browse-item";

        div.innerHTML = `
            <a href="game.html?id=${game.id}">
                ${game.title}
            </a>

            <div class="meta">
                🎲 ${getName(database.genres, game.genre)} ·
                🏢 ${getName(database.developers, game.developer)} ·
                📚 ${getName(database.publishers, game.publisher)} ·
                📅 ${getYear(game)}
            </div>
        `;

        list.appendChild(div);
    });

    renderAlphabetNav();
}

/* -----------------------------
   ALPHABET NAVIGATION
----------------------------- */
function renderAlphabetNav() {

    const alphabetContainer = document.getElementById("alphabet");
    alphabetContainer.innerHTML = "";

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

    alphabetContainer.innerHTML = alphabet.map(letter => {
        return `<a href="#letter-${letter}">${letter}</a>`;
    }).join("");
}

/* -----------------------------
   HELPERS
----------------------------- */
function populateFilter(select, values) {
    select.innerHTML = `<option value="all">All</option>`;

    Array.from(values)
        .sort()
        .forEach(v => {
            select.innerHTML += `<option value="${v}">${v}</option>`;
        });
}

function getName(list, id) {
    const item = list.find(x => x.id === id);
    return item ? item.name : "Unknown";
}

function getYear(game) {
    if (game.year) return String(game.year);

    if (game.releases?.length) {
        const rel = database.releases.find(r => r.id === game.releases[0]);
        if (rel?.year) return String(rel.year);
    }

    return "Unknown";
}

function getLetter(title) {
    const first = title.trim()[0].toUpperCase();
    return /[A-Z]/.test(first) ? first : "#";
}
