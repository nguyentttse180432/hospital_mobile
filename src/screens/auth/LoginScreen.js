import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenContainer from "../../components/common/ScreenContainer";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { login } from "../../services/authService"; // Uncomment if using a service for login

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        const data = await login(username, password);

        // Truy cập đúng path:
        const token = data?.accessToken;
        const user = data?.user;

        if (!data || !token) {
          setErrors({ general: "Tên đăng nhập hoặc mật khẩu không đúng" });
          return;
        }

        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("user", JSON.stringify(user));
        
        if (rememberMe) {
          await AsyncStorage.setItem("user", JSON.stringify(user));
        }

        navigation.replace("Main");
      } catch (error) {
        if (error.response && error.response.data) {
          const detail = error.response.data.detail;
          if (detail) {
            setErrors({ general: "Tên đăng nhập hoặc mật khẩu không đúng" }); // Hiện thông báo chi tiết từ server
          }
        } else {
          setErrors({ general: "Đã xảy ra lỗi. Vui lòng thử lại sau." });
        }
      }
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          {/* <Image
            source={require("../assets/images/placeholder-logo.png")}
            style={styles.logo}
            defaultSource={require("../assets/images/placeholder-logo.png")}
          /> */}
          <Text style={styles.welcomeText}>Chào mừng đến với</Text>
          <Text style={styles.brandText}>HOSPITAL CARE</Text>
        </View>

        <Text style={styles.loginText}>Vui lòng đăng nhập để sử dụng</Text>

        <View style={styles.formContainer}>
          <Input
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Nhập tên đăng nhập..."
            keyboardType="default"
            required
            error={errors.username}
          />

          <Input
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            placeholder="Nhập mật khẩu"
            secureTextEntry
            required
            error={errors.password}
          />

          <TouchableOpacity
            style={styles.rememberContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            >
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Lưu thông tin đăng nhập</Text>
          </TouchableOpacity>

          {errors.general && (
            <Text style={styles.errorText}>
              *{errors.general}
            </Text>
          )}

          <Button title="Đăng nhập" onPress={handleLogin} />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => console.log("Forgot password")}
          >
            <Text style={styles.forgotPasswordText}>
              Quên tài khoản hoặc mật khẩu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.registerText}>Đăng ký tài khoản mới</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  welcomeText: {
    fontSize: 18,
    marginTop: 10,
  },
  brandText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0066CC",
    marginTop: 5,
  },
  loginText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#0066CC",
    borderColor: "#0066CC",
  },
  checkmark: {
    color: "white",
    fontSize: 14,
  },
  rememberText: {
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "right",
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#0066CC",
    fontSize: 16,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: "#0066CC",
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: "center",
  },
  registerText: {
    color: "#0066CC",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;
