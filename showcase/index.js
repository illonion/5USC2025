// Get beatmaps
const titleEl = document.getElementById("title")
let allBeatmaps
async function getBeatmaps() {
    const response = await axios.get("../_data/showcase-beatmaps.json")
    allBeatmaps = response.data.beatmaps
    titleEl.textContent = `${response.data.roundName} SHOWCASE`
}
getBeatmaps()
const findBeatmaps = beatmapId => allBeatmaps.find(beatmap => Number(beatmap.beatmap_id) === Number(beatmapId))

// Iframe information
const nowPlayingIframeEl = document.getElementById("now-playing-iframe")
let nowPlayingIframeDocument
let nowPlayingIframeDocumentTitleEl
nowPlayingIframeEl.onload = function() {
    nowPlayingIframeDocument = nowPlayingIframeEl.contentDocument || nowPlayingIframeEl.contentWindow.document
    nowPlayingIframeDocumentTitleEl = nowPlayingIframeDocument.getElementById("title")
}
let mapId, mapMd5

// Beatmap information
const statisticsBodyMapperEl = document.getElementById("statistics-body-mapper")
const statisticsBodyStarEl = document.getElementById("statistics-body-star")
const statisticsBodyLengthEl = document.getElementById("statistics-body-length")
const statisticsBodyBpmEl = document.getElementById("statistics-body-bpm")
const statisticsBodyArEl = document.getElementById("statistics-body-ar")
const statisticsBodyCsEl = document.getElementById("statistics-body-cs")
const statisticsBodyHpEl = document.getElementById("statistics-body-hp")
const statisticsBodyOdEl = document.getElementById("statistics-body-od")
let mapper, star, songLength, bpm, ar, cs, hp, od

// Replayer
const replayerEl = document.getElementById("replayer")
const replayerNameEl = document.getElementById("replayer-name")
let replayerName

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    // Get data
    const data = JSON.parse(event.data)

    // Set mod
    if (mapId !== data.beatmap.id && mapMd5 !== data.beatmap.checksum && nowPlayingIframeDocumentTitleEl) {
        mapId = data.beatmap.id
        mapMd5 = data.beatmap.checksum

        const mappoolBeatmap = findBeatmaps(mapId)
        if (mappoolBeatmap) {
            nowPlayingIframeDocumentTitleEl.textContent = `${mappoolBeatmap.mod}${mappoolBeatmap.order}`
        } else {
            nowPlayingIframeDocumentTitleEl.textContent = "NOW PLAYING"
        }
    }

    // Set stats
    if (mapper !== data.beatmap.mapper) {
        mapper = data.beatmap.mapper
        statisticsBodyMapperEl.textContent = mapper
    }
    if (star !== data.beatmap.stats.stars.total) {
        star = data.beatmap.stats.stars.total
        statisticsBodyStarEl.textContent = star.toFixed(2)
    }
    if (songLength !== data.beatmap.time.lastObject - data.beatmap.time.firstObject) {
        songLength = data.beatmap.time.lastObject - data.beatmap.time.firstObject
        statisticsBodyLengthEl.textContent = setLengthDisplay(Math.round(songLength / 3 * 2 / 1000))
    }
    if (bpm !== data.beatmap.stats.bpm.common) {
        bpm = data.beatmap.stats.bpm.common
        statisticsBodyBpmEl.textContent = bpm
    }
    if (ar !== data.beatmap.stats.ar.converted) {
        ar = data.beatmap.stats.ar.converted
        statisticsBodyArEl.textContent = ar.toFixed(1)
    }
    if (cs !== data.beatmap.stats.cs.converted) {
        cs = data.beatmap.stats.cs.converted
        statisticsBodyCsEl.textContent = cs.toFixed(1)
    }
    if (hp !== data.beatmap.stats.hp.converted) {
        hp = data.beatmap.stats.hp.converted
        statisticsBodyHpEl.textContent = hp.toFixed(1)
    }
    if (od !== data.beatmap.stats.od.converted) {
        od = data.beatmap.stats.od.converted
        statisticsBodyOdEl.textContent = od.toFixed(1)
    }

    // Replayer name
    if (replayerName !== data.resultsScreen.playerName) {
        replayerName = data.resultsScreen.playerName
        replayerEl.style.display = "block"
        replayerNameEl.textContent = replayerName

        if (replayerName === "") { replayerEl.style.display = "none" }
    }
}

// Set Length Display
function setLengthDisplay(seconds) {
    const minuteCount = Math.floor(seconds / 60)
    const secondCount = seconds % 60

    return `${minuteCount.toString().padStart(2, "0")}:${secondCount.toString().padStart(2, "0")}`
}