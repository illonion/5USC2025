// Team star container
const teamStarContainerLeft = document.getElementById("team-star-container-left")
const teamStarContainerRight = document.getElementById("team-star-container-right")

// Beatmap information
const roundNameEl = document.getElementById("round-name")
const mappoolManagementMapsEl = document.getElementById("mappool-management-maps")
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

    // Append map buttons
    for (let i = 0; i < allBeatmaps.length - 1; i++) {
        const button = document.createElement("button")
        button.textContent = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
        button.addEventListener("mousedown", mapClickEvent)
        button.addEventListener("contextmenu", event => event.preventDefault())
        button.setAttribute("id", allBeatmaps[i].beatmap_id)
        button.dataset.id = allBeatmaps[i].beatmap_id
        mappoolManagementMapsEl.append(button)
    }

    // Set beatmap id
    mappoolTileTiebreakerEl.dataset.id = allBeatmaps[allBeatmaps.length - 1].beatmap_id
    mappoolTileTiebreakerEl.setAttribute("id", allBeatmaps[allBeatmaps.length - 1].beatmap_id)
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
const mappoolTileTiebreakerEl = document.getElementById("mappool-container-tiebreaker")
function updateStarCount(side, action) {
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

    // Setting Tiebreaker Information
    if (currentStarLeft >= currentFirstTo - 1 && currentStarRight >= currentFirstTo - 1) {
        mappoolTileTiebreakerEl.children[0].style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${allBeatmaps[allBeatmaps.length - 1].beatmapset_id}/covers/cover.jpg")`
        mappoolTileTiebreakerEl.children[1].style.backgroundColor = "#63cc4e"
        mappoolTileTiebreakerEl.children[1].textContent = "TB"
    } else {
        mappoolTileTiebreakerEl.children[0].style.backgroundImage = "none"
        mappoolTileTiebreakerEl.children[1].style.backgroundColor = "#2a2c30"
        mappoolTileTiebreakerEl.children[1].textContent = ""
    }
}

// Star Toggle
const toggleStarsEl = document.getElementById("toggle-stars")
let isStarToggled = true
function toggleStars() {
    isStarToggled = !isStarToggled
    toggleStarsEl.innerText = `TOGGLE STARS: ${isStarToggled? "ON" : "OFF"}`
    if (!isStarToggled) {
        teamStarContainerLeft.style.display = "none"
        teamStarContainerRight.style.display = "none"
    } else {
        teamStarContainerLeft.style.display = "block"
        teamStarContainerRight.style.display = "block"
    }
}

// Ban related elements
const teamBanImageContainerLeftEl = document.getElementById("team-ban-image-container-left")
const teamBanTextContainerLeftEl = document.getElementById("team-ban-text-container-left")
const teamBanImageContainerRightEl = document.getElementById("team-ban-image-container-right")
const teamBanTextContainerRightEl = document.getElementById("team-ban-text-container-right")

// Pick related elements
const mappoolContainerLeftEl = document.getElementById("mappool-container-left")
const mappoolContainerRightEl = document.getElementById("mappool-container-right")

