// Team information
let allTeams
async function getTeams() {
    const response = await axios.get("../_data/teams.json")
    allTeams = response.data
}
getTeams()
// Find Teams
const findTeams = team_name => allTeams.find(team => team.team_name === team_name)

// Beatmap information
const titleEl = document.getElementById("title")
const roundNameContainerEl = document.getElementById("round-name-container")
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

// Team Related Stuff
const backgroundStripeEl = document.getElementById("background-stripe")
const logoEl = document.getElementById("logo")
const teamNameEl = document.getElementById("team-name")
const teamPlayerNameContainerEl = document.getElementById("team-player-names-container")
let currentStarLeft, previousStarLeft
let currentStarRight, previousStarRight
let currentLeftTeamName
let currentRightTeamName
setInterval(() => {
    // Set team name
    currentLeftTeamName = getCookie("currentLeftTeamName")
    currentRightTeamName = getCookie("currentRightTeamName")
    
    // Star
    currentStarLeft = Number(getCookie("currentStarLeft"))
    currentStarRight = Number(getCookie("currentStarRight"))

    if (currentStarLeft !== previousStarLeft ||
        currentStarRight !== previousStarRight
    ) {
        previousStarLeft = currentStarLeft
        previousStarRight = currentStarRight
        
        if (currentStarLeft > currentStarRight) {
            updateTeamDisplay(currentLeftTeamName)
            backgroundStripeEl.classList.add("background-stripe-red")
            backgroundStripeEl.classList.remove("background-stripe-blue")
        } else if (currentStarRight > currentStarLeft) {
            updateTeamDisplay(currentRightTeamName)
            backgroundStripeEl.classList.remove("background-stripe-red")
            backgroundStripeEl.classList.add("background-stripe-blue")
        }
    }
}, 200)

// Update Team Display
function updateTeamDisplay(teamName) {
    logoEl.setAttribute("src", `../flags/${teamName}.png`)
    teamNameEl.textContent = teamName

    // Find team
    const team = findTeams(teamName)

    // Clear players
    for (let i = 0; i < teamPlayerNameContainerEl.childElementCount; i++) {
        teamPlayerNameContainerEl.children[i].textContent = ""
    }

    // Set new player names if available
    if (!team) return
    for (let i = 0; i < team.player_names.length; i++) {
        teamPlayerNameContainerEl.children[i].textContent = team.player_names[i].toUpperCase()
    }
}