import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../../components/common/ScreenContainer";
import { getPatientAppointments } from "../../services/appointmentService";

const ExaminationRecordsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("completed");
  const [appointments, setAppointments] = useState({
    upcoming: [],
    completed: [],
    pending: [],
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
      const completedResponse = await getPatientAppointments("Completed");
      const pendingResponse = await getPatientAppointments("Pending");
      const upcomingResponse = await getPatientAppointments(); // Default fetches upcoming

      if (
        completedResponse?.isSuccess &&
        Array.isArray(completedResponse.value?.items)
      ) {
        setAppointments((prev) => ({
          ...prev,
          completed: completedResponse.value.items || [],
        }));
      }

      if (
        pendingResponse?.isSuccess &&
        Array.isArray(pendingResponse.value?.items)
      ) {
        setAppointments((prev) => ({
          ...prev,
          pending: pendingResponse.value.items || [],
        }));
      }

      if (
        upcomingResponse?.isSuccess &&
        Array.isArray(upcomingResponse.value?.items)
      ) {
        setAppointments((prev) => ({
          ...prev,
          upcoming: upcomingResponse.value.items || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
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
  };

  const renderAppointmentItem = ({ item }) => {
    const date = item.scheduledDate ? new Date(item.scheduledDate) : null;
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
          <View style={styles.statusContainer}>
            <Icon name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.statusText}>
              {item.checkupRecordStatus === "Completed"
                ? "Đã hoàn thành"
                : item.checkupRecordStatus === "Pending"
                ? "Chưa thanh toán"
                : "Đã khám"}
            </Text>
          </View>
        </View>
        <View style={styles.appointmentDivider} />
        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Icon name="person" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.doctorName || "Chưa có thông tin bác sĩ"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="medical" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.specialtyName || "Chưa có thông tin khoa"}
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
          <View style={styles.tabRow}>
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
                Đã thanh toán
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "pending" && styles.activeTab]}
              onPress={() => setActiveTab("pending")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "pending" && styles.activeTabText,
                ]}
              >
                Chưa thanh toán
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "upcoming" && styles.activeTabText,
                ]}
              >
                Đã khám
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={
            activeTab === "completed"
              ? appointments.completed
              : activeTab === "pending"
              ? appointments.pending
              : appointments.upcoming
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
  tabRow: {
    flexDirection: "row",
    width: "100%",
  },
  tab: {
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    flex: 1,
    alignItems: "center",
  },
  activeTab: {
    borderBottomColor: "#4299e1",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#4299e1",
    fontWeight: "600",
  },
  listContainer: {
    padding: 8,
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
    backgroundColor: "#e8f5e9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: "#4CAF50",
    marginLeft: 4,
    fontWeight: "500",
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
    fontSize: 14,
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
