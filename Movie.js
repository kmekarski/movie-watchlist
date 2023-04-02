export default class Movie {
    constructor(data, isLiked) {
        Object.assign(this, data)
        this.isLiked = isLiked
    }
}

