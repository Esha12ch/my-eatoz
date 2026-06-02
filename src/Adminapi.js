import axios from "axios";

const BASE = "http://localhost:5000/api/admin";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

export const adminApi = {
  // Auth
  login: (email, password) =>
    axios.post(`${BASE}/login`, { email, password }),

  // Stats
  getStats: () =>
    axios.get(`${BASE}/stats`, { headers: getHeaders() }),

  getSurvey: () =>
    axios.get(`${BASE}/survey`, { headers: getHeaders() }),

  // Store
  getStoreStatus: () =>
    axios.get(`${BASE}/store-status`),

  setStoreStatus: (isOpen, message) =>
    axios.put(`${BASE}/store-status`, { isOpen, message }, { headers: getHeaders() }),

  // Users
  getUsers: () =>
    axios.get(`${BASE}/users`, { headers: getHeaders() }),

  deleteUser: (id) =>
    axios.delete(`${BASE}/user/${id}`, { headers: getHeaders() }),

  toggleBan: (id) =>
    axios.put(`${BASE}/user/${id}/toggle-ban`, {}, { headers: getHeaders() }),

  // Orders
  getOrders: () =>
    axios.get(`${BASE}/orders`, { headers: getHeaders() }),

  updateOrderStatus: (id, status) =>
    axios.put(`${BASE}/order/${id}/status`, { status }, { headers: getHeaders() }),

  // Food
  getFood: () =>
    axios.get(`${BASE}/food`, { headers: getHeaders() }),

  addFood: (data) =>
    axios.post(`${BASE}/add-food`, data, { headers: getHeaders() }),

  updateFood: (id, data) =>
    axios.put(`${BASE}/update-food/${id}`, data, { headers: getHeaders() }),

  deleteFood: (id) =>
    axios.delete(`${BASE}/delete-food/${id}`, { headers: getHeaders() }),

  // Grocery
  getGrocery: () =>
    axios.get(`${BASE}/grocery`, { headers: getHeaders() }),

  addGrocery: (data) =>
    axios.post(`${BASE}/add-grocery`, data, { headers: getHeaders() }),

  updateGrocery: (id, data) =>
    axios.put(`${BASE}/update-grocery/${id}`, data, { headers: getHeaders() }),

  deleteGrocery: (id) =>
    axios.delete(`${BASE}/delete-grocery/${id}`, { headers: getHeaders() }),

  // Restaurants
  getRestaurants: () =>
    axios.get(`${BASE}/restaurant`, { headers: getHeaders() }),

  addRestaurant: (data) =>
    axios.post(`${BASE}/add-restaurant`, data, { headers: getHeaders() }),

  updateRestaurant: (id, data) =>
    axios.put(`${BASE}/update-restaurant/${id}`, data, { headers: getHeaders() }),

  deleteRestaurant: (id) =>
    axios.delete(`${BASE}/delete-restaurant/${id}`, { headers: getHeaders() }),

  // Bookings ✅ FIXED
  getBookings: () =>
    axios.get(`http://localhost:5000/api/bookings`, { headers: getHeaders() }),

  cancelBooking: (id) =>
    axios.patch(`http://localhost:5000/api/bookings/${id}/cancel`, {}, { headers: getHeaders() }),
};