import API from './api';

export const getPortfolios = (studentId) => {
    const url = studentId ? `/api/portfolio?studentId=${studentId}` : '/api/portfolio';
    return API.get(url);
};
export const createPortfolio = (data) => API.post('/api/portfolio', data);
export const updatePortfolio = (id, data) => API.put(`/api/portfolio/${id}`, data);
export const deletePortfolio = (id) => API.delete(`/api/portfolio/${id}`);
