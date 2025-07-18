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

// Chat Display
const liveChatContainerEl = document.getElementById("live-chat-container")
let chatLen = 0

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)

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

    // This is also mostly taken from Victim Crasher: https://github.com/VictimCrasher/static/tree/master/WaveTournament
    if (chatLen !== data.tourney.chat.length) {
        (chatLen === 0 || chatLen > data.tourney.chat.length) ? (liveChatContainerEl.innerHTML = "", chatLen = 0) : null
        const fragment = document.createDocumentFragment()

        for (let i = chatLen; i < data.tourney.chat.length; i++) {
            const chatColour = data.tourney.chat[i].team

            // Chat message container
            const liveChatWrapper = document.createElement("div")
            liveChatWrapper.classList.add("live-chat-wrapper")  

            // Name
            const liveChatName = document.createElement("span")
            liveChatName.classList.add(chatColour)
            liveChatName.innerText = data.tourney.chat[i].name + ": ";

            // Message
            const liveChatMessage = document.createElement("span")
            liveChatMessage.classList.add("message-content")
            liveChatMessage.innerText = data.tourney.chat[i].message

            liveChatWrapper.append(liveChatName, liveChatMessage)
            fragment.append(liveChatWrapper)
        }

        liveChatContainerEl.append(fragment)
        chatLen = data.tourney.chat.length
        liveChatContainerEl.scrollTop = liveChatContainerEl.scrollHeight
    }
}