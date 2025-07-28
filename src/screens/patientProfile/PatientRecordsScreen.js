import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
  Button,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { getPatients } from "../../services/patientService";
import ScreenContainer from "../../components/common/ScreenContainer";
import { CameraView, useCameraPermissions } from "expo-camera";
import colors from "../../constant/colors"; // Import file colors.js mới

const PatientRecordsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Trạng thái camera
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients();

      if (response.isSuccess) {
        setPatients(response.value || []);
      } else {
        console.error("Lỗi tải danh sách bệnh nhân:", response.error);
        Alert.alert("Lỗi", "Không thể tải danh sách hồ sơ bệnh nhân");
      }
    } catch (error) {
      console.error("Lỗi tải danh sách bệnh nhân:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách hồ sơ bệnh nhân");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tải danh sách bệnh nhân khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      loadPatients();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPatients();
  };

  const handleAddProfile = () => {
    navigation.navigate("CreateProfileScreen", { isPrimary: false });
  };

  const handleViewProfile = (patient) => {
    navigation.navigate("ProfileScreen", { patientId: patient.id });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Hàm xử lý camera và quét mã vạch
  const handleBarcodeScanned = ({ type, data }) => {
    if (!scanned) {
      console.log("Mã vạch đã quét:", type, data);

      // Phân tích định dạng mã QR CCCD Việt Nam
      const parseVietnameseCCCD = (qrData) => {
        try {
          // Định dạng: ID|CIC|Name|DOB|Gender|Address|IssueDate
          // Ví dụ: 042173007269|250980646|Nguyễn Thị Thanh|16111973|Nữ|Xóm 1, Thôn Liên Trung, Tân Hà, Lâm Hà, Lâm Đồng|27122021
          const parts = qrData.split("|");

          if (parts.length >= 6) {
            const idCard = parts[0]; // Số CCCD
            const name = parts[2]; // Họ tên
            const dobRaw = parts[3]; // Ngày sinh (DDMMYYYY)
            const gender = parts[4]; // Giới tính
            const address = parts[5]; // Địa chỉ

            // Chuyển ngày sinh từ DDMMYYYY sang DD/MM/YYYY
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
          console.error("Lỗi phân tích mã QR CCCD:", error);
        }
        return null;
      };

      // Kiểm tra nếu dữ liệu quét là số CCCD hoặc mã bảo hiểm
      if (data && data.length >= 9 && data.length <= 15 && /^\d+$/.test(data)) {
        setScanned(true);
        setShowCamera(false);

        // Điều hướng sang màn hình tạo hồ sơ với dữ liệu quét
        navigation.navigate("CreateProfileScreen", {
          isPrimary: false,
          scannedIdCard: data,
        });

        // Đặt lại trạng thái quét sau một khoảng thời gian
        setTimeout(() => setScanned(false), 3000);
      } else {
        // Thử phân tích định dạng mã QR CCCD Việt Nam trước
        const cccdData = parseVietnameseCCCD(data);

        if (cccdData) {
          setScanned(true);
          setShowCamera(false);

          // Điều hướng sang màn hình tạo hồ sơ với dữ liệu CCCD đã phân tích
          navigation.navigate("CreateProfileScreen", {
            isPrimary: false,
            scannedData: cccdData,
          });

          // Đặt lại trạng thái quét sau một khoảng thời gian
          setTimeout(() => setScanned(false), 3000);
        } else {
          // Dự phòng: Tìm mẫu số CCCD trong dữ liệu
          const idMatches = data.match(/\b\d{9,15}\b/);
          if (idMatches && idMatches.length > 0) {
            setScanned(true);
            const extractedId = idMatches[0];
            setShowCamera(false);

            // Điều hướng sang màn hình tạo hồ sơ với dữ liệu quét
            navigation.navigate("CreateProfileScreen", {
              isPrimary: false,
              scannedIdCard: extractedId,
            });

            // Đặt lại trạng thái quét sau một khoảng thời gian
            setTimeout(() => setScanned(false), 3000);
          } else {
            Alert.alert(
              "Lỗi",
              "Không tìm thấy thông tin CCCD/CMND hợp lệ trong mã quét. Vui lòng thử lại."
            );
          }
        }
      }
    }
  };

  const openCamera = () => {
    if (permission?.granted) {
      setShowCamera(true);
      setScanned(false);
    } else {
      requestPermission();
    }
  };

  const closeCamera = () => {
    setShowCamera(false);
    setScanned(false);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleScanId = () => {
    // Mở camera để quét mã BHYT/CCCD
    openCamera();
  };

  // Tạo header tùy chỉnh với nút back và nút tạo mới
  const customHeader = (
    <View style={styles.customHeader}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Icon name="chevron-back" size={24} color={colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Hồ sơ người khám</Text>
      <TouchableOpacity style={styles.createButton} onPress={handleAddProfile}>
        <Icon name="person-add" size={24} color={colors.white} />
        <Text style={styles.createButtonText}>Tạo mới</Text>
      </TouchableOpacity>
    </View>
  );

  // Hiển thị UI yêu cầu quyền nếu cần
  if (showCamera && !permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionMessage}>Đang tải quyền camera...</Text>
      </View>
    );
  }

  if (showCamera && !permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionMessage}>
          Ứng dụng cần quyền truy cập camera để quét mã
        </Text>
        <Button onPress={requestPermission} title="Cấp quyền" />
        <Button onPress={closeCamera} title="Hủy" />
      </View>
    );
  }

  return (
    <ScreenContainer header={customHeader} hasBottomTabs={true}>
      <View style={[styles.container]}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 0 }} // Loại bỏ khoảng trống dưới
        >
          {loading && patients.length === 0 ? (
            <View style={styles.messageContainer}>
              <Text style={styles.loadingMessage}>Đang tải hồ sơ...</Text>
            </View>
          ) : patients.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.infoContainer}>
                <Icon
                  name="information-circle-outline"
                  size={24}
                  color={colors.primaryBlue}
                />
                <Text style={styles.infoMessage}>
                  Bạn chưa có hồ sơ. Vui lòng tạo mới hồ sơ để được đặt khám.
                </Text>
              </View>

              <View style={styles.emptyContent}>
                <Text style={styles.createTitle}>Tạo hồ sơ</Text>
                <Text style={styles.createDescription}>
                  Bạn được phép tạo tối đa 10 hồ sơ (cá nhân và người thân trong
                  gia đình)
                </Text>

                <TouchableOpacity
                  style={styles.mainActionButton}
                  onPress={handleAddProfile}
                >
                  <Text style={styles.mainActionText}>
                    CHƯA TỪNG KHÁM ĐĂNG KÝ MỚI
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={handleScanId}
                >
                  <Icon
                    name="scan-outline"
                    size={20}
                    color={colors.primaryBlue}
                  />
                  <Text style={styles.scanButtonText}>QUÉT MÃ CCCD</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.patientList}>
                {patients.map((patient, index) => (
                  <View key={patient.id || index} style={styles.patientCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.patientName}>
                        {patient.fullName.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.cardContent}>
                      <View style={styles.patientInfoRow}>
                        <Icon
                          name="call"
                          size={20}
                          color={colors.primaryBlue}
                          style={styles.patientIcon}
                        />
                        <Text style={styles.patientDetail}>
                          {patient.phone}
                        </Text>
                      </View>

                      <View style={styles.patientInfoRow}>
                        <Icon
                          name="calendar"
                          size={20}
                          color={colors.primaryBlue}
                          style={styles.patientIcon}
                        />
                        <Text style={styles.patientDetail}>
                          {new Date(patient.dob).toLocaleDateString("vi-VN")}
                        </Text>
                      </View>

                      <View style={styles.patientInfoRow}>
                        <Icon
                          name="location"
                          size={20}
                          color={colors.primaryBlue}
                          style={styles.patientIcon}
                        />
                        <Text style={styles.patientDetail}>
                          {patient.address || "Chưa cập nhật địa chỉ"}
                        </Text>
                      </View>

                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={styles.detailButton}
                          onPress={() => handleViewProfile(patient)}
                        >
                          <Text style={styles.detailButtonText}>Chi tiết</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.healthInfoButton}
                          onPress={() =>
                            navigation.navigate("PatientHealthScreen", {
                              patientId: patient.id,
                            })
                          }
                        >
                          <Text style={styles.healthInfoButtonText}>
                            Thông tin sức khỏe
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Modal camera để quét mã vạch */}
        {showCamera && permission?.granted && (
          <View style={styles.cameraContainer}>
            <View style={styles.cameraHeader}>
              <Text style={styles.cameraTitle}>Quét mã BHYT/CCCD</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeCamera}
              >
                <Icon name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            <CameraView
              style={styles.camera}
              facing={facing}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={handleBarcodeScanned}
              autofocus="on"
            >
              <View style={styles.overlay}>
                <View style={styles.scanArea}>
                  <Text style={styles.scanInstruction}></Text>
                </View>
              </View>

              <View style={styles.cameraButtonContainer}>
                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={toggleCameraFacing}
                >
                  <Icon
                    name="camera-reverse-outline"
                    size={24}
                    color={colors.white}
                  />
                  <Text style={styles.flipButtonText}>Lật camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.flipButton, { marginLeft: 10 }]}
                  onPress={closeCamera}
                >
                  <Icon name="close-outline" size={24} color={colors.white} />
                  <Text style={styles.flipButtonText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primaryBlue,
    paddingVertical: 15,
    paddingTop: 45,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  createButtonText: {
    color: colors.white,
    marginLeft: 5,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingMessage: {
    fontSize: 16,
    color: colors.textLoading,
  },
  emptyStateContainer: {
    flex: 1,
    padding: 16,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.infoBlue,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoMessage: {
    color: colors.primaryBlue,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  emptyContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  createTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: colors.textDarker,
  },
  createDescription: {
    fontSize: 16,
    color: colors.textDescription,
    textAlign: "center",
    marginBottom: 30,
  },
  mainActionButton: {
    backgroundColor: colors.primaryBlue,
    padding: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  mainActionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
    borderRadius: 8,
    width: "100%",
  },
  scanButtonText: {
    color: colors.primaryBlue,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  patientList: {
    padding: 16,
  },
  patientCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: colors.primaryBlue,
    padding: 12,
    paddingVertical: 14,
  },
  cardContent: {
    padding: 16,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  patientInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  patientIcon: {
    marginRight: 10,
    width: 24,
    textAlign: "center",
  },
  patientDetail: {
    fontSize: 15,
    color: colors.textDark,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  detailButton: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  detailButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "bold",
  },
  healthInfoButton: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.primaryBlue,
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
    textAlign: "center",
  },
  healthInfoButtonText: {
    fontSize: 16,
    color: colors.primaryBlue,
    fontWeight: "bold",
  },
  // Kiểu dáng camera
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    padding: 20,
  },
  permissionMessage: {
    textAlign: "center",
    paddingBottom: 20,
    fontSize: 16,
    color: colors.textDark,
  },
  cameraContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.cameraBlack,
    zIndex: 1000,
  },
  cameraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: colors.cameraOverlay,
  },
  cameraTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)", // Giữ nguyên vì không có màu tương ứng
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
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: colors.primaryGreen,
    borderRadius: 12,
    backgroundColor: colors.scanAreaOverlay,
    justifyContent: "center",
    alignItems: "center",
  },
  scanInstruction: {
    display: "none",
  },
  cameraButtonContainer: {
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
    backgroundColor: colors.cameraOverlay,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  flipButtonText: {
    color: colors.white,
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PatientRecordsScreen;
