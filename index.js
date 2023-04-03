import Movie from "./Movie.js"

let switchSitesLink = document.querySelector('.switch-link')
const searchForm = document.getElementById('search-form')
const searchInput = document.getElementById('search-input')
const moviesListEl = document.querySelector('.movies')
const initialStateEl = document.querySelector('.initial-state')
const noMatchesEl = document.querySelector('.no-matches')
const watchlistEmptyEl = document.querySelector('.watchlist-empty')

let site = "search"
let initial = true
const apiKey = "5d6c1b72"

let searchMovies = []
let watchlistMovies = []
let searchedMovieIDs = []
let likedMovieIDs = []

switchSitesLink.addEventListener('click', switchSites)

searchForm.addEventListener('submit', e => {
    e.preventDefault()
    search()
})

document.addEventListener('click', e => {
    if(e.target.dataset.id) {
        const id = e.target.dataset.id
        if(searchMovies.filter(movie => movie.imdbID === id)[0].isLiked) {
            removeFromWishList(id)
        } else {
            addToWishlist(id)
        }
    }
})

function search() {
    initial = false
    searchedMovieIDs = []
    searchMovies = []
    const query = searchInput.value
    fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${query}`)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            if(data.Search) {
                data.Search.forEach(movie => {
                searchedMovieIDs.push(movie.imdbID)
            })
            getMoviesFromSearch()
            } else {
                updateStates()
            }
        })
}

function getMoviesFromSearch() {
    searchedMovieIDs.forEach(id => {
        fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`)
            .then(res => res.json())
            .then(data => {
                const isLiked = likedMovieIDs.indexOf(data.imdbID) !== -1 ? true : false
                searchMovies.push(new Movie(data, isLiked))
                 renderMovies('search')             
            })
    })
}

function renderMovies(mode) {
    let html = ''
    searchMovies.forEach(movie => html += getMovieHtml(movie))
        moviesListEl.innerHTML = html
        updateStates()
}

function getMovieHtml(movie) {
    const wishlistBtnHtml = movie.isLiked ? `
    <div class="add-btn">
        <img class="add-icon" src="images/remove-icon.png" alt="" data-id="${movie.imdbID}">
        <p class="add-text" data-id="${movie.imdbID}">Remove</p>
    </div>
    `
    : `
    <div class="add-btn">
        <img class="add-icon" src="images/add-icon.png" alt="" data-id="${movie.imdbID}">
        <p class="add-text" data-id="${movie.imdbID}">Watchlist</p>
        </div>
    `

    return `
    <div class="movie-card">
            <img class="movie-poster" src="${movie.Poster}" alt="">
            <div class="movie-text">
                <div class="movie-header">
                    <h3 class="movie-title">${movie.Title}</h3>
                    <img class="star-icon" src="images/star-icon.png" alt="">
                    <p class="movie-rating">${movie.Metascore}</p>
                </div>
                <div class="movie-info">
                    <p class="movie-duration">${movie.Runtime}</p>
                    <p class="movie-genres">${movie.Genre}</p>
                    ${wishlistBtnHtml}
                </div>
                <p class="movie-desc">${movie.Plot}</p>
            </div>
        </div>
    `
}

function updateStates() {
    if(site === "search") {
        watchlistEmptyEl.classList.add('hidden')
        if(searchMovies.length) {
            noMatchesEl.classList.add('hidden')
            moviesListEl.classList.remove('hidden')
        } else {
            noMatchesEl.classList.remove('hidden')
            moviesListEl.classList.add('hidden')
        }

        if(!initial) {
            initialStateEl.classList.add('hidden')
        } else {
            initialStateEl.classList.remove('hidden')
            noMatchesEl.classList.add('hidden')
            moviesListEl.classList.add('hidden')
        }
    } 
    if(site === "watchlist") {
        initialStateEl.classList.add('hidden')
        if(searchMovies.length) {
            watchlistEmptyEl.classList.add('hidden')
            moviesListEl.classList.remove('hidden')
        } else {
            watchlistEmptyEl.classList.remove('hidden')
            moviesListEl.classList.add('hidden')
        }
    }
}

function addToWishlist(id) {
    likedMovieIDs.push(id)
    searchMovies.filter(movie => movie.imdbID === id)[0].isLiked = true
    renderMovies()
}

function removeFromWishList(id) {
    likedMovieIDs = likedMovieIDs.filter(el => el!==id)
    searchMovies.filter(movie => movie.imdbID === id)[0].isLiked = false
    if(site === "search") {
        renderMovies()
    }
    if(site === "watchlist") {
        renderWatchlist()
    }
}

function switchSites() {
    if(site === "search") {
        site = "watchlist"
        document.querySelector('.header').innerHTML = `
        <div class="container">
                <div class="header-text">
                    <h1 class="header-title">My Watchlist</h1>
                    <p class="header-link switch-link">Search for movies</a>
                </div>
            </div>
        `
        renderWatchlist()
    } 
    else {
        site = "search"
        document.querySelector('.header').innerHTML = `
        <div class="container">
                <div class="header-text">
                    <h1 class="header-title">Find your film</h1>
                    <p class="header-link switch-link">My Watchlist</a>
                </div>
                <div class="form-container">
                    <img class="form-icon" src="images/search-icon.png" alt="">
                    <form id="search-form">
                        <input type="text" id="search-input"> 
                        <button class="search-btn" id="search-btn">Search</button>
                    </form>
                </div>
            </div>
        ` 
    }
    switchSitesLink = document.querySelector('.switch-link')
    switchSitesLink.addEventListener('click', switchSites)
    updateStates()
}

function renderWatchlist() {
    searchMovies = []
    if(likedMovieIDs.length) {
        likedMovieIDs.forEach(id => {
            fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`)
                .then(res => res.json())
                .then(data => {
                    const isLiked = likedMovieIDs.indexOf(data.imdbID) !== -1 ? true : false
                    searchMovies.push(new Movie(data, isLiked))
                     renderMovies('watchlist')             
                })
        })
    } else {
        renderMovies('watchlist')
    }
}