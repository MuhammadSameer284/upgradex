import API from './api';

export const getTasks = (studentId) => {
    const url = studentId ? `/api/tasks?studentId=${studentId}` : '/api/tasks';
    return API.get(url);
};
export const createTask = (data) => API.post('/api/tasks', data);
export const updateTask = (id, data) => API.put(`/api/tasks/${id}`, data);
export const updateKanbanDrag = (tasks) => API.put('/api/tasks/kanban/drag', { tasks });
export const deleteTask = (id) => API.delete(`/api/tasks/${id}`);
