const { Message, Conversation } = require("../model/message.model");
const { User } = require("../model/user.model");
const mongoose = require("mongoose");

module.exports = {
    // Create a new conversation
    createConversation: async (req, res) => {
        try {
            const { participants, courseId, title } = req.body;
            
            // Validate participants exist
            const users = await User.find({ _id: { $in: participants } });
            
            if (users.length !== participants.length) {
                return res.status(400).json({ success: false, message: "One or more participants not found" });
            }
            
            // Create new conversation
            const newConversation = new Conversation({
                participants,
                course: courseId || null,
                title: title || null,
                messages: []
            });
            
            await newConversation.save();
            
            res.status(200).json({ success: true, data: newConversation });
        } catch (error) {
            console.error("Error creating conversation:", error);
            res.status(500).json({ success: false, message: "Server error creating conversation" });
        }
    },
    
    // Send a message in a conversation
    sendMessage: async (req, res) => {
        try {
            const { conversationId, senderId, content } = req.body;
            
            // Find the conversation
            const conversation = await Conversation.findById(conversationId);
            
            if (!conversation) {
                return res.status(404).json({ success: false, message: "Conversation not found" });
            }
            
            // Validate sender is a participant
            if (!conversation.participants.includes(senderId)) {
                return res.status(403).json({ success: false, message: "Sender is not a participant in this conversation" });
            }
            
            // Create new message
            const newMessage = {
                sender: senderId,
                recipient: conversation.participants.find(p => p.toString() !== senderId.toString()),
                content,
                read: false,
                createdAt: new Date()
            };
            
            // Add message to conversation
            conversation.messages.push(newMessage);
            conversation.lastMessageAt = new Date();
            
            await conversation.save();
            
            res.status(200).json({ success: true, data: newMessage });
        } catch (error) {
            console.error("Error sending message:", error);
            res.status(500).json({ success: false, message: "Server error sending message" });
        }
    },
    
    // Mark messages as read
    markMessagesAsRead: async (req, res) => {
        try {
            const { conversationId, userId } = req.body;
            
            // Find the conversation
            const conversation = await Conversation.findById(conversationId);
            
            if (!conversation) {
                return res.status(404).json({ success: false, message: "Conversation not found" });
            }
            
            // Validate user is a participant
            if (!conversation.participants.includes(userId)) {
                return res.status(403).json({ success: false, message: "User is not a participant in this conversation" });
            }
            
            // Mark unread messages as read
            let updated = false;
            
            conversation.messages.forEach(message => {
                if (message.recipient.toString() === userId && !message.read) {
                    message.read = true;
                    message.readAt = new Date();
                    updated = true;
                }
            });
            
            if (updated) {
                await conversation.save();
            }
            
            res.status(200).json({ success: true, message: "Messages marked as read" });
        } catch (error) {
            console.error("Error marking messages as read:", error);
            res.status(500).json({ success: false, message: "Server error marking messages as read" });
        }
    },
    
    // Get conversations for a user
    getUserConversations: async (req, res) => {
        try {
            const { userId } = req.params;
            
            // Find conversations where user is a participant
            const conversations = await Conversation.find({ participants: userId })
                .sort({ lastMessageAt: -1 })
                .populate('participants', 'name email')
                .populate('course', 'title');
            
            // Count unread messages for each conversation
            const conversationsWithUnreadCount = conversations.map(conversation => {
                const unreadCount = conversation.messages.filter(
                    message => message.recipient.toString() === userId && !message.read
                ).length;
                
                return {
                    ...conversation.toObject(),
                    unreadCount
                };
            });
            
            res.status(200).json({ success: true, data: conversationsWithUnreadCount });
        } catch (error) {
            console.error("Error getting user conversations:", error);
            res.status(500).json({ success: false, message: "Server error getting user conversations" });
        }
    },
    
    // Get messages in a conversation
    getConversationMessages: async (req, res) => {
        try {
            const { conversationId, userId } = req.params;
            
            // Find the conversation
            const conversation = await Conversation.findById(conversationId)
                .populate('participants', 'name email')
                .populate('course', 'title');
            
            if (!conversation) {
                return res.status(404).json({ success: false, message: "Conversation not found" });
            }
            
            // Validate user is a participant
            if (!conversation.participants.some(p => p._id.toString() === userId)) {
                return res.status(403).json({ success: false, message: "User is not a participant in this conversation" });
            }
            
            res.status(200).json({ success: true, data: conversation });
        } catch (error) {
            console.error("Error getting conversation messages:", error);
            res.status(500).json({ success: false, message: "Server error getting conversation messages" });
        }
    },
    
    // Delete a conversation
    deleteConversation: async (req, res) => {
        try {
            const { conversationId, userId } = req.params;
            
            // Find the conversation
            const conversation = await Conversation.findById(conversationId);
            
            if (!conversation) {
                return res.status(404).json({ success: false, message: "Conversation not found" });
            }
            
            // Validate user is a participant
            if (!conversation.participants.includes(userId)) {
                return res.status(403).json({ success: false, message: "User is not a participant in this conversation" });
            }
            
            // Delete the conversation
            await Conversation.findByIdAndDelete(conversationId);
            
            res.status(200).json({ success: true, message: "Conversation deleted successfully" });
        } catch (error) {
            console.error("Error deleting conversation:", error);
            res.status(500).json({ success: false, message: "Server error deleting conversation" });
        }
    }
};
