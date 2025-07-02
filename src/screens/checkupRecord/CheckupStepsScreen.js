import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../../components/common/ScreenContainer";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import { getCheckupRecordServices } from "../../services/checkupRecordService";
import signalRConnect from "../../utils/signalR";
import { useNavigation } from "@react-navigation/native";

const CheckupStepsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { checkupCode, patientName, bookingDate } = route.params;

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const signalRConnectionRef = useRef(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await getCheckupRecordServices(checkupCode);

      if (response.isSuccess) {
        // Sắp xếp services: Đo sinh hiệu luôn đứng đầu, các service khác theo thứ tự
        const sortedServices = response.value.sort((a, b) => {
          if (a.serviceName === "Đo sinh hiệu") return -1;
          if (b.serviceName === "Đo sinh hiệu") return 1;
          return 0;
        });

        setServices(sortedServices);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const initializeSignalR = async () => {
    try {
      console.log("Initializing SignalR connection for:", checkupCode);
      const connection = await signalRConnect({ code: checkupCode });

      // Lắng nghe sự kiện cập nhật status
      connection.on("UpdateStatus", (statusUpdate) => {
        console.log("Status updated via SignalR:", statusUpdate);
        if (statusUpdate) {
          updateServiceStatus(statusUpdate);
        }
      });

      signalRConnectionRef.current = connection;
      console.log("SignalR connection established successfully");
    } catch (error) {
      console.error("SignalR connection failed:", error);
      // Không hiển thị alert để không làm phiền user
      // Vẫn có thể sử dụng pull-to-refresh để cập nhật
    }
  };

  const cleanupSignalR = useCallback(() => {
    if (signalRConnectionRef.current) {
      console.log("Cleaning up SignalR connection");
      try {
        signalRConnectionRef.current.stop();
        signalRConnectionRef.current = null;
        console.log("SignalR connection stopped successfully");
      } catch (error) {
        console.error("Error stopping SignalR connection:", error);
      }
    }
  }, []);

  const updateServiceStatus = (statusUpdate) => {
    setServices((prevServices) =>
      prevServices.map((service) => {
        // Cập nhật status dựa trên serviceCode hoặc testRecordCode
        if (
          service.serviceCode.trim() === statusUpdate.serviceCode ||
          service.testRecordCode === statusUpdate.testRecordCode
        ) {
          return {
            ...service,
            vitalSignStatus:
              statusUpdate.vitalSignStatus || service.vitalSignStatus,
            testRecordStatus:
              statusUpdate.testRecordStatus || service.testRecordStatus,
            checkupRecordStatus:
              statusUpdate.checkupRecordStatus || service.checkupRecordStatus,
          };
        }
        return service;
      })
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused - initializing SignalR");
      initializeSignalR();

      return () => {
        console.log("Screen unfocused - cleaning up SignalR");
        cleanupSignalR();
      };
    }, [cleanupSignalR])
  );

  // Add function to handle going back
  const handleGoBack = () => {
    navigation.goBack();
  };

  const getServiceStatus = (service) => {
    if (service.serviceName === "Đo sinh hiệu") {
      return service.vitalSignStatus || "Pending";
    }
    return service.testRecordStatus || service.checkupRecordStatus || "Pending";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
      case "Finished":
        return "#4CAF50";
      case "InProgress":
      case "Processing":
        return "#FF9800";
      case "Pending":
      default:
        return "#9E9E9E";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Completed":
      case "Finished":
        return "Đã có kết quả";
      case "InProgress":
      case "Processing":
        return "Đang thực hiện";
      case "Pending":
      default:
        return "Chưa có kết quả";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const renderServiceItem = (service, index) => {
    const status = getServiceStatus(service);
    const statusColor = getStatusColor(status);
    const statusText = getStatusText(status);

    return (
      <Card key={service.id} style={styles.serviceCard}>
        <View style={styles.serviceContent}>
          <View style={styles.serviceNumber}>
            <Text style={styles.serviceNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.serviceName}</Text>
            <Text style={styles.roomNumber}>{service.roomNumber}</Text>
            {service.serviceNote && (
              <Text style={styles.serviceNote}>{service.serviceNote}</Text>
            )}
          </View>
          <View style={styles.statusContainer}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenContainer scrollable={false}>
      <Header title="Danh sách xét nghiệm" onBack={handleGoBack} />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.checkupDate}>
              Ngày khám: {formatDate(bookingDate)}
            </Text>
            <Text style={styles.checkupCode}>Mã: {checkupCode}</Text>
          </View>
        </View>

        <View style={styles.sectionTitle}>
          <Text style={styles.sectionTitleText}>Chờ xét nghiệm</Text>
        </View>

        {services
          .filter((service) =>
            ["Pending", "InProgress", "Processing"].includes(
              getServiceStatus(service)
            )
          )
          .map((service, index) => renderServiceItem(service, index))}

        {services.filter((service) =>
          ["Completed", "Finished"].includes(getServiceStatus(service))
        ).length > 0 && (
          <>
            <View style={styles.sectionTitle}>
              <Text style={styles.sectionTitleText}>Đã xét nghiệm</Text>
            </View>

            {services
              .filter((service) =>
                ["Completed", "Finished"].includes(getServiceStatus(service))
              )
              .map((service, index) => renderServiceItem(service, index))}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  patientInfo: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  checkupDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  checkupCode: {
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  serviceCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 0,
  },
  serviceContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  serviceNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  serviceNumberText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  roomNumber: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  serviceNote: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default CheckupStepsScreen;