// Map Click Event
function mapClickEvent(event) {
    // Figure out whether it is a pick or ban
    const currentMapId = this.dataset.id
    const currentMap = findBeatmaps(currentMapId)
    if (!currentMap) return

    // Team
    let team
    if (event.button === 0) team = "left"
    else if (event.button === 2) team = "right"
    if (!team) return

    // Action
    let action = "pick"
    if (event.ctrlKey) action = "ban"

    // Check if map exists in bans
    const mapCheck = !!(
        teamBanImageContainerLeftEl.querySelector(`[data-id="${currentMapId}"]`) ||
        teamBanImageContainerRightEl.querySelector(`[data-id="${currentMapId}"]`) ||
        mappoolContainerLeftEl.querySelector(`[data-id="${currentMapId}"]`) ||
        mappoolContainerRightEl.querySelector(`[data-id="${currentMapId}"]`)
    )
    if (mapCheck) return

    // Bans
    if (action === "ban") {
        const currentBanImageContainer = team === "left" ? teamBanImageContainerLeftEl : teamBanImageContainerRightEl
        const currentBanTextContainer = team === "left"? teamBanTextContainerLeftEl : teamBanTextContainerRightEl

        for (let i = 0; i < currentBanImageContainer.childElementCount; i++) {
            if (currentBanImageContainer.children[i].dataset.id !== undefined) continue
            currentBanImageContainer.children[i].dataset.id = currentMapId
            currentBanImageContainer.children[i].style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
            currentBanTextContainer.children[i].textContent = `${currentMap.mod}${currentMap.order}`
            break
        }
    }

    // Picks
    if (action === "pick") {
        const currentMapooolContainer = team === "left" ? mappoolContainerLeftEl : mappoolContainerRightEl
        for (let i = 0; i < currentMapooolContainer.childElementCount; i++) {
            if (currentMapooolContainer.children[i].dataset.id !== undefined) continue
            currentMapooolContainer.children[i].dataset.id = currentMapId
            currentMapooolContainer.children[i].children[0].style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
            currentMapooolContainer.children[i].children[1].style.backgroundColor = team === "left" ? "#CC4E4E" : "#1C4C8F"
            currentMapooolContainer.children[i].children[1].textContent = `${currentMap.mod}${currentMap.order}`
            break
        }
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

        // Find element
        const element = document.getElementById(currentId)
        
        // Click event
        if (isAutopickToggled && element && (!element.hasAttribute("data-is-autopicked") || element.getAttribute("data-is-autopicked") !== "true")) {
            // Check if autopicked already
            const event = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window,
                button: (currentNextPicker === "left")? 0 : 2
            })
            element.dispatchEvent(event)
            element.setAttribute("data-is-autopicked", "true")

            if (currentNextPicker === "left") setNextPicker("right")
            else if (currentNextPicker === "right") setNextPicker("left")
        }
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

// Toggle Autopick
const toggleAutopickEl = document.getElementById("toggle-autopick")
let isAutopickToggled = false
function toggleAutopick() {
    isAutopickToggled = !isAutopickToggled
    toggleAutopickEl.textContent = `TOGGLE AUTOPICK: ${isAutopickToggled? "ON": "OFF"}`
}

// TODO: Set Next Picker
const nextPickerEl = document.getElementById("next-picker")
let currentNextPicker = "none"
function setNextPicker(pickerTeam) {
    currentNextPicker = pickerTeam
    nextPickerEl.textContent = pickerTeam.toUpperCase()
}

// Mappool override section
const mappoolOverrideColumnEl = document.getElementById("mappool-override-column")
const mappoolOverrideActionSelectEl = document.getElementById("mappool-override-action-select")
function mappoolOverrideChangeAction() {
    let mappoolOverrideAction = mappoolOverrideActionSelectEl.value

    // Remove last elements
    while (mappoolOverrideColumnEl.childElementCount > 3) {
        mappoolOverrideColumnEl.lastChild.remove()
    }

    // Set Ban
    if (mappoolOverrideAction === "setBan" || mappoolOverrideAction === "removeBan") {
        // Create h2 for which ban
        const whichBanH2 = document.createElement("h2")
        whichBanH2.textContent = "Which Ban?"
        mappoolOverrideColumnEl.append(whichBanH2)

        // Select Ban
        const whichBanSelect = document.createElement("select")
        whichBanSelect.classList.add("mappool-override-select")
        whichBanSelect.setAttribute("onchange", "setMappoolOverrideInformation()")
        whichBanSelect.setAttribute("id", "which-action-select")
        whichBanSelect.setAttribute("size", "4")
        for (let i = 0; i < 2; i++) {
            // Create red ban option
            const redBanOption = document.createElement("option")
            redBanOption.setAttribute("value",`left|ban|${i}`)
            redBanOption.textContent = `Left Ban ${i + 1}`

            const blueBanOption = document.createElement("option")
            blueBanOption.setAttribute("value",`right|ban|${i}`)
            blueBanOption.textContent = `Right Ban ${i + 1}`

            whichBanSelect.append(redBanOption, blueBanOption)
        }
        mappoolOverrideColumnEl.append(whichBanSelect)

        if (mappoolOverrideAction === "setBan") {
            // Which Map
            const whichBanMap = document.createElement("h2")
            whichBanMap.textContent = "Which Map?"
            mappoolOverrideColumnEl.append(whichBanMap)

            // Select all maps
            const mappoolOverrideBeatmapsContainer = document.createElement("div")
            mappoolOverrideBeatmapsContainer.classList.add("mappool-override-beatmaps-container")

            for (let i = 0; i < allBeatmaps.length; i++) {
                const mappoolOverrideBeatmaps = document.createElement("div")
                mappoolOverrideBeatmaps.classList.add("mappool-override-beatmaps")
                mappoolOverrideBeatmaps.textContent = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
                mappoolOverrideBeatmaps.setAttribute("id", allBeatmaps[i].beatmap_id)
                mappoolOverrideBeatmaps.addEventListener("click", mappoolOverrideSelectMap)
                mappoolOverrideBeatmapsContainer.append(mappoolOverrideBeatmaps)
                mappoolOverrideColumnEl.append(mappoolOverrideBeatmapsContainer)
            }
        }
    }

    // Apply Changes Button
    const sidebarButtonContainer = document.createElement("div")
    sidebarButtonContainer.classList.add("sidebar-button-container")
    mappoolOverrideColumnEl.append(sidebarButtonContainer)

    const applyChangesButton = document.createElement("button")
    applyChangesButton.setAttribute("id", "apply-changes")
    applyChangesButton.textContent = `APPLY CHANGES`
    applyChangesButton.style.fontSize = "0.7em"
    sidebarButtonContainer.append(applyChangesButton)
    
    switch (mappoolOverrideAction) {
        case "setBan":
            applyChangesButton.setAttribute("onclick", "mappoolOverrideSetBan()")
            break
        case "removeBan":
            applyChangesButton.setAttribute("onclick", "mappoolOverrideRemoveBan()")
            break
    }
}

