import axios from 'axios';

const api = axios.create({
  // Kita gunakan localhost:5000 karena diagnosa tadi sukses di sini
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;