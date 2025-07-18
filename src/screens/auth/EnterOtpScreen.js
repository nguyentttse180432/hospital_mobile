import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { verifyOtpLogin, sendOtpToPhone } from "../../services/authService";
import ScreenContainer from "../../components/common/ScreenContainer";
import Button from "../../components/common/Button";

const EnterOtpScreen = ({ navigation }) => {
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countdown, setCountdown] = useState(120);
  const inputRefs = useRef([]);

  useEffect(() => {
    const getUserPhone = async () => {
      try {
        const userData = JSON.parse(await AsyncStorage.getItem("user"));
        console.log("User data in EnterOtpScreen:", userData);

        if (userData && userData.phoneNumber) {
          setPhoneNumber(userData.phoneNumber);
          console.log("Found phone number:", userData.phoneNumber);

          const otpAlreadySent = await AsyncStorage.getItem("otpAlreadySent");

          if (otpAlreadySent === "true") {
            console.log("OTP was already sent, not sending again");
          } else {
            console.log("No previous OTP was sent, sending now...");

            sendOtpToPhone(userData.phoneNumber)
              .then((response) => {
                if (response.isSuccess) {
                  console.log("OTP sent automatically on screen load");
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
      AsyncStorage.removeItem("otpAlreadySent");
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const verifyOtpCode = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6 || otpDigits.some((d) => d === "")) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ 6 số OTP");
      return;
    }
    try {
      setLoading(true);
      const response = await verifyOtpLogin(phoneNumber, otp);
      if (response.isSuccess) {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (!accessToken) {
          console.warn("No access token received after OTP verification!");
        }
        await AsyncStorage.setItem("phoneVerified", JSON.stringify(true));
        Alert.alert("Thành công", "Xác minh OTP thành công", [
          { text: "OK", onPress: () => navigation.replace("Main") },
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
        await AsyncStorage.setItem("otpAlreadySent", "true");
        setCountdown(120);
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

  const handleInputChange = (text, idx) => {
    // Chỉ cho phép nhập số
    if (/^\d?$/.test(text)) {
      const newDigits = [...otpDigits];
      newDigits[idx] = text;
      setOtpDigits(newDigits);

      // Auto focus to next input
      if (text && idx < 5) {
        // Delay nhỏ để đảm bảo state được update
        setTimeout(() => {
          inputRefs.current[idx + 1]?.focus();
        }, 50);
      }
    }
  };

  const handleKeyPress = (e, idx) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      setTimeout(() => {
        inputRefs.current[idx - 1]?.focus();
      }, 50);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Nhập mã OTP</Text>
        <Text style={styles.description}>
          Vui lòng nhập mã OTP đã được gửi đến số điện thoại {phoneNumber}
        </Text>

        <View style={styles.otpContainer}>
          {otpDigits.map((digit, idx) => (
            <TextInput
              key={idx}
              value={digit}
              onChangeText={(text) => handleInputChange(text, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              keyboardType="numeric"
              maxLength={1}
              style={[
                styles.otpInput,
                // Highlight active input
                digit ? styles.otpInputFilled : null,
              ]}
              ref={(ref) => (inputRefs.current[idx] = ref)}
              returnKeyType={idx === 5 ? "done" : "next"}
              autoFocus={idx === 0}
              selectTextOnFocus={true}
              textAlign="center"
            />
          ))}
        </View>

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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginHorizontal: 10,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    backgroundColor: "#fff",
    marginHorizontal: 2,
    color: "#000",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Shadow for Android
    elevation: 2,
  },
  otpInputFilled: {
    borderColor: "#007AFF",
    backgroundColor: "#f0f8ff",
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
