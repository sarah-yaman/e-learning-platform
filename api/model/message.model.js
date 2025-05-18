const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema for individual messages
const messageSchema = new Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Schema for conversation threads
const conversationSchema = new Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses' }, // Optional, if conversation is related to a course
    title: { type: String },
    messages: [messageSchema],
    lastMessageAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

// Create index for faster querying of conversations by participants
conversationSchema.index({ participants: 1 });
conversationSchema.index({ course: 1 });

module.exports = {
    Message: mongoose.model("Message", messageSchema),
    Conversation: mongoose.model("Conversation", conversationSchema)
};
