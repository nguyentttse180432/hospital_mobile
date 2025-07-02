import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { verifyOtpLogin, sendOtpToPhone } from "../../services/authService";
import ScreenContainer from "../../components/common/ScreenContainer";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const EnterOtpScreen = ({ navigation }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countdown, setCountdown] = useState(120); // 2 minutes countdown

  useEffect(() => {
    // Get user phone number
    const getUserPhone = async () => {
      try {
        const userData = JSON.parse(await AsyncStorage.getItem("user"));
        console.log("User data in EnterOtpScreen:", userData);

        if (userData && userData.phoneNumber) {
          setPhoneNumber(userData.phoneNumber);
          console.log("Found phone number:", userData.phoneNumber);

          // Check if we already have a flag indicating OTP has been sent
          const otpAlreadySent = await AsyncStorage.getItem("otpAlreadySent");

          if (otpAlreadySent === "true") {
            console.log("OTP was already sent, not sending again");
          } else {
            // Automatically send OTP when screen loads
            console.log("No previous OTP was sent, sending now...");

            sendOtpToPhone(userData.phoneNumber)
              .then((response) => {
                if (response.isSuccess) {
                  console.log("OTP sent automatically on screen load");
                  // Set flag to indicate OTP has been sent
                  AsyncStorage.setItem("otpAlreadySent", "true");
                } else {
                  console.log(
                    "Failed to send OTP automatically:",
                    response.error
                  );
                }
              })
              .catch((err) => console.error("Error auto-sending OTP:", err));
          }
        } else {
          // If no phone number, redirect to VerifyPhoneScreen
          console.log(
            "No phone number found, redirecting to VerifyPhoneScreen"
          );
          navigation.replace("VerifyPhoneScreen");
        }
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    };

    getUserPhone();

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      // Clear the OTP sent flag when component unmounts
      AsyncStorage.removeItem("otpAlreadySent");
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const verifyOtpCode = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP hợp lệ");
      return;
    }

    try {
      setLoading(true);
      console.log("Verifying OTP:", otp, "for phone:", phoneNumber);

      const response = await verifyOtpLogin(phoneNumber, otp);
      console.log("accessToken in response:", response.value.accessToken);
  

      if (response.isSuccess) {
        // Check if we have an access token now (should be saved by verifyOtp function)
        const accessToken = await AsyncStorage.getItem("accessToken");
        console.log("Access token after OTP verification:", !!accessToken);

        if (!accessToken) {
          console.warn("No access token received after OTP verification!");
        }

        // Set phone as verified
        await AsyncStorage.setItem("phoneVerified", JSON.stringify(true));
        console.log("Phone verified successfully. Navigating to Main screen");

        Alert.alert("Thành công", "Xác minh OTP thành công", [
          {
            text: "OK",
            onPress: () => navigation.replace("Main"),
          },
        ]);
      } else {
        Alert.alert("Lỗi", response.error?.message || "Mã OTP không hợp lệ");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Xác minh OTP thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setLoading(true);
      const response = await sendOtpToPhone(phoneNumber);
      console.log("Resending OTP to:", phoneNumber);

      if (response.isSuccess) {
        // Update the flag to indicate new OTP has been sent
        await AsyncStorage.setItem("otpAlreadySent", "true");

        setCountdown(120); // Reset countdown
        Alert.alert(
          "Thành công",
          "Mã OTP mới đã được gửi đến số điện thoại của bạn"
        );
      } else {
        Alert.alert("Lỗi", response.error?.message || "Không thể gửi lại OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      Alert.alert("Lỗi", "Không thể gửi lại OTP, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Nhập mã OTP</Text>
        <Text style={styles.description}>
          Vui lòng nhập mã OTP đã được gửi đến số điện thoại {phoneNumber}
        </Text>

        <Input
          placeholder="Nhập mã OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          style={styles.input}
        />

        <Button
          title="Xác minh"
          onPress={verifyOtpCode}
          loading={loading}
          style={styles.button}
        />

        {countdown > 0 ? (
          <Text style={styles.countdownText}>
            Gửi lại mã OTP sau {formatTime(countdown)}
          </Text>
        ) : (
          <Button
            title="Gửi lại mã OTP"
            onPress={resendOtp}
            loading={loading}
            type="outline"
            style={styles.resendButton}
          />
        )}
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
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginVertical: 10,
  },
  countdownText: {
    textAlign: "center",
    marginTop: 15,
    color: "#555",
  },
  resendButton: {
    marginTop: 15,
  },
});

export default EnterOtpScreen;
