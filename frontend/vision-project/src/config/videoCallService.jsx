import API from './api';

export const getCalls = () => API.get('/api/calls');
export const scheduleCall = (data) => API.post('/api/calls', data);
export const startCall = (id) => API.put(`/api/calls/${id}/start`);
export const endCall = (id) => API.put(`/api/calls/${id}/end`);
