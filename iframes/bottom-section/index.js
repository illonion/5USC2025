// Beatmap information
let allBeatmaps
async function getBeatmaps() {
    const response = await axios.get("../../_data/beatmaps.json")
    allBeatmaps = response.data.beatmaps
}
getBeatmaps()
// Find Beatmaps
const findBeatmaps = beatmapId => allBeatmaps.find(beatmap => Number(beatmap.beatmap_id) === Number(beatmapId))

// Now Playing Information
const nowPlayingContainerEl = document.getElementById("now-playing-container")
const nowPlayingModIdEl = document.getElementById("now-playing-mod-id")
const nowPlayingSongTitleEl = document.getElementById("now-playing-song-title")
const nowPlayingSongArtistEl = document.getElementById("now-playing-song-artist")
// Variables
let currentId, currentChecksum

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Now Playing Information
    if ((currentId !== data.beatmap.id || currentChecksum !== data.beatmap.checksum) && allBeatmaps) {
        currentId = data.beatmap.id
        currentChecksum = data.beatmap.checksum
        nowPlayingContainerEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${data.beatmap.set}/covers/cover.jpg")`
        nowPlayingSongTitleEl.textContent = data.beatmap.title
        nowPlayingSongArtistEl.textContent = data.beatmap.artist

        const currentBeatmap = findBeatmaps(currentId)
        if (currentBeatmap) {
            nowPlayingModIdEl.style.display = "block"
            nowPlayingModIdEl.textContent = `${currentBeatmap.mod.toUpperCase()}${currentBeatmap.order}`
        } else {
            nowPlayingModIdEl.style.display = "none"
        }
    }
}