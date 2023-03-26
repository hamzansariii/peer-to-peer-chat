
let HOST = location.origin.replace(/^http/, 'ws')
const connection = new WebSocket(HOST + "/connect");

//Global Varibles
let Self_Details;
let Peer_Details;
let User_Details;
let List_Of_Users;
let List_Of_Users_With_Location;
let Location_Details;
let My_Location;
let PeerConnection;
let Sender_Data_Channel;
let Receiver_Data_Channel;
let SenderDataChannel_FLAG;
let Global_Flag = true;
let Nearby_Flag = false;
let Request_Accept_Flag;
let Location_Flag;
let Chat_Flag;
let Video_Flag;
let videocallconstraints = {
  audio: true,
  video: {
    frameRate: {
      ideal: 30,
      min: 10
    }
  }
}








connection.onmessage = (message) => {

  let data = JSON.parse(message.data);

  switch (data.type) {

    //Initially storing the self details.
    case "Self-Details":
      Self_Details = data.content
      navigator.geolocation.getCurrentPosition(getLatLon, (error) => {
        if (error.code == 1) {
          Location_Flag = false;
        }
      });
      break;

    case "User_List":
      List_Of_Users = Object.values(data.content)
      if (Global_Flag == true) {
        UpdateStateGlobal(List_Of_Users, Self_Details)
      }
      User_Details = List_Of_Users.reduce(reducer, {});
      break;

    case "User_With_Location_List":
      List_Of_Users_With_Location = Object.values(data.content)
      if (Nearby_Flag == true) {
        UpdateStateNearby(List_Of_Users_With_Location, Self_Details)
      }
      break;


    //Profile and self details updation
    case "User-Profile":
      Self_Details = data.content
      ProfileModal(Self_Details)
      break;

    case "IceCandidate":
      let candidate = data.candidate
      try {
        PeerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (error) {
        null
      }
      break;


    case "Offer":
      let offer = data.offer
      let sender = data.sender
      Accept_Modal_Popup(sender, offer);
      break;

    case "Answer":
      document.getElementById("chat-profile-status").innerHTML = `Request Accepted!..wait`
      let answer = data.answer
      Chat_Flag = true;
      PeerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      break;

    case "Reject":
      connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
      Chat_Template_Instance.hide();
      PeerConnection.close();
      break;

    case "Cancel-Request":
      modalAcceptModalInstance.hide();
      connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
      break;

    default:
      break;
  }

}




/* Displaying the list of users starts */

//Updating Global List
function UpdateStateGlobal(ListOfUsers, Self_Details) {
  if (ListOfUsers.length > 1) {

    document.getElementById("User-List").innerHTML = `

    ${ListOfUsers.map(function (user) {
      if (user.uuid != Self_Details.uuid) {


        return `
          
          <li onclick=Request_Chat("${user.uuid}")>
                    <div class="message-avatar">
                      <img src=${user.image} alt="User Image">
                    </div>
                    <div class="message-body">
                      <div class="message-body-heading">
                        <h6><strong style="color:#1B1B1B;">${user.username}</strong></h6>
                      </div>
                      <p>${user.status}</p>
                    </div>
                </li>
          
          `
      }
    }).join("")}
    `

  } else {
    document.getElementById("User-List").innerHTML = `

    <div class="text-center" style="margin-top:25%; color:black;">
        <h2>Come back later!</h2>
    </div>
    <div class="text-center" style="color:gray">
        Nobody seems to be online.
    </div>


    `
  }
}


//Updating Nearby List
function UpdateStateNearby(ListOfUsers, Self_Details) {

  if (typeof ListOfUsers === "undefined") {
    document.getElementById("User-List").innerHTML = `
    
    <div class="text-center" style="margin-top:25%;">
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
            <div class="text-center" style="color:gray">
            Seaching for people nearby!
            </div>

    `
    if (Location_Flag === false) {
      document.getElementById("User-List").innerHTML = `
          
          <div class="text-center" style="margin-top:125px; margin-bottom:25px;">
          Allow location to see people nearby.
           </div>
           <div class="text-center">
              <button class="profile-submit-button" onclick=locationprompt()>Enable Location</button>
           </div>
          `
    }
  } else {
    if (ListOfUsers.length > 1) {

      try {
        document.getElementById("User-List").innerHTML = `
  
      ${ListOfUsers.map(function (user) {
          if (user.uuid != Self_Details.uuid) {
            if (distance(user.location[0], user.location[1], My_Location[0], My_Location[1]) < 5)
              return `
            
            <li onclick=Request_Chat("${user.uuid}")>
            <div class="message-avatar">
            <img src=${user.image} alt="User Image">
          </div>
          <div class="message-body">
            <div class="message-body-heading">
              <h6><strong style="color:#1B1B1B;">${user.username}</strong></h6>
            </div>
            <p>${user.status}</p>
          </div>
                  </li>
            
            `
          }
        }).join("")}
      `
      } catch (error) {
        console.log(error)
      }
    } else {
      document.getElementById("User-List").innerHTML = `
  
      <div class="text-center" style="margin-top:25%; color:black;">
          <h2>Come back later!</h2>
      </div>
      <div class="text-center" style="color:gray">
          Nobody seems to be online.
      </div>
  
  
      `
    }
  }

}






/* Displaying the list of users ends */



//Function to convert array of objects
function reducer(acc, cur) {
  return { ...acc, [cur.uuid]: cur };
}







/* WebRTC Logic Starts */



//Data Channel Creation
function Create_Data_Channel(ChannelName) {

  const channel_config = {
    ordered: true,
    maxPacketLifeTime: 3000,
    reliable: true,
    isTrusted: true
  }
  let channel_name = "WebRTC_DataChannel_" + ChannelName;
  Sender_Data_Channel = PeerConnection.createDataChannel(channel_name, channel_config);

  //Handling data channel events


  //On error callback
  Sender_Data_Channel.onerror = (error) => {
    null;
  }

  //On open callback
  Sender_Data_Channel.onopen = (event) => {
    //Flag that channel is open
    SenderDataChannel_FLAG = true;
    Chat_Flag = true;
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

    //Sender_Data_Channel.send("Hello, How are you???")
  }

  //On receiving new messages from other user
  Sender_Data_Channel.onmessage = (message) => {
    let messageData = JSON.parse(message.data)
    switch (messageData.type) {
      case "Typing0713":
        document.getElementById("chat-profile-status").innerHTML = `Typing...`
        break;

      case "Online0713":
        document.getElementById("chat-profile-status").innerHTML = `Online`
        break;

      case "VideoCallRequest":
        Accept_Video_Modal_Popup(Peer_Details, messageData.videooffer);
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
    //Update the chat messages
  }

  //When user closes the data channel
  Sender_Data_Channel.onclose = (event) => {
    document.getElementById("chat-profile-status").innerHTML = `Disconnected!`
    document.getElementById("chat-footer-area").innerHTML = `


    <footer class="footer navbar-fixed-bottom" id="footer-container">
    <div class="msger-inputarea justify-content-center" style="background-color: rgb(223, 223, 223);">
    <button type="submit" class="msger-send-btn" data-bs-dismiss="modal" data-bs-target="#Chat-Template-Modal" onclick=clearChat()>Back</button>
    </div>
</footer>
    
    `
  }



}




//Initial webrtc connection setup

//Webrtc for chat
function Initial_WebRTC_Connection() {
  PeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:openrelay.metered.ca:80",
          "stun:stun.12connect.com:3478",
          "stun:stun.nextcloud.com:443"
        ],
      },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
  });

  //Handling Onicecandidate event
  PeerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      let data = { type: "IceCandidate", peer: Peer_Details, candidate: event.candidate }
      connection.send(JSON.stringify(data))
    }
  }
}




