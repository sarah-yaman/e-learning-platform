import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloudService {
  SERVER_URL: string = "http://localhost:5001/api";
  
  constructor(private http: HttpClient) { }

  // ===== USER AUTHENTICATION =====
  login(email: string, password: string) {
    return this.http.post(`${this.SERVER_URL}/user/login`, { email, password });
  }
  
  signup(email: string, name: string, password: string, role: string = 'student') {
    return this.http.post(`${this.SERVER_URL}/user/create`, { email, name, password, role });
  }
  
  signout() {
    return this.http.get(`${this.SERVER_URL}/user/signout`);
  }

  isAuth() {
    return this.http.get<{success: boolean, data?: any}>(`${this.SERVER_URL}/user/isAuth`);
  }
  
  // Check if the current user has admin role
  isAdmin() {
    return this.http.get<{success: boolean, data?: any}>(`${this.SERVER_URL}/user/isAuth`).pipe(
      map((res: any) => {
        if (res.success && res.data && res.data.role === 'admin') {
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }
  
  // Check if the current user is a student
  isStudent() {
    return this.http.get<{success: boolean, data?: any}>(`${this.SERVER_URL}/user/isAuth`).pipe(
      map((res: any) => {
        if (res.success && res.data && res.data.role === 'student') {
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }
  
  getUserProfile(userId: string) {
    return this.http.get(`${this.SERVER_URL}/user/user-details/${userId}`);
  }

  // ===== COURSES =====
  // Course creation and management (for admins/instructors)
  addCourse(courseData: any) {
    return this.http.post(`${this.SERVER_URL}/courses/add`, courseData);
  }
  
  updateCourse(courseId: string, courseData: any) {
    return this.http.put(`${this.SERVER_URL}/courses/${courseId}`, courseData);
  }
  
  deleteCourse(courseId: string) {
    return this.http.delete(`${this.SERVER_URL}/courses/delete/${courseId}`);
  }
  
  // Course content management
  addLesson(courseId: string, lessonData: any) {
    return this.http.post(`${this.SERVER_URL}/courses/${courseId}/lesson`, lessonData);
  }
  
  updateLesson(courseId: string, lessonId: string, lessonData: any) {
    return this.http.put(`${this.SERVER_URL}/courses/${courseId}/lesson/${lessonId}`, lessonData);
  }
  
  deleteLesson(courseId: string, lessonId: string) {
    return this.http.delete(`${this.SERVER_URL}/courses/${courseId}/lesson/${lessonId}`);
  }
  
  addQuiz(courseId: string, quizData: any) {
    return this.http.post(`${this.SERVER_URL}/courses/${courseId}/quiz`, quizData);
  }
  
  addAssignment(courseId: string, assignmentData: any) {
    return this.http.post(`${this.SERVER_URL}/courses/${courseId}/assignment`, assignmentData);
  }
  
  updateCompletionCriteria(courseId: string, criteriaData: any) {
    return this.http.put(`${this.SERVER_URL}/courses/${courseId}/completion-criteria`, criteriaData);
  }
  
  // Course browsing and enrollment
  getCourses(params?: any) {
    let queryParams = '';
    if (params) {
      queryParams = '?' + Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&');
    }
    return this.http.get(`${this.SERVER_URL}/courses/all${queryParams}`);
  }
  
  getCourse(courseId: string, preview: boolean = false) {
    return this.http.get(`${this.SERVER_URL}/courses/${courseId}${preview ? '?preview=true' : ''}`);
  }
  
  getInstructorCourses(instructorId?: string) {
    const url = instructorId 
      ? `${this.SERVER_URL}/courses/instructor/${instructorId}`
      : `${this.SERVER_URL}/courses/instructor`;
    return this.http.get(url);
  }
  
  getCartDetails(idArr: string[]) {
    return this.http.post(`${this.SERVER_URL}/courses/cart`, { idArr });
  }
  
  // Course forum
  addForumTopic(courseId: string, title: string) {
    return this.http.post(`${this.SERVER_URL}/courses/${courseId}/forum/topic`, { title });
  }
  
  addForumPost(courseId: string, topicId: string, content: string) {
    return this.http.post(`${this.SERVER_URL}/courses/${courseId}/forum/topic/${topicId}/post`, { content });
  }
  
  getForumTopics(courseId: string) {
    return this.http.get(`${this.SERVER_URL}/courses/${courseId}/forum/topics`);
  }
  
  getForumPosts(courseId: string, topicId: string) {
    return this.http.get(`${this.SERVER_URL}/courses/${courseId}/forum/topic/${topicId}`);
  }
  
  // ===== STUDENT PROGRESS =====
  enrollInCourse(studentId: string, courseId: string) {
    return this.http.post(`${this.SERVER_URL}/progress/enroll`, { studentId, courseId });
  }
  
  markLessonCompleted(studentId: string, courseId: string, lessonId: string) {
    return this.http.post(`${this.SERVER_URL}/progress/lesson/complete`, { studentId, courseId, lessonId });
  }
  
  submitQuiz(studentId: string, courseId: string, quizId: string, answers: any[]) {
    return this.http.post(`${this.SERVER_URL}/progress/quiz/submit`, { studentId, courseId, quizId, answers });
  }
  
  submitAssignment(studentId: string, courseId: string, assignmentId: string, submissionContent: string) {
    return this.http.post(`${this.SERVER_URL}/progress/assignment/submit`, { 
      studentId, courseId, assignmentId, submissionContent 
    });
  }
  
  gradeAssignment(studentId: string, courseId: string, assignmentId: string, score: number, feedback: string) {
    return this.http.post(`${this.SERVER_URL}/progress/assignment/grade`, { 
      studentId, courseId, assignmentId, score, feedback 
    });
  }
  
  getStudentProgress(studentId: string, courseId: string) {
    return this.http.get(`${this.SERVER_URL}/progress/student/${studentId}/course/${courseId}`);
  }
  
  getStudentAllProgress(studentId: string) {
    return this.http.get(`${this.SERVER_URL}/progress/student/${studentId}`);
  }
  
  getCourseProgress(courseId: string) {
    return this.http.get(`${this.SERVER_URL}/progress/course/${courseId}`);
  }
  
  // ===== MESSAGING =====
  createConversation(participants: string[], courseId?: string, title?: string) {
    return this.http.post(`${this.SERVER_URL}/messages/conversation/create`, { participants, courseId, title });
  }
  
  sendMessage(conversationId: string, senderId: string, content: string) {
    return this.http.post(`${this.SERVER_URL}/messages/conversation/${conversationId}/message`, { 
      senderId, content 
    });
  }
  
  markMessagesAsRead(conversationId: string, userId: string) {
    return this.http.post(`${this.SERVER_URL}/messages/conversation/${conversationId}/read`, { userId });
  }
  
  getUserConversations(userId: string) {
    return this.http.get(`${this.SERVER_URL}/messages/conversations/${userId}`);
  }
  
  getConversationMessages(conversationId: string, userId: string) {
    return this.http.get(`${this.SERVER_URL}/messages/conversation/${conversationId}/${userId}`);
  }
  
  deleteConversation(conversationId: string, userId: string) {
    return this.http.delete(`${this.SERVER_URL}/messages/conversation/${conversationId}/${userId}`);
  }
  
  // ===== ORDERS =====
  newOrder(name: string, phone: string, email: string, payment: string) {
    let cart = localStorage.getItem("cart");
    let courses: string[] = [];
    if (cart) {
      courses = JSON.parse(cart);
    }
    return this.http.post(`${this.SERVER_URL}/order/new`, { name, phone, email, payment, courses });
  }

  getOrders() {
    return this.http.get(`${this.SERVER_URL}/order/all`);
  }

  getSingleOrder(id: string) {
    return this.http.get(`${this.SERVER_URL}/order/get/${id}`);
  }
  
  // ===== ADMIN DASHBOARD =====
  getAdminDashboard() {
    return this.http.get(`${this.SERVER_URL}/admin/dashboard`);
  }
  
  getAllUsers() {
    return this.http.get(`${this.SERVER_URL}/admin/users`);
  }
  
  updateUserRole(userId: string, role: string) {
    return this.http.put(`${this.SERVER_URL}/admin/user/${userId}/role`, { role });
  }
  
  getStudentProgressReports() {
    return this.http.get(`${this.SERVER_URL}/admin/reports/student-progress`);
  }
  
  getCoursePopularityReport() {
    return this.http.get(`${this.SERVER_URL}/admin/reports/course-popularity`);
  }
}
