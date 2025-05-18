const express = require("express");
const { auth, studentAuth } = require("../auth/auth");
const router = express.Router();
const messageController = require("../controllers/message.controller");

// Conversation management routes
router.post("/conversation/create", auth, messageController.createConversation);
router.post("/conversation/:conversationId/message", auth, messageController.sendMessage);
router.post("/conversation/:conversationId/read", auth, messageController.markMessagesAsRead);
router.delete("/conversation/:conversationId/:userId", auth, messageController.deleteConversation);

// Conversation retrieval routes
router.get("/conversations/:userId", auth, messageController.getUserConversations);
router.get("/conversation/:conversationId/:userId", auth, messageController.getConversationMessages);

module.exports = router;
