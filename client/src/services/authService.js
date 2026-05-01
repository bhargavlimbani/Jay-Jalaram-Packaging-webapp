import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// LOGIN
export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return res.data;
};

// REGISTER
export const sendRegistrationOtp = async (name, email, phone, address, password) => {
  const res = await axios.post(`${API_URL}/register/send-otp`, {
    name,
    email,
    phone,
    address,
    password,
  });
  return res.data;
};

export const registerUser = async (email, otp) => {
  const res = await axios.post(`${API_URL}/register`, {
    email,
    otp,
  });
  return res.data;
};

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${API_URL}/profile`, profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const forgotPasswordRequest = async (email) => {
  const res = await axios.post(`${API_URL}/forgot-password`, { email });
  return res.data;
};

export const resetPasswordRequest = async (token, password) => {
  const res = await axios.post(`${API_URL}/reset-password/${token}`, { password });
  return res.data;
};

export const resetPasswordWithOtpRequest = async (email, otp, password) => {
  const res = await axios.post(`${API_URL}/reset-password-otp`, {
    email,
    otp,
    password,
  });
  return res.data;
};