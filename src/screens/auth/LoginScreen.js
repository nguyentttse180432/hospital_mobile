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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { loginWithGoogle } from "../../services/authService";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const { width, height } = Dimensions.get("window");

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "879263326241-q390su58qmmkcvhrkk69r59pvqt4smot.apps.googleusercontent.com",
      offlineAccess: true,
      scopes: ["profile", "email"],
      iosClientId:
        "879263326241-lgtn5qc4ict46et8636211k37hiuunl8.apps.googleusercontent.com",
    });

    // Check if user is already logged in
    checkLoginStatus();
  }, []);

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
      console.error("Error checking login status:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log("Google user info:", response);

      // Extract the actual data from the response
      const { user, idToken } = response.data || response;

      console.log("User data:", user);
      console.log("ID Token:", idToken);

      // Call the backend API for authentication
      try {
        const backendResponse = await loginWithGoogle(idToken);
        console.log("Backend response:", backendResponse);

        if (backendResponse.isSuccess) {
          const { accessToken, refreshToken, user, requiredOtp } =
            backendResponse.value;

          // Save authentication data to AsyncStorage
          await AsyncStorage.setItem("accessToken", accessToken);
          await AsyncStorage.setItem("refreshToken", refreshToken);
          await AsyncStorage.setItem("user", JSON.stringify(user));
          await AsyncStorage.setItem(
            "phoneVerified",
            JSON.stringify(!!user.phoneNumber && !requiredOtp)
          );

          // Determine navigation based on requiredOtp and phoneNumber
          if (!requiredOtp || !user.phoneNumber) {
            navigation.replace("HomeScreen"); // ViewOnly mode
          } else {
            navigation.replace("EnterOtpScreen");
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
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            Alert.alert("Lỗi đăng nhập", "Bạn đã hủy đăng nhập Google.");
            break;
          case statusCodes.IN_PROGRESS:
            Alert.alert("Lỗi đăng nhập", "Đang tiến hành đăng nhập Google.");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert("Lỗi đăng nhập", "Dịch vụ Google Play không khả dụng.");
            break;
          case statusCodes.NETWORK_ERROR:
            Alert.alert("Lỗi đăng nhập", "Lỗi mạng khi đăng nhập Google.");
            break;
          default:
            console.error("Google Sign-In Error:", error);
            Alert.alert("Lỗi đăng nhập", "Không thể đăng nhập Google.");
        }
      } else {
        console.error("Unexpected error:", error);
        Alert.alert("Lỗi", "Đã xảy ra lỗi không mong muốn.");
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
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/hospital.png")}
              style={styles.logo}
            />
            <Text style={styles.welcomeText}>Chào mừng đến với</Text>
            <Text style={styles.brandText}>HOSPITAL CARE</Text>
          </View>

          <View style={styles.loginContainer}>
            <TouchableOpacity
              style={[
                styles.googleButton,
                loading && styles.googleButtonDisabled,
              ]}
              onPress={handleGoogleLogin}
            >
              <View style={styles.googleButtonContent}>
                <GoogleSigninButton style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>
                  {loading ? "Đang đăng nhập..." : "Đăng nhập với Google"}
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
});

export default LoginScreen;
