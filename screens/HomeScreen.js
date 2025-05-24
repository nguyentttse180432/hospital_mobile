import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import ScreenContainer from "../components/ScreenContainer";

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userProfileJson = await AsyncStorage.getItem("userProfile");
        if (userProfileJson) {
          setUserData(JSON.parse(userProfileJson));
        }
        setLoading(false);
      } catch (error) {
        console.error("Không thể tải dữ liệu người dùng", error);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Lỗi khi đăng xuất", error);
    }
  };

  const upcomingAppointments = [
    {
      id: "1",
      doctor: "Dr. Sarah Johnson",
      specialty: "Bác sĩ chuyên khoa Tim mạch",
      date: new Date("2025-05-25").toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }),
      time: "10:30",
      location: "Tòa nhà chính, Tầng 3",
    },
    {
      id: "2",
      doctor: "Dr. Michael Chen",
      specialty: "Bác sĩ chuyên khoa Thần kinh",
      date: new Date("2025-06-03").toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }),
      time: "14:15",
      location: "Cánh Đông, Tầng 2",
    },
  ];

  const quickActions = [
    {
      id: "1",
      icon: "calendar",
      title: "Đặt lịch hẹn",
      screen: "BookAppointment",
    },
    {
      id: "2",
      icon: "medkit",
      title: "Thuốc của tôi",
      screen: "Medications",
    },
    {
      id: "3",
      icon: "document-text",
      title: "Kết quả xét nghiệm",
      screen: "TestResults",
    },
    // {
    //   id: "4",
    //   icon: "chatbubbles",
    //   title: "Nhắn tin bác sĩ",
    //   screen: "Messages",
    // },
  ];

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {/* <Image
            source={
              userData?.profileImage
                ? { uri: userData.profileImage }
                : require("../../assets/default-avatar.png")
            }
            style={styles.avatar}
          /> */}
          <View style={styles.nameContainer}>
            <Text style={styles.welcome}>Chào mừng trở lại,</Text>
            <Text style={styles.userName}>
              {userData?.firstName || "Thao Nguyen"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <Icon name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch hẹn sắp tới</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllAppointments")}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length > 0 ? (
            <FlatList
              data={upcomingAppointments}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.appointmentCard}
                  onPress={() =>
                    navigation.navigate("AppointmentDetails", { id: item.id })
                  }
                >
                  <View style={styles.appointmentHeader}>
                    <Text style={styles.doctorName}>{item.doctor}</Text>
                    <Text style={styles.specialty}>{item.specialty}</Text>
                  </View>
                  <View style={styles.appointmentInfo}>
                    <View style={styles.infoRow}>
                      <Icon name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>{item.date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="time-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>{item.time}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Icon name="location-outline" size={16} color="#666" />
                      <Text style={styles.infoText}>{item.location}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.noAppointments}>
              <Text style={styles.noAppointmentsText}>
                Không có lịch hẹn sắp tới
              </Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => navigation.navigate("BookAppointment")}
              >
                <Text style={styles.bookButtonText}>Đặt ngay</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Hành động nhanh</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View style={styles.actionIconContainer}>
                  <Icon name={action.icon} size={28} color="#1e88e5" />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.healthStatsSection}>
          <Text style={styles.sectionTitle}>Sức khỏe của tôi</Text>
          <TouchableOpacity
            style={styles.healthCard}
            onPress={() => navigation.navigate("HealthDetails")}
          >
            <View style={styles.healthCardContent}>
              <View style={styles.vitalSign}>
                <Icon name="heart" size={24} color="#e53935" />
                <View>
                  <Text style={styles.vitalValue}>78 nhịp/phút</Text>
                  <Text style={styles.vitalLabel}>Nhịp tim</Text>
                </View>
              </View>

              <View style={styles.vitalDivider} />

              <View style={styles.vitalSign}>
                <Icon name="water" size={24} color="#1e88e5" />
                <View>
                  <Text style={styles.vitalValue}>120/80</Text>
                  <Text style={styles.vitalLabel}>Huyết áp</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Icon name="home" size={26} color="#1e88e5" />
          <Text style={[styles.navText, styles.activeNavText]}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("BookAppointment")}
        >
          <Icon name="calendar-outline" size={24} color="#757575" />
          <Text style={styles.navText}>Lịch hẹn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Messages")}
        >
          <Icon name="chatbubbles-outline" size={24} color="#757575" />
          <Text style={styles.navText}>Tin nhắn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <Icon name="person-outline" size={24} color="#757575" />
          <Text style={styles.navText}>Hồ sơ</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  nameContainer: {
    justifyContent: "center",
  },
  welcome: {
    fontSize: 14,
    color: "#757575",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  appointmentsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  seeAllText: {
    color: "#1e88e5",
    fontSize: 14,
    fontWeight: "500",
  },
  appointmentCard: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  appointmentHeader: {
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  specialty: {
    fontSize: 14,
    color: "#757575",
  },
  appointmentInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    color: "#666",
    fontSize: 14,
  },
  noAppointments: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  noAppointmentsText: {
    color: "#757575",
    fontSize: 16,
    marginBottom: 16,
  },
  bookButton: {
    backgroundColor: "#1e88e5",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  healthStatsSection: {
    marginBottom: 80, // Add space for bottom navigation
  },
  healthCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  healthCardContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  vitalSign: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  vitalLabel: {
    fontSize: 14,
    color: "#757575",
  },
  vitalDivider: {
    height: "70%",
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 8,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  activeNavText: {
    color: "#1e88e5",
    fontWeight: "500",
  },
});

export default HomeScreen;
