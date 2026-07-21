import API from './api';

export const getStudentDashboard = () => API.get('/api/dashboard/student');
export const getInstructorDashboard = () => API.get('/api/dashboard/instructor');
