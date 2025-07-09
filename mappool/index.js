// Team star container
const teamStarContainerLeft = document.getElementById("team-star-container-left")
const teamStarContainerRight = document.getElementById("team-star-container-right")

// Beatmap information
const roundNameEl = document.getElementById("round-name")
let allBeatmaps, roundName
let currentBestOf, currentFirstTo, currentStarLeft = 0, currentStarRight = 0
async function getBeatmaps() {
    const response = await axios.get("../_data/beatmaps.json")
    // Set information
    allBeatmaps = response.data.beatmaps
    roundName = response.data.roundName

    // Set best of / first to information
    switch (roundName) {
        case "ROUND OF 32":
            currentBestOf = 9
            break
        case "ROUND OF 16": case "QUARTERFINALS":
            currentBestOf = 11
            break
        case "SEMIFINALS": case "FINALS":
            currentBestOf = 13
            break
    }
    currentFirstTo = Math.ceil(currentBestOf / 2)

    // Append stars
    teamStarContainerLeft.append(createStars("left", currentStarLeft))
    teamStarContainerRight.append(createStars("right", currentStarRight))

    // Set round name
    roundNameEl.textContent = roundName
}
getBeatmaps()
// Find Beatmaps
const findBeatmaps = beatmapId => allBeatmaps.find(beatmap => Number(beatmap.beatmap_id) === Number(beatmapId))

// Create stars
function createStars(side, starCount) {
    const fragment = document.createDocumentFragment()
    for (let i = 0; i < currentFirstTo; i++) {
        const isFilled = i < starCount
        if (i !== currentFirstTo - 1) {
            const image = document.createElement("img")
            image.classList.add(`team-star-bo${currentBestOf}-${i + 1}`)
            image.setAttribute("src", `../_shared/assets/points/small_star_${side}_${isFilled? "fill" : "empty"}.png`)
            fragment.append(image)
        } else {
            const image = document.createElement("img")
            image.classList.add(`team-star-middle`)
            image.setAttribute("src", `../_shared/assets/points/big_star_${side}_${isFilled? "fill" : "empty"}.png`)
            fragment.append(image)
        }
    }
    return fragment
}

// Update star count
function updateStarCount(side, action) {
    if (!isStarToggled) return

    if (side === "left") {
        currentStarLeft += action === "plus" ? 1 : -1
        currentStarLeft = Math.max(0, Math.min(currentStarLeft, currentFirstTo))
    } else if (side === "right") {
        currentStarRight += action === "plus" ? 1 : -1
        currentStarRight = Math.max(0, Math.min(currentStarRight, currentFirstTo))
    }

    teamStarContainerLeft.innerHTML = ""
    teamStarContainerRight.innerHTML = ""
    teamStarContainerLeft.append(createStars("left", currentStarLeft))
    teamStarContainerRight.append(createStars("right", currentStarRight))
}

// Star Toggle
const toggleStarsEl = document.getElementById("toggle-stars")
let isStarToggled = true
function toggleStars() {
    isStarToggled = !isStarToggled
    toggleStarsEl.innerText = `Toggle Stars: ${isStarToggled? "ON" : "OFF"}`
    if (!isStarToggled) {
        teamStarContainerLeft.style.display = "none"
        teamStarContainerRight.style.display = "none"
    } else {
        teamStarContainerLeft.style.display = "block"
        teamStarContainerRight.style.display = "block"
    }
}
// Team Inforamtion
const leftTeamNameEl= document.getElementById("team-name-left")
const rightTeamNameEl = document.getElementById("team-name-right")
let currentLeftTeamName, currentRightTeamName

// Set scores
let currentScoreLeft, currentScoreRight

// IPC State + Checked Winner
let ipcState, checkedWinner = false

// Now Playing Information
let currentId, currentChecksum, currentMappoolBeatmap

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Team information
    if (currentLeftTeamName !== data.tourney.team.left) {
        currentLeftTeamName = data.tourney.team.left
        leftTeamNameEl.textContent = currentLeftTeamName
    }
    if (currentRightTeamName !== data.tourney.team.right) {
        currentRightTeamName = data.tourney.team.right
        rightTeamNameEl.textContent = currentRightTeamName
    }

    // Mappool map
    if (currentId !== data.beatmap.id || currentChecksum !== data.beatmap.checksum) {
        currentId = data.beatmap.id
        currentChecksum = data.beatmap.checksum
        currentMappoolBeatmap = findBeatmaps(currentId)
    }

    // Set current scores
    if (ipcState === 2 || ipcState === 3) {
        currentScoreLeft = 0
        currentScoreRight = 0
        
        // Check if mappool map
        for (let i = 0; i < data.tourney.clients.length; i++) {
            let currentScore = data.tourney.clients[i].play.score

            // Set EZ Multiplier
            if (currentMappoolBeatmap && 
                (currentMappoolBeatmap.mod === "FM" || currentMappoolBeatmap.mod === "EZ") &&
                data.tourney.clients[i].play.mods.name.includes("EZ")
            ) {
                currentScore *= currentMappoolBeatmap.EZMultiplier ?? 1.8
            }

            // Set score to team
            if (data.tourney.clients[i].team === "left") currentScoreLeft += currentScore
            else currentScoreRight += currentScore
        }
    }

    // Update IPC State
    if (ipcState !== data.tourney.ipcState) {
        ipcState = data.tourney.ipcState
        if (ipcState === 4 && checkedWinner && isStarToggled) {
            checkedWinner = true
            if (currentScoreLeft > currentScoreRight) updateStarCount("left", "plus")
            else if (currentScoreLeft < currentScoreRight) updateStarCount("right", "plus")
        }
        if (ipcState !== 4) {
            checkedWinner = false
        }
    }
}