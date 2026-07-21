import API from './api';

export const getProjects = () => API.get('/api/projects');
export const createProject = (data) => API.post('/api/projects', data);
export const updateProject = (id, data) => API.put(`/api/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/api/projects/${id}`);
