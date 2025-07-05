import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendOtpToPhone, verifyOtp } from "../../services/authService";
import {
  getPatientByIdNumber,
  linkPatientProfile,
} from "../../services/patientService";
import ScreenContainer from "../../components/common/ScreenContainer";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const LinkProfileScreen = ({ route, navigation }) => {
  const { idCard, isPrimary = false } = route.params;

  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientInfo, setPatientInfo] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch patient info based on ID card
    const getPatientInfo = async () => {
      try {
        setLoading(true);
        const response = await getPatientByIdNumber(idCard);

        if (response.isSuccess && response.value) {
          console.log("Patient info received:", response.value);
          setPatientInfo(response.value);
          console.log(response.value);

          setPhoneNumber(response.value.phone || response.value.phoneNumber);
        } else {
          Alert.alert(
            "Lỗi",
            "Không tìm thấy thông tin hồ sơ với số CCCD/CMND này",
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
        }
      } catch (error) {
        console.error("Error fetching patient info:", error);
        Alert.alert(
          "Lỗi",
          "Không thể lấy thông tin hồ sơ, vui lòng thử lại sau",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    };

    getPatientInfo();
  }, [idCard]);

  const sendOtpToPhoneNumber = async () => {
    try {
      setLoading(true);
      const response = await sendOtpToPhone(phoneNumber);
      console.log(phoneNumber);

      if (response.isSuccess) {
        setOtpSent(true);
        Alert.alert(
          "Thành công",
          "Mã OTP đã được gửi đến số điện thoại của hồ sơ này"
        );
      } else {
        Alert.alert("Lỗi", response.error?.message || "Không thể gửi OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      Alert.alert("Lỗi", "Không thể gửi OTP, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const linkProfile = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP hợp lệ");
      return;
    }

    try {
      setLoading(true);

      // First verify the OTP code
      const verifyResponse = await verifyOtp(phoneNumber, otp);

      if (!verifyResponse.value) {
        Alert.alert("Lỗi", "Mã OTP không hợp lệ hoặc đã hết hạn");
        setLoading(false);
        return;
      }

      // Show success message for OTP verification
      Alert.alert("Thành công", "Xác minh OTP thành công", [
        {
          text: "Liên kết hồ sơ",
          onPress: () => proceedWithLinking(),
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert("Lỗi", "Không thể xác minh OTP, vui lòng thử lại");
      setLoading(false);
    }
  };

  const proceedWithLinking = async () => {
    try {
      setLoading(true);

      const patientId = patientInfo.id || patientInfo.patientId;

      if (!patientId) {
        console.error("Patient ID not found in:", patientInfo);
        Alert.alert("Lỗi", "Không tìm thấy ID hồ sơ bệnh nhân");
        setLoading(false);
        return;
      }

      const linkData = {
        patientId,
        isPrimary,
      };

      const response = await linkPatientProfile(linkData);
      console.log("Link response:", response);

      if (response.isSuccess) {
        if (isPrimary) {
          // Set phone as verified for primary profile
          await AsyncStorage.setItem("phoneVerified", JSON.stringify(true));

          Alert.alert("Thành công", "Liên kết hồ sơ thành công", [
            {
              text: "OK",
              onPress: () => navigation.replace("Main"),
            },
          ]);
        } else {
          Alert.alert("Thành công", "Liên kết hồ sơ người thân thành công", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        }
      } else {
        console.error("Link profile error:", response.error);
        Alert.alert(
          "Lỗi",
          response.error?.message || "Không thể liên kết hồ sơ"
        );
      }
    } catch (error) {
      console.error("Error linking profile:", error);
      Alert.alert("Lỗi", "Không thể liên kết hồ sơ, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !patientInfo) {
    return (
      <ScreenContainer>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Đang tải thông tin hồ sơ...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Liên kết hồ sơ bệnh nhân</Text>

        {patientInfo && (
          <View style={styles.profileInfo}>
            <Text style={styles.infoTitle}>Thông tin hồ sơ:</Text>
            <Text style={styles.infoItem}>
              Họ tên:{" "}
              <Text style={styles.infoValue}>
                {`${patientInfo.firstName} ${patientInfo.lastName}` ||
                  patientInfo.fullName}
              </Text>
            </Text>
            <Text style={styles.infoItem}>
              Ngày sinh:{" "}
              <Text style={styles.infoValue}>
                {new Date(
                  patientInfo.dateOfBirth || patientInfo.dob
                ).toLocaleDateString("vi-VN")}
              </Text>
            </Text>
            <Text style={styles.infoItem}>
              Giới tính:{" "}
              <Text style={styles.infoValue}>
                {patientInfo.gender === "Male" || patientInfo.gender === true
                  ? "Nam"
                  : "Nữ"}
              </Text>
            </Text>
            <Text style={styles.infoItem}>
              CCCD/CMND:{" "}
              <Text style={styles.infoValue}>
                {patientInfo.idNumber || patientInfo.identityNumber}
              </Text>
            </Text>
            <Text style={styles.infoItem}>
              Số điện thoại:{" "}
              <Text style={styles.infoValue}>
                {patientInfo.phoneNumber || patientInfo.phone}
              </Text>
            </Text>
          </View>
        )}

        {!otpSent ? (
          <Button
            title="Gửi mã OTP để xác nhận"
            onPress={sendOtpToPhoneNumber}
            loading={loading}
            style={styles.button}
          />
        ) : (
          <>
            <Text style={styles.description}>
              Nhập mã OTP đã được gửi đến số điện thoại {phoneNumber} để xác
              nhận liên kết hồ sơ
            </Text>

            <Input
              placeholder="Nhập mã OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              style={styles.input}
            />

            <Button
              title="Xác minh OTP"
              onPress={linkProfile}
              loading={loading}
              style={styles.button}
            />
          </>
        )}

        <Button
          title="Quay lại"
          onPress={() => navigation.goBack()}
          type="outline"
          style={styles.backButton}
        />
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
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
  },
  profileInfo: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  infoValue: {
    fontWeight: "bold",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginVertical: 10,
  },
  backButton: {
    marginVertical: 10,
  },
});

export default LinkProfileScreen;
