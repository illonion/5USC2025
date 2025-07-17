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

    document.cookie = `currentFirstTo=${currentFirstTo}; path=/`
    document.cookie = `currentStarLeft=${currentStarLeft}; path=/`
    document.cookie = `currentStarRight=${currentStarRight}; path=/`
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
        toggleStarsEl.classList.add("toggle-inactive")
        toggleStarsEl.classList.remove("toggle-active")
    } else {
        teamStarContainerLeft.style.display = "block"
        teamStarContainerRight.style.display = "block"
        toggleStarsEl.classList.add("toggle-active")
        toggleStarsEl.classList.remove("toggle-inactive")
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
async function mapClickEvent(event) {
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
            currentBanImageContainer.children[i].children[1].style.display = "block"
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
            currentPickedTile = currentMapooolContainer.children[i]
            break
        }

        await delay(10000)
        if (enableAutoAdvance) {
            obsGetCurrentScene((currentScene) => {
                if (currentScene.name === gameplay_scene_name) return
                obsSetCurrentScene(gameplay_scene_name)
            })
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
let currentIpcState, previousIpcState, checkedWinner = false

// Now Playing Information
let currentId, currentChecksum, currentMappoolBeatmap, currentPickedTile

// Current Picker
const currentPickerEl = document.getElementById("current-picker")

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)

    // Team information
    if (currentLeftTeamName !== data.tourney.team.left) {
        currentLeftTeamName = data.tourney.team.left
        leftTeamNameEl.textContent = currentLeftTeamName.toUpperCase()
        document.cookie = `currentLeftTeamName=${currentLeftTeamName}; path=/`
    }
    if (currentRightTeamName !== data.tourney.team.right) {
        currentRightTeamName = data.tourney.team.right
        rightTeamNameEl.textContent = currentRightTeamName.toUpperCase()
        document.cookie = `currentRightTeamName=${currentRightTeamName}; path=/`
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
    if (currentIpcState === 2 || currentIpcState === 3) {
        // Auto switch to gameplay no matter what
        obsSetCurrentScene(gameplay_scene_name)

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
    if (currentIpcState !== data.tourney.ipcState) {
        currentIpcState = data.tourney.ipcState
        
        // Results screen
        if (currentIpcState === 4 && !checkedWinner && isStarToggled) {
            checkedWinner = true

            // Set winner
            let winner = ""
            if (currentScoreLeft > currentScoreRight) winner = "left"
            else if (currentScoreLeft < currentScoreRight) winner = "right"
            const loser = winner === "left" ? "right" : "left"
            if (!winner) return
            updateStarCount(winner, "plus")
            
            // Set background to winning map
            if (currentMappoolBeatmap && currentPickedTile) {
                currentPickedTile.children[0].children[0].classList.add(`${winner}-win-overlay`)
                currentPickedTile.children[0].children[0].classList.remove(`${loser}-win-overlay`)
                currentPickedTile.children[2].setAttribute("src", `static/${winner === "left"? "red" : "blue"}-crown.png`)
                currentPickedTile.children[2].style.display = "block"
            }
        }

        // Non results screen
        if (currentIpcState !== 4) {
            checkedWinner = false

            // If no winners yet, then go to mappool scene
            // If winners, then go to winner scene
            // Generally this triggers when enableAutoAdvance is turned on and ipcState === 1 (from results screen)
            if (previousIpcState === 4 &&
                currentIpcState !== previousIpcState &&
                enableAutoAdvance &&
                currentStarLeft !== currentFirstTo &&
                currentStarRight !== currentFirstTo
            ) {
                obsGetCurrentScene((scene) => {
                    if (scene.name === mappool_scene_name) return
                    obsSetCurrentScene(mappool_scene_name)
                })
            } else if (previousIpcState === 4 &&
                currentIpcState !== previousIpcState &&
                enableAutoAdvance
            ) {
                obsGetCurrentScene((scene) => {
                    if (scene.name === winner_scene_name) return
                    obsSetCurrentScene(winner_scene_name)
                })
            }
        }

        previousIpcState = currentIpcState
    }

    // Set current picker
    const mapCheck = !!(
        mappoolContainerLeftEl.querySelector(`[data-id="${currentId}"]`) ||
        mappoolContainerRightEl.querySelector(`[data-id="${currentId}"]`)
    )
    if (mapCheck) {
        currentPickerEl.style.display = "block"
        let element, index, parent
        if (mappoolContainerLeftEl.querySelector(`[data-id="${currentId}"]`)) {
            parent = mappoolContainerLeftEl
            element = parent.querySelector(`[data-id="${currentId}"]`)
            currentPickerEl.setAttribute("src", "static/red-team-picking.png")
        } else {
            parent = mappoolContainerRightEl
            element = parent.querySelector(`[data-id="${currentId}"]`)
            currentPickerEl.setAttribute("src", "static/blue-team-picking.png")
        }

        // Get index of element
        index = Array.from(parent.children).indexOf(element)

        // Set horizontal alignment
        const widthOfTile = parent.children[0].getBoundingClientRect().width
        currentPickerEl.style.left = `${599 + index * (widthOfTile + 35) + widthOfTile / 2}px`
    } else {
        currentPickerEl.style.display = "none"
    }
}

// Toggle Autopick
const toggleAutopickEl = document.getElementById("toggle-autopick")
let isAutopickToggled = false
function toggleAutopick() {
    isAutopickToggled = !isAutopickToggled
    toggleAutopickEl.textContent = `TOGGLE AUTOPICK: ${isAutopickToggled? "ON": "OFF"}`
    if (isAutopickToggled) {
        toggleAutopickEl.classList.remove("toggle-inactive")
        toggleAutopickEl.classList.add("toggle-active")
    } else {
        toggleAutopickEl.classList.add("toggle-inactive")
        toggleAutopickEl.classList.remove("toggle-active")
    }
}

// Next Picker
const nextPickerEl = document.getElementById("next-picker")
let currentNextPicker = "none"
function setNextPicker(pickerTeam) {
    currentNextPicker = pickerTeam
    nextPickerEl.textContent = pickerTeam === "left" ? "RED" : "BLUE"
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
            redBanOption.textContent = `Red Ban ${i + 1}`

            const blueBanOption = document.createElement("option")
            blueBanOption.setAttribute("value",`right|ban|${i}`)
            blueBanOption.textContent = `Blue Ban ${i + 1}`

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

    if (mappoolOverrideAction === "setPick" || mappoolOverrideAction === "removePick") {
        // Create h2 for which ban
        const whichBanH2 = document.createElement("h2")
        whichBanH2.textContent = "Which Pick?"
        mappoolOverrideColumnEl.append(whichBanH2)

        // Select Pick
        const whichPickSelect = document.createElement("select")
        whichPickSelect.classList.add("mappool-override-select")
        whichPickSelect.setAttribute("onchange", "setMappoolOverrideInformation()")
        whichPickSelect.setAttribute("id", "which-action-select")
        whichPickSelect.setAttribute("size", mappoolContainerLeftEl.childElementCount * 2)

        for (let i = 0; i < mappoolContainerLeftEl.childElementCount; i++) {
            // Create red ban option
            const redPickOption = document.createElement("option")
            redPickOption.setAttribute("value",`left|pick|${i}`)
            redPickOption.textContent = `Red Pick ${i + 1}`

            const bluePickOption = document.createElement("option")
            bluePickOption.setAttribute("value",`right|pick|${i}`)
            bluePickOption.textContent = `Blue Pick ${i + 1}`

            whichPickSelect.append(redPickOption, bluePickOption)
        }
        mappoolOverrideColumnEl.append(whichPickSelect)

        if (mappoolOverrideAction === "setPick") {
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

    // Set Winner
    if (mappoolOverrideAction === "setWinner" || mappoolOverrideAction === "removeWinner") {
        // Create h2 for which ban
        const whichBanH2 = document.createElement("h2")
        whichBanH2.textContent = "Which Pick?"
        mappoolOverrideColumnEl.append(whichBanH2)

        // Select Pick
        const whichPickSelect = document.createElement("select")
        whichPickSelect.classList.add("mappool-override-select")
        whichPickSelect.setAttribute("onchange", "setMappoolOverrideInformation()")
        whichPickSelect.setAttribute("id", "which-action-select")
        whichPickSelect.setAttribute("size", mappoolContainerLeftEl.childElementCount * 2)

        for (let i = 0; i < mappoolContainerLeftEl.childElementCount; i++) {
            // Create red ban option
            const redPickOption = document.createElement("option")
            redPickOption.setAttribute("value",`left|pick|${i}`)
            redPickOption.textContent = `Red Pick ${i + 1}`

            const bluePickOption = document.createElement("option")
            bluePickOption.setAttribute("value",`right|pick|${i}`)
            bluePickOption.textContent = `Blue Pick ${i + 1}`

            whichPickSelect.append(redPickOption, bluePickOption)
        }
        mappoolOverrideColumnEl.append(whichPickSelect)

        if (mappoolOverrideAction === "setWinner") {
            // Which Team
            const whichBanMap = document.createElement("h2")
            whichBanMap.textContent = "Which Team?"
            mappoolOverrideColumnEl.append(whichBanMap)

            // Select Team
            const whichPickSelect = document.createElement("select")
            whichPickSelect.classList.add("mappool-override-select")
            whichPickSelect.setAttribute("id", "which-team-winner")
            whichPickSelect.setAttribute("size", 2)
            const redTeamOption = document.createElement("option")
            redTeamOption.setAttribute("value", "left")
            redTeamOption.textContent = `Left`
            const blueTeamOption = document.createElement("option")
            blueTeamOption.setAttribute("value", "right")
            blueTeamOption.textContent = `Right`
            whichPickSelect.append(redTeamOption, blueTeamOption)
            mappoolOverrideColumnEl.append(whichPickSelect)
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
        case "setPick":
            applyChangesButton.setAttribute("onclick", "mappoolOverrideSetPick()")
            break
        case "removePick":
            applyChangesButton.setAttribute("onclick", "mappoolOverrideRemovePick()")
            break
        case "setWinner":
            applyChangesButton.setAttribute("onclick", "mappoolOverrideSetWinner()")
            break
        case "removeWinner":
            applyChangesButton.setAttribute("onclick", "mappoolOverrideRemoveWinner()")
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
    currentBanImage.children[1].style.display = "block"
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
    currentBanImage.children[1].style.display = "none"
    currentBanTextContainer.children[mappoolOverrideTileNumber].textContent = ``
}

// Mappool Override Set Pick
function mappoolOverrideSetPick() {
    if (!mappoolOverrideTeam || !mappoolOverrideAction || !mappoolOverrideTileNumber || !mappoolOverrideMap) return

    // Get current map
    const currentMap = findBeatmaps(mappoolOverrideMap)
    if (!currentMap) return

    // Set map information
    const currentMapooolContainer = mappoolOverrideTeam === "left" ? mappoolContainerLeftEl : mappoolContainerRightEl
    const currentTile = currentMapooolContainer.children[mappoolOverrideTileNumber]

    currentTile.dataset.id = mappoolOverrideMap
    currentTile.children[0].style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
    currentTile.children[1].style.backgroundColor = mappoolOverrideTeam === "left" ? "#CC4E4E" : "#1C4C8F"
    currentTile.children[1].textContent = `${currentMap.mod}${currentMap.order}`
}

// Mappool Override Remove Pick
function mappoolOverrideRemovePick() {
    if (!mappoolOverrideTeam || !mappoolOverrideAction || !mappoolOverrideTileNumber) return

    // Set map information
    const currentMapooolContainer = mappoolOverrideTeam === "left" ? mappoolContainerLeftEl : mappoolContainerRightEl
    const currentTile = currentMapooolContainer.children[mappoolOverrideTileNumber]

    currentTile.removeAttribute("data-id")
    currentTile.children[0].style.backgroundImage = "none"
    currentTile.children[1].style.backgroundColor = "#2a2c30"
    currentTile.children[1].textContent = ""
    currentTile.children[2].style.display = "none"
}

// Set Mappool Override Team Winner
function mappoolOverrideSetWinner() {
    if (!mappoolOverrideTeam || !mappoolOverrideAction || !mappoolOverrideTileNumber) return
    const teamWinner = document.getElementById("which-team-winner").value
    if (!teamWinner) return
    const teamLoser = teamWinner === "left" ? "right" : "left"

    // Set map information
    const currentMapooolContainer = mappoolOverrideTeam === "left" ? mappoolContainerLeftEl : mappoolContainerRightEl
    const currentTile = currentMapooolContainer.children[mappoolOverrideTileNumber]

    currentTile.children[0].children[0].classList.add(`${teamWinner}-win-overlay`)
    currentTile.children[0].children[0].classList.remove(`${teamLoser}-win-overlay`)
    currentTile.children[2].style.display = "block"
    currentTile.children[2].setAttribute("src", `static/${teamWinner === "left"? "red" : "blue"}-crown.png`)
}

// Set Mappool Override Remove Winner
function mappoolOverrideRemoveWinner() {
    if (!mappoolOverrideTeam || !mappoolOverrideAction || !mappoolOverrideTileNumber) return
    // Set map information
    const currentMapooolContainer = mappoolOverrideTeam === "left" ? mappoolContainerLeftEl : mappoolContainerRightEl
    const currentTile = currentMapooolContainer.children[mappoolOverrideTileNumber]
    currentTile.children[0].children[0].classList.remove(`left-win-overlay`)
    currentTile.children[0].children[0].classList.remove(`right-win-overlay`)
    currentTile.children[2].style.display = "none"
}

// League Select
const leagueNameEl = document.getElementById("league-name")
const majorLeagueButtonEl = document.getElementById("major-league-button")
const minorLeagueButtonEl = document.getElementById("minor-league-button")
document.cookie = `leagueName=major; path=/`
function setLeague(league) {
    leagueNameEl.textContent = `${league.toUpperCase()} LEAGUE`
    document.cookie = `leagueName=${league}; path=/`
    if (league === "major") {
        majorLeagueButtonEl.classList.add("toggle-active")
        minorLeagueButtonEl.classList.remove("toggle-active")
    } else {
        majorLeagueButtonEl.classList.remove("toggle-active")
        minorLeagueButtonEl.classList.add("toggle-active")
    }
}


// OBS Information
const sceneCollection = document.getElementById("sceneCollection")
let autoadvance_button = document.getElementById('auto-advance-button')
let autoadvance_timer_label = document.getElementById('autoAdvanceTimerLabel')
const pick_to_transition_delay_ms = 10000;
let enableAutoAdvance = false
const gameplay_scene_name = "Gameplay"
const mappool_scene_name = "Mappool"
const winner_scene_name = "Winner"

let sceneTransitionTimeoutID

function switchAutoAdvance() {
    enableAutoAdvance = !enableAutoAdvance
    if (enableAutoAdvance) {
        autoadvance_button.innerText = 'AUTO ADVANCE: ON'
        autoadvance_button.classList.add("toggle-active")
        autoadvance_button.classList.remove("toggle-inactive")
    } else {
        autoadvance_button.innerText = 'AUTO ADVANCE: OFF'
        autoadvance_button.classList.remove("toggle-active")
        autoadvance_button.classList.add("toggle-inactive")
    }
}

const obsGetCurrentScene = window.obsstudio?.getCurrentScene ?? (() => {})
const obsGetScenes = window.obsstudio?.getScenes ?? (() => {})
const obsSetCurrentScene = window.obsstudio?.setCurrentScene ?? (() => {})

obsGetScenes(scenes => {
    for (const scene of scenes) {
        let clone = document.getElementById("sceneButtonTemplate").content.cloneNode(true)
        let buttonNode = clone.querySelector('button')
        buttonNode.id = `scene__${scene}`
        buttonNode.textContent = `GO TO: ${scene}`
        buttonNode.onclick = function() { obsSetCurrentScene(scene); }
        sceneCollection.appendChild(clone)
    }

    obsGetCurrentScene((scene) => { document.getElementById(`scene__${scene.name}`).classList.add("active-scene") })
})

window.addEventListener('obsSceneChanged', function(event) {
    let activeButton = document.getElementById(`scene__${event.detail.name}`)
    for (const scene of sceneCollection.children) { scene.classList.remove("toggle-active") }
    activeButton.classList.add("toggle-active")
})