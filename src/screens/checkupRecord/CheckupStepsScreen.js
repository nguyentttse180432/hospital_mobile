import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../../components/common/ScreenContainer";
import Card from "../../components/common/Card";
import { getCheckupRecordServices } from "../../services/checkupRecordService";
import signalRConnect from "../../utils/signalR";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const CheckupStepsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { checkupCode, patientName, bookingDate } = route.params;

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const signalRConnectionRef = useRef(null);
  const autoRefreshIntervalRef = useRef(null);

  const getServiceStatus = (service) => {
    if (service.serviceName === "Đo sinh hiệu") {
      // Đảm bảo trả về đúng trạng thái Completed nếu có
      return service.vitalSignStatus || "Pending";
    }
    if (service.testRecordStatus && service.testRecordStatus !== "Paid") {
      return service.testRecordStatus;
    }
    if (service.checkupRecordStatus && service.checkupRecordStatus !== "Paid") {
      return service.checkupRecordStatus;
    }
    if (
      service.testRecordStatus === "Paid" ||
      service.checkupRecordStatus === "Paid"
    ) {
      return "Pending";
    }
    return "Pending";
  };

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCheckupRecordServices(checkupCode);
      if (response && response.isSuccess) {
        const sortedServices = response.value.sort((a, b) => {
          // Lấy trạng thái của các dịch vụ
          const statusA = getServiceStatus(a);
          const statusB = getServiceStatus(b);

          // Ưu tiên hiển thị dịch vụ đang trong quá trình thực hiện
          // Checkin (chờ cận lâm sàng) có ưu tiên cao nhất
          if (statusA === "Checkin" && statusB !== "Checkin") return -1;
          if (statusA !== "Checkin" && statusB === "Checkin") return 1;

          // Tiếp theo là các dịch vụ đang xử lý
          if (
            (statusA === "Processing" || statusA === "Testing") &&
            statusB !== "Processing" &&
            statusB !== "Testing" &&
            statusB !== "Checkin"
          )
            return -1;
          if (
            statusA !== "Processing" &&
            statusA !== "Testing" &&
            statusA !== "Checkin" &&
            (statusB === "Processing" || statusB === "Testing")
          )
            return 1;

          // Tiếp theo là các dịch vụ đang chờ kết quả
          if (
            statusA === "ProcessingResult" &&
            statusB !== "ProcessingResult" &&
            statusB !== "Checkin" &&
            statusB !== "Processing" &&
            statusB !== "Testing"
          )
            return -1;
          if (
            statusA !== "ProcessingResult" &&
            statusA !== "Checkin" &&
            statusA !== "Processing" &&
            statusA !== "Testing" &&
            statusB === "ProcessingResult"
          )
            return 1;

          // Các dịch vụ đã hoàn thành xét nghiệm nhưng chưa có kết quả
          if (
            statusA === "TestDone" &&
            statusB !== "TestDone" &&
            statusB !== "Checkin" &&
            statusB !== "Processing" &&
            statusB !== "Testing" &&
            statusB !== "ProcessingResult"
          )
            return -1;
          if (
            statusA !== "TestDone" &&
            statusA !== "Checkin" &&
            statusA !== "Processing" &&
            statusA !== "Testing" &&
            statusA !== "ProcessingResult" &&
            statusB === "TestDone"
          )
            return 1;

          // Đo sinh hiệu ở trạng thái Pending được ưu tiên hơn các dịch vụ Pending khác
          if (
            a.serviceName === "Đo sinh hiệu" &&
            statusA === "Pending" &&
            (b.serviceName !== "Đo sinh hiệu" || statusB !== "Pending")
          )
            return -1;
          if (
            (a.serviceName !== "Đo sinh hiệu" || statusA !== "Pending") &&
            b.serviceName === "Đo sinh hiệu" &&
            statusB === "Pending"
          )
            return 1;

          // Giữ nguyên thứ tự ban đầu cho các trạng thái khác
          return 0;
        });
        setServices(sortedServices);

        // Check if all services are completed
        checkAllServicesCompleted(sortedServices);
      } else {
        console.warn("Failed to fetch services or empty response", response);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  }, [checkupCode, checkAllServicesCompleted]);

  const initializeSignalR = useCallback(async () => {
    try {
      console.log("Initializing SignalR connection for:", checkupCode);
      const connection = await signalRConnect({ code: checkupCode });
      connection.on("UpdateStatus", (statusUpdate) => {
        console.log("Status updated via SignalR:", statusUpdate);
        if (statusUpdate) {
          updateServiceStatus(statusUpdate);
        }
      });
      signalRConnectionRef.current = connection;
    } catch (error) {
      console.error("SignalR connection failed:", error);
    }
  }, [checkupCode, updateServiceStatus]);

  const cleanupSignalR = useCallback(() => {
    if (signalRConnectionRef.current) {
      try {
        signalRConnectionRef.current.stop();
        signalRConnectionRef.current = null;
      } catch (error) {
        console.error("Error stopping SignalR connection:", error);
      }
    }
  }, []);

  const checkAllServicesCompleted = useCallback(
    (services) => {
      if (!services || services.length === 0) return false;

      const allCompleted = services.every((service) => {
        const status = getServiceStatus(service);
        return status === "Completed" || status === "Finished";
      });

      if (allCompleted) {
        // Navigate to done screen after a short delay
        setTimeout(() => {
          navigation.navigate("DoneCheckup", { checkupCode, patientName });
        }, 1000);
      }

      return allCompleted;
    },
    [navigation, checkupCode, patientName]
  );

  const updateServiceStatus = useCallback(
    (statusUpdate) => {
      setServices((prevServices) => {
        const updatedServices = prevServices.map((service) => {
          const serviceCodeMatches =
            service.serviceCode &&
            statusUpdate.serviceCode &&
            service.serviceCode.trim() === statusUpdate.serviceCode.trim();
          const testRecordMatches =
            service.testRecordCode &&
            statusUpdate.testRecordCode &&
            service.testRecordCode === statusUpdate.testRecordCode;
          if (serviceCodeMatches || testRecordMatches) {
            return {
              ...service,
              vitalSignStatus:
                statusUpdate.vitalSignStatus ?? service.vitalSignStatus,
              testRecordStatus:
                statusUpdate.testRecordStatus ?? service.testRecordStatus,
              checkupRecordStatus:
                statusUpdate.checkupRecordStatus ?? service.checkupRecordStatus,
            };
          }
          return service;
        });

        // Check if all services are now completed
        checkAllServicesCompleted(updatedServices);

        return updatedServices;
      });
    },
    [checkAllServicesCompleted]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  }, [fetchServices]);

  useEffect(() => {
    fetchServices();
    const cleanup = setupAutoRefresh();
    return () => {
      if (cleanup) cleanup();
      cleanupSignalR();
    };
  }, [fetchServices, setupAutoRefresh, cleanupSignalR]);

  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused - initializing SignalR");
      fetchServices();
      initializeSignalR();
      const cleanup = setupAutoRefresh();
      return () => {
        console.log("Screen unfocused - cleaning up SignalR");
        cleanupSignalR();
        if (cleanup) cleanup();
      };
    }, [cleanupSignalR, setupAutoRefresh, fetchServices, initializeSignalR])
  );

  // No need for a separate handleGoBack function since we're using ScreenContainer with title
  // which already has back navigation built-in
  const getStatusColor = (status, serviceName) => {
    // Special case for "Đo sinh hiệu" service with Pending status
    if (serviceName === "Đo sinh hiệu" && status === "Pending") {
      return "#5C6BC0"; // Indigo color for waiting for vital signs
    }

    switch (status) {
      case "Completed":
      case "Finished":
        return "#4CAF50"; // Xanh lá - hoàn thành
      case "InProgress":
      case "Processing":
      case "Testing":
        return "#FF5722"; // Cam đỏ - đang thực hiện
      case "TestDone":
        return "#8bc34a"; // Xanh lá nhạt - đã xét nghiệm xong
      case "Pending":
        return "#9E9E9E"; // Xám - chờ đợi
      case "Checkin":
        return "#2196F3"; // Xanh dương - chờ cận lâm sàng
      case "ProcessingResult":
        return "#ff8300"; // Cam - đang chờ kết quả
      default:
        return "#9E9E9E"; // Xám mặc định
    }
  };

  const getStatusText = (status, serviceName) => {
    // Special case for "Đo sinh hiệu" service with Pending status
    if (serviceName === "Đo sinh hiệu" && status === "Pending") {
      return "Chờ đo sinh hiệu";
    }

    switch (status) {
      case "Completed":
        return "Đã có kết quả";
      case "Checkin":
        return "Chờ cận lâm sàng";
      case "Finished":
        return "Đã có kết quả";
      case "ProcessingResult":
        return "Đang chờ kết quả";
      case "Testing":
        return "Đang tiến hành";
      case "TestDone":
        return "Đã xét nghiệm xong";
      case "Processing":
        return "Đang thực hiện";
      case "Pending":
      default:
        return "Chưa tiến hành";
    }
  };

  const getStatusIcon = (status, serviceName) => {
    // Special case for "Đo sinh hiệu" service with Pending status
    if (serviceName === "Đo sinh hiệu" && status === "Pending") {
      return "pulse"; // Heart rate icon for vital signs
    }

    switch (status) {
      case "Completed":
      case "Finished":
        return "checkmark-circle";
      case "Checkin":
        return "time";
      case "Processing":
      case "Testing":
        return "medkit-outline";
      case "TestDone":
        return "checkmark-done";
      case "ProcessingResult":
        return "document-text";
      case "Pending":
      default:
        return "help-circle";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const handleServicePress = (item) => {
    console.log("HANDLE SERVICE PRESS CALLED");
    console.log(JSON.stringify(item, null, 2));

    try {
      // Cố gắng sử dụng phương thức điều hướng trực tiếp hơn
      if (item.serviceName === "Đo sinh hiệu") {
        console.log("Đo sinh hiệu được chọn, thử điều hướng...");

        // Kiểm tra trạng thái của Đo sinh hiệu, chỉ cho phép xem khi Completed hoặc Finished
        const status = getServiceStatus(item);
        if (status === "Completed" || status === "Finished") {
          navigation.navigate("CheckupResultDetail", {
            serviceId: item.id,
            serviceName: item.serviceName,
            serviceCode: item.serviceCode,
            isVitalSign: true, // Đánh dấu đây là kết quả đo sinh hiệu
          });
        } else {
          Alert.alert("Thông báo", "Dịch vụ này chưa có kết quả để xem");
        }
        return;
      }

      // Xử lý các dịch vụ khác
      const status = getServiceStatus(item);

      if (status === "Completed" || status === "Finished") {
        navigation.navigate("CheckupResultDetail", {
          serviceId: item.id,
          serviceName: item.serviceName,
          serviceCode: item.serviceCode,
        });
      } else {
        Alert.alert("Thông báo", "Dịch vụ này chưa có kết quả để xem");
      }
    } catch (error) {
      console.error("Lỗi khi xử lý sự kiện nhấn:", JSON.stringify(error));
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi xử lý yêu cầu: " + error.message);
    }
  };

  const renderServiceItem = ({ item, index }) => {
    // Console.log để debug cho mỗi item được render

    const status = getServiceStatus(item);

    const statusColor = getStatusColor(status, item.serviceName);
    const statusText = getStatusText(status, item.serviceName);
    const statusIcon = getStatusIcon(status, item.serviceName);

    // Kiểm tra có thể xem kết quả không
    let canViewResults;

    // Chỉ hiển thị nút Xem kết quả khi trạng thái là Completed hoặc Finished
    if (item.serviceName === "Đo sinh hiệu") {
      canViewResults = status === "Completed" || status === "Finished";
    } else {
      // Các dịch vụ khác
      canViewResults = status === "Completed" || status === "Finished";
    }

    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => {
            console.log("Card pressed for:", item.serviceName);
            // Chỉ xử lý nhấn vào card nếu dịch vụ có trạng thái Completed
            if (canViewResults) {
              handleServicePress(item);
            } else {
              Alert.alert("Thông báo", "Dịch vụ này chưa có kết quả để xem.");
            }
          }}
          activeOpacity={0.7}
          style={{ marginVertical: 8 }}
        >
          <Card
            key={item.id}
            style={[
              styles.serviceCard,
              { borderLeftWidth: 4, borderLeftColor: statusColor },
            ]}
          >
            <View style={styles.serviceContent}>
              <View
                style={[styles.serviceNumber, { backgroundColor: statusColor }]}
              >
                <Text style={styles.serviceNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.serviceName}</Text>
                {item.roomNumber && (
                  <View style={styles.roomInfoContainer}>
                    <Text style={styles.roomLabel}>Phòng:</Text>
                    <Text style={styles.roomNumber}>{item.roomNumber}</Text>
                  </View>
                )}
              </View>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        status === "Completed" || status === "Finished"
                          ? "#e8f5e9"
                          : status === "TestDone"
                          ? "#f1f8e9"
                          : status === "Processing" || status === "Testing"
                          ? "#fbe9e7"
                          : status === "Checkin"
                          ? "#e3f2fd"
                          : status === "ProcessingResult"
                          ? "#fff3e0"
                          : item.serviceName === "Đo sinh hiệu" &&
                            status === "Pending"
                          ? "#e8eaf6" // Light indigo for waiting for vital signs
                          : "#f5f5f5",
                    },
                  ]}
                >
                  <Icon
                    name={statusIcon}
                    size={16}
                    color={statusColor}
                    style={styles.statusIcon}
                  />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {statusText}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={(event) => {
                    // Ngăn sự kiện lan sang thẻ cha
                    event.stopPropagation();
                    console.log("View button pressed for:", item.serviceName);

                    // Chỉ xử lý nhấn khi dịch vụ có trạng thái Completed
                    if (canViewResults) {
                      handleServicePress(item);
                    } else {
                      Alert.alert(
                        "Thông báo",
                        "Dịch vụ này chưa có kết quả để xem."
                      );
                    }
                  }}
                  style={{
                    marginTop: 4,
                    backgroundColor: canViewResults ? "#e8f5e9" : "#f5f5f5",
                    padding: 8,
                    borderRadius: 8,
                    alignItems: "center",
                    flexDirection: "row",
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 1,
                    display: canViewResults ? "flex" : "none", // Chỉ hiển thị khi trạng thái là Completed hoặc Finished
                  }}
                >
                  <Icon
                    name="chevron-forward"
                    size={16}
                    color={statusColor}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      color: statusColor,
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    Xem kết quả
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </View>
    );
  };

  const setupAutoRefresh = useCallback(() => {
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
    }
    // Use a more battery-friendly 3-second interval instead of 1 second
    autoRefreshIntervalRef.current = setInterval(() => {
      fetchServices();
    }, 1000);
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [fetchServices]);

  // Thêm hàm kiểm tra điều hướng để gỡ lỗi
  const testNavigation = () => {
    console.log("Test navigation called...");
    try {
      navigation.navigate("CheckupResultDetail", {
        serviceId: "test-id",
        serviceName: "Test Service",
        serviceCode: "TEST123",
      });
      console.log("Navigation attempted successfully");
    } catch (err) {
      console.error("Navigation error:", err);
      Alert.alert(
        "Lỗi điều hướng",
        "Không thể chuyển đến màn hình kết quả: " + err.message
      );
    }
  };

  const renderCustomHeader = () => (
    <View style={styles.customHeader}>
      <TouchableOpacity
        style={styles.headerBackButton}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Quay lại"
        accessibilityRole="button"
        accessibilityHint="Quay lại màn hình trước đó"
      >
        <Icon name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Chi tiết phiếu khám</Text>
      <TouchableOpacity
        onPress={testNavigation}
        style={styles.headerRightPlaceholder}
      >
        <Icon name="bug-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer
      scrollable={false}
      style={{ padding: 0 }}
      header={renderCustomHeader()}
      headerBackgroundColor="#4299e1"
      hasBottomTabs={true} // Enable bottom tab safe area handling
    >
      <View style={styles.container}>
        <Card style={styles.headerCard}>
          <View style={styles.patientInfoSection}>
            <View style={styles.patientHeader}>
              <Text style={styles.patientNameLabel}>Người khám:</Text>
              <Text style={styles.patientName}>{patientName}</Text>
            </View>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Mã phiếu:</Text>
                <Text style={styles.infoValue}>{checkupCode}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ngày khám:</Text>
                <Text style={styles.infoValue}>{formatDate(bookingDate)}</Text>
              </View>
            </View>
          </View>
        </Card>

        {services.length === 0 ? (
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#4299e1" />
            ) : (
              <Text style={styles.emptyText}>
                Không có dịch vụ xét nghiệm nào
              </Text>
            )}
          </View>
        ) : (
          <FlatList
            data={services}
            renderItem={renderServiceItem}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.serviceList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4299e1"
                colors={["#4299e1"]}
              />
            }
            style={{ marginBottom: 0 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerCard: {
    padding: 0,
    borderRadius: 12,
    overflow: "hidden",
    borderLeftWidth: 4,
    borderLeftColor: "#4299e1",
    elevation: 2,
    marginHorizontal: 12,
    marginTop: 12,
  },
  patientInfoSection: {
    padding: 16,
  },
  patientHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  patientNameLabel: {
    fontSize: 15,
    color: "#666",
    marginRight: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 15,
    color: "#666",
    marginRight: 4,
  },
  infoValue: {
    fontSize: 15,
    color: "#1976d2",
    fontWeight: "500",
  },
  serviceList: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  serviceCard: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  serviceNumberText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  serviceInfo: {
    flex: 1,
    paddingRight: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  roomInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomLabel: {
    fontSize: 13,
    color: "#555",
    marginRight: 4,
  },
  roomNumber: {
    fontSize: 14,
    color: "#1976d2",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  viewResultIcon: {
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    margin: 12,
    marginBottom: 20, // Giảm margin để tránh khoảng trống lớn ở dưới
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4299e1",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  headerRightPlaceholder: {
    width: 40,
  },
});

export default CheckupStepsScreen;