// Set Mappool Override Information
let mappoolOverrideTeam, mappoolOverrideAction, mappoolOverrideTileNumber
function setMappoolOverrideInformation() {
    [mappoolOverrideTeam, mappoolOverrideAction, mappoolOverrideTileNumber] = document.getElementById("which-action-select").value.split("|")
}

// Mappool Override Select Map
let mappoolOverrideMap
function mappoolOverrideSelectMap() {
    mappoolOverrideMap = this.id
    const mappoolOverrideBeatmaps = document.getElementsByClassName("mappool-override-beatmaps")
    for (let i = 0; i < mappoolOverrideBeatmaps.length; i++) {
        mappoolOverrideBeatmaps[i].style.backgroundColor = "transparent"
        mappoolOverrideBeatmaps[i].style.color = "white"
    }
    this.style.backgroundColor = "#C2C2C2"
    this.style.color = "#26272B"
}

// Mappool Override Set Ban
function mappoolOverrideSetBan() {
    if (!mappoolOverrideTeam || !mappoolOverrideAction || !mappoolOverrideTileNumber || !mappoolOverrideMap) return

    // Get current map
    const currentMap = findBeatmaps(mappoolOverrideMap)
    if (!currentMap) return

    // Get Containers
    const currentBanImageContainer = mappoolOverrideTeam === "left" ? teamBanImageContainerLeftEl : teamBanImageContainerRightEl
    const currentBanTextContainer = mappoolOverrideTeam === "left"? teamBanTextContainerLeftEl : teamBanTextContainerRightEl

    // Set information
    const currentBanImage = currentBanImageContainer.children[mappoolOverrideTileNumber]
    currentBanImage.dataset.id = mappoolOverrideMap
    currentBanImage.style.backgroundImage =  `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
    currentBanTextContainer.children[mappoolOverrideTileNumber].textContent = `${currentMap.mod}${currentMap.order}`
}

// Mappool Override Remove Ban
function mappoolOverrideRemoveBan() {
    if (!mappoolOverrideTeam || !mappoolOverrideAction || !mappoolOverrideTileNumber) return

    // Get Containers
    const currentBanImageContainer = mappoolOverrideTeam === "left" ? teamBanImageContainerLeftEl : teamBanImageContainerRightEl
    const currentBanTextContainer = mappoolOverrideTeam === "left"? teamBanTextContainerLeftEl : teamBanTextContainerRightEl

    // Remove Information
    const currentBanImage = currentBanImageContainer.children[mappoolOverrideTileNumber]
    currentBanImage.removeAttribute("data-id")
    currentBanImage.style.backgroundImage = "none"
    currentBanTextContainer.children[mappoolOverrideTileNumber].textContent = ``
}