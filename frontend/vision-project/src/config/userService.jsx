import API from './api';

export const getUserProfile = () => API.get('/api/users/profile');
export const updateUserProfile = (data) => API.put('/api/users/profile', data);
export const getStudents = () => API.get('/api/users/students');
export const getInstructors = () => API.get('/api/users/instructors');
