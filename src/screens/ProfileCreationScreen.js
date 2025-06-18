import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../components/common/ScreenContainer";
import Header from "../components/common/Header";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const ProfileCreationScreen = ({ navigation }) => {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!lastName.trim()) {
      newErrors.lastName = "Họ tên lót là bắt buộc";
      valid = false;
    }

    if (!firstName.trim()) {
      newErrors.firstName = "Tên là bắt buộc";
      valid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email là bắt buộc";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = "Email không hợp lệ";
      valid = false;
    }

    if (!idNumber.trim()) {
      newErrors.idNumber = "CCCD/CMND/Passport là bắt buộc";
      valid = false;
    }

    if (!birthDate.trim()) {
      newErrors.birthDate = "Ngày sinh là bắt buộc";
      valid = false;
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate.trim())) {
      newErrors.birthDate = "Định dạng ngày sinh không hợp lệ (DD/MM/YYYY)";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // In a real app, you would save this data to an API or local storage
      Alert.alert("Thành công", "Hồ sơ đã được tạo thành công", [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    }
  };

  const handleScanID = () => {
    Alert.alert("Thông báo", "Tính năng quét CCCD đang được phát triển");
  };

  return (
    <ScreenContainer>
      <Header title="Tạo hồ sơ khám bệnh" onBack={() => navigation.goBack()} />

      <View style={styles.progressBarContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressIcon, styles.activeStep]}>
            <Icon name="person" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.progressLine} />
        </View>
        <View style={styles.progressStep}>
          <View style={styles.progressIcon}>
            <Icon name="medkit" size={20} color="#AAAAAA" />
          </View>
          <View style={styles.progressLine} />
        </View>
        <View style={styles.progressStep}>
          <View style={styles.progressIcon}>
            <Icon name="document-text" size={20} color="#AAAAAA" />
          </View>
          <View style={styles.progressLine} />
        </View>
        <View style={styles.progressStep}>
          <View style={styles.progressIcon}>
            <Icon name="wallet" size={20} color="#AAAAAA" />
          </View>
          <View style={styles.progressLine} />
        </View>
        <View style={styles.progressStep}>
          <View style={styles.progressIcon}>
            <Icon name="receipt" size={20} color="#AAAAAA" />
          </View>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Input
            label="Họ tên lót"
            value={lastName}
            onChangeText={setLastName}
            placeholder="(theo CCCD/CMND/Passport)"
            required
            error={errors.lastName}
          />

          <Input
            label="Tên"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="(theo CCCD/CMND/Passport)"
            required
            error={errors.firstName}
          />

          <Input
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            placeholder="Số điện thoại..."
            keyboardType="phone-pad"
            required
            error={errors.phone}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Email..."
            keyboardType="email-address"
            required
            error={errors.email}
          />

          <View style={styles.idContainer}>
            <Input
              label="CCCD/CMND/Passport"
              value={idNumber}
              onChangeText={setIdNumber}
              placeholder="CCCD/CMND/Passport..."
              keyboardType="numeric"
              required
              error={errors.idNumber}
            />
            <TouchableOpacity style={styles.scanButton} onPress={handleScanID}>
              <Text style={styles.scanButtonText}>Quét CCCD</Text>
              <Icon name="id-card" size={20} color="#0066CC" />
            </TouchableOpacity>
          </View>

          <Input
            label="Ngày sinh"
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="DD/MM/YYYY"
            keyboardType="numeric"
            required
            error={errors.birthDate}
          />

          <View style={styles.buttonContainer}>
            <Button title="XÁC NHẬN" onPress={handleSubmit} />
            <Button
              title="Quay lại"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              textStyle={styles.backButtonText}
            />
          </View>
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
  progressBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F5F5F5",
  },
  progressStep: {
    alignItems: "center",
    flexDirection: "row",
  },
  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DDDDDD",
    justifyContent: "center",
    alignItems: "center",
  },
  activeStep: {
    backgroundColor: "#0066CC",
  },
  progressLine: {
    height: 2,
    width: 30,
    backgroundColor: "#DDDDDD",
  },
  formContainer: {
    width: "100%",
  },
  idContainer: {
    marginBottom: 15,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    padding: 10,
    backgroundColor: "#E6F0FF",
    borderRadius: 5,
  },
  scanButtonText: {
    color: "#0066CC",
    marginRight: 10,
    fontWeight: "bold",
  },
  buttonContainer: {
    marginVertical: 20,
  },
  backButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#0066CC",
  },
  backButtonText: {
    color: "#0066CC",
  },
});

export default ProfileCreationScreen;
