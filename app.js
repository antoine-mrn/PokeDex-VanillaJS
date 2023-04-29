const maximumPokemon = 906
let pokemonTab = []

const allTypes = {
    normal: "#aca596",
    fighting: "#9a563f",
    flying: "#a9acf1",
    poison: "#a95fa1",
    ground: "#d1b668",
    rock: "#b9a665",
    bug: "#b0bc44",
    ghost: "#6363b0",
    steel: "#adadc4",
    fire: "#e55e3f",
    water: "#569af8",
    grass: "#8fcc63",
    electric: "#f6c853",
    psychic: "#ee7ba4",
    ice: "#7acbe4",
    dragon: "#815aed",
    dark: "#6f5b4c",
    fairy: "#d69ddf",
    unknown: "#759f91",
    shadow: "#382e26"
}

const loader = document.querySelector('.loader')

//Fetch Pokemon API

const infoMessage = document.querySelector('.info-message')

async function fetchPokemon() {

    try {
        const fetches = []
        for (let i = 1; i <= maximumPokemon; i++) {
        fetches.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}/`))
        }
        const responses = await Promise.all(fetches)
        for (const response of responses) {
            if(!response.ok) {
                throw new Error(`${response.status} Pokemon not found`)
            }
            const currentPokemon = await response.json()
            creatingPokemon(currentPokemon)
        }
        const pokemonDisplay = pokemonTab.slice(0, 30)
        creatingCard(pokemonDisplay)
        loader.classList.add('hide')
        intersectionObserver.observe(document.querySelector('.intersection-observer'))
    }
    catch (error) {
        infoMessage.textContent = `${error}`
        loader.classList.add('hide')
    }
}

// Création des objets pour chaque pokemon

function creatingPokemon(pokemon) {

    let pokemonObj = {}

    pokemonObj.id = pokemon.id
    pokemonObj.name = pokemon.name
    pokemonObj.sprite = pokemon["sprites"]["other"]["official-artwork"]["front_default"]
    pokemonObj.types = pokemon.types.map(el => el.type.name)

    pokemonTab.push(pokemonObj)
}

// Création des cartes et affichage

const cardContainer = document.querySelector('.card-container')

function creatingCard(cardCreated) {
    // console.log(cardCreated)
    for(let i = 0; i < cardCreated.length; i++) {
        const pokemonCard = document.createElement('div')
        pokemonCard.classList.add("pokemon-card")

        pokemonCard.innerHTML = `
        <div class="pokemon-identification">
            <p class="pokemon-id">#${cardCreated[i].id.toString().padStart(3,0)}</p>
            <p class="pokemon-name">${cardCreated[i].name}</p>
        </div>
        <img class="pokemon-image" src="${cardCreated[i].sprite}" alt="${cardCreated[i].name} image">
        <div class="pokemon-type-container">
            ${cardCreated[i].types.map(type => `<p class='pokemon-type'>${type}</p>`).join("")}
        </div>
        `

        pokemonCard.style.background = cardBackground(cardCreated[i])
        cardContainer.appendChild(pokemonCard)
    }
}

function cardBackground(currentCard) {
    return currentCard.types.length > 1 ? `linear-gradient(180deg, ${allTypes[currentCard.types[0]]}, ${allTypes[currentCard.types[1]]})` : `${allTypes[currentCard.types[0]]}`
}

// Scroll infini

let index = 31

const handleIntersect = entries => {
    if(entries[0].isIntersecting) {
        const pokemonToAdd = pokemonTab.slice(index, index + 20)
        index += 20
        creatingCard(pokemonToAdd)
    }
}

const option = {
    rootMargin: "250px"
}

const intersectionObserver = new IntersectionObserver(handleIntersect, option)

// Génération options générations

const pokemonGeneration = {
    1 : [1, 151],
    2: [152, 251],
    3: [252, 386],
    4: [387, 493],
    5: [494, 649],
    6: [650, 721],
    7: [722, 809],
    8: [810, 905]
}

const filterGeneration = document.getElementById('pokemon-generation-filter')

function addGenerationFilterOption() {
    for(const generationOption in pokemonGeneration) {
        const option = document.createElement('option')
        option.value = generationOption
        option.text = `Generation ${generationOption}`
        filterGeneration.add(option)
    }
}

// Génération options types
const filterType = document.getElementById('pokemon-type-filter')

function addTypeFilterOption() {
    for(const typeOption in allTypes) {
        const option = document.createElement('option')
        option.value = typeOption
        option.text = typeOption
        filterType.add(option)
    }
}

// Initialisation filtrage

const form = [...document.querySelector("form")]

function filterInit() {
    cardContainer.innerHTML = ""
    intersectionObserver.unobserve(document.querySelector('.intersection-observer'))

    form.forEach(el => {
        if(!el.classList.contains("active") && el.type != "reset") {
            el.value = ""
        }
        else {
            el.classList.remove("active")
        }
    })
}

// Filtre par génération

filterGeneration.addEventListener('input', showOneGeneration)

function showOneGeneration() {
    filterGeneration.classList.add("active")
    filterInit()
    if(filterGeneration.value > 0) {
        const currentGeneration = filterGeneration.value
        const generationFiltered = pokemonTab.slice(pokemonGeneration[currentGeneration][0] - 1, pokemonGeneration[currentGeneration][1])

        creatingCard(generationFiltered)
    }
    else {
        resetFilter()
    }
}

// Recherche par type

filterType.addEventListener('input', showOneType)

function showOneType() {
    filterType.classList.add("active")
    filterInit()
    if(filterType.value != "") {
        const currentType = filterType.value
        const typeFiltered = pokemonTab.filter(el => el.types.includes(currentType))

        creatingCard(typeFiltered)
    }
    else {
        resetFilter()
    }
}

// Recherche d'un pokémon
const searchInput = document.getElementById('research')
searchInput.addEventListener('input', searchPokemon)

function searchPokemon() {
    searchInput.classList.add("active")
    filterInit()

    const searchInputValue = searchInput.value.toLowerCase()
    const filteredTab = pokemonTab.filter(el => el.name.toLowerCase().includes(searchInputValue))

    if(filteredTab.length > 0) {
        creatingCard(filteredTab)
        infoMessage.textContent = ""
    }
    else {
        infoMessage.textContent = "No pokemon found, you have to explore the world to find it"
    }
}

// Reset filtres

const resetBtn = document.querySelector('input[type="reset"]')
resetBtn.addEventListener("click", resetFilter)

function resetFilter() {
    cardContainer.innerHTML = ""
    infoMessage.textContent = ""
    intersectionObserver.observe(document.querySelector('.intersection-observer'))
    creatingCard(pokemonTab.slice(0, 30))
    index = 31
}

fetchPokemon()
.then(addGenerationFilterOption)
.then(addTypeFilterOption)