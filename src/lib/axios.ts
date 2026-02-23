// lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://barber-syndicate.vercel.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;