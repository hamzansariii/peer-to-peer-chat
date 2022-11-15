let Chat_Template = document.getElementById("Chat-Template-Modal")

Chat_Template.addEventListener('shown.bs.modal', function () {
    Chat_Template_Instance = bootstrap.Modal.getInstance(Chat_Template);
});




//Sending message to other client through webrtc datachannel
function SendMessage() {
    let messagedata = document.getElementById("Chat-Input").value
    document.getElementById("Chat-Input").value = null
    if (messagedata.length != 0) {
        if (SenderDataChannel_FLAG) {
            Sender_Data_Channel.send(JSON.stringify({ type: "Message", data: messagedata }));
            document.getElementById("Chat-Message-Container").insertAdjacentHTML("beforeend", `
      
        <div class="msg right-msg">
  
        <div class="msg-bubble">
            <div class="msg-text">
                ${messagedata}
            </div>
        </div>
    </div>
      `)
            let element = document.getElementById("Chat-Template-Modal-Outer-Container")
            element.scrollTop = element.scrollHeight;
        } else {
            Receiver_Data_Channel.send(JSON.stringify({ type: "Message", data: messagedata }));
            document.getElementById("Chat-Message-Container").insertAdjacentHTML("beforeend", `
      
        <div class="msg right-msg">
  
        <div class="msg-bubble">
  
            <div class="msg-text">
                ${messagedata}
            </div>
        </div>
    </div>
      `)
            let element = document.getElementById("Chat-Template-Modal-Outer-Container")
            element.scrollTop = element.scrollHeight;
        }
    }
}



function exitchatsession() {
    PeerConnection.close()
}



function clearChat() {
    document.getElementById("Chat-Message-Container").innerHTML = null;
    connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
}



function typing() {
    document.getElementById("Chat-Input").addEventListener("keyup", (event) => {
        if (event.code == "Enter") {
            SendMessage()
        }
    });

    let messagedata = document.getElementById("Chat-Input").value
    if (messagedata.length == 1) {
        if (SenderDataChannel_FLAG) {
            Sender_Data_Channel.send(JSON.stringify({ type: "Typing0713" }));
        } else {
            Receiver_Data_Channel.send(JSON.stringify({ type: "Typing0713" }))
        }
    } else if (messagedata.length == 0) {
        if (SenderDataChannel_FLAG) {
            Sender_Data_Channel.send(JSON.stringify({ type: "Online0713" }));
        } else {
            Receiver_Data_Channel.send(JSON.stringify({ type: "Online0713" }))
        }
    }
}