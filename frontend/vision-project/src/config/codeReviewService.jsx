import API from './api';

export const getReviews = () => API.get('/api/reviews');
export const createReview = (data) => API.post('/api/reviews', data);
export const updateReviewStatus = (id, status) => API.put(`/api/reviews/${id}/status`, { status });
export const addComment = (id, line, text) => API.post(`/api/reviews/${id}/comments`, { line, text });
export const resolveComment = (id, commentId) => API.put(`/api/reviews/${id}/comments/${commentId}/resolve`);
