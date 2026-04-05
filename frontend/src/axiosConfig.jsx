import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5001', // local
  baseURL: 'http://15.135.83.231', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
