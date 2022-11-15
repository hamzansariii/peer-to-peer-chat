const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000
const path = require('path')
const hbs = require("hbs")


//Global Details
/* to store the connection details */
let connectiondetails = {};
//Storing the details to send to client
let userdetails = {}
//User with location
let User_With_Location = {}

//Setting up Websocket
let expressWs = require('express-ws')(app);

//Load static files
console.log("Dir Name + ", path.join(__dirname, "node_modules"))
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist")))
app.use(express.static(path.join(__dirname, "public")))

console.log(__dirname)
//View engine
const templatesPATH = path.join(__dirname, 'views/templates')
app.set("view engine", "hbs")
app.set("views", templatesPATH)

//Load partials
const partialPATH = path.join(__dirname, 'views/partials')
hbs.registerPartials(partialPATH)


app.get("/", (req, res) => {
    res.render("home")
})

app.get("/connect", (req, res) => {
    res.render("connect")
})




//websocket server for global chat
app.ws("/connect", (connection) => {

    //When a new user joins
    onconnection(connection)
    //Sending uuid to the user
    connection.send(JSON.stringify({ type: "Self-Details", content: userdetails[connection.uuid] }))
    //Sending all the connection updates to that new connected user
    for (let i in connectiondetails) {
        connectiondetails[i].send(JSON.stringify({ type: "User_List", content: userdetails }))
    }
    console.log(Object.keys(userdetails).length)



    connection.on("close", () => {
        let quituserid = connection.uuid
        delete userdetails[quituserid]
        delete User_With_Location[quituserid]

        //Sending updates about userlist to all the users
        for (let i in connectiondetails) {
            connectiondetails[i].send(JSON.stringify({ type: "User_List", content: userdetails }))
        }
        for (let i in User_With_Location) {
            connectiondetails[i].send(JSON.stringify({ type: "User_With_Location_List", content: User_With_Location }))
        }
        console.log(Object.keys(userdetails).length)
    })





    connection.on("message", (message) => {
        let data = JSON.parse(message);
        //console.log("offer data", data)

        switch (data.type) {

            case "User-Profile":
                if (data.content == null) {
                    let Details = userdetails[connection.uuid]
                    connection.send(JSON.stringify({ type: "User-Profile", content: Details }))
                }
                else {
                    if (data.content_type == "username") {
                        userdetails[connection.uuid].username = data.content
                        if (User_With_Location[connection.uuid]) {
                            User_With_Location[connection.uuid].username = data.content
                        }
                    }
                    else if (data.content_type == "image") {
                        userdetails[connection.uuid].image = data.content
                        if (User_With_Location[connection.uuid]) {
                            User_With_Location[connection.uuid].image = data.content
                        }
                    }


                    //Send update for his own profile.
                    connection.send(JSON.stringify({ type: "User-Profile", content: userdetails[connection.uuid] }))

                    //Sending user update to all users
                    for (let i in userdetails) {
                        connectiondetails[i].send(JSON.stringify({ type: "User_List", content: userdetails }))
                    }

                    //If that user has location then send updates to all people with location
                    if (User_With_Location[connection.uuid]) {
                        for (let i in User_With_Location) {
                            connectiondetails[i].send(JSON.stringify({ type: "User_With_Location_List", content: User_With_Location }))
                        }
                    }


                }
                break;

            case "IceCandidate":
                let destination = data.peer.uuid
                let candidate = data.candidate
                let candidatesData = { type: "IceCandidate", candidate: candidate }
                connectiondetails[destination].send(JSON.stringify(candidatesData))
                break;

            case "Answer":
                let answerDestination = data.answerReceiver.uuid
                let answer = data.answer
                let answerSender = data.answerSender
                let answerData = { type: "Answer", answer: answer, answerSender: answerSender }
                connectiondetails[answerDestination].send(JSON.stringify(answerData))
                break;


            case "Offer":
                let Chatsender = data.sender
                let Chatreceiver = data.receiver
                let Chatoffer = data.offer
                connectiondetails[Chatreceiver.uuid].send(JSON.stringify({ type: "Offer", offer: Chatoffer, sender: Chatsender }))
                break;

            case "Reject":
                let RejectDestination = data.answerReceiver.uuid
                let RejectanswerSender = data.answerSender
                let RejectanswerData = { type: "Reject", answerSender: RejectanswerSender }
                connectiondetails[RejectDestination].send(JSON.stringify(RejectanswerData))
                break;

            case "status":
                let status = data.content
                let useruuid = data.useruuid
                userdetails[useruuid].status = status
                if (User_With_Location[useruuid]) {
                    User_With_Location[useruuid].status = status
                }
                for (let i in userdetails) {
                    connectiondetails[i].send(JSON.stringify({ type: "User_List", content: userdetails }))
                }
                for (let i in User_With_Location) {
                    connectiondetails[i].send(JSON.stringify({ type: "User_With_Location_List", content: User_With_Location }))
                }
                break;

            case "Location":
                if (userdetails[data.userid]) {
                    User_With_Location[data.userid] = userdetails[data.userid]
                    User_With_Location[data.userid].location = data.location
                    for (let i in User_With_Location) {
                        connectiondetails[i].send(JSON.stringify({ type: "User_With_Location_List", content: User_With_Location }))
                    }
                }
                break;

            case "Cancel-Request":
                if (userdetails[data.uuid]) {
                    connectiondetails[data.uuid].send(JSON.stringify({ type: "Cancel-Request" }))
                }
                break;

            default:
                break;
        }
    })
})









app.listen(PORT, () => {
    console.log("App listening at ", PORT)
})





//Important functions

//Function to generate random number
function getRandomNum(minRange, maxRange) {
    let min = minRange;
    let max = maxRange;

    let randomNum = Math.round(Math.random() * (max - min) + min);
    return randomNum
}

// Function to create uuid
function getUUID() {
    let datetime = new Date().getTime().toString();
    let randomNum1 = Math.random().toString();
    let randomNum2 = Math.random().toString();
    return datetime + "-" + randomNum1 + "-" + randomNum2
}

//Function on connection with chat server
function onconnection(connection) {
    let GeneratedUUID = getUUID();
    let randomUserNo = getRandomNum(0, 999).toString()
    connection.uuid = GeneratedUUID
    connectiondetails[GeneratedUUID] = connection
    userdetails[GeneratedUUID] = {
        username: "User" + randomUserNo,
        status: "Online",
        uuid: GeneratedUUID,
        image: "images/" + "user.png",
    }
}


//end

