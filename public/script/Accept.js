/* Chat Part */

let acceptmodalelement = document.getElementById("Accept-Modal")
acceptmodalelement.addEventListener('shown.bs.modal', function () {
    modalAcceptModalInstance = bootstrap.Modal.getInstance(acceptmodalelement);
});


let videoacceptmodal = document.getElementById("VideoAcceptModal")
videoacceptmodal.addEventListener('shown.bs.modal', function () {
    videoAcceptModalInstance = bootstrap.Modal.getInstance(videoacceptmodal);
});

function Accept_Modal_Popup(sender, offer) {
    Chat_Flag = false;
    connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Busy" }))
    document.getElementById("Accept-Modal-Body").innerHTML = `
    <div class="p-4 to-front" id="Accept-Modal-Display-Body">
    <div class="text-center">
    <div class="logo" id="Accept-Modal-Image-Container">
        <img src=${sender.image} alt="Image" id="Accept-Modal-Image" class="img-fluid mb-4" style="border-radius: 50%;">
    </div>
    <h3>@${sender.username}</h3>
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
    <p class="mb-0 cancel"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-chat" viewBox="0 0 16 16">
    <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
  </svg></p>
</div>
                </div>
                <div class="container-fluid" id="Accept-Modal-Body-Decision-Container">
                    <button type="button" class="reject-button" data-bs-dismiss="modal" aria-label="Close"
                        id="reject-request">Reject</button>
                    <button type="button" class="accept-button" id="accept-request"
                        >Accept</button>
                </div>
            
    `

    //Initializing webrtc
    Initial_WebRTC_Connection()
    Handle_Remote_DataChannel(offer)
    let myAcceptModal = new bootstrap.Modal(document.getElementById("Accept-Modal"));
    myAcceptModal.show();
    Peer_Details = sender
    let interval = setInterval(() => {
        if (!User_Details[sender.uuid]) {
            PeerConnection.close()
            myAcceptModal.hide()
            connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
            clearInterval(interval);
        }
        if (Chat_Flag == true) {
            if (!User_Details[sender.uuid]) {
                PeerConnection.close()
                Chat_Template_Instance.hide()
                connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
                clearInterval(interval);
            }
        }
    }, 1000);

    document.getElementById("accept-request").addEventListener("click", () => {
        document.getElementById("Accept-Modal-Body").innerHTML = `
    <div class="p-4 to-front" id="Accept-Modal-Display-Body">
    <div class="text-center">
    <div class="logo" id="Accept-Modal-Image-Container">
        <img src=${sender.image} alt="Image" id="Accept-Modal-Image" class="img-fluid mb-4" style="border-radius: 50%;">
    </div>
    <h3>@${sender.username}</h3>
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
    <p>Wait for a moment!</p>
    <h4>Establishing a secure connection...</h4>
</div>
            
    `
        Answer_Creation()
    });
    document.getElementById("reject-request").addEventListener("click", () => {
        PeerConnection.close();
        connection.send(JSON.stringify({ type: "Reject", answerReceiver: Peer_Details, answerSender: Self_Details }))
        connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
    });
}


function Handle_Remote_DataChannel(offer) {

    //Receive data channel callbacks
    PeerConnection.ondatachannel = (sender) => {

        //Receiving the data channel from sender
        Receiver_Data_Channel = sender.channel;

        //Handling data channel callbacks

        //Onopen call back
        Receiver_Data_Channel.onopen = (event) => {
            SenderDataChannel_FLAG = false;
            Chat_Flag = true;
            document.getElementById("chat-profile-image").innerHTML = `
            <svg onclick=exitchatsession() style="cursor: pointer;" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="black" class="bi bi-arrow-left-short" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"/>
          </svg>
            <img src=${Peer_Details.image} alt="" height="30px" width="30px" style="border-radius: 50%;">
            `

            document.getElementById("chat-profile-username").innerHTML = `
            <strong>${Peer_Details.username}</strong>
            `
            document.getElementById("chat-profile-status").innerHTML = `Online`


            document.getElementById("Video-Call-Button").innerHTML = `
    
            <svg onclick=VideoCall() xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-camera-video" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
</svg>
        
            `

            document.getElementById("chat-footer-area").innerHTML = `
    
            <footer class="footer navbar-fixed-bottom" id="footer-container">
                    <div class="msger-inputarea" style="background-color: rgb(32,42,68);">
                        <input type="text" class="msger-input" id="Chat-Input" oninput=typing() placeholder="Enter your message...">
                        <button type="submit" class="msger-send-btn" id="Chat-Input-Button" onclick=SendMessage() >Send</button>
                    </div>
                </footer>
    `
            connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Busy" }))
            let myChatModal = new bootstrap.Modal(document.getElementById("Chat-Template-Modal"));
            modalAcceptModalInstance.hide()
            myChatModal.show();
            // Receiver_Data_Channel.send("Ha bhai..Ekdum Badhiya!")
        }

        //On error callback
        Receiver_Data_Channel.onerror = (error) => {
            null;
        }

        //On close callback
        Receiver_Data_Channel.onclose = (event) => {
            document.getElementById("chat-profile-status").innerHTML = `Disconnected!`
            document.getElementById("chat-footer-area").innerHTML = `


            <footer class="footer navbar-fixed-bottom" id="footer-container">
            <div class="msger-inputarea justify-content-center" style="background-color: rgb(223, 223, 223);">
            <button type="submit" class="msger-send-btn" data-bs-dismiss="modal" data-bs-target="#Chat-Template-Modal" onclick=clearChat()>Back</button>
            </div>
        </footer>
            
            `
        }

        //On message callback
        Receiver_Data_Channel.onmessage = (message) => {
            let messageData = JSON.parse(message.data)
            console.log(messageData)
            switch (messageData.type) {
                case "Typing0713":
                    document.getElementById("chat-profile-status").innerHTML = `Typing...`
                    break;

                case "Online0713":
                    document.getElementById("chat-profile-status").innerHTML = `Online`
                    break;

                case "VideoCallRequest":
                    console.log(messageData)
                    console.log(messageData.offer)
                    Accept_Video_Modal_Popup(Peer_Details,messageData.videooffer);
                    break;

                case "VideoCallAnswer":
                    PeerConnection.setRemoteDescription(new RTCSessionDescription(messageData.videoanswer))
                    break;

                case "Message":
                    document.getElementById("Chat-Message-Container").insertAdjacentHTML("beforeend", `
              
                    <div class="msg left-msg">
                                        <div class="msg-bubble">
                                            <div class="msg-text">
                                                ${messageData.data}
                                            </div>
                                        </div>
                                    </div>
                `)
                    let element = document.getElementById("Chat-Template-Modal-Outer-Container")
                    element.scrollTop = element.scrollHeight;
                    document.getElementById("chat-profile-status").innerHTML = `Online`
                    break;

                default:
                    break;
            }
        }


    }

    //Here

    PeerConnection.setRemoteDescription(new RTCSessionDescription(offer))
}


