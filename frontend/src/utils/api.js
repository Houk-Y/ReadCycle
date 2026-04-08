import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('rc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rc_token');
      localStorage.removeItem('rc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register:       (d) => API.post('/auth/register', d),
  login:          (d) => API.post('/auth/login', d),
  getMe:          ()  => API.get('/auth/me'),
  updateProfile:  (d) => API.put('/auth/profile', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (d) => API.put('/auth/change-password', d),
};

export const booksAPI = {
  getAll:        (p)     => API.get('/books', { params: p }),
  getOne:        (id)    => API.get(`/books/${id}`),
  create:        (d)     => API.post('/books', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:        (id, d) => API.put(`/books/${id}`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove:        (id)    => API.delete(`/books/${id}`),
  getMyListings: ()      => API.get('/books/my-listings'),
};

export const messagesAPI = {
  getConversations:   ()   => API.get('/messages/conversations'),
  getMessages:        (id) => API.get(`/messages/${id}`),
  send:               (d)  => API.post('/messages', d),
  deleteConversation: (id) => API.delete(`/messages/conversations/${id}`),
};

export const wishlistAPI = {
  get:    ()       => API.get('/wishlist'),
  add:    (bookId) => API.post('/wishlist', { bookId }),
  remove: (bookId) => API.delete(`/wishlist/${bookId}`),
  check:  (bookId) => API.get(`/wishlist/check/${bookId}`),
};

export const transactionsAPI = {
  buy:          (d)          => API.post('/transactions/buy', d),
  swap:         (d)          => API.post('/transactions/swap', d),
  getMy:        (role)       => API.get('/transactions/my', { params: { role } }),
  updateStatus: (id, status) => API.put(`/transactions/${id}/status`, { status }),
};

export const adminAPI = {
  getStats:        ()  => API.get('/admin/stats'),
  getUsers:        (p) => API.get('/admin/users', { params: p }),
  toggleBlock:     (id)=> API.put(`/admin/users/${id}/block`),
  deleteUser:      (id)=> API.delete(`/admin/users/${id}`),
  getBooks:        (p) => API.get('/admin/books', { params: p }),
  deleteBook:      (id)=> API.delete(`/admin/books/${id}`),
  getTransactions: ()  => API.get('/admin/transactions'),
};

export const usersAPI = {
  getProfile: (id) => API.get(`/users/${id}`),
};

export default API;