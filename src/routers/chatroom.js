const express = require('express')
	, router = express.Router()
	, authMiddleware = require('../middlewares/isAuthenticated')
	, {findCardByID} = require('../controllers/card')
	, {findUserById} = require('../controllers/user')
	, {getMessagesByRoomId} = require('../controllers/message')
	, {verifyUser} = require('../middlewares/isAuthenticated')
	, {createMessage} = require('../controllers/message')
	, exp = require('express')
	, app = exp()
	, http = require('http').Server(app)
	, io = require('socket.io')(http);


router.get('/card/:cardId', verifyUser, async (req, res) => {
	const roomID = req.params.cardId;
	try {
		const roomObj = await findCardByID(roomID);
		const authorObj = await findUserById(roomObj.uid);
		const messages = await getMessagesByRoomId(roomID);
		const authorName = authorObj.firstName + " " + authorObj.lastName;
		console.log(req.user.email);
		res.render('chatroom', {room: roomObj, authorName: authorName, messages: messages, user:req.user.email});
	}
	catch(err) {
		console.log("error in opening chatroom");
		throw err;
	}
})

router.post('/card/:cardId', verifyUser, async (req, res) => {
	const currentUserName = req.user.firstName + " " + req.user.lastName;
	const roomID = req.params.cardId;
	const msg = req.body.message;
	const query = {
		author: currentUserName,
		roomID: roomID,
		message: msg
	}

	try {
		const resp = await createMessage(query);
		res.status(200).redirect(`/chatroom/card/${roomID}`)
	}
	catch(err) {
		console.log("Error in POST to this room!");
		throw err;
	}


})


module.exports=router
