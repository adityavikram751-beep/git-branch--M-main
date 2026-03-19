// lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.3846.in',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;