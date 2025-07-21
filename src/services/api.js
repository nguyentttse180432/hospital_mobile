import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "https://hair-salon-fpt.io.vn/api",
  // baseURL: "https://67c1408c62be.ngrok-free.app",
  // headers: {
  //   "ngrok-skip-browser-warning": "true",
  // },
});

// Thêm interceptor để tự động gắn accessToken
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
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
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (refreshToken) {
          // Lấy thông tin user từ AsyncStorage
          const userString = await AsyncStorage.getItem("user");
          const user = userString ? JSON.parse(userString) : {};

          // Gọi API để lấy access token mới với body đúng format
          const response = await axios.post(
            "https://hair-salon-fpt.io.vn/api/Auth/refresh-token",
            {
              userId: user.id || "",
              role: user.role || "",
              refreshToken,
            }
          );

          if (response.data.isSuccess) {
            // Lưu token mới vào AsyncStorage
            await AsyncStorage.setItem(
              "accessToken",
              response.data.value.accessToken
            );
            await AsyncStorage.setItem(
              "refreshToken",
              response.data.value.refreshToken
            );

            // Cập nhật token trong header và thực hiện lại request
            api.defaults.headers.common.Authorization = `Bearer ${response.data.value.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Bỏ console.error để tránh cảnh báo
        // console.error("Refresh token error:", refreshError);
      }

      // Xóa token và chuyển về màn hình đăng nhập nếu refresh token thất bại
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("phoneVerified");

      // Tùy chọn: Redirect về màn hình đăng nhập (cần xử lý thêm)
    }

    return Promise.reject(error);
  }
);

export default api;
