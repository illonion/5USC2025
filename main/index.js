// Team Inforamtion
const leftTeamFlagEl= document.getElementById("left-team-flag")
const rightTeamFlagEl = document.getElementById("right-team-flag")
const leftTeamNameEl= document.getElementById("left-team-name")
const rightTeamNameEl = document.getElementById("right-team-name")
let currentLeftTeamName, currentRightTeamName

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