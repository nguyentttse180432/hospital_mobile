import React, { useState } from "react";
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
import DatePicker from "react-native-date-picker";

const PersonalInfoForm = ({
  name,
  setName,
  dateOfBirth,
  setShowDatePicker,
  gender,
  setShowGenderModal,
  idCard,
  insuranceNumber,
  setInsuranceNumber,
  occupation,
  setShowOccupationModal,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  loading,
  proceedToAddressInfo,
  goBack,
  disabledFields = {},
}) => {
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleDateConfirm = (selectedDate) => {
    setShowDatePickerModal(false);
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const year = selectedDate.getFullYear();
    setShowDatePicker(`${day}/${month}/${year}`);
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
          editable={!disabledFields.name}
        />

        <FormField
          label="Ngày sinh (DD/MM/YYYY)"
          value={dateOfBirth}
          placeholder="Chọn ngày sinh"
          onPress={() => setShowDatePickerModal(true)}
          editable={false}
          disabled={disabledFields.dateOfBirth}
        />

        <FormField
          label="Giới tính"
          value={gender}
          placeholder="Chọn giới tính"
          onPress={setShowGenderModal}
          editable={false}
          disabled={disabledFields.gender}
        />

        <FormField
          label="Căn cước công dân"
          value={idCard}
          placeholder="Vui lòng nhập Mã định danh/CCCD/Passport"
          required={true}
          editable={false}
          iconName="none"
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
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={proceedToAddressInfo}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Tiếp tục</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.backButton, loading && styles.disabledButton]}
        onPress={goBack}
        disabled={loading}
      >
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={showDatePickerModal}
        date={
          dateOfBirth
            ? new Date(dateOfBirth.split("/").reverse().join("-"))
            : new Date()
        }
        mode="date"
        maximumDate={new Date()}
        locale="vi"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePickerModal(false)}
        confirmText="Xác nhận"
        cancelText="Hủy"
        title="Chọn ngày sinh"
        disabled={disabledFields.dateOfBirth}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 5,
  },
  instructions: {
    fontSize: 14,
    marginBottom: 10,
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
    marginBottom: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#ccc",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  backButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
});

export default PersonalInfoForm;
