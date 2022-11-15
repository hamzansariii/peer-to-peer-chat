let videoON = true;
let audioON = true;
let Video_Template = document.getElementById("VideoModal")



Video_Template.addEventListener('shown.bs.modal', function () {
    document.documentElement.requestFullscreen().catch((error) => {
        console.log(error)
    })
    Video_Template_Instance = bootstrap.Modal.getInstance(Video_Template);
});

Video_Template.addEventListener('hidden.bs.modal', function () {
    connection.send(JSON.stringify({ type: "status", useruuid: Self_Details.uuid, content: "Online" }))
});


//Button click handling - starts
document.getElementById("close-video-call").addEventListener("click", () => {

    if (Video_Flag == true) {
        localStream.getVideoTracks().forEach(track => track.enabled = false)
        localStream.getAudioTracks().forEach(track => track.enabled = false)
        setTimeout(() => {
            localStream.getTracks().forEach(function (track) {
                track.stop();
            });
            PeerConnection.close()
            localStream = null;
            remoteStream = null;
            Video_Template_Instance.hide()
        }, 500);
    } else {
        connection.send(JSON.stringify({ type: "Cancel-Video-Request", uuid: Peer_Details.uuid}))
        Video_Template_Instance.hide()
        localStream.getTracks().forEach(function (track) {
            track.stop();
        });
        PeerConnection.close()
        localStream = null;
        remoteStream = null;
    }
})



document.getElementById("video-button-container").addEventListener("click", () => {
    if (videoON == true) {
        videoON = false;
        localStream.getVideoTracks().forEach(track => track.enabled = false)
        document.getElementById("video-button-container").innerHTML = `

        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-camera-video-off-fill" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925-10-14 .814-.58 10 14-.814.58z"/>
    </svg>
        
        `
    } else if (videoON == false) {
        videoON = true;
        localStream.getVideoTracks().forEach(track => track.enabled = true)
        document.getElementById("video-button-container").innerHTML = `
        
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor"
                            class="bi bi-camera-video" viewBox="0 0 16 16">
                            <path fill-rule="evenodd"
                                d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z" />
                        </svg>
        
        `
    }
})




document.getElementById("mic-button-container").addEventListener("click", () => {

    if (audioON == true) {
        audioON = false;
        localStream.getAudioTracks().forEach(track => track.enabled = false)
        document.getElementById("mic-button-container").innerHTML = `
    
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-mic-mute-fill" viewBox="0 0 16 16">
  <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z"/>
  <path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/>
</svg>
    
    `
    } else if (audioON == false) {
        audioON = true;
        localStream.getAudioTracks().forEach(track => track.enabled = true)
        document.getElementById("mic-button-container").innerHTML = `
        
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor"
                            class="bi bi-mic" viewBox="0 0 16 16">
                            <path
                                d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
                            <path
                                d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z" />
                        </svg>
        
        `
    }
})


//Button click handling - ends



