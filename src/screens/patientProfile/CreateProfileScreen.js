import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  Text,
  Button,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { sendOtpToPhone, verifyOtp } from "../../services/authService";
import {
  getPatientByIdNumber,
  createPatientProfile,
} from "../../services/patientService";
import ScreenContainer from "../../components/common/ScreenContainer";
import IdCardStep from "../../components/patientProfile/IdCardStep";
import PhoneVerificationStep from "../../components/patientProfile/PhoneVerificationStep";
import PersonalInfoForm from "../../components/patientProfile/PersonalInfoForm";
import AddressInfoForm from "../../components/patientProfile/AddressInfoForm";
import SelectionModal from "../../components/patientProfile/SelectionModal";
import {
  genderOptions,
  ethnicityOptions,
  occupationOptions,
  provinceOptions,
  districtOptions,
  wardOptions,
} from "./addressData";
import { CameraView, useCameraPermissions } from "expo-camera";

const CreateProfileScreen = ({ route, navigation }) => {
  const {
    isPrimary = true,
    scannedIdCard = "",
    scannedData = null,
  } = route.params || {};

  // State management
  const [user, setUser] = useState(null);
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [step, setStep] = useState("checkIdCard");
  const [idCard, setIdCard] = useState(
    scannedIdCard || (scannedData ? scannedData.idCard : "")
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [name, setName] = useState(scannedData ? scannedData.name : "");
  const [gender, setGender] = useState(scannedData ? scannedData.gender : "");
  const [dateOfBirth, setDateOfBirth] = useState(
    scannedData ? scannedData.dateOfBirth : ""
  );
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [occupation, setOccupation] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Việt Nam");
  const [ethnicity, setEthnicity] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showEthnicityModal, setShowEthnicityModal] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [showOccupationModal, setShowOccupationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch user data from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userJSON = await AsyncStorage.getItem("user");
        if (userJSON) {
          const userData = JSON.parse(userJSON);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // Initialize address from scanned data
  useEffect(() => {
    if (scannedData?.address) {
      const addressParts = scannedData.address.split(", ");
      if (addressParts.length >= 3) {
        const addressProvince = addressParts[addressParts.length - 1];
        const addressDistrict = addressParts[addressParts.length - 2];
        const addressWard = addressParts[addressParts.length - 3];
        const addressStreet = addressParts
          .slice(0, addressParts.length - 3)
          .join(", ");

        const formattedProvince = addressProvince.includes("Tỉnh")
          ? addressProvince
          : `Tỉnh ${addressProvince}`;
        const formattedDistrict = addressDistrict.includes("Huyện")
          ? addressDistrict
          : `Huyện ${addressDistrict}`;
        const formattedWard = addressWard.includes("Xã")
          ? addressWard
          : `Xã ${addressWard}`;

        setProvince(formattedProvince);
        setDistrict(formattedDistrict);
        setWard(formattedWard);
        setStreetAddress(addressStreet);
      } else {
        setStreetAddress(scannedData.address);
      }

      Alert.alert(
        "Thông tin tự động điền",
        `Thông tin từ QR CCCD:\n- Họ tên: ${scannedData.name}\n- CCCD: ${scannedData.idCard}\n- Ngày sinh: ${scannedData.dateOfBirth}\n- Giới tính: ${scannedData.gender}\n\nVui lòng kiểm tra và hoàn thiện thông tin.`
      );
    }
  }, [scannedData]);

  // Check ID card existence
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
          navigation.navigate("LinkProfileScreen", { idCard, isPrimary });
        } else {
          setStep("verifyPhone");
        }
      } else {
        Alert.alert(
          "Lỗi",
          response.error?.message || "Không thể kiểm tra CCCD/CMND"
        );
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kiểm tra CCCD/CMND, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  // Send OTP to phone number
  const sendOtpToPhoneNumber = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ.");
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
      Alert.alert("Lỗi", "Không thể gửi OTP, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  // Validate phone number
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(0|\+84)(\d{9})$/;
    return phoneRegex.test(phone);
  };

  // Verify OTP
  const verifyOtpCode = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP hợp lệ");
      return;
    }
    try {
      setLoading(true);
      const response = await verifyOtp(phoneNumber, otp);
      if (response.value) {
        setStep("personalInfo");
      } else {
        Alert.alert("Lỗi", response.error?.message || "Mã OTP không hợp lệ");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Xác minh OTP thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  // Validate personal info
  const validatePersonalInfo = () => {
    if (!name) {
      Alert.alert("Thông báo", "Vui lòng nhập họ và tên");
      return false;
    }
    if (!dateOfBirth || !/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.test(dateOfBirth)) {
      Alert.alert(
        "Thông báo",
        "Vui lòng nhập ngày sinh đúng định dạng DD/MM/YYYY"
      );
      return false;
    }
    const [day, month, year] = dateOfBirth.split("/").map(Number);
    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getDate() !== day ||
      dateObj.getMonth() + 1 !== month ||
      dateObj.getFullYear() !== year ||
      year < 1900 ||
      dateObj > new Date()
    ) {
      Alert.alert("Thông báo", "Ngày sinh không hợp lệ");
      return false;
    }
    if (!gender) {
      Alert.alert("Thông báo", "Vui lòng chọn giới tính");
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Thông báo", "Email không hợp lệ");
      return false;
    }
    if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
      Alert.alert("Thông báo", "Số điện thoại không hợp lệ");
      return false;
    }
    return true;
  };

  // Validate address info
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

  // Proceed to address info
  const proceedToAddressInfo = () => {
    if (validatePersonalInfo()) {
      setStep("addressInfo");
    }
  };

  // Create profile with phone number matching logic
 const handleCreateProfile = async () => {
   if (!validateAddressInfo()) return;
   console.log(user.phoneNumber, phoneNumber);

   try {
     setLoading(true);
     const [day, month, year] = dateOfBirth.split("/").map(Number);
     const formattedDate = new Date(year, month - 1, day).toISOString();
     const nameParts = name.trim().split(" ");
     const firstName =
       nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0];
     const lastName =
       nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

     // Check if phoneNumber matches user.phoneNumber
     const isPrimaryProfile =
       isPrimary || (user?.phoneNumber && user.phoneNumber === phoneNumber);

     const profileData = {
       firstName,
       lastName,
       gender: gender === "Nam" ? "Male" : "Female",
       dateOfBirth: formattedDate,
       identityNumber: idCard,
       phoneNumber,
       email: email || "",
       address: {
         street: streetAddress,
         ward,
         district,
         province,
         street_2: "",
         ward_2: "",
         district_2: "",
         province_2: "",
       },
       isPrimary: isPrimaryProfile,
     };

     const response = await createPatientProfile(profileData);
     if (response.isSuccess) {
       if (isPrimaryProfile) {
         // Save as defaultPatient in AsyncStorage
         await AsyncStorage.setItem("phoneVerified", JSON.stringify(true));
         await AsyncStorage.setItem(
           "defaultPatient",
           JSON.stringify({
             firstName,
             lastName,
             gender: gender === "Nam" ? "Male" : "Female",
             dateOfBirth: formattedDate,
           })
         );
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
     Alert.alert("Lỗi", "Không thể tạo hồ sơ, vui lòng thử lại");
   } finally {
     setLoading(false);
   }
 };

  // Handle barcode scanning
  const handleBarcodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);

    // Parse Vietnamese CCCD QR code (Format: ID|CIC|Name|DOB|Gender|Address|IssueDate)
    const parseVietnameseCCCD = (qrData) => {
      try {
        const parts = qrData.split("|");
        if (parts.length >= 6) {
          const idCard = parts[0];
          const name = parts[2];
          const dobRaw = parts[3];
          const gender = parts[4];
          const address = parts[5];
          const dateOfBirth =
            dobRaw.length === 8
              ? `${dobRaw.slice(0, 2)}/${dobRaw.slice(2, 4)}/${dobRaw.slice(
                  4,
                  8
                )}`
              : "";
          return { idCard, name, dateOfBirth, gender, address };
        }
      } catch (error) {
        console.error("Error parsing CCCD:", error);
      }
      return null;
    };

    // Check if data is a valid ID number or QR code
    if (/^\d{9,12}$/.test(data)) {
      setIdCard(data);
      setShowCamera(false);
    } else {
      const cccdData = parseVietnameseCCCD(data);
      if (cccdData) {
        setIdCard(cccdData.idCard);
        setName(cccdData.name);
        setGender(cccdData.gender);
        setDateOfBirth(cccdData.dateOfBirth);
        if (cccdData.address) {
          const addressParts = cccdData.address.split(", ");
          if (addressParts.length >= 3) {
            const addressProvince = addressParts[addressParts.length - 1];
            const addressDistrict = addressParts[addressParts.length - 2];
            const addressWard = addressParts[addressParts.length - 3];
            const addressStreet = addressParts
              .slice(0, addressParts.length - 3)
              .join(", ");
            setProvince(
              addressProvince.includes("Tỉnh")
                ? addressProvince
                : `Tỉnh ${addressProvince}`
            );
            setDistrict(
              addressDistrict.includes("Huyện")
                ? addressDistrict
                : `Huyện ${addressDistrict}`
            );
            setWard(
              addressWard.includes("Xã") ? addressWard : `Xã ${addressWard}`
            );
            setStreetAddress(addressStreet);
          } else {
            setStreetAddress(cccdData.address);
          }
        }
        setShowCamera(false);
      } else {
        Alert.alert(
          "Lỗi",
          "Không tìm thấy thông tin CCCD/CMND hợp lệ. Vui lòng thử lại."
        );
      }
    }

    setTimeout(() => setScanned(false), 3000);
  };

  // Camera controls
  const openCamera = async () => {
    if (permission?.granted) {
      setShowCamera(true);
      setScanned(false);
    } else {
      const result = await requestPermission();
      if (result.granted) {
        setShowCamera(true);
        setScanned(false);
      } else {
        Alert.alert(
          "Lỗi",
          "Không thể truy cập camera. Vui lòng cấp quyền trong cài đặt."
        );
      }
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    setScanned(false);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // Render selection modal
  const renderSelectionModal = (visible, title, options, onSelect, onClose) => (
    <SelectionModal
      visible={visible}
      title={title}
      options={options}
      onSelect={onSelect}
      onClose={onClose}
    />
  );

  // Camera permission UI
  if (showCamera && !permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Đang tải quyền camera...</Text>
      </View>
    );
  }

  if (showCamera && !permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Ứng dụng cần quyền truy cập camera để quét mã
        </Text>
        <Button onPress={requestPermission} title="Cấp quyền" />
        <Button onPress={closeCamera} title="Hủy" />
      </View>
    );
  }

  return (
    <ScreenContainer style={styles.screenContainer}>
      <View style={styles.container}>
        {step === "checkIdCard" && (
          <IdCardStep
            idCard={idCard}
            setIdCard={setIdCard}
            checkIdCardExists={checkIdCardExists}
            loading={loading}
            onScanPress={openCamera}
          />
        )}
        {step === "verifyPhone" && (
          <PhoneVerificationStep
            otpSent={otpSent}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            otp={otp}
            setOtp={setOtp}
            sendOtpToPhoneNumber={sendOtpToPhoneNumber}
            verifyOtpCode={verifyOtpCode}
            loading={loading}
            goBack={() => setStep("checkIdCard")}
          />
        )}
        {step === "personalInfo" && (
          <PersonalInfoForm
            name={name}
            setName={setName}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            gender={gender}
            setShowGenderModal={() => setShowGenderModal(true)}
            idCard={idCard}
            insuranceNumber={insuranceNumber}
            setInsuranceNumber={setInsuranceNumber}
            occupation={occupation}
            setShowOccupationModal={() => setShowOccupationModal(true)}
            email={email}
            setEmail={setEmail}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            loading={loading}
            proceedToAddressInfo={proceedToAddressInfo}
            goBack={() => setStep("verifyPhone")}
            disabledFields={
              scannedData ? { name: true, dateOfBirth: true, gender: true } : {}
            }
          />
        )}
        {step === "addressInfo" && (
          <AddressInfoForm
            country={country}
            ethnicity={ethnicity}
            province={province}
            district={district}
            ward={ward}
            streetAddress={streetAddress}
            setStreetAddress={setStreetAddress}
            loading={loading}
            handleCreateProfile={handleCreateProfile}
            goBack={() => setStep("personalInfo")}
            showEthnicityModal={() => setShowEthnicityModal(true)}
            showProvinceModal={() => setShowProvinceModal(true)}
            showDistrictModal={() => setShowDistrictModal(true)}
            showWardModal={() => setShowWardModal(true)}
            disabledFields={
              scannedData
                ? {
                    province: true,
                    district: true,
                    ward: true,
                    streetAddress: true,
                  }
                : {}
            }
          />
        )}
      </View>

      {/* Selection Modals */}
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
        (selected) => {
          setProvince(selected);
          setDistrict("");
          setWard("");
        },
        () => setShowProvinceModal(false)
      )}
      {renderSelectionModal(
        showDistrictModal,
        "Chọn quận/huyện",
        districtOptions[province] || [],
        (selected) => {
          setDistrict(selected);
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

      {/* Camera Modal */}
      {showCamera && (
        <View style={styles.cameraContainer}>
          <View style={styles.cameraHeader}>
            <Text style={styles.cameraTitle}>Quét mã CCCD/CMND</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeCamera}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <CameraView
            style={styles.camera}
            facing={facing}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleBarcodeScanned}
            enableTorch={false}
            autofocus="on"
          >
            <View style={styles.overlay}>
              <View style={styles.scanArea}>
                <Text style={styles.scanInstruction}>
                </Text>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraFacing}
              >
                <Icon name="camera-reverse-outline" size={24} color="#fff" />
                <Text style={styles.flipButtonText}>Lật camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.flipButton, { marginLeft: 10 }]}
                onPress={closeCamera}
              >
                <Icon name="close-outline" size={24} color="#fff" />
                <Text style={styles.flipButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
  },
  screenContainer: {
    padding: 0,
    paddingTop: 0,
    marginBottom: 20,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 16,
    color: "#333",
  },
  cameraContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 1000,
  },
  cameraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  cameraTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    paddingTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 12,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  // scanInstruction: {
  //   color: "#fff",
  //   fontSize: 14,
  //   textAlign: "center",
  //   backgroundColor: "rgba(0,0,0,0.7)",
  //   padding: 10,
  //   borderRadius: 8,
  //   margin: 20,
  // },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  flipButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  flipButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default CreateProfileScreen;
