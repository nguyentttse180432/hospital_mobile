import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import ScreenContainer from "../../components/ScreenContainer";
import Header from "../../components/Header";
import Input from "../../components/Input";
import Button from "../../components/Button";

const RegisterScreen = ({ navigation }) => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
      valid = false;
    } else if (!/^[0-9]{10}$/.test(phone.trim())) {
      newErrors.phone = "Số điện thoại phải có 10 chữ số";
      valid = false;
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email là bắt buộc";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = "Email không hợp lệ";
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      valid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = () => {
    if (validateForm()) {
      // In a real app, you would call an API here
      Alert.alert(
        "Đăng ký thành công",
        "Vui lòng kiểm tra email để xác nhận tài khoản.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    }
  };

  return (
    <ScreenContainer>

      <View style={styles.container}>
        <Text style={styles.title}>Đăng ký tài khoản</Text>

        <View style={styles.formContainer}>
          <Input
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại..."
            keyboardType="phone-pad"
            required
            error={errors.phone}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email..."
            keyboardType="email-address"
            required
            error={errors.email}
          />

          <Input
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            placeholder="Nhập mật khẩu..."
            secureTextEntry
            required
            error={errors.password}
          />

          <Input
            label="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu..."
            secureTextEntry
            required
            error={errors.confirmPassword}
          />

          <Text style={styles.policyText}>
            Bằng cách đăng ký, bạn đồng ý với các{" "}
            <Text style={styles.policyLink}>Điều khoản dịch vụ</Text> và{" "}
            <Text style={styles.policyLink}>Chính sách quyền riêng tư</Text> của
            chúng tôi.
          </Text>

          <Button title="Đăng ký" onPress={handleRegister} />
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  policyText: {
    marginVertical: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
  policyLink: {
    color: "#0066CC",
    fontWeight: "bold",
  },
});

export default RegisterScreen;