function Answer_Creation() {


    //Onclick create answer logic
    PeerConnection.createAnswer().then((answer) => {
        PeerConnection.setLocalDescription(answer)
        let data = { type: "Answer", answerReceiver: Peer_Details, answerSender: Self_Details, answer: answer }
        connection.send(JSON.stringify(data))
    }).catch((error) => {
        console.log("Answer error ", error.message)
        alert("Answer Creation Failed")
    })
}






/* Video Part */


let videoacceptmodalelement = document.getElementById("VideoAcceptModal")
videoacceptmodalelement.addEventListener('shown.bs.modal', function () {
    videoAcceptModalInstance = bootstrap.Modal.getInstance(videoacceptmodalelement);
});

function Accept_Video_Modal_Popup(sender,offer) {
    Video_Flag = false;
    Initial_WebRTC_Connection_For_Video()
    PeerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    document.getElementById("VideoAcceptModal-Body").innerHTML = `
    <div class="p-4 to-front" id="VideoAcceptModal-Display-Body">
    <div class="text-center">
    <div class="logo" id="VideoAcceptModal-Image-Container">
        <img src=${Peer_Details.image} alt="Image" id="VideoAcceptModal-Image" class="img-fluid mb-4" style="border-radius: 50%;">
    </div>
    <h3>@${Peer_Details.username}</h3>
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
    <p class="mb-0 cancel"><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-camera-video" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/>
  </svg></p>
</div>
                </div>
                <div class="container-fluid" id="VideoAcceptModal-Body-Decision-Container">
                    <button type="button" class="reject-button" data-bs-dismiss="modal" aria-label="Close"
                        id="reject-video-request">Reject</button>
                    <button type="button" class="accept-button" id="Accept-Video-Request"
                        >Accept</button>
                </div>
            
    `
    document.getElementById("peer-video-container").innerHTML = `
        
        <div class="modal-body bg-3" id="Request-Modal-Body" >
        <div class="p-4 to-front">
            <div class="text-center">
                <div class="logo" id="Request-Modal-Image-Container">
                    <img src=${Peer_Details.image} alt="Image" class="img-fluid mb-4" id="Request-Modal-Image" style="border-radius: 50%;">
                </div>
                <h3 style="color:white;">@${Peer_Details.username}</h3>
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
                <p class="mb-0 cancel" style="color:white;">Building a secure connection...</p>
            </div>
        </div>
    </div>
        
        `
    let myAcceptVideoModal = new bootstrap.Modal(document.getElementById("VideoAcceptModal"));
    myAcceptVideoModal.show()

    let interval = setInterval(() => {
        if (!User_Details[sender.uuid]) {
            myAcceptVideoModal.hide();
            PeerConnection.close();
            connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
            clearInterval(interval);
        }
        if (Video_Flag == true) {
            if (!User_Details[sender.uuid]) {
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





    document.getElementById("Accept-Video-Request").addEventListener("click", () => {
        acceptvideooffer(offer)
        videoAcceptModalInstance.hide()
    })

    document.getElementById("reject-video-request").addEventListener("click", () => {
        connection.send(JSON.stringify({ type: "Reject-Video", answerReceiver: Peer_Details, answerSender: Self_Details }))
        connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
    });
}


//Video accept function
async function acceptvideooffer() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia(videocallconstraints);
        localStream.getTracks().forEach((track) => {
            PeerConnection.addTrack(track, localStream);
        });
        let myVideoModal = new bootstrap.Modal(document.getElementById("VideoModal"));
        myVideoModal.show()
        localvideo.srcObject = localStream
        createAnswerforvideo()
    } catch (error) {
        connection.send(JSON.stringify({ type: "Reject-Video", answerReceiver: Peer_Details, answerSender: Self_Details }))
        connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
        alert("For video call allow permissions first!")

    }
}


function createAnswerforvideo() {
    PeerConnection.createAnswer().then((answer) => {
        PeerConnection.setLocalDescription(answer)
        let data = { type: "Video-Answer", answerReceiver: Peer_Details, answerSender: Self_Details, answer: answer }
        if (SenderDataChannel_FLAG) {
            Sender_Data_Channel.send((JSON.stringify({ type: "VideoCallAnswer", videoanswer: answer })))
        } else {
            Receiver_Data_Channel.send((JSON.stringify({ type: "VideoCallAnswer", videoanswer: answer })))
        }
    }).catch((error) => {
        console.log("Answer error ", error.message)
        alert("Answer Creation Failed")
    })
}