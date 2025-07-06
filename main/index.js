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
        leftTeamNameEl.textContent = currentLeftTeamName

        // Set team flag
        leftTeamFlagEl.setAttribute("src", `../flags/${currentLeftTeamName}.png`)
        leftTeamFlagEl.onerror = () => {
            leftTeamFlagEl.onerror = null
            leftTeamFlagEl.src = "../flags/transparent.png"
        }
    }
    if (currentRightTeamName !== data.tourney.team.right) {
        currentRightTeamName = data.tourney.team.right
        rightTeamNameEl.textContent = currentRightTeamName

        // Set team flag
        rightTeamFlagEl.setAttribute("src", `../flags/${currentRightTeamName}.png`)
            rightTeamFlagEl.onerror = () => {
            rightTeamFlagEl.onerror = null
            rightTeamFlagEl.src = "../flags/transparent.png"
        }
    }
}