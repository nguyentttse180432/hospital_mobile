import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Platform,
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
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

const CreateProfileScreen = ({ route, navigation }) => {
  const { isPrimary = true } = route.params || {};

  // Flow states
  const [step, setStep] = useState("checkIdCard"); // checkIdCard, verifyPhone, personalInfo, addressInfo
  const [idCard, setIdCard] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Profile form states
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [occupation, setOccupation] = useState("");
  const [email, setEmail] = useState("");

  // Address form states
  const [country, setCountry] = useState("Việt Nam");
  const [ethnicity, setEthnicity] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  // Modal states
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showEthnicityModal, setShowEthnicityModal] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [showOccupationModal, setShowOccupationModal] = useState(false);

  const [loading, setLoading] = useState(false);

  // Options for dropdowns
  const genderOptions = ["Nam", "Nữ"];
  const ethnicityOptions = [
    "Kinh",
    "Tày",
    "Thái",
    "Mường",
    "Khmer",
    "Hoa",
    "Nùng",
    "Dao",
  ];
  const occupationOptions = [
    "Bác sĩ",
    "Điều dưỡng",
    "Y sĩ",
    "Dược sĩ",
    "Nha sĩ",
    "Nha công",
    "Dược sĩ trung cấp",
    "Cử nhân Điều dưỡng",
    "Hộ lý",
    "Kỹ sư điện",
    "Khác",
  ];
  const provinceOptions = [
    "Thành phố Hồ Chí Minh",
    "Thành phố Hà Nội",
    "Thành phố Cần Thơ",
    "Thành phố Hải Phòng",
    "Thành phố Đà Nẵng",
    "Tỉnh An Giang",
    "Tỉnh Bà Rịa - Vũng Tàu",
    "Tỉnh Bình Dương",
    "Tỉnh Bình Phước",
    "Tỉnh Bình Thuận",
  ];
  const districtOptions = {
    "Thành phố Hồ Chí Minh": [
      "Quận 1",
      "Quận 3",
      "Quận 4",
      "Quận 5",
      "Quận 6",
      "Quận 7",
      "Quận 8",
      "Quận 10",
      "Quận 11",
      "Quận 12",
      "Quận Bình Thạnh",
      "Quận Gò Vấp",
      "Quận Phú Nhuận",
      "Quận Tân Bình",
      "Quận Tân Phú",
      "Thành phố Thủ Đức",
    ],
    "Thành phố Hà Nội": [
      "Ba Đình",
      "Hoàn Kiếm",
      "Hai Bà Trưng",
      "Đống Đa",
      "Tây Hồ",
      "Cầu Giấy",
      "Thanh Xuân",
      "Hoàng Mai",
      "Long Biên",
      "Nam Từ Liêm",
      "Bắc Từ Liêm",
      "Hà Đông",
    ],
  };
  const wardOptions = {
    "Quận 1": [
      "Bến Nghé",
      "Bến Thành",
      "Cầu Kho",
      "Cầu Ông Lãnh",
      "Nguyễn Thái Bình",
      "Phạm Ngũ Lão",
      "Tân Định",
    ],
    "Ba Đình": [
      "Phúc Xá",
      "Trúc Bạch",
      "Vĩnh Phúc",
      "Cống Vị",
      "Liễu Giai",
      "Nguyễn Trung Trực",
      "Quán Thánh",
    ],
  };

  // Effect to compile the full address whenever address components change
  useEffect(() => {
    if (streetAddress && ward && district && province) {
      const fullAddress = `${streetAddress}, ${ward}, ${district}, ${province}`;
      // No need to set an address state as we'll compile it when submitting
    }
  }, [streetAddress, ward, district, province]);

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
    // Support both formats: 0xxxxxxxxx and +84xxxxxxxxx
    const phoneRegex = /^(0|\+84)(\d{9})$/;
    return phoneRegex.test(phone);
  };

  // Date picker handlers
  const onDateChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    const currentDate = selectedDate || tempDate;
    setShowDatePicker(Platform.OS === "ios");
    setTempDate(currentDate);

    // Format date for display: DD/MM/YYYY
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear();
    setDateOfBirth(`${day}/${month}/${year}`);
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
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
        // Proceed to create profile - personal info first
        setStep("personalInfo");
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

  const validatePersonalInfo = () => {
    if (!name) {
      Alert.alert("Thông báo", "Vui lòng nhập họ và tên");
      return false;
    }
    if (!dateOfBirth) {
      Alert.alert("Thông báo", "Vui lòng chọn ngày sinh");
      return false;
    }
    if (!gender) {
      Alert.alert("Thông báo", "Vui lòng chọn giới tính");
      return false;
    }
    if (!occupation) {
      Alert.alert("Thông báo", "Vui lòng chọn nghề nghiệp");
      return false;
    }

    if (email && !validateEmail(email)) {
      Alert.alert("Thông báo", "Email không hợp lệ");
      return false;
    }

    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      Alert.alert("Thông báo", "Số điện thoại không hợp lệ");
      return false;
    }

    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAddressInfo = () => {
    if (!ethnicity) {
      Alert.alert("Thông báo", "Vui lòng chọn dân tộc");
      return false;
    }
    if (!province) {
      Alert.alert("Thông báo", "Vui lòng chọn tỉnh/thành phố");
      return false;
    }
    if (!district) {
      Alert.alert("Thông báo", "Vui lòng chọn quận/huyện");
      return false;
    }
    if (!ward) {
      Alert.alert("Thông báo", "Vui lòng chọn phường/xã");
      return false;
    }
    if (!streetAddress) {
      Alert.alert("Thông báo", "Vui lòng nhập địa chỉ chi tiết");
      return false;
    }

    return true;
  };

  const proceedToAddressInfo = () => {
    if (validatePersonalInfo()) {
      setStep("addressInfo");
    }
  };

  const handleCreateProfile = async () => {
    if (!validateAddressInfo()) {
      return;
    }

    try {
      setLoading(true);

      // Compile the full address
      const fullAddress = `${streetAddress}, ${ward}, ${district}, ${province}`;

      // Convert DD/MM/YYYY to ISO date format
      let formattedDate = dateOfBirth;
      if (dateOfBirth && dateOfBirth.includes("/")) {
        const [day, month, year] = dateOfBirth
          .split("/")
          .map((part) => parseInt(part, 10));
        const dateObj = new Date(year, month - 1, day);
        formattedDate = dateObj.toISOString();
      }

      const profileData = {
        name,
        gender,
        dateOfBirth: formattedDate,
        idCard,
        phoneNumber,
        email,
        ethnicity,
        occupation,
        insuranceNumber,
        address: fullAddress,
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

  // Form field renderer for consistent UI
  const renderFormField = ({
    label,
    value,
    placeholder,
    required = false,
    onPress,
    editable = true,
  }) => {
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.fieldLabel}>{label}</Text>
          {required && <Text style={styles.requiredAsterisk}>*</Text>}
        </View>

        <TouchableOpacity
          style={[styles.inputField, !editable && styles.selectField]}
          onPress={onPress}
          disabled={!onPress}
        >
          {editable ? (
            <TextInput
              style={styles.inputText}
              placeholder={placeholder}
              placeholderTextColor="#999"
              value={value}
              onChangeText={(text) => {
                // Handle specific field changes
                if (label.includes("Họ và tên")) setName(text);
                else if (label.includes("CCCD")) setIdCard(text);
                else if (label.includes("bảo hiểm")) setInsuranceNumber(text);
                else if (label.includes("Email")) setEmail(text);
                else if (label.includes("Số nhà")) setStreetAddress(text);
              }}
            />
          ) : (
            <>
              <Text style={[styles.inputText, !value && styles.placeholder]}>
                {value || placeholder}
              </Text>
              <Icon
                name="chevron-forward"
                size={18}
                color="#888"
                style={styles.selectIcon}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Phone field renderer
  const renderPhoneField = () => {
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.fieldLabel}>Số điện thoại</Text>
          <Text style={styles.requiredAsterisk}>*</Text>
        </View>

        <View style={styles.phoneContainer}>
          <View style={styles.countryCodeContainer}>
            <Text style={styles.countryCode}>+84</Text>
          </View>

          <TextInput
            style={styles.phoneInput}
            placeholder="09xxxxxxx"
            placeholderTextColor="#999"
            value={phoneNumber.replace(/^\+84/, "")}
            onChangeText={(text) => {
              const phoneNum = text.startsWith("0") ? text.substring(1) : text;
              setPhoneNumber(`+84${phoneNum}`);
            }}
            keyboardType="phone-pad"
          />
        </View>
      </View>
    );
  };

  // Render modal for selection options
  const renderSelectionModal = (visible, title, options, onSelect, onClose) => {
    return (
      <Modal visible={visible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.modalCloseButton}
                  >
                    <Icon name="close" size={22} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{title}</Text>
                  <View style={{ width: 22 }} />{" "}
                  {/* Placeholder for alignment */}
                </View>

                <View style={styles.searchContainer}>
                  <Icon
                    name="search-outline"
                    size={20}
                    color="#999"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm"
                    placeholderTextColor="#999"
                  />
                </View>

                <FlatList
                  data={options}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => {
                        onSelect(item);
                        onClose();
                      }}
                    >
                      <Text style={styles.optionText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.optionsList}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const renderCheckIdCardStep = () => (
    <View style={styles.stepContainer}>
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
    <View style={styles.stepContainer}>
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

  // Personal Info Form
  const renderPersonalInfoForm = () => {
    return (
      <ScrollView style={styles.formContainer}>
        <Text style={styles.formTitle}>
          {isPrimary ? "Tạo hồ sơ cá nhân" : "Tạo hồ sơ người thân"}
        </Text>

        <Text style={styles.instructions}>
          Vui lòng cung cấp thông tin chính xác để được phục vụ tốt nhất.
        </Text>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>

          {renderFormField({
            label: "Họ và tên (có dấu)",
            value: name,
            placeholder: "Nhập họ và tên",
            required: true,
            onPress: null,
            editable: true,
          })}

          <View style={styles.fieldContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.fieldLabel}>Ngày sinh</Text>
              <Text style={styles.requiredAsterisk}>*</Text>
            </View>

            <TouchableOpacity
              style={[styles.inputField, styles.selectField]}
              onPress={showDatePickerModal}
            >
              <Text
                style={[styles.inputText, !dateOfBirth && styles.placeholder]}
              >
                {dateOfBirth || "Ngày / Tháng / Năm"}
              </Text>
              <Icon
                name="calendar-outline"
                size={18}
                color="#888"
                style={styles.selectIcon}
              />
            </TouchableOpacity>
          </View>

          {renderFormField({
            label: "Giới tính",
            value: gender,
            placeholder: "Chọn giới tính",
            required: true,
            onPress: () => setShowGenderModal(true),
            editable: false,
          })}

          {renderFormField({
            label: "Mã định danh/CCCD/Passport",
            value: idCard,
            placeholder: "Vui lòng nhập Mã định danh/CCCD/Passport",
            required: true,
            onPress: null,
            editable: false,
          })}

          <Text style={styles.warningText}>
            Vui lòng nhập đúng thông tin để không bị bệnh viện từ chối
          </Text>

          {renderFormField({
            label: "Mã bảo hiểm y tế",
            value: insuranceNumber,
            placeholder: "Mã bảo hiểm y tế",
            required: false,
            onPress: null,
            editable: true,
          })}

          {renderFormField({
            label: "Nghề nghiệp",
            value: occupation,
            placeholder: "Chọn nghề nghiệp",
            required: true,
            onPress: () => setShowOccupationModal(true),
            editable: false,
          })}

          {renderFormField({
            label: "Email (dùng để nhận phiếu khám bệnh)",
            value: email,
            placeholder: "Email",
            required: false,
            onPress: null,
            editable: true,
          })}

          {renderPhoneField()}
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

        <Button
          title="Quay lại"
          onPress={() => setStep("verifyPhone")}
          type="outline"
          style={styles.backButton}
        />
      </ScrollView>
    );
  };

  // Address information form
  const renderAddressInfoForm = () => {
    return (
      <ScrollView style={styles.formContainer}>
        <Text style={styles.formTitle}>
          {isPrimary ? "Tạo hồ sơ cá nhân" : "Tạo hồ sơ người thân"}
        </Text>

        <Text style={styles.instructions}>
          Vui lòng cung cấp thông tin chính xác để được phục vụ tốt nhất.
        </Text>

        {renderFormField({
          label: "Quốc gia",
          value: country,
          placeholder: "Việt Nam",
          required: true,
          onPress: null,
          editable: false,
        })}

        {renderFormField({
          label: "Dân tộc",
          value: ethnicity,
          placeholder: "Chọn Dân tộc",
          required: true,
          onPress: () => setShowEthnicityModal(true),
          editable: false,
        })}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Địa chỉ theo CCCD</Text>

          {renderFormField({
            label: "Tỉnh / TP",
            value: province,
            placeholder: "Chọn tỉnh thành",
            required: true,
            onPress: () => setShowProvinceModal(true),
            editable: false,
          })}

          {renderFormField({
            label: "Quận / Huyện",
            value: district,
            placeholder: "Chọn Quận/Huyện",
            required: true,
            onPress: () =>
              province
                ? setShowDistrictModal(true)
                : Alert.alert("Thông báo", "Vui lòng chọn Tỉnh/TP trước"),
            editable: false,
          })}

          {renderFormField({
            label: "Phường / Xã",
            value: ward,
            placeholder: "Chọn Phường/Xã",
            required: true,
            onPress: () =>
              district
                ? setShowWardModal(true)
                : Alert.alert("Thông báo", "Vui lòng chọn Quận/Huyện trước"),
            editable: false,
          })}

          {renderFormField({
            label: "Số nhà/Tên đường/Ấp thôn xóm",
            value: streetAddress,
            placeholder: "Chỉ nhập số nhà, tên đường, ấp thôn xóm...",
            required: true,
            onPress: null,
            editable: true,
          })}

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
          onPress={() => setStep("personalInfo")}
          type="outline"
          style={styles.backButton}
        />
      </ScrollView>
    );
  };

  const renderCreateProfileStep = () => {
    // Based on the current step, render either personal info or address info
    if (step === "createProfile") {
      // Split the form into two parts
      const subStep = "personalInfo"; // Could be "personalInfo" or "addressInfo" based on your logic
      return subStep === "personalInfo"
        ? renderPersonalInfoForm()
        : renderAddressInfoForm();
    }

    // For backward compatibility, show the default form
    return (
      <ScrollView>
        <Text style={styles.title}>
          {isPrimary ? "Tạo hồ sơ cá nhân" : "Tạo hồ sơ người thân"}
        </Text>
        <Text style={styles.description}>Vui lòng nhập thông tin hồ sơ</Text>
        {renderPersonalInfoForm()}
      </ScrollView>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {step === "checkIdCard" && renderCheckIdCardStep()}
        {step === "verifyPhone" && renderVerifyPhoneStep()}
        {step === "personalInfo" && renderPersonalInfoForm()}
        {step === "addressInfo" && renderAddressInfoForm()}
      </View>

      {/* Modals for selections */}
      {renderSelectionModal(
        showGenderModal,
        "Chọn giới tính",
        genderOptions,
        setGender,
        () => setShowGenderModal(false)
      )}

      {renderSelectionModal(
        showEthnicityModal,
        "Chọn dân tộc",
        ethnicityOptions,
        setEthnicity,
        () => setShowEthnicityModal(false)
      )}

      {renderSelectionModal(
        showOccupationModal,
        "Chọn nghề nghiệp",
        occupationOptions,
        setOccupation,
        () => setShowOccupationModal(false)
      )}

      {renderSelectionModal(
        showProvinceModal,
        "Chọn tỉnh/thành phố",
        provinceOptions,
        (selectedProvince) => {
          setProvince(selectedProvince);
          // Reset district and ward when province changes
          setDistrict("");
          setWard("");
        },
        () => setShowProvinceModal(false)
      )}

      {renderSelectionModal(
        showDistrictModal,
        "Chọn quận/huyện",
        districtOptions[province] || [],
        (selectedDistrict) => {
          setDistrict(selectedDistrict);
          // Reset ward when district changes
          setWard("");
        },
        () => setShowDistrictModal(false)
      )}

      {renderSelectionModal(
        showWardModal,
        "Chọn phường/xã",
        wardOptions[district] || [],
        setWard,
        () => setShowWardModal(false)
      )}

      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  instructions: {
    fontSize: 14,
    marginVertical: 15,
    color: "#666",
    textAlign: "center",
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
  formContainer: {
    flex: 1,
    padding: 16,
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
  fieldContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 15,
    flex: 1,
    color: "#333",
  },
  requiredAsterisk: {
    color: "red",
    marginLeft: 5,
    fontWeight: "bold",
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  selectField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  inputText: {
    fontSize: 15,
    color: "#333",
  },
  placeholder: {
    color: "#999",
  },
  selectIcon: {
    position: "absolute",
    right: 12,
    top: 12,
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
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#fff",
  },
  countryCodeContainer: {
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  countryCode: {
    fontSize: 15,
    color: "#333",
    paddingVertical: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
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
});

export default CreateProfileScreen;
