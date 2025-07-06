// Team Inforamtion
const leftTeamFlagEl= document.getElementById("left-team-flag")
const rightTeamFlagEl = document.getElementById("right-team-flag")
const leftTeamNameEl= document.getElementById("left-team-name")
const rightTeamNameEl = document.getElementById("right-team-name")
let currentLeftTeamName, currentRightTeamName

// Beatmap information
const titleEl = document.getElementById("title")
const roundNameEl = document.getElementById("round-name")
let allBeatmaps
async function getBeatmaps() {
    const response = await axios.get("../_data/beatmaps.json")
    allBeatmaps = response.data.beatmaps

    roundNameEl.textContent = response.data.roundName
}
getBeatmaps()
// Find Beatmaps
const findBeatmaps = beatmapId => allBeatmaps.find(beatmap => Number(beatmap.beatmap_id) === Number(beatmapId))

// Now Playing Information
const nowPlayingSectionEl = document.getElementById("now-playing-section")
const nowPlayingTopSectionEl = document.getElementById("now-playing-top-section")
const nowPlayingSongTitleEl = document.getElementById("now-playing-song-title")
const nowPlayingSongArtistEl = document.getElementById("now-playing-song-artist")
// Stats
const statsSrEl = document.getElementById("stats-sr")
const statsLengthEl = document.getElementById("stats-length")
const statsArEl = document.getElementById("stats-ar")
const statsHpEl = document.getElementById("stats-hp")
const statsBpmEl = document.getElementById("stats-bpm")
const statsCsEl = document.getElementById("stats-cs")
const statsOdEl = document.getElementById("stats-od")
// Variables
let currentId, currentChecksum, mapFound = false, currentBeatmap

