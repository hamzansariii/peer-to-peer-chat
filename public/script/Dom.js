


//Disable right click
document.addEventListener('contextmenu', event => event.preventDefault());


//Disable drag
document.ondragstart = () => {
    return false;
}


//Request full screen
document.addEventListener("dblclick", () => {
    try {
        document.documentElement.requestFullscreen()
    } catch (error) {
        null
    }
})