import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendOtpToPhone, verifyOtp } from "../../services/authService";
import {
  getPatientByIdNumber,
  createPatientProfile,
} from "../../services/patientService";
import ScreenContainer from "../../components/common/ScreenContainer";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
// import DateTimePicker from '@react-native-community/datetimepicker';

const CreateProfileScreen = ({ route, navigation }) => {
  const { isPrimary = true } = route.params || {};

  // ID card verification states
  const [step, setStep] = useState("checkIdCard"); // checkIdCard, verifyPhone, createProfile
  const [idCard, setIdCard] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Profile form states
  const [name, setName] = useState("");
  const [gender, setGender] = useState(true); // true = male, false = female
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [address, setAddress] = useState("");
  //   const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(false);

  const checkIdCardExists = async () => {
    if (!idCard || idCard.length < 9) {
      Alert.alert("Lỗi", "Vui lòng nhập số CCCD/CMND hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const response = await getPatientByIdNumber(idCard);

      if (response.isSuccess) {
        if (response.value) {
          // ID card exists, proceed to linking
          navigation.navigate("LinkProfileScreen", { idCard, isPrimary });
        } else {
          // ID card doesn't exist, proceed to create new profile
          setStep("verifyPhone");
        }
      } else {
        Alert.alert(
          "Lỗi",
          response.error?.message || "Không thể kiểm tra CCCD/CMND"
        );
      }
    } catch (error) {
      console.error("Error checking ID card:", error);
      Alert.alert("Lỗi", "Không thể kiểm tra CCCD/CMND, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const sendOtpToPhoneNumber = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        "Lỗi",
        "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ."
      );
      return;
    }

    try {
      setLoading(true);
      const response = await sendOtpToPhone(phoneNumber);

      if (response.isSuccess) {
        setOtpSent(true);
        Alert.alert(
          "Thành công",
          "Mã OTP đã được gửi đến số điện thoại của bạn"
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

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(0|\+84)(\d{9})$/;
    return phoneRegex.test(phone);
  };

  const verifyOtpCode = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtp(phoneNumber, otp);

      if (response.isSuccess) {
        // Proceed to create profile
        setStep("createProfile");
      } else {
        Alert.alert("Lỗi", response.error?.message || "Mã OTP không hợp lệ");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert("Lỗi", "Xác minh OTP thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!name || !address) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      const profileData = {
        name,
        gender,
        dateOfBirth: dateOfBirth.toISOString(),
        idCard,
        phoneNumber,
        address,
        isPrimary,
      };

      const response = await createPatientProfile(profileData);

      if (response.isSuccess) {
        if (isPrimary) {
          // Set phone as verified for primary profile
          await AsyncStorage.setItem("phoneVerified", JSON.stringify(true));

          Alert.alert("Thành công", "Hồ sơ của bạn đã được tạo thành công", [
            { text: "OK", onPress: () => navigation.replace("Main") },
          ]);
        } else {
          Alert.alert("Thành công", "Hồ sơ người thân đã được tạo thành công", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        }
      } else {
        Alert.alert("Lỗi", response.error?.message || "Không thể tạo hồ sơ");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      Alert.alert("Lỗi", "Không thể tạo hồ sơ, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const renderCheckIdCardStep = () => (
    <View>
      <Text style={styles.title}>
        {isPrimary ? "Tạo hồ sơ cá nhân" : "Tạo hồ sơ người thân"}
      </Text>
      <Text style={styles.description}>Nhập số CCCD/CMND để tiếp tục</Text>

      <Input
        placeholder="Nhập số CCCD/CMND"
        value={idCard}
        onChangeText={setIdCard}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button
        title="Tiếp tục"
        onPress={checkIdCardExists}
        loading={loading}
        style={styles.button}
      />
    </View>
  );

  const renderVerifyPhoneStep = () => (
    <View>
      <Text style={styles.title}>Xác minh số điện thoại</Text>

      {!otpSent ? (
        <>
          <Text style={styles.description}>
            Vui lòng nhập số điện thoại để tiếp tục
          </Text>
          <Input
            placeholder="Nhập số điện thoại"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <Button
            title="Gửi mã OTP"
            onPress={sendOtpToPhoneNumber}
            loading={loading}
            style={styles.button}
          />
        </>
      ) : (
        <>
          <Text style={styles.description}>
            Nhập mã OTP đã được gửi đến số điện thoại {phoneNumber}
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
            onPress={verifyOtpCode}
            loading={loading}
            style={styles.button}
          />
        </>
      )}

      <Button
        title="Quay lại"
        onPress={() => setStep("checkIdCard")}
        type="outline"
        style={styles.backButton}
      />
    </View>
  );

  const renderCreateProfileStep = () => (
    <ScrollView>
      <Text style={styles.title}>
        {isPrimary ? "Tạo hồ sơ cá nhân" : "Tạo hồ sơ người thân"}
      </Text>
      <Text style={styles.description}>Vui lòng nhập thông tin hồ sơ</Text>

      <Input
        placeholder="Họ và tên"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Giới tính:</Text>
        <Text style={styles.switchValue}>{gender ? "Nam" : "Nữ"}</Text>
        <Switch
          value={gender}
          onValueChange={setGender}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={gender ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      {/* <Text style={styles.inputLabel}>Ngày sinh:</Text>
      <Button
        title={dateOfBirth.toLocaleDateString('vi-VN')}
        onPress={() => setShowDatePicker(true)}
        type="outline"
        style={styles.dateButton}
      />
       */}
      {/* {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDateOfBirth(selectedDate);
            }
          }}
        />
      )} */}

      <Input
        placeholder="Địa chỉ"
        value={address}
        onChangeText={setAddress}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Text style={styles.idCardLabel}>
        Số CCCD/CMND: <Text style={styles.idCardValue}>{idCard}</Text>
      </Text>

      <Text style={styles.idCardLabel}>
        Số điện thoại: <Text style={styles.idCardValue}>{phoneNumber}</Text>
      </Text>

      <Button
        title="Tạo hồ sơ"
        onPress={handleCreateProfile}
        loading={loading}
        style={styles.button}
      />

      <Button
        title="Quay lại"
        onPress={() => setStep("verifyPhone")}
        type="outline"
        style={styles.backButton}
      />
    </ScrollView>
  );

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {step === "checkIdCard" && renderCheckIdCardStep()}
        {step === "verifyPhone" && renderVerifyPhoneStep()}
        {step === "createProfile" && renderCreateProfileStep()}
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
  backButton: {
    marginVertical: 10,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  switchValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  dateButton: {
    marginBottom: 15,
  },
  idCardLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  idCardValue: {
    fontWeight: "bold",
  },
});

export default CreateProfileScreen;
