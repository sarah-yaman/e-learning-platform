export interface Lesson {
    _id?: string;
    title: string;
    description: string;
    content: string;
    duration?: number;
    order: number;
    isPreview: boolean;
    createdAt?: Date;
}

export interface QuizQuestion {
    _id?: string;
    question: string;
    options: string[];
    correctAnswer?: string; // Only visible to instructors
    points: number;
}

export interface Quiz {
    _id?: string;
    title: string;
    description?: string;
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit?: number;
    createdAt?: Date;
}

export interface Assignment {
    _id?: string;
    title: string;
    description: string;
    instructions: string;
    dueDate?: Date;
    maxPoints: number;
    passingScore: number;
    createdAt?: Date;
}

export interface CompletionCriteria {
    requiredLessons: string[];
    quizzes: Quiz[];
    assignments: Assignment[];
    minimumPassingGrade: number;
}

export interface ForumPost {
    _id?: string;
    content: string;
    createdBy: any; // User reference
    createdAt?: Date;
}

export interface ForumTopic {
    _id?: string;
    title: string;
    createdBy: any; // User reference
    createdAt?: Date;
    posts: ForumPost[];
}

export interface Forum {
    enabled: boolean;
    topics: ForumTopic[];
}

export interface Rating {
    _id?: string;
    rating: number;
    review?: string;
    createdBy: any; // User reference
    createdAt?: Date;
}

export interface Course {
    _id?: string;
    title: string;
    description: string;
    type: string;
    price: string;
    date?: string;
    instructor: any; // User reference
    thumbnail?: string;
    lessons: Lesson[];
    prerequisites?: any[]; // Course references
    completionCriteria: CompletionCriteria;
    forum: Forum;
    enrolledStudents?: any[]; // User references
    ratings?: Rating[];
    createdAt?: Date;
    
    // Client-side properties (not stored in DB)
    previewLessonsCount?: number;
    totalLessonsCount?: number;
}

export interface CourseProgress {
    _id?: string;
    student: any; // User reference
    course: any; // Course reference
    completedLessons: {
        lessonId: string;
        completedAt: Date;
    }[];
    quizAttempts: {
        quizId: string;
        score: number;
        passed: boolean;
        answers: {
            questionId: string;
            answer: string;
            correct: boolean;
        }[];
        attemptedAt: Date;
    }[];
    assignmentSubmissions: {
        assignmentId: string;
        submissionContent: string;
        score?: number;
        feedback?: string;
        status: 'submitted' | 'graded' | 'returned';
        submittedAt: Date;
        gradedAt?: Date;
    }[];
    overallProgress: number;
    overallGrade?: number;
    certificateIssued: boolean;
    certificateIssuedAt?: Date;
    status: 'enrolled' | 'in-progress' | 'completed' | 'failed';
    startedAt: Date;
    lastAccessedAt: Date;
    completedAt?: Date;
}