// Scores
const scoresContainerEl = document.getElementById("scores-container")
const scoreLeftEl = document.getElementById("score-left")
const scoreRightEl = document.getElementById("score-right")
const scoreDifferenceNumberEl = document.getElementById("score-difference-number")
const animation = {
    "scoreLeft": new CountUp(scoreLeftEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    "scoreRight": new CountUp(scoreRightEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    "scoreDifferenceNumber": new CountUp(scoreDifferenceNumberEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
}
let scoreVisible = true
// Score lines
const scoreLineLeftEl = document.getElementById("score-line-left")
const scoreLineRightEl = document.getElementById("score-line-right")

// Iframe
const iframe = document.getElementById("iframe")

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Team information
    if (currentLeftTeamName !== data.tourney.team.left) {
        currentLeftTeamName = data.tourney.team.left
        setFlagAndTeamName(currentLeftTeamName, leftTeamNameEl, leftTeamFlagEl)
    }
    if (currentRightTeamName !== data.tourney.team.right) {
        currentRightTeamName = data.tourney.team.right
        setFlagAndTeamName(currentRightTeamName, rightTeamNameEl, rightTeamFlagEl)
    }

    // Now Playing Information
    if (currentId !== data.beatmap.id || currentChecksum !== data.beatmap.checksum) {
        currentId = data.beatmap.id
        currentChecksum = data.beatmap.checksum
        mapFound = false

        nowPlayingSongTitleEl.textContent = data.beatmap.title
        nowPlayingSongArtistEl.textContent = data.beatmap.artist
    
        currentBeatmap = findBeatmaps(currentId)
        if (currentBeatmap) {
            nowPlayingTopSectionEl.textContent = `${currentBeatmap.mod.toUpperCase()}${currentBeatmap.order}`
            let sr = Math.round(Number(currentBeatmap.difficultyrating) * 100) / 100
            let len = setLengthDisplay(Number(currentBeatmap.total_length))
            let ar = Math.round(Number(currentBeatmap.diff_approach) * 10) / 10
            let hp = Math.round(Number(currentBeatmap.diff_drain) * 10) / 10
            let bpm = Math.round(Number(currentBeatmap.bpm) * 10) / 10
            let cs = Math.round(Number(currentBeatmap.diff_size) * 10) / 10
            let od = Math.round(Number(currentBeatmap.diff_overall) * 10) / 10

            switch (currentBeatmap.mod) {
                case "HR":
                    cs = Math.min(Math.round(cs * 1.3 * 10) / 10, 10)
                    ar = Math.min(Math.round(ar * 1.4 * 10) / 10, 10)
                    hp = Math.min(Math.round(hp * 1.4 * 10) / 10, 10)
                    od = Math.min(Math.round(od * 1.4 * 10) / 10, 10)
                case "DT":
                    if (ar > 5) ar = Math.round((((1200 - (( 1200 - (ar - 5) * 150) * 2 / 3)) / 150) + 5) * 10) / 10
                    else ar = Math.round((1800 - ((1800 - ar * 120) * 2 / 3)) / 120 * 10) / 10
                    od = Math.round((79.5 - (( 79.5 - 6 * od) * 2 / 3)) / 6 * 10) / 10
                    bpm = Math.round(bpm * 1.5)
                    len = Math.round(len / 1.5)
            }

            statsSrEl.textContent = `${sr}*`
            statsLengthEl.textContent = setLengthDisplay(len)
            statsArEl.textContent = ar
            statsHpEl.textContent = hp
            statsBpmEl.textContent = bpm
            statsCsEl.textContent = cs
            statsOdEl.textContent = od
            mapFound = true
        } else {
            nowPlayingTopSectionEl.textContent = "NOW PLAYING"
        }
    }

    if (!mapFound) {
        statsSrEl.textContent = `${data.beatmap.stats.stars.total}*`
        statsLengthEl.textContent = setLengthDisplay(Math.round((data.beatmap.time.lastObject - data.beatmap.time.firstObject) / 1000))
        statsArEl.textContent = data.beatmap.stats.ar.converted
        statsHpEl.textContent = data.beatmap.stats.hp.converted
        statsBpmEl.textContent = data.beatmap.stats.bpm.common
        statsCsEl.textContent = data.beatmap.stats.cs.converted
        statsOdEl.textContent = data.beatmap.stats.od.converted
    }

    // Update scores
    let currentScoreLeft = 0, currentScoreRight = 0
    for (let i = 0; i < data.tourney.clients.length; i++) {
        let currentScore = data.tourney.clients[i].play.score
        if (currentBeatmap && currentBeatmap.EZMultiplier) currentScore *= currentBeatmap.EZMultiplier
        if (data.tourney.clients[i].team === "left") currentScoreLeft += currentScore
        else currentScoreRight += currentScore
    }
    animation.scoreLeft.update(currentScoreLeft)
    animation.scoreRight.update(currentScoreRight)
    animation.scoreDifferenceNumber.update(Math.abs(currentScoreLeft - currentScoreRight))

    // Update lines
    if (currentScoreLeft > currentScoreRight) {
        scoreLineLeftEl.style.display = "block"
        scoreLineRightEl.style.display = "none"
    } else if (currentScoreLeft === currentScoreRight) {
        scoreLineLeftEl.style.display = "block"
        scoreLineRightEl.style.display = "block"
    } else if (currentScoreLeft < currentScoreRight) {
        scoreLineLeftEl.style.display = "none"
        scoreLineRightEl.style.display = "block"
    }

    // Score visibility
    if (scoreVisible !== data.tourney.scoreVisible) {
        scoreVisible = data.tourney.scoreVisible

        if (scoreVisible) {
            titleEl.style.top = "237px"
            roundNameEl.style.top = "314px"
            nowPlayingSectionEl.style.top = `calc(var(--greenscreen-player-1-4-top) + var(--greenscreen-height) - var(--middle-now-playing-section-height))`
            scoresContainerEl.style.top = "0px"
            iframe.style.bottom = "-263px"
        } else {
            titleEl.style.top = "257px"
            roundNameEl.style.top = "354px"
            nowPlayingSectionEl.style.top = `calc(var(--greenscreen-player-1-4-top) + var(--greenscreen-height)`
            scoresContainerEl.style.top = "-217px"
            iframe.style.bottom = "0px"
        }
    }
}

// Set flag and team name
function setFlagAndTeamName(teamName, teamNameElement, teamFlagElement) {
    teamNameElement.textContent = teamName

    // Set team flag
    teamFlagElement.setAttribute("src", `../flags/${teamName}.png`)
    teamFlagElement.onerror = () => {
        teamFlagElement.onerror = null
        teamFlagElement.src = "../flags/transparent.png"
    }
}

// Set Length Display
function setLengthDisplay(seconds) {
    const minuteCount = Math.floor(seconds / 60)
    const secondCount = seconds % 60

    return `${minuteCount.toString().padStart(2, "0")}:${secondCount.toString().padStart(2, "0")}`
}