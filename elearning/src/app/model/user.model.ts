export interface Certificate {
    courseId: string;
    issueDate: Date;
    certificateUrl: string;
}

export interface User {
    _id?: string;
    email: string;
    name: string;
    password?: string; // Only used for registration, not stored in client
    role: 'student' | 'admin' | 'guest';
    enrolledCourses?: string[];
    completedCourses?: string[];
    certificates?: Certificate[];
    createdAt?: Date;
}

export interface Conversation {
    _id?: string;
    participants: User[];
    course?: any; // Course reference
    title?: string;
    messages: Message[];
    lastMessageAt: Date;
    createdAt: Date;
    unreadCount?: number; // Client-side property
}

export interface Message {
    _id?: string;
    sender: User;
    recipient: User;
    content: string;
    read: boolean;
    readAt?: Date;
    createdAt: Date;
}
