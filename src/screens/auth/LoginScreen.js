import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Alert,
  ActivityIndicator,
  LogBox,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tắt cảnh báo trong màn hình đăng nhập
LogBox.ignoreLogs([
  "open debugger to view warning",
  "Setting a timer",
  "Cannot connect to Metro",
  "Google Play",
  "WebView",
  "ERROR: WebView",
  "Error: WebView",
  "WebView received error",
  "Linking requires",
  "Error: activity is null",
]);

import { loginWithGoogle } from "../../services/authService";
import googleSignInHelper from "../../utils/googleSignInHelper";

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [userAvatar, setUserAvatar] = useState(null);
  const [userName, setUserName] = useState(null);
  useEffect(() => {
    // Khởi tạo Google Sign In
    googleSignInHelper.initGoogleSignIn();

    // Thêm delay để đảm bảo GoogleSignin được khởi tạo đầy đủ
    setTimeout(() => {
      // Kiểm tra nếu người dùng đã đăng nhập trước đó và tải thông tin hiện có
      loadExistingGoogleUser();
    }, 1000);

    // Check if user is already logged in
    checkLoginStatus();
  }, []);

  const loadExistingGoogleUser = async () => {
    try {
      // Try to load saved Google avatar/name regardless of login status
      const savedAvatar = await AsyncStorage.getItem("googleUserAvatar");
      const savedName = await AsyncStorage.getItem("googleUserName");

      if (savedAvatar) setUserAvatar(savedAvatar);
      if (savedName) setUserName(savedName);

      // Cũng kiểm tra nếu có người dùng Google hiện tại
      const googleUserResult = await googleSignInHelper.getCurrentGoogleUser();
      if (googleUserResult.success && googleUserResult.data) {
        const user = googleUserResult.data.user;
        if (user) {
          const photoUrl = user.photo || user.photoURL;
          const displayName = user.name || user.displayName;

          if (photoUrl && !savedAvatar) {
            setUserAvatar(photoUrl);
            await AsyncStorage.setItem("googleUserAvatar", photoUrl);
          }

          if (displayName && !savedName) {
            setUserName(displayName);
            await AsyncStorage.setItem("googleUserName", displayName);
          }
        }
      }
    } catch (error) {
      console.log("Error loading existing Google user:", error);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const user = await AsyncStorage.getItem("user");

      if (accessToken && user) {
        // User is already logged in, determine which screen to navigate to
        const userData = JSON.parse(user);
        const phoneVerified = JSON.parse(
          (await AsyncStorage.getItem("phoneVerified")) || "false"
        );

        if (phoneVerified) {
          navigation.replace("Main");
        } else {
          navigation.replace("HomeScreen"); // ViewOnly mode
        }
      }
    } catch (error) {
      console.log("Error checking login status:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Đang kết nối với Google...");

      // Khởi tạo lại GoogleSignin
      googleSignInHelper.initGoogleSignIn();

      // Thêm delay để đảm bảo UI được cập nhật và GoogleSignin được khởi tạo đầy đủ
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Sử dụng helper để thực hiện đăng nhập Google
      const result = await googleSignInHelper.performGoogleSignIn();

      if (!result.success) {
        // Không hiển thị Alert nếu user đã hủy đăng nhập
        if (
          result.error &&
          result.error.includes("Bạn đã hủy đăng nhập Google")
        ) {
          console.log("User cancelled Google sign-in");
          setLoading(false);
          return;
        }

        // Thử khởi tạo lại GoogleSignin và thử lại một lần nữa
        if (
          result.error &&
          (result.error.includes("activity is null") ||
            result.error.includes("isSignedIn is not a function") ||
            result.error.includes("Không thể khởi tạo đăng nhập Google"))
        ) {
          console.log("Retrying Google sign-in after initialization error");

          // Thêm delay dài hơn và thử lại
          await new Promise((resolve) => setTimeout(resolve, 2000));
          googleSignInHelper.initGoogleSignIn();
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Thử lại lần nữa
          const retryResult = await googleSignInHelper.performGoogleSignIn();
          if (!retryResult.success) {
            Alert.alert(
              "Thông báo",
              "Không thể kết nối với Google sau nhiều lần thử. Vui lòng thử lại sau."
            );
            setLoading(false);
            return;
          } else {
            // Nếu thử lại thành công, sử dụng kết quả mới
            result.success = true;
            result.data = retryResult.data;
            result.error = null;
          }
        } else {
          // Hiển thị lỗi khác
          Alert.alert(
            "Thông báo",
            result.error ||
              "Không thể đăng nhập với Google. Vui lòng thử lại sau."
          );
          setLoading(false);
          return;
        }
      }

      const response = result.data;
      setLoadingMessage("Đã kết nối với Google, đang xác thực...");

      // Extract the actual data from the response
      const { user, idToken } = response.data || response;

      if (!user || !idToken) {
        console.log("Missing user data or idToken");
        Alert.alert(
          "Thông báo",
          "Đăng nhập Google không trả về đầy đủ thông tin. Vui lòng thử lại."
        );
        setLoading(false);
        return;
      }

      // console.log("User data:", user);
      // console.log("ID Token:", idToken);

      // Save the user's avatar URL and name for display
      if (user) {
        // The photo property might be in different locations depending on the response structure
        const photoUrl =
          user.photo || user.photoURL || (user.user && user.user.photo);
        const displayName =
          user.name || user.displayName || (user.user && user.user.name);

        if (photoUrl) {
          setUserAvatar(photoUrl);
          await AsyncStorage.setItem("googleUserAvatar", photoUrl);
          // console.log("Saved Google user avatar:", photoUrl);
        }

        if (displayName) {
          setUserName(displayName);
          await AsyncStorage.setItem("googleUserName", displayName);
          // console.log("Saved Google user name:", displayName);
        }
      }

      // Call the backend API for authentication
      try {
        setLoadingMessage("Đang xác thực với máy chủ...");
        
        const backendResponse = await loginWithGoogle(idToken);
        // console.log("Backend response:", backendResponse);

        if (backendResponse.isSuccess) {
          // Extract data from response
          const { accessToken, refreshToken, user, requiredOtp } =
            backendResponse.value;

          // Store user data in AsyncStorage
          await AsyncStorage.setItem("user", JSON.stringify(user));
          console.log("User data saved to AsyncStorage:", user);
          

          // For requiredOtp flow, tokens might not be provided until OTP verification
          if (accessToken) {
            await AsyncStorage.setItem("accessToken", accessToken);
          }

          if (refreshToken) {
            await AsyncStorage.setItem("refreshToken", refreshToken);
          }

          // Determine navigation based on requiredOtp and phoneNumber
          if (requiredOtp) {
            await AsyncStorage.setItem("otpAlreadySent", "true");
            // console.log("Set flag to prevent duplicate OTP sending");

            navigation.replace("EnterOtpScreen");
          } else if (user.phoneNumber) {
            // If user has a phone number and no OTP required, they're fully verified
            await AsyncStorage.setItem("phoneVerified", JSON.stringify(true));
            // console.log("User is fully verified. Navigating to Main");
            navigation.replace("Main");
          } else {
            // If user doesn't have a phone number, they need to verify phone first
            await AsyncStorage.setItem("phoneVerified", JSON.stringify(false));
            // console.log("Phone verification required. Navigating to ViewOnly mode");
            navigation.replace("HomeScreen"); // ViewOnly mode
          }
        } else {
          Alert.alert(
            "Lỗi",
            backendResponse.error?.message || "Đăng nhập thất bại"
          );
        }
      } catch (e) {
        console.error("Login with backend failed:", e);
        Alert.alert(
          "Lỗi",
          "Không thể kết nối tới máy chủ. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      // Hầu hết các lỗi sẽ được xử lý trong googleSignInHelper
      // Chỉ xử lý các lỗi cụ thể khác ở đây
      console.log("Error during login process:", error);

      // Không hiển thị Alert nếu có lỗi "activity is null"
      if (!error.message || !error.message.includes("activity is null")) {
        Alert.alert(
          "Thông báo",
          "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View
            style={[
              styles.logoContainer,
              userAvatar && styles.logoContainerWithAvatar,
            ]}
          >
            <Image
              source={require("../../assets/hospital.png")}
              style={styles.logo}
            />
            <Text style={styles.welcomeText}>Chào mừng đến với</Text>
            <Text style={styles.brandText}>HOSPITAL CARE</Text>
          </View>

          {userAvatar ? (
            <View style={styles.userProfileContainer}>
              <Image source={{ uri: userAvatar }} style={styles.userAvatar} />
              {userName && (
                <Text style={styles.userName}>Xin chào, {userName}</Text>
              )}
              {loading ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                    style={styles.loadingIndicator}
                  />
                  {loadingMessage ? (
                    <Text style={styles.loadingText}>{loadingMessage}</Text>
                  ) : null}
                </>
              ) : (
                <TouchableOpacity
                  style={styles.changeAccountButton}
                  onPress={async () => {
                    try {
                      setLoading(true);
                      setLoadingMessage("Đang đăng xuất...");

                      // Thêm delay để đảm bảo UI được cập nhật
                      await new Promise((resolve) => setTimeout(resolve, 500));

                      // Sign out from Google
                      await googleSignInHelper.signOutGoogle();

                      // Clear just the Google avatar/name but not the full login
                      await AsyncStorage.removeItem("googleUserAvatar");
                      await AsyncStorage.removeItem("googleUserName");
                      setUserAvatar(null);
                      setUserName(null);
                    } catch (error) {
                      console.log("Error signing out from Google:", error);

                      // Still clear local state even if Google signout fails
                      await AsyncStorage.removeItem("googleUserAvatar");
                      await AsyncStorage.removeItem("googleUserName");
                      setUserAvatar(null);
                      setUserName(null);
                    } finally {
                      setLoading(false);
                      setLoadingMessage("");
                    }
                  }}
                >
                  <Text style={styles.changeAccountText}>Đổi tài khoản</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          <View style={styles.loginContainer}>
            <TouchableOpacity
              style={[
                styles.googleButton,
                loading && styles.googleButtonDisabled,
              ]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <View style={styles.googleButtonContent}>
                <Image
                  source={require("../../assets/google-icon.png")}
                  style={styles.googleIconImage}
                />
                <Text style={styles.googleButtonText}>
                  {loading
                    ? "Đang đăng nhập..."
                    : userAvatar
                    ? "Tiếp tục đăng nhập"
                    : "Đăng nhập với Google"}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Bằng cách đăng nhập, bạn đồng ý với{" "}
                <Text style={styles.linkText}>Điều khoản sử dụng</Text> và{" "}
                <Text style={styles.linkText}>Chính sách bảo mật</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width,
    height,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainerWithAvatar: {
    marginBottom: 5,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 5,
    textAlign: "center",
  },
  brandText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userProfileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  changeAccountButton: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
  },
  changeAccountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  loginContainer: {
    width: "100%",
    alignItems: "center",
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleIconImage: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "bold",
  },
  termsContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 18,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  linkText: {
    color: "#87CEEB",
    textDecorationLine: "underline",
  },
  loadingIndicator: {
    marginTop: 5,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  clearSessionButton: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
  },
  clearSessionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default LoginScreen;
