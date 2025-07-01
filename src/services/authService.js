import api from './api';;

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

export const sendOtpToPhone = async (phoneNumber) => {
  try {
    const response = await api.post("Account/sms-sending", {
      phoneNumber,
    });
    // {
    //   "phoneNumber": "string"
    // }
    return response.data.value;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (phoneNumber, code) => {
  try {
    const response = await api.post("Account/verification-sms", {
      phoneNumber,
      code,
    });
    // {
    //   "phoneNumber": "string",
    //   "code": "string"
    // }
    return response.data.value;
  } catch (error) {
    throw error;
  }
}

export const updateAccount = async (data) => {
  try {
    const response = await api.put("Account", data);
    // {
    //   "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   "phoneNumber": "stringstri"
    // }
    return response.data.value;
  } catch (error) {
    throw error;
  }
}