//Webrtc for Video
function Initial_WebRTC_Connection_For_Video() {
  PeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:openrelay.metered.ca:80",
          "stun:stun.12connect.com:3478",
          "stun:stun.nextcloud.com:443"
        ],
      },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
  });

  //Handling Onicecandidate event
  PeerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      let data = { type: "IceCandidate", peer: Peer_Details, candidate: event.candidate }
      connection.send(JSON.stringify(data))
    }
  }

  remoteStream = new MediaStream();
  PeerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
      document.getElementById("peer-video-container").innerHTML = `<video id="peer-video" class="videocall" playsinline autoplay></video>`
      document.getElementById("peer-video").srcObject = remoteStream
    });
    Video_Flag = true;
  };


  PeerConnection.addEventListener('connectionstatechange', event => {
    if (PeerConnection.connectionState === 'disconnected') {
      localStream.getTracks().forEach(function (track) {
        track.stop();
      });
      remoteStream = null
      localStream = null
      PeerConnection.close()
      Video_Template_Instance.hide()
      document.getElementById("peer-video").innerHTML = null;
    }
  });

}





//Creating Offer For Connection
async function Offer_Creation(data) {
  try {
    const offer = await PeerConnection.createOffer({ iceRestart: true });
    await PeerConnection.setLocalDescription(offer);
    data.offer = offer
    connection.send(JSON.stringify(data))
  } catch (error) {

    alert("Failed to create offer!", error)
  }
}




/* WebRTC Logic Ends */



let NearbyButton = document.getElementById("Nearby-Button")
let GlobalButton = document.getElementById("Global-Button")





NearbyButton.addEventListener("click", () => {
  Global_Flag = false;
  Nearby_Flag = true;
  UpdateStateNearby(List_Of_Users_With_Location, Self_Details)
  NearbyButton.style.color = "blue";
  GlobalButton.style.color = "black";
})


GlobalButton.addEventListener("click", () => {
  Global_Flag = true;
  Nearby_Flag = false;
  UpdateStateGlobal(List_Of_Users, Self_Details)
  GlobalButton.style.color = "blue";
  NearbyButton.style.color = "black";

})




function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p) / 2 +
    c(lat1 * p) * c(lat2 * p) *
    (1 - c((lon2 - lon1) * p)) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}


async function getLatLon(position) {
  let latitude = await position.coords.latitude;
  let longitude = await position.coords.longitude;
  My_Location = [latitude, longitude]
  Location_Flag = true;
  connection.send(JSON.stringify({ type: "Location", location: [latitude, longitude], userid: Self_Details.uuid }))
};



function locationprompt() {
  navigator.geolocation.getCurrentPosition((position) => {
    document.getElementById("User-List").innerHTML = `
    
    <div class="text-center" style="margin-top:25%;">
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
            <div class="text-center" style="color:gray">
              Seaching for people nearby!
            </div>

    `
    getLatLon(position)
  }, (error) => {
    if (error.code == 1) {
      document.getElementById("User-List").innerHTML = `
      
      <div class="text-center" style="margin-top:125px; margin-bottom:25px;">
          Allow location to see people nearby.
          <p>Note : If location prompt does not appear then enable location from browser.</p>
       </div>
       <div class="text-center">
          <button class="profile-submit-button" onclick=locationprompt()>Enable Location</button>
       </div>
      `
    }
  });
}



