const params = new URLSearchParams(window.location.search);
const type = params.get("type") || "games";

let database = null;

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
   LOAD DATABASE
----------------------------- */
fetch("./database.json")
    .then(res => res.json())
    .then(db => {

        database = db;

        setupPage();

        if (type === "games" && letter !== currentLetter) {
            setupFilters();
            renderList(database.games);
        } else {
            renderList(database[type] || []);
        }
    });

/* -----------------------------
   PAGE SETUP
----------------------------- */
function setupPage() {

    const iconMap = {
        games: "🎮",
        platforms: "🕹",
        developers: "🏢",
        publishers: "📚",
        genres: "🎲",
        franchises: "🧬",
        years: "📅"
    };

    title.textContent = `${iconMap[type] || "📁"} ${capitalize(type)}`;
}

/* -----------------------------
   FILTER SETUP (ONLY GAMES)
----------------------------- */
function setupFilters() {

    if (type !== "games") return;

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

    if (type !== "games") return;

    const genre = genreFilter.value;
    const pub = publisherFilter.value;
    const dev = developerFilter.value;
    const year = yearFilter.value;

    const filtered = database.games.filter(g => {
        return (
            (genre === "all" || g.genre === genre) &&
            (pub === "all" || g.publisher === pub) &&
            (dev === "all" || g.developer === dev) &&
            (year === "all" || getYear(g) === year)
        );
    });

    renderList(filtered);
}

/* -----------------------------
   RENDER LIST + ALPHABET
----------------------------- */
function renderList(data) {

    list.innerHTML = "";

    if (!data || data.length === 0) {
        list.innerHTML = "<p>No results found.</p>";
        count.textContent = "0 items";
        return;
    }

    count.textContent = `${data.length} items`;

    data.sort((a, b) => {
        const aName = a.title || a.name || "";
        const bName = b.title || b.name || "";
        return aName.localeCompare(bName);
    });

    let currentLetter = "";

    data.forEach(item => {

        const name = item.title || item.name || "Unknown";
        const letter = type === "games" ? getLetter(name) : null;

        if (letter !== currentLetter) {
            currentLetter = letter;

            const heading = document.createElement("div");
            heading.className = "letter-heading";
            heading.id = `letter-${letter}`;
            heading.innerHTML = `<h2>${letter}</h2>`;
            list.appendChild(heading);
        }

        const link =
            type === "games"
                ? `game.html?id=${item.id}`
                : `entity.html?type=${type.slice(0, -1)}&id=${item.id}`;

        const div = document.createElement("div");
        div.className = "browse-item";

        div.innerHTML = `
            <a href="${link}">
                ${name}
            </a>

            ${type === "games" ? `
                <div class="meta">
                    🎲 ${getName(database.genres, item.genre)} ·
                    🏢 ${getName(database.developers, item.developer)} ·
                    📚 ${getName(database.publishers, item.publisher)} ·
                    📅 ${getYear(item)}
                </div>
            ` : ""}
        `;

        list.appendChild(div);
    });

    renderAlphabetNav();
}

/* -----------------------------
   ALPHABET NAV
----------------------------- */
function renderAlphabetNav() {

    const alphabet = document.getElementById("alphabet");
    if (!alphabet) return;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

    alphabet.innerHTML = letters
        .map(l => `<a href="#letter-${l}">${l}</a>`)
        .join("");
}

/* -----------------------------
   HELPERS
----------------------------- */
function populateFilter(select, values) {

    if (!select) return;

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

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
