import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import FormField from "./FormField";
import Button from "../common/Button";

const AddressInfoForm = ({
  country,
  ethnicity,
  province,
  district,
  ward,
  streetAddress,
  setStreetAddress,
  loading,
  handleCreateProfile,
  goBack,
  showEthnicityModal,
  showProvinceModal,
  showDistrictModal,
  showWardModal,
}) => {
  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.instructions}>
        Vui lòng cung cấp thông tin chính xác để được phục vụ tốt nhất.
      </Text>

      <FormField
        label="Quốc gia"
        value={country}
        placeholder="Việt Nam"
        required={true}
        editable={false}
      />

      <FormField
        label="Dân tộc"
        value={ethnicity}
        placeholder="Chọn Dân tộc"
        required={true}
        onPress={showEthnicityModal}
        editable={false}
      />

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Địa chỉ theo CCCD</Text>

        <FormField
          label="Tỉnh / TP"
          value={province}
          placeholder="Chọn tỉnh thành"
          required={true}
          onPress={showProvinceModal}
          editable={false}
        />

        <FormField
          label="Quận / Huyện"
          value={district}
          placeholder="Chọn Quận/Huyện"
          required={true}
          onPress={() =>
            province
              ? showDistrictModal()
              : Alert.alert("Thông báo", "Vui lòng chọn Tỉnh/TP trước")
          }
          editable={false}
        />

        <FormField
          label="Phường / Xã"
          value={ward}
          placeholder="Chọn Phường/Xã"
          required={true}
          onPress={() =>
            district
              ? showWardModal()
              : Alert.alert("Thông báo", "Vui lòng chọn Quận/Huyện trước")
          }
          editable={false}
        />

        <FormField
          label="Số nhà/Tên đường/Ấp thôn xóm"
          value={streetAddress}
          placeholder="Chỉ nhập số nhà, tên đường, ấp thôn xóm..."
          required={true}
          onChangeText={setStreetAddress}
          editable={true}
        />

        <Text style={[styles.warningText, styles.smallerText]}>
          (không nhập tỉnh/thành, quận/huyện, phường/xã)
        </Text>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleCreateProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Tạo mới hồ sơ</Text>
        )}
      </TouchableOpacity>

      <Button
        title="Quay lại"
        onPress={goBack}
        type="outline"
        style={styles.backButton}
      />
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
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
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
  warningText: {
    fontSize: 14,
    color: "#E57373",
    marginBottom: 16,
    fontStyle: "italic",
  },
  smallerText: {
    fontSize: 12,
    marginTop: -8,
  },
  submitButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
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

export default AddressInfoForm;
