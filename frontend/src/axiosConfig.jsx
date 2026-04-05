import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5001', // local
  baseURL: 'http://15.135.83.231:5001', // live - backend running on port 5001
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
