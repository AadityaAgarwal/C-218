const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const { emit } = require("process");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

var node_mailer = require("nodemailer")

const transporter = node_mailer.createTransport({
    port: 587,
    host: "smtp.gmail.com",
    auth: {
        user: 'agarwalaaditya916@gmail.com',
        pass: 'amwpprcppcaqezxu',
    },
    secure: true,

})

app.post("/sendmail", (req, res) => {
    const to=req.body.to;
    const url=req.body.url;
    const mail_data={
        from:"agarwalaaditya916@gmail.com",
        to:to,
        subject:"Join the video chat",
        html:`<p>Hey there<p> <p>Join me for video chat here: ${url}<p>`
    }
    transporter.sendMail(mail_data,(err,info)=>{
        if (err)
            return console.log(err);
        else{
            res.status(200).send({
                message:"Invitation sent! ",
                messsage_id:info.messageId,
            })
        }
    })
})
app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user connected ", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(3030);