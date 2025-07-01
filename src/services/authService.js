import api from './api';

export const login = async (username, password) => {
  try {
    const response = await api.post('Auth/login', {
      username,
      password,
    });
    return response.data.value; 
  } catch (error) {
    throw error;
  }
};

export const loginWithGoogle = async (token) => {
  try {
    const response = await api.post('Auth/oauth2', {
      token,
    });
    return response.data.value;
  } catch (error) {
    throw error;
  }
};
