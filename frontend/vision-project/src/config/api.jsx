import axios from 'axios';

const API = axios.create({
    baseURL: "http://localhost:3000",
});

API.interceptors.request.use((req) => {
    // Use upgradex_token — same key used in Login/Signup
    const token = localStorage.getItem('upgradex_token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

export default API;
