import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../../components/common/ScreenContainer";
import { getPatientAppointments } from "../../services/appointmentService";

const ExaminationRecordsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("paid");
  const [appointments, setAppointments] = useState({
    paid: [],
    booked: [],
    completed: [],
    canceled: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch appointments when component mounts or refreshes
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Use focus effect to refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchAppointments();
      return () => {};
    }, [])
  );

  const fetchAppointments = async () => {
    setIsLoading(true);
    setRefreshing(true);
    try {
      // Fetch appointments with different statuses
      const paidResponse = await getPatientAppointments("Paid");
      const bookedResponse = await getPatientAppointments("Booked");
      const completedResponse = await getPatientAppointments("Completed");
      // const canceledResponse = await getPatientAppointments("Canceled");

      // Xử lý dữ liệu Paid
      if (paidResponse?.isSuccess && Array.isArray(paidResponse.value)) {
        const paidAppointments = paidResponse.value.flatMap(
          (item) => item.patientAppointments || []
        );
        setAppointments((prev) => ({
          ...prev,
          paid: paidAppointments || [],
        }));
      }

      // Xử lý dữ liệu Booked
      if (bookedResponse?.isSuccess && Array.isArray(bookedResponse.value)) {
        const bookedAppointments = bookedResponse.value.flatMap(
          (item) => item.patientAppointments || []
        );
        setAppointments((prev) => ({
          ...prev,
          booked: bookedAppointments || [],
        }));
      }

      // Xử lý dữ liệu Completed (VitalsDone)
      if (
        completedResponse?.isSuccess &&
        Array.isArray(completedResponse.value)
      ) {
        const completedAppointments = completedResponse.value.flatMap(
          (item) => item.patientAppointments || []
        );
        setAppointments((prev) => ({
          ...prev,
          completed: completedAppointments || [],
        }));
      }

      // Xử lý dữ liệu Canceled
      // if (
      //   canceledResponse?.isSuccess &&
      //   Array.isArray(canceledResponse.value)
      // ) {
      //   const canceledAppointments = canceledResponse.value.flatMap(
      //     (item) => item.patientAppointments || []
      //   );
      //   setAppointments((prev) => ({
      //     ...prev,
      //     canceled: canceledAppointments || [],
      //   }));
      // }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      if (error.response) {
        // Hiển thị thông tin lỗi chi tiết từ response
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // Lỗi không có response
        console.error("Error request:", error.request);
      } else {
        // Lỗi khác
        console.error("Error message:", error.message);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchAppointments();
  };

  const handleAppointmentPress = (appointment) => {
    navigation.navigate("AppointmentDetail", {
      appointmentCode: appointment.code,
      status: appointment.checkupRecordStatus,
    });
  console.log("Appointment data:", appointment);
  };

  

  const renderAppointmentItem = ({ item }) => {
    const date = item.bookingDate ? new Date(item.bookingDate) : null;
    const formattedDate = date
      ? `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`
      : "Không có ngày";

    return (
      <TouchableOpacity
        style={styles.appointmentCard}
        onPress={() => handleAppointmentPress(item)}
      >
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentDate}>{formattedDate}</Text>
          <View
            style={[
              styles.statusContainer,
              item.checkupRecordStatus === "Paid"
                ? styles.paidStatus
                : item.checkupRecordStatus === "Booked"
                ? styles.bookedStatus
                : item.checkupRecordStatus === "VitalsDone"
                ? styles.completedStatus
                : styles.canceledStatus,
            ]}
          >
            <Icon
              name={
                item.checkupRecordStatus === "Canceled"
                  ? "close-circle"
                  : item.checkupRecordStatus === "Booked"
                  ? "time"
                  : "checkmark-circle"
              }
              size={16}
              color={
                item.checkupRecordStatus === "Paid"
                  ? "#4CAF50"
                  : item.checkupRecordStatus === "Booked"
                  ? "#FF9800"
                  : item.checkupRecordStatus === "VitalsDone"
                  ? "#2196F3"
                  : "#F44336"
              }
            />
            <Text
              style={[
                styles.statusText,
                item.checkupRecordStatus === "Paid"
                  ? styles.paidText
                  : item.checkupRecordStatus === "Booked"
                  ? styles.bookedText
                  : item.checkupRecordStatus === "VitalsDone"
                  ? styles.completedText
                  : styles.canceledText,
              ]}
            >
              {item.checkupRecordStatus === "Paid"
                ? "Đã thanh toán"
                : item.checkupRecordStatus === "Booked"
                ? "Chưa thanh toán"
                : item.checkupRecordStatus === "VitalsDone"
                ? "Đã khám"
                : "Đã hủy"}
            </Text>
          </View>
        </View>
        <View style={styles.appointmentDivider} />
        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Icon name="medical" size={20} color="#4299e1" />
            <Text
              style={styles.detailText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.packageName || "Không có thông tin gói khám"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="barcode" size={20} color="#4299e1" />
            <Text style={styles.detailText}>
              Mã phiếu: {item.code || "Không có mã"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer
      scrollable={false}
      style={{ padding: 0 }}
      title="Danh sách phiếu khám"
      headerBackgroundColor="#4299e1"
    >
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContent}
          >
            <TouchableOpacity
              style={[styles.tab, activeTab === "paid" && styles.activeTab]}
              onPress={() => setActiveTab("paid")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "paid" && styles.activeTabText,
                ]}
              >
                Đã thanh toán
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "booked" && styles.activeTab]}
              onPress={() => setActiveTab("booked")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "booked" && styles.activeTabText,
                ]}
              >
                Chưa thanh toán
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "completed" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("completed")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "completed" && styles.activeTabText,
                ]}
              >
                Đã khám
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "canceled" && styles.activeTab]}
              onPress={() => setActiveTab("canceled")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "canceled" && styles.activeTabText,
                ]}
              >
                Đã hủy
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <FlatList
          data={
            activeTab === "paid"
              ? appointments.paid
              : activeTab === "booked"
              ? appointments.booked
              : activeTab === "completed"
              ? appointments.completed
              : appointments.canceled
          }
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          renderItem={renderAppointmentItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          style={{ width: "100%" }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="document-text-outline" size={80} color="#e0e0e0" />
              <Text style={styles.emptyText}>Bạn chưa có phiếu khám nào</Text>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    width: "100%",
    padding: 0,
    margin: 0,
  },
  tabContainer: {
    backgroundColor: "#fff",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tabScrollContent: {
    flexDirection: "row",
    paddingHorizontal: 5,
  },
  tab: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    alignItems: "center",
    marginHorizontal: 5,
  },
  activeTab: {
    borderBottomColor: "#4299e1",
  },
  tabText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  activeTabText: {
    color: "#4299e1",
    fontWeight: "600",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 80, // Extra padding at the bottom to ensure all items are visible
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  paidStatus: {
    backgroundColor: "#e8f5e9",
  },
  bookedStatus: {
    backgroundColor: "#fff3e0",
  },
  completedStatus: {
    backgroundColor: "#e3f2fd",
  },
  canceledStatus: {
    backgroundColor: "#ffebee",
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  paidText: {
    color: "#4CAF50",
  },
  bookedText: {
    color: "#FF9800",
  },
  completedText: {
    color: "#2196F3",
  },
  canceledText: {
    color: "#F44336",
  },
  appointmentDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginBottom: 12,
  },
  appointmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});

export default ExaminationRecordsScreen;
