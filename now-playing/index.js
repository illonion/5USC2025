const socket = createTosuWsSocket()
let mapId, mapChecksum
const songTitleEl = document.getElementById("song-title")
const songArtistEl = document.getElementById("song-artist")
const songBannerEl = document.getElementById("song-banner")
socket.onmessage = event => {
    const data = JSON.parse(event.data)

    if (mapId !== data.beatmap.id || mapChecksum !== data.beatmap.checksum) {
        mapId = data.beatmap.id
        mapChecksum = data.beatmap.checksum
        songBannerEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${data.beatmap.set}/covers/cover.jpg")`;
        songTitleEl.textContent = data.beatmap.title
        songArtistEl.textContent = data.beatmap.artist
    }
}