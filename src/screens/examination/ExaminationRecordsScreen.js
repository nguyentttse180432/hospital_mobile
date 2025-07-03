// ExaminationRecordsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "../../components/common/ScreenContainer";
import {
  getPatientAppointments,
  getDateInMultipleFormats,
} from "../../services/appointmentService";

const ExaminationRecordsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("today");
  const [appointments, setAppointments] = useState({
    today: [],
    paid: [],
    booked: [],
    completed: [],
    inProgress: [], // Added to track in-progress appointments
    // canceled: [], // Commented until backend supports Canceled status
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
      // Lấy ngày hiện tại định dạng YYYY-MM-DD theo múi giờ địa phương (+07)
      const today = new Date();
      const todayFormatted = today
        .toLocaleDateString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-"); // Định dạng thành yyyy-mm-dd (ví dụ: 2025-07-04)

      // Fetch today's appointments directly from API using the date parameter
      const todayResponse = await getPatientAppointments(null, todayFormatted);

      // Fetch appointments with different statuses
      const paidResponse = await getPatientAppointments("Paid");
      const bookedResponse = await getPatientAppointments("Booked");
      const completedResponse = await getPatientAppointments("Completed");

      // Fetch appointments for in-progress stages
      const vitalsResponse = await getPatientAppointments("VitalsDone");
      const vitalSignTestingResponse = await getPatientAppointments(
        "VitalSignTesting"
      );
      const waitingResponse = await getPatientAppointments("Waiting");
      const inCheckupResponse = await getPatientAppointments("InCheckup");
      const testRequestedResponse = await getPatientAppointments(
        "TestRequested"
      );
      const testDoneResponse = await getPatientAppointments("TestDone");
      const testingResponse = await getPatientAppointments("Testing");
      // const canceledResponse = await getPatientAppointments('Canceled'); // Commented until backend supports Canceled status

      // Xử lý dữ liệu Today - lấy trực tiếp từ API
      if (todayResponse?.isSuccess && Array.isArray(todayResponse.value)) {
        const todayAppointments = todayResponse.value.flatMap(
          (item) => item?.patientAppointments || []
        );
        // Log the appointment dates to verify they match today's date
        if (todayAppointments.length > 0) {

          // Verify each appointment date against today's date for debugging
          const todayString = today
            .toLocaleDateString("en-CA", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\//g, "-");
          todayAppointments.forEach((apt, index) => {
            if (apt.bookingDate) {
              const aptDate = new Date(apt.bookingDate)
                .toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })
                .replace(/\//g, "-");
              if (aptDate !== todayString) {
                console.warn(
                  `Appointment ${index} (${apt.code}) has date ${aptDate}, expected ${todayString}`
                );
              }
            } else {
              console.warn(`Appointment ${index} has no bookingDate`);
            }
          });
        } else {
          console.log("No appointments found for today");
        }

        setAppointments((prev) => ({
          ...prev,
          today: todayAppointments || [],
        }));
      }

      // Xử lý dữ liệu Paid
      if (paidResponse?.isSuccess && Array.isArray(paidResponse.value)) {
        const paidAppointments = paidResponse.value.flatMap(
          (item) => item?.patientAppointments || []
        );
        setAppointments((prev) => ({
          ...prev,
          paid: paidAppointments || [],
        }));
      }

      // Xử lý dữ liệu Booked
      if (bookedResponse?.isSuccess && Array.isArray(bookedResponse.value)) {
        const bookedAppointments = bookedResponse.value.flatMap(
          (item) => item?.patientAppointments || []
        );
        setAppointments((prev) => ({
          ...prev,
          booked: bookedAppointments || [],
        }));
      }

      // Xử lý dữ liệu Completed (đã khám)
      if (
        completedResponse?.isSuccess &&
        Array.isArray(completedResponse.value)
      ) {
        const completedAppointments = completedResponse.value.flatMap(
          (item) => item?.patientAppointments || []
        );
        setAppointments((prev) => ({
          ...prev,
          completed: completedAppointments || [],
        }));
      }

      // Process in-progress appointments (combine all in-progress statuses)
      let allInProgressAppointments = [];

      // Process VitalsDone and VitalSignTesting
      if (vitalsResponse?.isSuccess && Array.isArray(vitalsResponse.value)) {
        const vitalsAppointments = vitalsResponse.value.flatMap(
          (item) => item?.patientAppointments || []
        );
        allInProgressAppointments = [
          ...allInProgressAppointments,
          ...vitalsAppointments,
        ];
      }

      // Process Waiting
      if (waitingResponse?.isSuccess && Array.isArray(waitingResponse.value)) {
        const waitingAppointments = waitingResponse.value.flatMap(
          (item) => item?.patientAppointments || []
        );
        allInProgressAppointments = [
          ...allInProgressAppointments,
          ...waitingAppointments,
        ];
      }

      // Process InCheckup
      if (
        inCheckupResponse?.isSuccess &&
        Array.isArray(inCheckupResponse.value)
      ) {
        const inCheckupAppointments = inCheckupResponse.value.flatMap(
          (item) => item?.patientAppointments || []
        );
        allInProgressAppointments = [
          ...allInProgressAppointments,
          ...inCheckupAppointments,
        ];
      }

      // Process TestRequested, Testing, TestDone
      if (testingResponse?.isSuccess && Array.isArray(testingResponse.value)) {
        const testingAppointments = testingResponse.value.flatMap(
          (item) => item?.patientAppointments || []
        );
        allInProgressAppointments = [
          ...allInProgressAppointments,
          ...testingAppointments,
        ];
      }
      setAppointments((prev) => ({
        ...prev,
        inProgress: allInProgressAppointments || [],
      }));

      // Xử lý dữ liệu Canceled
      // if (canceledResponse?.isSuccess && Array.isArray(canceledResponse.value)) {
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
    console.log("Appointment pressed:", appointment);

    // For today's tab
    if (activeTab === "today") {
      // Kiểm tra nếu trạng thái là "Booked" (chưa thanh toán)
      if (appointment.checkupRecordStatus === "Booked") {
        // Hiển thị thông báo yêu cầu thanh toán trước
        Alert.alert(
          "Thông báo",
          "Bạn cần thanh toán phiếu khám này trước khi có thể theo dõi quá trình khám.",
          [
            {
              text: "OK",
            },
            { text: "Hủy", style: "cancel" },
          ]
        );
      } else {
        // Nếu đã thanh toán, cho phép truy cập CheckupSteps
        navigation.navigate("CheckupSteps", {
          checkupCode: appointment.code,
          patientName: appointment.patientName || "Bệnh nhân",
          bookingDate: appointment.bookingDate,
        });
      }
      console.log("Today Appointment data:", appointment);
    } else {
      // For other tabs, continue with normal behavior
      navigation.navigate("AppointmentDetail", {
        appointmentCode: appointment.code,
        status: appointment.checkupRecordStatus,
      });
      console.log("Appointment data:", appointment);
    }
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
                : item.checkupRecordStatus === "Completed"
                ? styles.completedStatus
                : item.checkupRecordStatus === "VitalsDone" ||
                  item.checkupRecordStatus === "VitalSignTesting"
                ? styles.vitalsStatus
                : item.checkupRecordStatus === "Waiting"
                ? styles.waitingStatus
                : item.checkupRecordStatus === "InCheckup"
                ? styles.inCheckupStatus
                : item.checkupRecordStatus === "TestRequested" ||
                  item.checkupRecordStatus === "Testing" ||
                  item.checkupRecordStatus === "TestDone"
                ? styles.testingStatus
                : styles.canceledStatus,
            ]}
          >
            <Icon
              name={
                item.checkupRecordStatus === "Canceled"
                  ? "close-circle"
                  : item.checkupRecordStatus === "Booked"
                  ? "time"
                  : item.checkupRecordStatus === "Paid"
                  ? "card"
                  : item.checkupRecordStatus === "VitalsDone" ||
                    item.checkupRecordStatus === "VitalSignTesting"
                  ? "pulse"
                  : item.checkupRecordStatus === "Waiting"
                  ? "people"
                  : item.checkupRecordStatus === "InCheckup"
                  ? "medkit"
                  : item.checkupRecordStatus === "TestRequested" ||
                    item.checkupRecordStatus === "Testing" ||
                    item.checkupRecordStatus === "TestDone"
                  ? "flask"
                  : item.checkupRecordStatus === "Completed"
                  ? "checkmark-circle"
                  : "help-circle"
              }
              size={16}
              color={
                item.checkupRecordStatus === "Paid"
                  ? "#4CAF50"
                  : item.checkupRecordStatus === "Booked"
                  ? "#FF9800"
                  : item.checkupRecordStatus === "VitalsDone" ||
                    item.checkupRecordStatus === "VitalSignTesting"
                  ? "#9C27B0"
                  : item.checkupRecordStatus === "Waiting"
                  ? "#00BCD4"
                  : item.checkupRecordStatus === "InCheckup"
                  ? "#673AB7"
                  : item.checkupRecordStatus === "TestRequested" ||
                    item.checkupRecordStatus === "Testing" ||
                    item.checkupRecordStatus === "TestDone"
                  ? "#FF5722"
                  : item.checkupRecordStatus === "Completed"
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
                  : item.checkupRecordStatus === "Completed"
                  ? styles.completedText
                  : item.checkupRecordStatus === "VitalsDone" ||
                    item.checkupRecordStatus === "VitalSignTesting"
                  ? styles.vitalsText
                  : item.checkupRecordStatus === "Waiting"
                  ? styles.waitingText
                  : item.checkupRecordStatus === "InCheckup"
                  ? styles.inCheckupText
                  : item.checkupRecordStatus === "TestRequested" ||
                    item.checkupRecordStatus === "Testing" ||
                    item.checkupRecordStatus === "TestDone"
                  ? styles.testingText
                  : styles.canceledText,
              ]}
            >
              {item.checkupRecordStatus === "Paid"
                ? "Đã thanh toán"
                : item.checkupRecordStatus === "Booked"
                ? "Chưa thanh toán"
                : item.checkupRecordStatus === "Completed"
                ? "Đã khám xong"
                : item.checkupRecordStatus === "VitalsDone"
                ? "Đã đo sinh hiệu"
                : item.checkupRecordStatus === "VitalSignTesting"
                ? "Đang đo sinh hiệu"
                : item.checkupRecordStatus === "Waiting"
                ? "Đang chờ khám"
                : item.checkupRecordStatus === "InCheckup"
                ? "Đang khám"
                : item.checkupRecordStatus === "TestRequested"
                ? "Yêu cầu xét nghiệm"
                : item.checkupRecordStatus === "Testing"
                ? "Đang xét nghiệm"
                : item.checkupRecordStatus === "TestDone"
                ? "Đã xét nghiệm"
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
              style={[styles.tab, activeTab === "today" && styles.activeTab]}
              onPress={() => setActiveTab("today")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "today" && styles.activeTabText,
                ]}
              >
                Hôm nay
              </Text>
            </TouchableOpacity>

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
              style={[
                styles.tab,
                activeTab === "inProgress" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("inProgress")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "inProgress" && styles.activeTabText,
                ]}
              >
                Đang xử lý
              </Text>
            </TouchableOpacity>

            {/* Commented out until backend supports Canceled status
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
            */}
          </ScrollView>
        </View>

    
        <FlatList
          data={
            activeTab === "today"
              ? appointments.today
              : activeTab === "paid"
              ? appointments.paid
              : activeTab === "booked"
              ? appointments.booked
              : activeTab === "completed"
              ? appointments.completed
              : activeTab === "inProgress"
              ? appointments.inProgress
              : [] // Return empty array for "canceled" since it's not supported yet
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
              <Text style={styles.emptyText}>
                {activeTab === "today"
                  ? `Không có phiếu khám nào cho hôm nay (${new Date()
                      .toLocaleDateString("en-CA", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                      .replace(/\//g, "-")})`
                  : activeTab === "paid"
                  ? "Không có phiếu khám đã thanh toán"
                  : activeTab === "booked"
                  ? "Không có phiếu khám chưa thanh toán"
                  : activeTab === "completed"
                  ? "Không có phiếu khám đã hoàn thành"
                  : activeTab === "inProgress"
                  ? "Không có phiếu khám nào đang xử lý"
                  : "Bạn chưa có phiếu khám nào"}
              </Text>
              {activeTab === "today" && (
                <Text style={styles.emptySubText}>
                  Ngày tìm kiếm:{" "}
                  {new Date()
                    .toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                    .replace(/\//g, "-")}
                </Text>
              )}
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
  vitalsStatus: {
    backgroundColor: "#f3e5f5", // Light purple for vitals
  },
  waitingStatus: {
    backgroundColor: "#e0f7fa", // Light cyan for waiting
  },
  inCheckupStatus: {
    backgroundColor: "#ede7f6", // Light deep purple for in checkup
  },
  testingStatus: {
    backgroundColor: "#fbe9e7", // Light deep orange for testing stages
  },
  canceledStatus: {
    backgroundColor: "#ffebee", // Kept for future use when backend supports Canceled status
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
  vitalsText: {
    color: "#9C27B0", // Purple for vitals
  },
  waitingText: {
    color: "#00BCD4", // Cyan for waiting
  },
  inCheckupText: {
    color: "#673AB7", // Deep purple for in checkup
  },
  testingText: {
    color: "#FF5722", // Deep orange for testing stages
  },
  canceledText: {
    color: "#F44336", // Kept for future use when backend supports Canceled status
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
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  debugContainer: {
    backgroundColor: "#f0f8ff", // Light blue background
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  debugText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
  refreshButton: {
    backgroundColor: "#4299e1",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: "auto",
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default ExaminationRecordsScreen;
