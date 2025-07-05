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
          if (a.serviceName === "Đo sinh hiệu") return -1;
          if (b.serviceName === "Đo sinh hiệu") return 1;
          return 0;
        });
        setServices(sortedServices);
      } else {
        console.warn("Failed to fetch services or empty response", response);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  }, [checkupCode]);

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

  const updateServiceStatus = useCallback((statusUpdate) => {
    setServices((prevServices) =>
      prevServices.map((service) => {
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
      })
    );
  }, []);

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
  const getStatusColor = (status) => {
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

  const getStatusText = (status) => {
    switch (status) {
      case "Completed":
        return "Đã hoàn thành";
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
      case "Finished":
        return "checkmark-circle";
      case "Checkin":
        return "time";
      case "Processing":
      case "Testing":
        return "testing";
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

  const renderServiceItem = ({ item, index }) => {
    const status = getServiceStatus(item);
    const statusColor = getStatusColor(status);
    const statusText = getStatusText(status);
    const statusIcon = getStatusIcon(status);

    return (
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
          </View>
        </View>
      </Card>
    );
  };

  const setupAutoRefresh = useCallback(() => {
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
    }
    autoRefreshIntervalRef.current = setInterval(() => {
      fetchServices();
    }, 1000);
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [fetchServices]);

  const renderCustomHeader = () => (
    <View style={styles.customHeader}>
      <TouchableOpacity
        style={styles.headerBackButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Chi tiết phiếu khám</Text>
      <View style={styles.headerRightPlaceholder} />
    </View>
  );

  return (
    <ScreenContainer
      scrollable={false}
      style={{ padding: 0 }}
      header={renderCustomHeader()}
      headerBackgroundColor="#4299e1"
    >
      <View style={styles.container}>
        <Card style={styles.headerCard}>
          <View style={styles.patientInfoSection}>
            <View style={styles.patientHeader}>
              <Text style={styles.patientNameLabel}>Bệnh nhân:</Text>
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
            <Text style={styles.emptyText}>
              Không có dịch vụ xét nghiệm nào
            </Text>
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
              />
            }
            style={{ marginBottom: 0 }} // Ensure the FlatList doesn't overflow
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
    marginBottom: 12,
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
    paddingBottom: 80, // Added extra padding at the bottom to account for the bottom tab navigation
  },
  serviceCard: {
    marginVertical: 8,
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
  emptyContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    margin: 12,
    marginBottom: 80, // Added extra margin at the bottom to account for the bottom tab navigation
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
