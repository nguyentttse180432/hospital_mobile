import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const loginWithGoogle = async (token) => {
  try {
    const response = await api.post("Auth/oauth2", {
      token,
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in with Google:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể đăng nhập với Google" },
    };
  }
};

export const sendOtpToPhone = async (phoneNumber) => {
  try {
    const response = await api.post("Accounts/sms-sending", {
      phoneNumber,
    });
    // {
    //   "phoneNumber": "string"
    // }
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể gửi mã OTP" },
    };
  }
};

export const verifyOtp = async (phoneNumber, code) => {
  try {
    const response = await api.post("Accounts/verification-sms", {
      phoneNumber,
      code,
    });
    console.log("Response from verifyOtp:", response.data);

    // {
    //   "phoneNumber": "string",
    //   "code": "string"
    // }

    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      isSuccess: false,
      error: { message: "Mã OTP không hợp lệ hoặc đã hết hạn" },
    };
  }
};

export const verifyOtpLogin = async (phoneNumber, code) => {
  try {
    const response = await api.post("Auth/verification-phone-login", {
      phoneNumber,
      code,
    });
    console.log("Response from verifyOtp:", response.data);

    // {
    //   "phoneNumber": "string",
    //   "code": "string"
    // }

    // Handle the case where the response includes access/refresh tokens
    // This happens in the requiredOtp flow after successful OTP verification
    if (response.data.isSuccess && response.data.value) {
      const { accessToken, refreshToken } = response.data.value;

      if (accessToken) {
        await AsyncStorage.setItem("accessToken", accessToken);
        console.log("Access token saved from OTP verification");
      }

      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
        console.log("Refresh token saved from OTP verification");
      }
    }

    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      isSuccess: false,
      error: { message: "Mã OTP không hợp lệ hoặc đã hết hạn" },
    };
  }
};

export const updateAccount = async (data) => {
  try {
    const response = await api.patch(`Accounts/${data.accountId}`, data);
    console.log("Response from updateAccount:", response.data);
    console.log("User data before update:", data.accountId);
    console.log("Phone number being updated:", data.phoneNumber);
    console.log("OTP being verified:", data.code);

    // {
    //   "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //   "phoneNumber": "string",
    //   "code": "string",
    // }
    return response.data;
  } catch (error) {
    console.error("Error updating account:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể cập nhật thông tin tài khoản" },
    };
  }
};

export const refreshToken = async (refreshToken) => {
  try {
    const response = await api.post("Auth/refresh-token", { refreshToken });
    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể làm mới token" },
    };
  }
};

export const logout = async () => {
  try {
    // Clear all authentication and user data from AsyncStorage
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("userData");
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");

    // You could also make an API call to invalidate the token on the server if needed
    // const response = await api.post("Auth/logout");

    return { isSuccess: true };
  } catch (error) {
    console.error("Error during logout:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể đăng xuất. Vui lòng thử lại." },
    };
  }
};

// The following patient-related functions have been moved to patientService.js
// and should be imported from there instead:
// - linkPatientProfile
// - createPatientProfile
// - checkIdCard
