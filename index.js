import Movie from "./Movie.js"

const apiKey = "5d6c1b72"

const searchBtn = document.getElementById('search-btn')
const searchForm = document.getElementById('search-form')
const searchInput = document.getElementById('search-input')
const moviesListEl = document.querySelector('.movies')
const initialStateEl = document.querySelector('.initial-state')


let movies = []

let searchedMovieIDs = []

let likedMovieIDs = []

searchForm.addEventListener('submit', e => {
    e.preventDefault()
    search()
})

document.addEventListener('click', e => {
    if(e.target.dataset.id) {
        console.log(e.target.dataset.id)
        const id = e.target.dataset.id
        if(movies.filter(movie => movie.imdbID === id)[0].isLiked) {
            removeFromWishList(id)
        } else {
            addToWishlist(id)
        }
    }
})

function getMovieHtml(movie) {
    const wishlistBtnHtml = movie.isLiked ? `
    <div class="add-btn">
        <img class="add-icon" src="images/add-icon.png" alt="" data-id="${movie.imdbID}">
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

function renderMovies() {
    let html = ''
    movies.forEach(movie => html += getMovieHtml(movie))
    moviesListEl.innerHTML = html
    moviesListEl.classList.remove('hidden')
    initialStateEl.classList.add('hidden')
}

function getMoviesFromSearch() {
    movies = []
    searchedMovieIDs.forEach(id => {
        fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`)
            .then(res => res.json())
            .then(data => {
                console.log(data)
                const isLiked = likedMovieIDs.indexOf(data.imdbID) !== -1 ? true : false
                movies.push(new Movie(data, isLiked))
                // moviesListHtml += getMovieHtml(data)
                 renderMovies()             
            })
    })
}

function search() {
    searchedMovieIDs = []
    const query = searchInput.value
    fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${query}`)
        .then(res => res.json())
        .then(data => {
            data.Search.forEach(movie => {
                searchedMovieIDs.push(movie.imdbID)
            })
            getMoviesFromSearch()
        })
    }

function addToWishlist(id) {
    likedMovieIDs.push(id)
    movies.filter(movie => movie.imdbID === id)[0].isLiked = true
    renderMovies()
}

function removeFromWishList(id) {
    likedMovieIDs = likedMovieIDs.filter(el => el!==id)
    movies.filter(movie => movie.imdbID === id)[0].isLiked = false
    renderMovies()
}