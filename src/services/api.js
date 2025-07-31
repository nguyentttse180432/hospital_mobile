import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import environment variables
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL_PROD;
const AUTH_REFRESH_TOKEN_ENDPOINT =
  process.env.EXPO_PUBLIC_AUTH_REFRESH_TOKEN_ENDPOINT || "/Auth/refresh-token";
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT) || 10000;
const STORAGE_ACCESS_TOKEN_KEY =
  process.env.EXPO_PUBLIC_STORAGE_ACCESS_TOKEN_KEY || "accessToken";
const STORAGE_REFRESH_TOKEN_KEY =
  process.env.EXPO_PUBLIC_STORAGE_REFRESH_TOKEN_KEY || "refreshToken";
const STORAGE_USER_KEY = process.env.EXPO_PUBLIC_STORAGE_USER_KEY || "user";
const STORAGE_PHONE_VERIFIED_KEY =
  process.env.EXPO_PUBLIC_STORAGE_PHONE_VERIFIED_KEY || "phoneVerified";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  // Uncomment for development with ngrok
  // headers: {
  //   "ngrok-skip-browser-warning": "true",
  // },
});

// Thêm interceptor để tự động gắn accessToken
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý refresh token khi access token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi là 401 (Unauthorized) và chưa thử refresh token
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Lấy refresh token từ AsyncStorage
        const refreshToken = await AsyncStorage.getItem(
          STORAGE_REFRESH_TOKEN_KEY
        );

        if (refreshToken) {
          // Lấy thông tin user từ AsyncStorage
          const userString = await AsyncStorage.getItem(STORAGE_USER_KEY);
          const user = userString ? JSON.parse(userString) : {};

          // Gọi API để lấy access token mới với body đúng format
          const response = await axios.post(
            `${API_BASE_URL}${AUTH_REFRESH_TOKEN_ENDPOINT}`,
            {
              userId: user.id || "",
              role: user.role || "",
              refreshToken,
            }
          );

          if (response.data.isSuccess) {
            // Lưu token mới vào AsyncStorage
            await AsyncStorage.setItem(
              STORAGE_ACCESS_TOKEN_KEY,
              response.data.value.accessToken
            );
            await AsyncStorage.setItem(
              STORAGE_REFRESH_TOKEN_KEY,
              response.data.value.refreshToken
            );

            // Cập nhật token trong header và thực hiện lại request
            api.defaults.headers.common.Authorization = `Bearer ${response.data.value.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Log error in development mode only
        if (process.env.EXPO_PUBLIC_DEBUG_MODE === "true") {
          console.error("Refresh token error:", refreshError);
        }
      }

      // Xóa token và chuyển về màn hình đăng nhập nếu refresh token thất bại
      await AsyncStorage.removeItem(STORAGE_ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(STORAGE_USER_KEY);
      await AsyncStorage.removeItem(STORAGE_PHONE_VERIFIED_KEY);

      // Tùy chọn: Redirect về màn hình đăng nhập (cần xử lý thêm)
    }

    return Promise.reject(error);
  }
);

export default api;
