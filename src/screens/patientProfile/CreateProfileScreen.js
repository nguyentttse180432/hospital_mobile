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
import DateTimePicker from "@react-native-community/datetimepicker";

// Import custom components
import IdCardStep from "../../components/patientProfile/IdCardStep";
import PhoneVerificationStep from "../../components/patientProfile/PhoneVerificationStep";
import PersonalInfoForm from "../../components/patientProfile/PersonalInfoForm";
import AddressInfoForm from "../../components/patientProfile/AddressInfoForm";
import SelectionModal from "../../components/patientProfile/SelectionModal";
import { CameraView, useCameraPermissions } from "expo-camera";

const CreateProfileScreen = ({ route, navigation }) => {
  const {
    isPrimary = true,
    scannedIdCard = "",
    scannedData = null,
  } = route.params || {};

  // Camera states
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Flow states
  const [step, setStep] = useState("checkIdCard"); // checkIdCard, verifyPhone, personalInfo, addressInfo
  const [idCard, setIdCard] = useState(
    scannedIdCard || (scannedData ? scannedData.idCard : "")
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Profile form states
  const [name, setName] = useState(scannedData ? scannedData.name : "");
  const [gender, setGender] = useState(scannedData ? scannedData.gender : "");
  const [dateOfBirth, setDateOfBirth] = useState(
    scannedData ? scannedData.dateOfBirth : ""
  );
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

  // Initialize address from scanned data
  useEffect(() => {
    if (scannedData && scannedData.address) {
      // Parse the address string to extract components
      // Format: "Xóm 1, Thôn Liên Trung, Tân Hà, Lâm Hà, Lâm Đồng"
      const addressParts = scannedData.address.split(", ");

      if (addressParts.length >= 3) {
        // Get the last parts as province, district, ward
        const addressProvince = addressParts[addressParts.length - 1];
        const addressDistrict = addressParts[addressParts.length - 2];
        const addressWard = addressParts[addressParts.length - 3];

        // Get the street address (everything before ward)
        const addressStreet = addressParts
          .slice(0, addressParts.length - 3)
          .join(", ");

        // Try to match with known provinces/districts
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
        // If can't parse, put the whole address in streetAddress
        setStreetAddress(scannedData.address);
      }

      // Show notification that data has been auto-filled
      setTimeout(() => {
        Alert.alert(
          "Thông tin đã được tự động điền",
          `Thông tin từ QR CCCD đã được điền vào form:\n- Họ tên: ${scannedData.name}\n- CCCD: ${scannedData.idCard}\n- Ngày sinh: ${scannedData.dateOfBirth}\n- Giới tính: ${scannedData.gender}\n\nVui lòng kiểm tra và hoàn thiện thông tin còn thiếu.`
        );
      }, 500);
    }
  }, [scannedData]);

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
    "Quận 3": [
      "Phường 1",
      "Phường 2",
      "Phường 3",
      "Phường 4",
      "Phường 5",
      "Phường 9",
      "Phường 10",
      "Phường 11",
      "Phường 12",
      "Phường 13",
      "Phường 14",
    ],
    "Quận 4": [
      "Phường 1",
      "Phường 2",
      "Phường 3",
      "Phường 4",
      "Phường 5",
      "Phường 6",
      "Phường 8",
      "Phường 9",
      "Phường 10",
      "Phường 13",
      "Phường 14",
      "Phường 15",
      "Phường 16",
      "Phường 18",
    ],
    "Quận 5": [
      "Phường 1",
      "Phường 2",
      "Phường 3",
      "Phường 4",
      "Phường 5",
      "Phường 6",
      "Phường 7",
      "Phường 8",
      "Phường 9",
      "Phường 10",
      "Phường 11",
      "Phường 12",
      "Phường 13",
      "Phường 14",
      "Phường 15",
    ],
    "Quận Bình Thạnh": [
      "Phường 1",
      "Phường 2",
      "Phường 3",
      "Phường 5",
      "Phường 6",
      "Phường 7",
      "Phường 11",
      "Phường 12",
      "Phường 13",
      "Phường 14",
      "Phường 15",
      "Phường 17",
      "Phường 19",
      "Phường 21",
      "Phường 22",
      "Phường 24",
      "Phường 25",
      "Phường 26",
      "Phường 27",
      "Phường 28",
    ],
    "Quận Tân Bình": [
      "Phường 1",
      "Phường 2",
      "Phường 3",
      "Phường 4",
      "Phường 5",
      "Phường 6",
      "Phường 7",
      "Phường 8",
      "Phường 9",
      "Phường 10",
      "Phường 11",
      "Phường 12",
      "Phường 13",
      "Phường 14",
      "Phường 15",
    ],
    "Hoàn Kiếm": [
      "Phường Đồng Xuân",
      "Phường Hàng Bạc",
      "Phường Hàng Bồ",
      "Phường Hàng Bông",
      "Phường Hàng Buồm",
      "Phường Hàng Đào",
      "Phường Hàng Gai",
      "Phường Hàng Mã",
      "Phường Hàng Trống",
      "Phường Lý Thái Tổ",
      "Phường Phan Chu Trinh",
      "Phường Trần Hưng Đạo",
      "Phường Tràng Tiền",
    ],
    "Hai Bà Trưng": [
      "Phường Bạch Đằng",
      "Phường Bách Khoa",
      "Phường Bạch Mai",
      "Phường Cầu Dền",
      "Phường Đống Mác",
      "Phường Đồng Nhân",
      "Phường Đồng Tâm",
      "Phường Lê Đại Hành",
      "Phường Minh Khai",
      "Phường Ngô Thì Nhậm",
      "Phường Nguyễn Du",
      "Phường Phạm Đình Hổ",
      "Phường Phố Huế",
      "Phường Quỳnh Lôi",
      "Phường Quỳnh Mai",
      "Phường Thanh Lương",
      "Phường Thanh Nhàn",
      "Phường Trương Định",
      "Phường Vĩnh Tuy",
    ],
    "Thành phố Thủ Đức": [
      "Phường An Khánh",
      "Phường An Lợi Đông",
      "Phường An Phú",
      "Phường Bình Chiểu",
      "Phường Bình Thọ",
      "Phường Bình Trưng Đông",
      "Phường Bình Trưng Tây",
      "Phường Cát Lái",
      "Phường Hiệp Bình Chánh",
      "Phường Hiệp Bình Phước",
      "Phường Hiệp Phú",
      "Phường Linh Chiểu",
      "Phường Linh Đông",
      "Phường Linh Tây",
      "Phường Linh Trung",
      "Phường Linh Xuân",
      "Phường Long Bình",
      "Phường Long Phước",
      "Phường Long Thạnh Mỹ",
      "Phường Long Trường",
      "Phường Phú Hữu",
      "Phường Phước Bình",
      "Phường Phước Long A",
      "Phường Phước Long B",
      "Phường Tam Bình",
      "Phường Tam Phú",
      "Phường Tăng Nhơn Phú A",
      "Phường Tăng Nhơn Phú B",
      "Phường Tân Phú",
      "Phường Thảo Điền",
      "Phường Thủ Thiêm",
      "Phường Trường Thạnh",
      "Phường Trường Thọ",
    ],
    "Quận 6": [
      "Phường 1",
      "Phường 2",
      "Phường 3",
      "Phường 4",
      "Phường 5",
      "Phường 6",
      "Phường 7",
      "Phường 8",
      "Phường 9",
      "Phường 10",
      "Phường 11",
      "Phường 12",
      "Phường 13",
      "Phường 14",
    ],
    "Quận 7": [
      "Phường Tân Thuận Đông",
      "Phường Tân Thuận Tây",
      "Phường Tân Kiểng",
      "Phường Tân Hưng",
      "Phường Bình Thuận",
      "Phường Tân Quy",
      "Phường Phú Thuận",
      "Phường Tân Phú",
      "Phường Tân Phong",
      "Phường Phú Mỹ",
    ],
    "Quận 8": [
      "Phường 1",
      "Phường 2",
      "Phường 3",
      "Phường 4",
      "Phường 5",
      "Phường 6",
      "Phường 7",
      "Phường 8",
      "Phường 9",
      "Phường 10",
      "Phường 11",
      "Phường 12",
      "Phường 13",
      "Phường 14",
      "Phường 15",
      "Phường 16",
    ],
    "Quận 10": [
      "Phường 1",
      "Phường 2",
      "Phường 3",
      "Phường 4",
      "Phường 5",
      "Phường 6",
      "Phường 7",
      "Phường 8",
      "Phường 9",
      "Phường 10",
      "Phường 11",
      "Phường 12",
      "Phường 13",
      "Phường 14",
      "Phường 15",
    ],
    "Quận 11": [
      "Phường 1",
      "Phường 2",
      "Phường 3",
      "Phường 4",
      "Phường 5",
      "Phường 6",
      "Phường 7",
      "Phường 8",
      "Phường 9",
      "Phường 10",
      "Phường 11",
      "Phường 12",
      "Phường 13",
      "Phường 14",
      "Phường 15",
      "Phường 16",
    ],
    "Quận 12": [
      "Phường An Phú Đông",
      "Phường Đông Hưng Thuận",
      "Phường Hiệp Thành",
      "Phường Tân Chánh Hiệp",
      "Phường Tân Hưng Thuận",
      "Phường Tân Thới Hiệp",
      "Phường Tân Thới Nhất",
      "Phường Thạnh Lộc",
      "Phường Thạnh Xuân",
      "Phường Thới An",
      "Phường Trung Mỹ Tây",
    ],
    "Quận Gò Vấp": [
      "Phường 1",
      "Phường 3",
      "Phường 4",
      "Phường 5",
      "Phường 6",
      "Phường 7",
      "Phường 8",
      "Phường 9",
      "Phường 10",
      "Phường 11",
      "Phường 12",
      "Phường 13",
      "Phường 14",
      "Phường 15",
      "Phường 16",
      "Phường 17",
    ],
    "Quận Phú Nhuận": [
      "Phường 1",
      "Phường 2",
      "Phường 3",
      "Phường 4",
      "Phường 5",
      "Phường 7",
      "Phường 8",
      "Phường 9",
      "Phường 10",
      "Phường 11",
      "Phường 13",
      "Phường 15",
      "Phường 17",
    ],
    "Quận Tân Phú": [
      "Phường Hiệp Tân",
      "Phường Hòa Thạnh",
      "Phường Phú Thạnh",
      "Phường Phú Thọ Hòa",
      "Phường Phú Trung",
      "Phường Sơn Kỳ",
      "Phường Tân Quý",
      "Phường Tân Sơn Nhì",
      "Phường Tân Thành",
      "Phường Tân Thới Hòa",
      "Phường Tây Thạnh",
    ],
    "Đống Đa": [
      "Phường Cát Linh",
      "Phường Hàng Bột",
      "Phường Khâm Thiên",
      "Phường Khương Thượng",
      "Phường Kim Liên",
      "Phường Láng Hạ",
      "Phường Láng Thượng",
      "Phường Nam Đồng",
      "Phường Ngã Tư Sở",
      "Phường Ô Chợ Dừa",
      "Phường Phương Liên",
      "Phường Phương Mai",
      "Phường Quang Trung",
      "Phường Quốc Tử Giám",
      "Phường Thịnh Quang",
      "Phường Thổ Quan",
      "Phường Trung Liệt",
      "Phường Trung Phụng",
      "Phường Trung Tự",
      "Phường Văn Chương",
      "Phường Văn Miếu",
    ],
    "Tây Hồ": [
      "Phường Bưởi",
      "Phường Nhật Tân",
      "Phường Phú Thượng",
      "Phường Quảng An",
      "Phường Thụy Khuê",
      "Phường Tứ Liên",
      "Phường Xuân La",
      "Phường Yên Phụ",
    ],
    "Cầu Giấy": [
      "Phường Dịch Vọng",
      "Phường Dịch Vọng Hậu",
      "Phường Mai Dịch",
      "Phường Nghĩa Đô",
      "Phường Nghĩa Tân",
      "Phường Quan Hoa",
      "Phường Trung Hòa",
      "Phường Yên Hòa",
    ],
    "Thanh Xuân": [
      "Phường Hạ Đình",
      "Phường Khương Đình",
      "Phường Khương Mai",
      "Phường Khương Trung",
      "Phường Kim Giang",
      "Phường Nhân Chính",
      "Phường Phương Liệt",
      "Phường Thanh Xuân Bắc",
      "Phường Thanh Xuân Nam",
      "Phường Thanh Xuân Trung",
      "Phường Thượng Đình",
    ],
    "Hoàng Mai": [
      "Phường Đại Kim",
      "Phường Định Công",
      "Phường Giáp Bát",
      "Phường Hoàng Liệt",
      "Phường Hoàng Văn Thụ",
      "Phường Lĩnh Nam",
      "Phường Mai Động",
      "Phường Tân Mai",
      "Phường Thanh Trì",
      "Phường Thịnh Liệt",
      "Phường Trần Phú",
      "Phường Tương Mai",
      "Phường Vĩnh Hưng",
      "Phường Yên Sở",
    ],
    "Long Biên": [
      "Phường Bồ Đề",
      "Phường Cự Khối",
      "Phường Đức Giang",
      "Phường Gia Thụy",
      "Phường Giang Biên",
      "Phường Long Biên",
      "Phường Ngọc Lâm",
      "Phường Ngọc Thụy",
      "Phường Phúc Đồng",
      "Phường Phúc Lợi",
      "Phường Sài Đồng",
      "Phường Thạch Bàn",
      "Phường Thượng Thanh",
      "Phường Việt Hưng",
    ],
    "Nam Từ Liêm": [
      "Phường Cầu Diễn",
      "Phường Đại Mỗ",
      "Phường Mễ Trì",
      "Phường Mỹ Đình 1",
      "Phường Mỹ Đình 2",
      "Phường Phú Đô",
      "Phường Phương Canh",
      "Phường Tây Mỗ",
      "Phường Trung Văn",
      "Phường Xuân Phương",
    ],
    "Bắc Từ Liêm": [
      "Phường Cổ Nhuế 1",
      "Phường Cổ Nhuế 2",
      "Phường Đông Ngạc",
      "Phường Đức Thắng",
      "Phường Liên Mạc",
      "Phường Minh Khai",
      "Phường Phú Diễn",
      "Phường Phúc Diễn",
      "Phường Tây Tựu",
      "Phường Thượng Cát",
      "Phường Thụy Phương",
      "Phường Xuân Đỉnh",
      "Phường Xuân Tảo",
    ],
    "Hà Đông": [
      "Phường Biên Giang",
      "Phường Đồng Mai",
      "Phường Dương Nội",
      "Phường Hà Cầu",
      "Phường Kiến Hưng",
      "Phường La Khê",
      "Phường Mộ Lao",
      "Phường Nguyễn Trãi",
      "Phường Phú La",
      "Phường Phú Lãm",
      "Phường Phú Lương",
      "Phường Phúc La",
      "Phường Quang Trung",
      "Phường Vạn Phúc",
      "Phường Văn Quán",
      "Phường Yên Nghĩa",
      "Phường Yết Kiêu",
    ],
  };

  // Effect to compile the full address whenever address components change
  useEffect(() => {
    if (streetAddress && ward && district && province) {
      const addressParts = [streetAddress, ward, district, province].filter(
        (part) => part
      );
      const fullAddress = addressParts.join(", ");
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

  // Không còn cần thiết các hàm xử lý DatePicker nữa,
  // giữ lại để tránh lỗi với code đã có
  const onDateChange = () => {};
  const showDatePickerModal = () => {};

  const verifyOtpCode = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtp(phoneNumber, otp);

      if (response.value) {
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

    // Kiểm tra ngày sinh có đúng định dạng và hợp lệ
    if (!dateOfBirth) {
      Alert.alert("Thông báo", "Vui lòng nhập ngày sinh");
      return false;
    }

    // Kiểm tra định dạng ngày sinh DD/MM/YYYY
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    if (!dateRegex.test(dateOfBirth)) {
      Alert.alert(
        "Thông báo",
        "Vui lòng nhập ngày sinh đúng định dạng ngày/tháng/năm"
      );
      return false;
    }

    // Kiểm tra tính hợp lệ của ngày sinh
    const [day, month, year] = dateOfBirth
      .split("/")
      .map((part) => parseInt(part, 10));
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
    if (!ethnicity || ethnicity.trim() === "") {
      Alert.alert("Thông báo", "Vui lòng chọn dân tộc");
      return false;
    }
    if (!province || province.trim() === "") {
      Alert.alert("Thông báo", "Vui lòng chọn tỉnh/thành phố");
      return false;
    }
    if (!district || district.trim() === "") {
      Alert.alert("Thông báo", "Vui lòng chọn quận/huyện");
      return false;
    }
    if (!ward || ward.trim() === "") {
      Alert.alert("Thông báo", "Vui lòng chọn phường/xã");
      return false;
    }
    if (!streetAddress || streetAddress.trim() === "") {
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

      // Convert DD/MM/YYYY to ISO date format
      let formattedDate = dateOfBirth;
      if (dateOfBirth && dateOfBirth.includes("/")) {
        const [day, month, year] = dateOfBirth
          .split("/")
          .map((part) => parseInt(part, 10));
        const dateObj = new Date(year, month - 1, day);
        formattedDate = dateObj.toISOString();
      }

      // Parse Vietnamese name: last word is lastName (given name), rest is firstName (family name + middle name)
      const nameParts = name?.trim().split(" ") || [];
      let firstName = "";
      let lastName = "";

      if (nameParts.length === 1) {
        // If there's only one word, treat it as firstName
        firstName = nameParts[0];
      } else if (nameParts.length >= 2) {
        // Last word is the given name (lastName), rest is family name + middle name (firstName)
        lastName = nameParts[nameParts.length - 1];
        firstName = nameParts.slice(0, nameParts.length - 1).join(" ");
      }

      const profileData = {
        firstName: firstName,
        lastName: lastName,
        gender: gender === "Nam" ? "Male" : "Female",
        dateOfBirth: formattedDate,
        identityNumber: idCard,
        phoneNumber: phoneNumber,
        email: email || "",
        address: {
          street: streetAddress || "",
          ward: ward || "",
          district: district || "",
          province: province || "",
          street_2: "",
          ward_2: "",
          district_2: "",
          province_2: "",
        },
        isPrimary: isPrimary,
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

  // Compute which fields should be disabled if scannedData exists
  const disabledFields = scannedData
    ? {
        name: true,
        dateOfBirth: true,
        gender: true,
        province: true,
        district: true,
        ward: true,
        streetAddress: true,
      }
    : {};

  // Render modal for selection options
  const renderSelectionModal = (visible, title, options, onSelect, onClose) => {
    return (
      <SelectionModal
        visible={visible}
        title={title}
        options={options}
        onSelect={onSelect}
        onClose={onClose}
      />
    );
  };

  // Camera and barcode handling functions
  const handleBarcodeScanned = ({ type, data }) => {
    if (!scanned) {
      console.log("Barcode scanned:", type, data);

      // Parse Vietnamese CCCD QR code format
      const parseVietnameseCCCD = (qrData) => {
        try {
          // Format: ID|CIC|Name|DOB|Gender|Address|IssueDate
          const parts = qrData.split("|");

          if (parts.length >= 6) {
            const idCard = parts[0]; // CCCD number
            const name = parts[2]; // Full name
            const dobRaw = parts[3]; // Date of birth (DDMMYYYY)
            const gender = parts[4]; // Gender
            const address = parts[5]; // Full address

            // Parse date of birth from DDMMYYYY to DD/MM/YYYY
            let dateOfBirth = "";
            if (dobRaw && dobRaw.length === 8) {
              const day = dobRaw.substring(0, 2);
              const month = dobRaw.substring(2, 4);
              const year = dobRaw.substring(4, 8);
              dateOfBirth = `${day}/${month}/${year}`;
            }

            return {
              idCard,
              name,
              dateOfBirth,
              gender,
              address,
            };
          }
        } catch (error) {
          console.error("Error parsing CCCD QR code:", error);
        }
        return null;
      };

      // Check if the scanned data looks like a Vietnamese ID card number
      if (data && data.length >= 9 && data.length <= 12 && /^\d+$/.test(data)) {
        setScanned(true);
        setIdCard(data);
        setShowCamera(false);
        // Reset scanned state after a delay
        setTimeout(() => setScanned(false), 3000);
      } else {
        // Try to parse Vietnamese CCCD QR code format first
        const cccdData = parseVietnameseCCCD(data);

        if (cccdData) {
          setScanned(true);
          setShowCamera(false);

          // Auto-fill all the form data
          setIdCard(cccdData.idCard);
          setName(cccdData.name);
          setGender(cccdData.gender);
          setDateOfBirth(cccdData.dateOfBirth);

          // Parse and set address components
          if (cccdData.address) {
            const addressParts = cccdData.address.split(", ");

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
              setStreetAddress(cccdData.address);
            }
          }

          // Reset scanned state after a delay
          setTimeout(() => setScanned(false), 3000);
        } else {
          // Fallback: Try to find ID number pattern in the data
          const idMatches = data.match(/\b\d{9,12}\b/);
          if (idMatches && idMatches.length > 0) {
            setScanned(true);
            const extractedId = idMatches[0];
            setIdCard(extractedId);
            setShowCamera(false);

            // Reset scanned state after a delay
            setTimeout(() => setScanned(false), 3000);
          } else {
            Alert.alert(
              "Lỗi",
              "Không tìm thấy thông tin CCCD/CMND hợp lệ trong mã quét. Vui lòng thử lại hoặc nhập thủ công."
            );
          }
        }
      }
    }
  };

  const openCamera = () => {
    if (permission?.granted) {
      setShowCamera(true);
      setScanned(false); // Reset scanned state when opening camera
    } else {
      requestPermission();
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    setScanned(false); // Reset scanned state when closing camera
  };

  // Render the camera view
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  // Show permission request UI if needed
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
            setDateOfBirth={setDateOfBirth} // Thêm hàm setDateOfBirth
            showDatePickerModal={showDatePickerModal}
            gender={gender}
            setShowGenderModal={() => setShowGenderModal(true)} // Thêm hàm hiển thị modal giới tính
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
            disabledFields={disabledFields}
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
            disabledFields={disabledFields}
          />
        )}
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

      {/* Camera Modal for Barcode Scanning */}
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
            barcodeScannerSettings={{
              barcodeTypes: [
                "qr",
                "ean13",
                "ean8",
                "upc_a",
                "upc_e",
                "code39",
                "code128",
                "pdf417",
              ],
            }}
            onBarcodeScanned={handleBarcodeScanned}
          >
            <View style={styles.overlay}>
              <View style={styles.scanArea}>
                <Text style={styles.scanInstruction}>
                  Đặt mã QR hoặc barcode vào khung quét
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

      {/* Đã loại bỏ DateTimePicker vì chúng ta đã chuyển sang nhập trực tiếp */}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20, // Thêm margin bottom
  },
  screenContainer: {
    padding: 0, // Loại bỏ padding mặc định
    paddingTop: 0, // Đặc biệt loại bỏ padding phía trên
    marginBottom: 20, // Thêm margin bottom
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    fontSize: 16,
    color: "#333",
  },
  // Camera styles
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 12,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanInstruction: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 8,
    margin: 20,
  },
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
