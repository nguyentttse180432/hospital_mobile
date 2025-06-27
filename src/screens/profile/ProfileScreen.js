import { useState, useEffect } from "react";
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
import { useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { getPatientAppointments } from "../../services/appointmentService";
import Button from "../../components/common/Button";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [userProfile, setUserProfile] = useState(null);
  const [appointments, setAppointments] = useState({
    upcoming: [],
    completed: [],
  });
  const [activeTab, setActiveTab] = useState("today");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
    fetchAppointments();
  }, []);

  // Effect to refresh appointments when feedback is completed
  useEffect(() => {
    if (route.params?.feedbackCompleted) {
      // Clear the parameter so it doesn't trigger again on other navigation events
      navigation.setParams({ feedbackCompleted: undefined });
      // Refresh appointments
      fetchAppointments();
    }
  }, [route.params?.feedbackCompleted]);
  const loadUserProfile = async () => {
    try {
      // Lấy dữ liệu từ AsyncStorage
      const userDataString = await AsyncStorage.getItem("user");

      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserProfile(userData);
      } else {
        console.warn("No user data found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      // Lấy ID người dùng từ userProfile hoặc từ AsyncStorage
      let patientId;

      if (userProfile && userProfile.id) {
        patientId = userProfile.id;
      } else {
        const userDataString = await AsyncStorage.getItem("user");
        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString);
            patientId = userData.id;
          } catch (e) {
            console.warn("Error parsing user data from storage:", e);
          }
        }
      }

      if (!patientId) {
        console.warn("No patient ID available, cannot fetch appointments");
        setIsLoading(false);
        return;
      }

      // Fetch regular appointments (will be filtered for upcoming ones)
      const regularResponse = await getPatientAppointments();

      // Fetch completed appointments
      const completedResponse = await getPatientAppointments("Completed");
      // Validate regular appointments response
      if (
        !regularResponse ||
        !regularResponse.value ||
        !Array.isArray(regularResponse.value.items)
      ) {
        console.warn(
          "Unexpected response format for regular appointments:",
          regularResponse
        );
        setIsLoading(false);
        return;
      }

      // Validate completed appointments response
      if (
        !completedResponse ||
        !completedResponse.value ||
        !Array.isArray(completedResponse.value.items)
      ) {
        console.warn(
          "Unexpected response format for completed appointments:",
          completedResponse
        );
        setIsLoading(false);
        return;
      }

      const regularAppointments = regularResponse.value.items;
      const completedAppointments = completedResponse.value.items;
      // Filter regular appointments to get only upcoming ones
      const currentDate = new Date();
      const upcoming = regularAppointments.filter((appt) => {
        if (!appt || !appt.bookingDate) return false;
        try {
          const apptDate = new Date(appt.bookingDate);
          return apptDate > currentDate;
        } catch (e) {
          console.warn("Error processing appointment date:", e, appt);
          return false;
        }
      });
      setAppointments({
        upcoming,
        completed: completedAppointments,
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải thông tin lịch hẹn. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        onPress: async () => {
          try {
            // Xóa dữ liệu người dùng từ AsyncStorage
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("userData");
            await AsyncStorage.removeItem("authToken");

            // Chuyển đến màn hình đăng nhập
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  const handleFeedback = (appointment) => {
    // Check if the appointment has any feedback IDs
    const hasDoctorFeedback = appointment.feedbackDoctorId !== null;
    const hasServiceFeedback = appointment.feedbackId !== null;
    const hasAllFeedbacks = hasDoctorFeedback && hasServiceFeedback;

    try {
      // Navigate to the feedback type selection screen with the appropriate status
      navigation.navigate("FeedbackTypeSelection", {
        appointmentCode: appointment.code || appointment.checkupRecordCode,
        feedbackStatus: {
          hasDoctorFeedback,
          hasServiceFeedback,
          hasAllFeedbacks,
          appointment,
        },
      });
    } catch (error) {
      console.error("Error checking feedback status:", error);
      Alert.alert(
        "Lỗi",
        "Không thể kiểm tra trạng thái đánh giá. Vui lòng thử lại sau."
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const getServiceName = (appointment) => {
    try {
      if (appointment.services) {
        if (
          appointment.services.packages &&
          appointment.services.packages.name
        ) {
          return appointment.services.packages.name;
        } else if (
          appointment.services.services &&
          Array.isArray(appointment.services.services) &&
          appointment.services.services.length > 0 &&
          appointment.services.services[0].name
        ) {
          return appointment.services.services[0].name;
        }
      }
      return "Dịch vụ khám";
    } catch (error) {
      console.warn("Error getting service name:", error);
      return "Dịch vụ khám";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ Sơ</Text>
      </View>

      {/* Profile Information */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchAppointments}
          />
        }
      >
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Icon name="person-circle" size={80} color="#1976d2" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile?.name || "Chưa cập nhật"}
              </Text>
              <Text style={styles.profileDetail}>
                <Icon name="call-outline" size={16} color="#555" />{" "}
                {userProfile?.phoneNumber || "Chưa cập nhật"}
              </Text>
              <Text style={styles.profileDetail}>
                <Icon name="mail-outline" size={16} color="#555" />{" "}
                {userProfile?.email ||
                  userProfile?.username ||
                  "huong@gmail.com"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
            <Icon name="create-outline" size={18} color="#1976d2" />
          </TouchableOpacity>
        </View>

        {/* Tabs for Appointments */}
        <View style={styles.tabContainer}>
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
            style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "upcoming" && styles.activeTabText,
              ]}
            >
              Lịch hẹn sắp tới
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "completed" && styles.activeTab]}
            onPress={() => setActiveTab("completed")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "completed" && styles.activeTabText,
              ]}
            >
              Lịch sử khám
            </Text>
          </TouchableOpacity>
        </View>

        {/* Appointment List */}
        <View style={styles.appointmentsContainer}>
          {activeTab === "today" && (
            <View style={styles.todayContainer}>
              <View style={styles.todayCard}>
                <Text style={styles.todayTitle}>Lịch khám hôm nay</Text>
                <Text style={styles.todayDescription}>
                  Xem danh sách các cuộc hẹn khám và theo dõi tiến trình xét
                  nghiệm
                </Text>
                <TouchableOpacity
                  style={styles.todayButton}
                  onPress={() => navigation.navigate("TodayCheckup")}
                >
                  <Text style={styles.todayButtonText}>Xem chi tiết</Text>
                  <Icon name="arrow-forward" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {activeTab === "upcoming" &&
            (appointments.upcoming.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="calendar-outline" size={60} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  Bạn không có lịch hẹn sắp tới
                </Text>
                <Button
                  title="Đặt lịch khám"
                  onPress={() => navigation.navigate("Appointment")}
                  style={styles.bookButton}
                />
              </View>
            ) : (
              appointments.upcoming.map((appointment, index) => (
                <View key={index} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: "#1976d2" },
                        ]}
                      />
                      <Text style={styles.statusText}>Sắp tới</Text>
                    </View>
                    <Text style={styles.appointmentId}>
                      #{appointment.code || appointment.id}
                    </Text>
                  </View>

                  <View style={styles.appointmentDetails}>
                    <View style={styles.appointmentDetail}>
                      <Icon name="calendar-outline" size={18} color="#555" />
                      <Text style={styles.detailText}>
                        {formatDate(appointment.bookingDate)}
                      </Text>
                    </View>
                    <View style={styles.appointmentDetail}>
                      <Icon name="time-outline" size={18} color="#555" />
                      <Text style={styles.detailText}>
                        {formatTime(appointment.bookingDate)}
                      </Text>
                    </View>
                    <View style={styles.appointmentDetail}>
                      <Icon name="medkit-outline" size={18} color="#555" />
                      <Text style={styles.detailText} numberOfLines={1}>
                        {getServiceName(appointment)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() =>
                      navigation.navigate("AppointmentDetail", {
                        appointmentCode: appointment.code,
                        // Không truyền status để sử dụng mặc định
                      })
                    }
                  >
                    <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
                    <Icon name="chevron-forward" size={16} color="#1976d2" />
                  </TouchableOpacity>
                </View>
              ))
            ))}

          {activeTab === "completed" &&
            (appointments.completed.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="document-text-outline" size={60} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  Chưa có lịch sử khám bệnh
                </Text>
              </View>
            ) : (
              appointments.completed.map((appointment, index) => (
                <View key={index} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: "#4CAF50" },
                        ]}
                      />
                      <Text style={styles.statusText}>Hoàn thành</Text>
                    </View>
                    <Text style={styles.appointmentId}>
                      #{appointment.code || appointment.id}
                    </Text>
                  </View>

                  <View style={styles.appointmentDetails}>
                    <View style={styles.appointmentDetail}>
                      <Icon name="calendar-outline" size={18} color="#555" />
                      <Text style={styles.detailText}>
                        {formatDate(appointment.bookingDate)}
                      </Text>
                    </View>
                    <View style={styles.appointmentDetail}>
                      <Icon name="time-outline" size={18} color="#555" />
                      <Text style={styles.detailText}>
                        {formatTime(appointment.bookingDate)}
                      </Text>
                    </View>
                    <View style={styles.appointmentDetail}>
                      <Icon name="medkit-outline" size={18} color="#555" />
                      <Text style={styles.detailText} numberOfLines={1}>
                        {getServiceName(appointment)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.detailsButton]}
                      onPress={() =>
                        navigation.navigate("AppointmentDetail", {
                          appointmentCode: appointment.code,
                          status: "Completed", // Truyền status Completed cho lịch sử khám
                        })
                      }
                    >
                      <Text style={styles.detailsButtonText}>Xem chi tiết</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.feedbackButton]}
                      onPress={() => handleFeedback(appointment)}
                    >
                      <Text style={styles.feedbackButtonText}>
                        {appointment.feedbackId !== null ||
                        appointment.feedbackDoctorId !== null
                          ? "Xem đánh giá"
                          : "Đánh giá"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ))}
        </View>
      </ScrollView>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={20} color="#e53935" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    backgroundColor: "#1976d2",
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profileDetail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 16,
    paddingTop: 12,
  },
  editProfileText: {
    color: "#1976d2",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#1976d2",
    fontWeight: "600",
  },
  appointmentsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  appointmentId: {
    fontSize: 14,
    color: "#888",
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  appointmentDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  viewDetailsText: {
    color: "#1976d2",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  actionButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  detailsButton: {
    marginRight: 8,
    backgroundColor: "#e3f2fd",
  },
  feedbackButton: {
    backgroundColor: "#e8f5e9",
  },
  detailsButtonText: {
    color: "#1976d2",
    fontWeight: "600",
  },
  feedbackButtonText: {
    color: "#43a047",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  bookButton: {
    width: 200,
  },
  logoutButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#e53935",
  },
  todayContainer: {
    padding: 16,
  },
  todayCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  todayDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  todayButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default ProfileScreen;
