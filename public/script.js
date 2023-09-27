const { errorMonitor } = require("nodemailer/lib/xoauth2");

const socket = io("/");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

const user = prompt("Enter your name");
const my_video = document.createElement("video");
my_video.muted = true;
let mystream;
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
})
    .then((stream) => {

        mystream = stream
        add_video(my_video, stream)
        socket.on("user connected ", (userId) => {
            connectNewUser(userId, stream)
        })
        peer.on("call", (call) => {
            call.answer(stream)
            const ans_video = document.createElement("video");
            call.on("stream", (vid_stream) => {
                add_video(ans_video, vid_stream)
            })
        })

    })

function connectNewUser(userId, stream) {
    const call = peer.call(userId, stream)

    const video = document.createElement("video");
    call.on("stream", (user_video) => {
        // addVideoStream(video,user_video);
        add_video(video, user_video)

    })
}

function add_video(video, stream) {
    video.srcObject = stream
    video.addEventListener("loadedmetadata", () => {
        video.play();
        $("#video_stream").append(video)
    })
}

$(function () {
    $("#show_chat").click(function () {
        $(".left-window").css("display", "none")
        $(".right-window").css("display", "block")
        $(".header_back").css("display", "block")
    })
    $(".header_back").click(function () {
        $(".left-window").css("display", "block")
        $(".right-window").css("display", "none")
        $(".header_back").css("display", "none")
    })

    $("#send").click(function () {
        if ($("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

    $("#chat_message").keydown(function (e) {
        if (e.key == "Enter" && $("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })
    $("#mute_button").click(function () {
        const enabled = mystream.getAudioTracks()[0].enabled
        if (enabled) {
            mystream.getAudioTracks()[0].enabled = false
            html = `<i class="fas fa-microphone-slash"  />`
            $("#mute_button").toggleClass("background_red")
            $("#mute_button").html(html)
        }
        else {
            mystream.getAudioTracks()[0].enabled = true;
            html = `<i class="fas fa-microphone" />`
            $("#mute_button").toggleClass("background_red")
            $("#mute_button").html(html)
        }

    })

    $("#stop_video").click(function () {
        const enabled=mystream.getVideoTracks()[0].enabled
        if(enabled){
            mystream.getVideoTracks()[0].enabled=false
            html=`<i class="fas fa-video-slash"/>`
            $("#stop_video").toggleClass("background_red")
            $("#stop_video").html(html)
        }
        else {
                mystream.getVideoTracks()[0].enabled=true
                html=`<i class="fas fa-video"/>`
                $("#stop_video").toggleClass("background_red")
                $("#stop_video").html(html)
        }
    })

    $("#invite_button").click(function(){
        const to=prompt("Enter email address: ")
        data={
            url:window.location.href,
            to:to,
        }
        $.ajax({
            url:"/sendmail",
            type:'post',
            data:JSON.stringify(data),
            dataType:'json',
            contentType:"application/json",
            success:function(res){alert("Invite sent!!")},
            error:function(res){console.log(res.responseJSON)},
        })
    })
})

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

socket.on("createMessage", (message, userName) => {
    $(".messages").append(`
        <div class="message">
            <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
        }</span> </b>
            <span>${message}</span>
        </div>
    `)
});