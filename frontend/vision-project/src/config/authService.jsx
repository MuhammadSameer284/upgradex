import API from "./api";

// baseURL is http://localhost:3000
// so these become http://localhost:3000/api/auth/register etc.
export const register = (userData) => API.post('/api/auth/register', userData);
export const login = (userData) => API.post('/api/auth/login', userData);
