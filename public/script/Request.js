

function Request_Chat(peerUUID) {
    if (User_Details[peerUUID].status != "Busy") {
        Chat_Flag = false;
        connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Busy" }))
        Peer_Details = User_Details[peerUUID]
        let you = Self_Details
        let peer = User_Details[peerUUID]
        let data = { type: "Offer", receiver: peer, sender: you }
        Initial_WebRTC_Connection()
        Create_Data_Channel(you.username)
        Offer_Creation(data)

        document.getElementById("chat-profile-image").innerHTML = `
        <svg onclick=exitchatsession() style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="black" class="bi bi-arrow-left-short" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
</svg>
        <img src=${Peer_Details.image} alt="" height="30px" width="30px" style="border-radius: 50%;">
        `

        document.getElementById("chat-profile-username").innerHTML = `
        <strong>${Peer_Details.username}</strong>
        `
        document.getElementById("chat-profile-status").innerHTML = `Requesting...`
        let myChatModal = new bootstrap.Modal(document.getElementById("Chat-Template-Modal"));
        myChatModal.show();
        document.getElementById("chat-footer-area").innerHTML = `


        <footer class="footer navbar-fixed-bottom" id="footer-container">
        <div class="msger-inputarea justify-content-center" style="background-color: rgb(223, 223, 223);">
        <button type="submit" class="msger-send-btn" data-bs-dismiss="modal" data-bs-target="#Chat-Template-Modal" style="background-color:red;" onclick=CancelRequest("${peerUUID}")>Cancel Request</button>
        </div>
    </footer>
        
        `

        let interval = setInterval(() => {
            if (!User_Details[peerUUID]) {
                PeerConnection.close()
                myChatModal.hide()
                connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
                clearInterval(interval);
            }
            if (Chat_Flag == true) {
                if (!User_Details[peerUUID]) {
                    PeerConnection.close()
                    myChatModal.hide()
                    connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
                    clearInterval(interval);
                }
            }
        }, 1000);



    } else if (User_Details[peerUUID].status == "Busy") {
        alert("User is busy!")
    }


}





let localStream = null;
let remoteStream = null;
const localvideo = document.getElementById("your-video")


async function VideoCall() {
    request_video_call(Peer_Details.uuid)
}


async function request_video_call(peerUUID) {
    let Video_Flag = false;
    Peer_Details = User_Details[peerUUID]
    let you = Self_Details
    let peer = User_Details[peerUUID]
    let data = { type: "Video-Offer", receiver: peer, sender: you }
    Initial_WebRTC_Connection_For_Video()

    try {
        localStream = await navigator.mediaDevices.getUserMedia(videocallconstraints);
        localStream.getTracks().forEach((track) => {
            PeerConnection.addTrack(track, localStream);
        });
        localvideo.srcObject = localStream
        document.getElementById("peer-video-container").innerHTML = `

        <div class="p-4 to-front" id="Accept-Modal-Display-Body">
        <div class="text-center">
        <div class="logo" id="Accept-Modal-Image-Container">
            <img src=${peer.image} alt="Image" id="Accept-Modal-Image" class="img-fluid mb-4" style="border-radius: 50%;">
        </div>
        <h4>@${peer.username}</h4>
        <div class="lds-roller">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
    
    `
        let myVideoModal = new bootstrap.Modal(document.getElementById("VideoModal"));
        myVideoModal.show()
        Offer_Creation_For_Video(data)


        let interval = setInterval(() => {
            if (!User_Details[peerUUID]) {
                Video_Template_Instance.hide();
                PeerConnection.close();
                localStream.getTracks().forEach(function (track) {
                    track.stop();
                });
                connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
                clearInterval(interval);
            }
            if (Video_Flag == true) {
                if (!User_Details[peerUUID]) {
                    Video_Template_Instance.hide();
                    PeerConnection.close();
                    localStream.getTracks().forEach(function (track) {
                        track.stop();
                    });
                    connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
                    clearInterval(interval);
                }
            }
        }, 1000);


    } catch (error) {
        console.log(error)
        alert("To video call allow permissions!")
    }
}

async function Request_Video(peerUUID) {
    if (User_Details[peerUUID].status == "Busy") {
        let Video_Flag = false;
        Peer_Details = User_Details[peerUUID]
        let you = Self_Details
        let peer = User_Details[peerUUID]
        let data = { type: "Video-Offer", receiver: peer, sender: you }
        Initial_WebRTC_Connection_For_Video()

        try {
            localStream = await navigator.mediaDevices.getUserMedia(videocallconstraints);
            localStream.getTracks().forEach((track) => {
                PeerConnection.addTrack(track, localStream);
            });
            localvideo.srcObject = localStream
            document.getElementById("peer-video-container").innerHTML = `

            <div class="p-4 to-front" id="Accept-Modal-Display-Body">
            <div class="text-center">
            <div class="logo" id="Accept-Modal-Image-Container">
                <img src=${peer.image} alt="Image" id="Accept-Modal-Image" class="img-fluid mb-4" style="border-radius: 50%;">
            </div>
            <h4>@${peer.username}</h4>
            <div class="lds-roller">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
        
        `
            let myVideoModal = new bootstrap.Modal(document.getElementById("VideoModal"));
            myVideoModal.show()
            connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Busy" }))
            Offer_Creation_For_Video(data)


            let interval = setInterval(() => {
                if (!User_Details[peerUUID]) {
                    Video_Template_Instance.hide();
                    PeerConnection.close();
                    localStream.getTracks().forEach(function (track) {
                        track.stop();
                    });
                    connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
                    clearInterval(interval);
                }
                if (Video_Flag == true) {
                    if (!User_Details[peerUUID]) {
                        Video_Template_Instance.hide();
                        PeerConnection.close();
                        localStream.getTracks().forEach(function (track) {
                            track.stop();
                        });
                        connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
                        clearInterval(interval);
                    }
                }
            }, 1000);


        } catch (error) {
            console.log(error)
            alert("To video call allow permissions!")
        }
    } else if (User_Details[peerUUID].status == "Busy") {
        alert("User is busy!")
    }
}


/*Webrtc Logic -starts */
//Another user answers for our connection


async function Offer_Creation_For_Video(data) {
    try {
        const offer = await PeerConnection.createOffer({ iceRestart: true });
        await PeerConnection.setLocalDescription(offer);
        data.offer = offer
        if (SenderDataChannel_FLAG) {
            Sender_Data_Channel.send(JSON.stringify({ type: "VideoCallRequest", videooffer: offer }))
        } else {
            Receiver_Data_Channel.send(JSON.stringify({ type: "VideoCallRequest", videooffer: offer }))
        }
    } catch (error) {

        alert("Failed to create offer!", error)
    }
}




function CancelRequest(peeruuid) {
    connection.send(JSON.stringify({ type: "Cancel-Request", uuid: peeruuid }))
    connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
}


