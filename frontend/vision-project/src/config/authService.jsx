import API from "./api";

export const register = (userData) => API.post('/api/auth/register', userData)
export const login = (userData) => API.post('/api/auth/login', userData)
// export const register = (userData) => API.post('/api/auth/register', userData)