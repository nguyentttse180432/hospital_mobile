import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { getPatients } from "../../services/patientService";
import ScreenContainer from "../../components/common/ScreenContainer";
import Button from "../../components/common/Button";

const PatientRecordsScreen = () => {
  const navigation = useNavigation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients();
      console.log("API Response:", response);

      if (response.isSuccess) {
        setPatients(response.value || []);
      } else {
        console.error("Error loading patients:", response.error);
        Alert.alert("Lỗi", "Không thể tải danh sách hồ sơ bệnh nhân");
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách hồ sơ bệnh nhân");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load patients when the screen gains focus
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

  const handleScanId = () => {
    // Xử lý quét mã BHYT/CCCD
    Alert.alert("Thông báo", "Tính năng quét mã BHYT/CCCD đang phát triển");
  };

  // Tạo header tùy chỉnh với nút back và nút tạo mới
  const customHeader = (
    <View style={styles.customHeader}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Icon name="chevron-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Hồ sơ bệnh nhân</Text>
      <TouchableOpacity style={styles.createButton} onPress={handleAddProfile}>
        <Icon name="person-add" size={24} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Tạo mới</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer
      scrollable={false}
      header={customHeader}
      style={{ padding: 0 }}
    >
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.scrollView}
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
                  color="#4299e1"
                />
                <Text style={styles.infoMessage}>
                  Bạn chưa có hồ sơ bệnh nhân. Vui lòng tạo mới hồ sơ để được
                  đặt khám.
                </Text>
              </View>

              <View style={styles.emptyContent}>
                <Text style={styles.createTitle}>Tạo hồ sơ bệnh nhân</Text>
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
                  <Icon name="scan-outline" size={20} color="#4299e1" />
                  <Text style={styles.scanButtonText}>QUÉT MÃ BHYT/CCCD</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.infoContainer}>
                <Icon
                  name="information-circle-outline"
                  size={24}
                  color="#4299e1"
                />
                <Text style={styles.infoMessage}>
                  Vui lòng chọn 1 trong các hồ sơ bên dưới, hoặc bấm vào biểu
                  tượng ở trên để thêm hồ sơ người bệnh.
                </Text>
              </View>

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
                          color="#4299e1"
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
                          color="#4299e1"
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
                          color="#4299e1"
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
    backgroundColor: "#4299e1",
    paddingVertical: 15,
    paddingTop: 45,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  createButtonText: {
    color: "white",
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
    color: "#757575",
  },
  emptyStateContainer: {
    flex: 1,
    padding: 16,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f2ff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoMessage: {
    color: "#4299e1",
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
  },
  createDescription: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  mainActionButton: {
    backgroundColor: "#4299e1",
    padding: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  mainActionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#4299e1",
    borderRadius: 8,
    width: "100%",
  },
  scanButtonText: {
    color: "#4299e1",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  patientList: {
    padding: 16,
  },
  patientCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#4299e1",
    padding: 12,
    paddingVertical: 14,
  },
  cardContent: {
    padding: 16,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
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
    color: "#333",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  detailButton: {
    backgroundColor: "#4299e1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  detailButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  healthInfoButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#4299e1",
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  healthInfoButtonText: {
    color: "#4299e1",
    fontWeight: "bold",
  },
});

export default PatientRecordsScreen;
