import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userProfile = await AsyncStorage.getItem("user");

        if (userProfile) {
          setUserData(JSON.parse(userProfile));
        }
        setLoading(false);

        // Animate content in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (error) {
        console.error("Không thể tải dữ liệu người dùng", error);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("userToken");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Lỗi khi đăng xuất", error);
    }
  };

  // Enhanced Default Avatar
  const DefaultAvatar = ({ firstName }) => {
    const initials = firstName ? firstName.charAt(0).toUpperCase() : "T";
    return (
      <View style={styles.defaultAvatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const upcomingAppointments = [
    {
      id: "1",
      doctor: "Bác sĩ Nguyễn Văn An",
      specialty: "Bác sĩ chuyên khoa Tim mạch",
      date: new Date("2025-05-25").toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }),
      time: "10:30",
      location: "Tòa nhà chính, Tầng 3",
      status: "confirmed",
      avatar: "👨‍⚕️",
      color: "#4CAF50",
    },
    {
      id: "2",
      doctor: "Bác sĩ Trần Thị Bích",
      specialty: "Bác sĩ chuyên khoa Thần kinh",
      date: new Date("2025-06-03").toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }),
      time: "14:15",
      location: "Cánh Đông, Tầng 2",
      status: "pending",
      avatar: "👩‍⚕️",
      color: "#FF9800",
    },
  ];

  const quickActions = [
    {
      id: "1",
      icon: "calendar",
      title: "Đặt lịch hẹn",
      screen: "BookAppointment",
      color: "#FF6B6B",
      bgColor: "#FFE8E8",
    },
    {
      id: "2",
      icon: "medkit",
      title: "Thuốc của tôi",
      screen: "Medications",
      color: "#4ECDC4",
      bgColor: "#E8F8F7",
    },
    {
      id: "3",
      icon: "document-text",
      title: "Kết quả xét nghiệm",
      screen: "TestResults",
      color: "#45B7D1",
      bgColor: "#E8F4FD",
    },
    {
      id: "4",
      icon: "heart",
      title: "Sức khỏe của tôi",
      screen: "HealthDetails",
      color: "#9C27B0",
      bgColor: "#F3E5F5",
    },
  ];

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      default:
        return "#757575";
    }
  };

  const renderAppointmentCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.appointmentCard, { borderLeftColor: item.color }]}
      onPress={() => navigation.navigate("AppointmentDetails", { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.appointmentHeader}>
        <View style={styles.doctorInfo}>
          <View style={styles.doctorAvatarContainer}>
            <Text style={styles.doctorAvatar}>{item.avatar}</Text>
          </View>
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>{item.doctor}</Text>
            <Text style={styles.specialty}>{item.specialty}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === "confirmed" ? "Đã xác nhận" : "Chờ xác nhận"}
          </Text>
        </View>
      </View>

      <View style={styles.appointmentInfo}>
        <View style={styles.infoRow}>
          <View
            style={[
              styles.infoIconContainer,
              { backgroundColor: item.color + "15" },
            ]}
          >
            <Icon name="calendar-outline" size={16} color={item.color} />
          </View>
          <Text style={styles.infoText}>{item.date}</Text>
        </View>
        <View style={styles.infoRow}>
          <View
            style={[
              styles.infoIconContainer,
              { backgroundColor: item.color + "15" },
            ]}
          >
            <Icon name="time-outline" size={16} color={item.color} />
          </View>
          <Text style={styles.infoText}>{item.time}</Text>
        </View>
        <View style={styles.infoRow}>
          <View
            style={[
              styles.infoIconContainer,
              { backgroundColor: item.color + "15" },
            ]}
          >
            <Icon name="location-outline" size={16} color={item.color} />
          </View>
          <Text style={styles.infoText}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingEmoji}>⏳</Text>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Header with attractive background */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={styles.avatarContainer}
              activeOpacity={0.8}
            >
              {userData?.photo || userData?.profileImage ? (
                <Image
                  source={{ uri: userData.photo || userData.profileImage }}
                  style={styles.avatar}
                  onError={() => {
                    console.log("Failed to load profile image");
                  }}
                />
              ) : (
                <DefaultAvatar
                  firstName={
                    userData?.name?.split(" ")[0] || userData?.firstName || "U"
                  }
                />
              )}
              <View style={styles.onlineIndicator} />
            </TouchableOpacity>

            <View style={styles.nameContainer}>
              <Text style={styles.welcome}>{getCurrentGreeting()},</Text>
              <Text style={styles.userName}>
                {userData?.name || "Người dùng"}
              </Text>
              <Text style={styles.subtitle}>
                Chúc bạn một ngày tốt lành! 🌟
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationButton}>
              <Icon name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate("Settings")}
            >
              <Icon name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Animated.ScrollView
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Health Summary Card */}
        <TouchableOpacity
          style={styles.healthSummaryCard}
          onPress={() => navigation.navigate("HealthDetails")}
          activeOpacity={0.8}
        >
          <View style={styles.healthContent}>
            <View style={styles.healthLeft}>
              <Text style={styles.healthTitle}>Tổng quan sức khỏe</Text>
              <Text style={styles.healthSubtitle}>
                Tất cả chỉ số đều bình thường
              </Text>
              <View style={styles.vitalsRow}>
                <View style={styles.vitalItem}>
                  <View style={styles.vitalIconContainer}>
                    <Icon name="heart" size={16} color="#FF6B6B" />
                  </View>
                  <Text style={styles.vitalText}>78 bpm</Text>
                </View>
                <View style={styles.vitalItem}>
                  <View style={styles.vitalIconContainer}>
                    <Icon name="water" size={16} color="#45B7D1" />
                  </View>
                  <Text style={styles.vitalText}>120/80</Text>
                </View>
              </View>
            </View>
            <View style={styles.healthRight}>
              <Text style={styles.healthEmoji}>❤️</Text>
              <Text style={styles.healthStatus}>Tốt</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Appointments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch hẹn sắp tới</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllAppointments")}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
              <Icon name="chevron-forward" size={16} color="#667eea" />
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length > 0 ? (
            <FlatList
              data={upcomingAppointments}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderAppointmentCard}
              contentContainerStyle={styles.appointmentsList}
            />
          ) : (
            <View style={styles.noAppointments}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.noAppointmentsText}>
                Không có lịch hẹn sắp tới
              </Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => navigation.navigate("BookAppointment")}
                activeOpacity={0.8}
              >
                <Text style={styles.bookButtonText}>Đặt lịch ngay</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    { backgroundColor: action.bgColor },
                  ]}
                >
                  <Icon name={action.icon} size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Icon name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  Hoàn thành khám tổng quát
                </Text>
                <Text style={styles.activityTime}>2 ngày trước</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Icon name="document-text" size={24} color="#2196F3" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Kết quả xét nghiệm máu</Text>
                <Text style={styles.activityTime}>1 tuần trước</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9ff",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: "#667eea",
    fontWeight: "600",
  },
  headerContainer: {
    backgroundColor: "#667eea",
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 3,
    borderColor: "#fff",
  },
  defaultAvatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#764ba2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "#fff",
  },
  nameContainer: {
    flex: 1,
  },
  welcome: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    position: "relative",
    marginRight: 15,
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -15,
  },
  healthSummaryCard: {
    backgroundColor: "#fff",
    marginBottom: 25,
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderLeftWidth: 5,
    borderLeftColor: "#FF6B6B",
  },
  healthContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  healthLeft: {
    flex: 1,
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
  },
  healthSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 15,
  },
  vitalsRow: {
    flexDirection: "row",
  },
  vitalItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  vitalIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  vitalText: {
    color: "#2C3E50",
    fontSize: 14,
    fontWeight: "600",
  },
  healthRight: {
    alignItems: "center",
  },
  healthEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  healthStatus: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E50",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  appointmentsList: {
    paddingRight: 20,
  },
  appointmentCard: {
    width: width * 0.8,
    backgroundColor: "#fff",
    marginRight: 15,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderLeftWidth: 4,
  },
  appointmentHeader: {
    marginBottom: 15,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  doctorAvatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  doctorAvatar: {
    fontSize: 24,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 2,
  },
  specialty: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  appointmentInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoText: {
    color: "#34495E",
    fontSize: 14,
    fontWeight: "500",
  },
  noAppointments: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  noAppointmentsText: {
    color: "#7F8C8D",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  bookButton: {
    backgroundColor: "#667eea",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  actionIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  activityIcon: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#7F8C8D",
  },
});

export default HomeScreen;
