import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import FormField from "./FormField";
import PhoneField from "./PhoneField";
import DateGenderRow from "./DateGenderRow";
import Button from "../common/Button";

const PersonalInfoForm = ({
  name,
  setName,
  dateOfBirth,
  setDateOfBirth,
  showDatePickerModal,
  gender,
  setShowGenderModal,
  idCard,
  insuranceNumber,
  setInsuranceNumber,
  occupation,
  setShowOccupationModal, // Thêm setShowOccupationModal
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  loading,
  proceedToAddressInfo,
  goBack,
}) => {
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.instructions}>
        Vui lòng cung cấp thông tin chính xác để được phục vụ tốt nhất.
      </Text>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Thông tin chung</Text>

        <FormField
          label="Họ và tên"
          value={name}
          placeholder="Nhập họ và tên"
          required={true}
          onChangeText={setName}
          editable={true}
        />

        <DateGenderRow
          dateValue={dateOfBirth}
          onChangeDateValue={setDateOfBirth}
          genderValue={gender}
          onPressGender={setShowGenderModal}
        />

        <FormField
          label="Căn cước công dân"
          value={idCard}
          placeholder="Vui lòng nhập Mã định danh/CCCD/Passport"
          required={true}
          editable={false}
          iconName="none" // Hide the chevron icon
        />

        <FormField
          label="Mã bảo hiểm y tế"
          value={insuranceNumber}
          placeholder="Mã bảo hiểm y tế"
          onChangeText={setInsuranceNumber}
          editable={true}
        />

        <FormField
          label="Nghề nghiệp"
          value={occupation}
          placeholder="Chọn nghề nghiệp"
          required={true}
          onPress={setShowOccupationModal}
          editable={false}
        />

        <FormField
          label="Email (dùng để nhận phiếu khám bệnh)"
          value={email}
          placeholder="Email"
          onChangeText={setEmail}
          editable={true}
        />

        <PhoneField value={phoneNumber} onChangeText={setPhoneNumber} />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={proceedToAddressInfo}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Tiếp tục</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 5, // Giảm khoảng cách từ trên xuống
  },
  instructions: {
    fontSize: 14,
    marginBottom: 10, // Giảm khoảng cách xuống phần dưới
    color: "#666",
    textAlign: "center",
  },
  sectionContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    marginVertical: 10,
  },
});

export default PersonalInfoForm;
