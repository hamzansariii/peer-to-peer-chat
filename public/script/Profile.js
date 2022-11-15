/* Logic for profile section - Starts */
const imagecontainer = document.getElementById("profile-image");
let video;
let camON;
let myprofilemodal = document.getElementById("Profile-Modal");
const imageconstraints = {
    audio: false,
    video: {
        width: 150, height: 150
    }
};

//Getting the details for the first time
document.getElementById("profile-setting-button").addEventListener("click", () => {
    connection.send(JSON.stringify({ type: "User-Profile", content: null }))
})



//Updating Username
document.getElementById("username-button").addEventListener("click", () => {

    let newusername = document.getElementById("username-input").value
    if (newusername != "") {
        connection.send(JSON.stringify({ type: "User-Profile", content_type: "username", content: newusername }))
        document.getElementById("username-input").value = null
    }
})






function ProfileModal(Self_Details) {

    document.getElementById("profile-image").innerHTML = `
    <img src=${Self_Details.image} alt="" style="height: 150px; width: 150px; border-radius:50%;">
    
    `

    document.getElementById("profile-username").innerHTML = `
    <span class="name mt-3" id="username-display">@${Self_Details.username}</span>
    
    `
}



/* Logic for profile section - Ends */

async function displayVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(imageconstraints);
        handlesucces(stream);
    }
    catch (error) {
        console.log("Error : ", error)
    }
};

function handlesucces(stream) {
    camON = true;
    imagecontainer.innerHTML = `
    <video id="video" playsinline autoplay style="border-radius:50%"></video>
    `
    video = document.getElementById("video")
    window.stream = stream;
    video.srcObject = stream;
    document.getElementById("profile-image-button-container").innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-vinyl" viewBox="0 0 16 16" style:"cursor:pointer;" onclick=clickimage()>
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM4 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"/>
  <path d="M9 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
</svg>
    `
};


function clickimage() {

    snapimage()

    document.getElementById("profile-image-button-container").innerHTML = `
    <div class="d-flex justify-content-center flex-nowrap">
    <div class="text-white mx-2 p-2">
    <svg xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" width="25" height="25" fill="red" class="bi bi-x-circle" viewBox="0 0 16 16" onclick=retakeimage()>
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
  </svg>
    </div>
     <div class="text-white mx-2 p-2">
     <svg xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;" width="25" height="25" fill="green" class="bi bi-check-circle" viewBox="0 0 16 16" onclick=saveimage()>
     <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
     <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
   </svg>
    </div>
  </div>
    `
}


function showvideo() {
    displayVideo()
}


function snapimage() {
    camON = false;
    imagecontainer.innerHTML = `
    <canvas id="canvas" width="150" height="150"></canvas>
    `
    let context = document.getElementById("canvas").getContext("2d");
    context.translate(150, 0)
    context.scale(-1, 1)
    context.drawImage(video, 0, 0, 150, 150)
    stream.getTracks().forEach(function (track) {
        track.stop();
    });
}


function retakeimage() {
    showvideo()
}

function savesnap() {
    let imageURL = document.getElementById("canvas").toDataURL();
    document.getElementById("profile-image").innerHTML = `
    <div id="bg-demo" style="height: 150px; width: 150px; background: url(${imageURL}); border-radius: 50%;"></div>
    `
    document.getElementById("profile-image-button-container").innerHTML = `
    <div class="d-flex justify-content-center flex-nowrap">
                            <div class="text-white mx-1 p-1">
                                <p>Click a Profile Picture</p>
                            </div>
                            <div class="text-white mx-1 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor"
                            class="bi bi-camera" viewBox="0 0 16 16" onclick=showvideo()>
                            <path
                                d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z" />
                            <path
                                d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
                        </svg>
                            </div>
                        </div>
    `
    connection.send(JSON.stringify({ type: "User-Profile", content_type: "image", content: imageURL }))
}
function saveimage() {
    savesnap()
}

myprofilemodal.addEventListener("hide.bs.modal", () => {

    try {
        stream.getTracks().forEach(function (track) {
            track.stop();
        });
    } catch (error) {
        null;
    }
    document.getElementById("profile-image-button-container").innerHTML = `
    <div class="d-flex justify-content-center flex-nowrap">
                            <div class="text-white mx-1 p-1">
                                <p>Click a Profile Picture</p>
                            </div>
                            <div class="text-white mx-1 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor"
                            class="bi bi-camera" viewBox="0 0 16 16" onclick=showvideo()>
                            <path
                                d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z" />
                            <path
                                d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
                        </svg>
                            </div>
                        </div>
    `
})