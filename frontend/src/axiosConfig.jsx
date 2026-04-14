import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5001', // local
  // baseURL: 'http://15.135.83.231:5001', // live (previous)
  baseURL: 'http://13.211.77.81:5001', // live - backend running on port 5001
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
