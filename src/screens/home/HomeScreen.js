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
  Alert,
  SafeAreaView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { getMedicalPackages } from "../../services/medicalPackageService";
import { getServices } from "../../services/serviceService";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import { logout } from "../../services/authService";
import PackageDetailModal from "../../components/common/PackageDetailModal";
import { usePackageModal } from "../../hooks/usePackageModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBottomTabSafeStyle } from "../../utils/safeAreaHelper";

const { width } = Dimensions.get("window");

const HomeScreen = (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [medicalPackages, setMedicalPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [googleAvatar, setGoogleAvatar] = useState(null);
  const [googleUserName, setGoogleUserName] = useState(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Use our custom hook for package modal
  const packageModal = usePackageModal(medicalPackages);

  // Calculate safe areas for better layout
  const getContainerStyle = () => ({
    ...styles.container,
    // Remove bottom padding from container to avoid double padding
  });

  const getHeaderStyle = () => ({
    ...styles.header,
    paddingTop:
      Platform.OS === "android"
        ? Math.max(insets.top + 15, 55) // Handle Android status bar better
        : Math.max(insets.top + 10, 50),
  });

  const getScrollContentStyle = () => ({
    ...styles.scrollContent,
    ...getBottomTabSafeStyle(insets, 20), // Additional 20px padding
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userProfile = await AsyncStorage.getItem("user");
        const isPhoneVerified = JSON.parse(
          (await AsyncStorage.getItem("phoneVerified")) || "false"
        );
        // Get Google avatar and name from AsyncStorage
        const googleUserAvatar = await AsyncStorage.getItem("googleUserAvatar");
        const googleName = await AsyncStorage.getItem("googleUserName");

        if (userProfile) {
          setUserData(JSON.parse(userProfile));
        }

        if (googleUserAvatar) {
          setGoogleAvatar(googleUserAvatar);
        }

        if (googleName) {
          setGoogleUserName(googleName);
        }

        setPhoneVerified(isPhoneVerified);

        // Check if we're not in a tab navigator but should be
        if (
          route.name === "HomeScreen" ||
          route.name === "FullAccessHomeScreen"
        ) {
          // If we're not in the tab navigator, we should redirect to Main
          if (isPhoneVerified) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
            return;
          }
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

        // Fetch medical packages and services
        fetchMedicalPackages();
        fetchServices();
      } catch (error) {
        console.error("Không thể tải dữ liệu người dùng", error);
        setLoading(false);
      }
    };

    loadUserData();
  }, [isFocused]);

  const fetchMedicalPackages = async () => {
    try {
      const response = await getMedicalPackages();
      if (response.isSuccess) {
        setMedicalPackages(response.value);
      }
    } catch (error) {
      console.error("Error fetching medical packages:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await getServices();
      if (response.isSuccess) {
        setServices(response.value);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleBookAppointment = async (itemId, isService = false) => {
    // Check if phone is verified
    if (!phoneVerified) {
      Alert.alert(
        "Xác minh số điện thoại",
        "Vui lòng xác minh số điện thoại để đặt khám",
        [
          {
            text: "Xác minh ngay",
            onPress: () => navigation.navigate("VerifyPhoneScreen"),
          },
          {
            text: "Để sau",
            style: "cancel",
          },
        ]
      );
    } else {
      // Navigate to appointment booking screen with the appropriate ID
      if (isService) {
        navigation.navigate("AppointmentBookingScreen", { serviceId: itemId });
      } else {
        navigation.navigate("AppointmentBookingScreen", { packageId: itemId });
      }
    }
  };

  const handleViewServiceDetail = (serviceId) => {
    // Navigate to service detail screen
    // This is allowed in ViewOnly mode
    navigation.navigate("ServiceDetailScreen", { serviceId });
  };

  const handleLogout = async () => {
    setShowLogoutAlert(false);
    try {
      // Call the logout service
      const result = await logout();

      // Clear additional items not handled by the logout service
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("phoneVerified");
      await AsyncStorage.removeItem("googleUserAvatar");
      await AsyncStorage.removeItem("googleUserName");
      await AsyncStorage.removeItem("otpAlreadySent");

      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Lỗi khi đăng xuất", error);
      Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại sau.");
    }
  };

  const showLogoutConfirmation = () => {
    if (!phoneVerified) {
      Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          onPress: handleLogout,
          style: "destructive",
        },
      ]);
    }
  };

  // Enhanced Default Avatar
  const DefaultAvatar = ({ firstName }) => {
    // If we have a firstName, use it, otherwise check if we have userData.name or googleUserName
    const nameToUse =
      firstName || googleUserName || (userData && userData.name) || "U";
    const initials = nameToUse.charAt(0).toUpperCase();
    return (
      <View style={styles.defaultAvatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

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
    <SafeAreaView style={getContainerStyle()}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />

      {/* Header with user info */}
      <View style={getHeaderStyle()}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={showLogoutConfirmation}>
            {googleAvatar ? (
              <Image source={{ uri: googleAvatar }} style={styles.avatar} />
            ) : userData && userData.photo ? (
              <Image source={{ uri: userData.photo }} style={styles.avatar} />
            ) : (
              <DefaultAvatar firstName={userData?.name} />
            )}
            {!phoneVerified && (
              <View style={styles.logoutIndicator}>
                <Icon name="log-out-outline" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.userDetails}>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName}>
              {googleUserName || (userData && userData.name) || "Người dùng"}
            </Text>
          </View>
        </View>

        {!phoneVerified && (
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={() => navigation.navigate("VerifyPhoneScreen")}
          >
            <Icon name="alert-circle-outline" size={18} color="#ff6b6b" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={getScrollContentStyle()}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Banner */}
        <Animated.View
          style={[
            styles.bannerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Image
            source={require("../../assets/hospital.png")}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Chăm sóc sức khỏe tận tình</Text>
            <Text style={styles.bannerSubtitle}>
              Đặt lịch khám ngay hôm nay
            </Text>
          </View>
        </Animated.View>

        {/* Medical Packages Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gói khám</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllPackagesScreen")}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={medicalPackages.slice(0, 5)}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.packageCard}
                onPress={() => packageModal.showPackageDetails(item)}
              >
                <View style={styles.packageCardContent}>
                  <Text style={styles.packageName}>{item.name}</Text>
                  <Text style={styles.packagePrice}>
                    {item.price.toLocaleString("vi-VN")} VNĐ
                  </Text>
                  <View style={styles.packageDescriptionContainer}>
                    <Text style={styles.packageDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                  <View style={styles.viewDetailsButton}>
                    <Icon name="eye-outline" size={18} color="#0071CE" />
                    <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Không có gói khám nào</Text>
            }
          />
        </View>

        {/* Services Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dịch vụ</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllServicesScreen")}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={services.slice(0, 5)}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => handleViewServiceDetail(item.id)}
              >
                <View style={styles.serviceCardContent}>
                  <Text style={styles.serviceName}>{item.name}</Text>
                  <Text style={styles.servicePrice}>
                    {item.price.toLocaleString("vi-VN")} VNĐ
                  </Text>
                  <View style={styles.serviceDescriptionContainer}>
                    <Text style={styles.serviceDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Không có dịch vụ nào</Text>
            }
          />
        </View>

        {/* Verification Banner */}
        {!phoneVerified && (
          <View style={styles.verifyBanner}>
            <Icon name="information-circle-outline" size={24} color="#fff" />
            <Text style={styles.verifyBannerText}>
              Vui lòng xác minh số điện thoại để sử dụng đầy đủ tính năng
            </Text>
            <TouchableOpacity
              style={styles.verifyBannerButton}
              onPress={() => navigation.navigate("VerifyPhoneScreen")}
            >
              <Text style={styles.verifyBannerButtonText}>Xác minh ngay</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Use our reusable Package Detail Modal */}
      <PackageDetailModal
        visible={packageModal.modalVisible}
        onClose={packageModal.closeModal}
        packageDetails={packageModal.selectedPackageDetails}
        packages={medicalPackages}
        currentIndex={packageModal.currentPackageIndex}
        onNavigate={packageModal.handleNavigatePackage}
        onBookPackage={(packageId) => {
          packageModal.closeModal();
          handleBookAppointment(packageId, false);
        }}
        swipeDistance={packageModal.swipeDistance}
        fadeAnim={packageModal.fadeModalAnim}
        scaleAnim={packageModal.scaleAnim}
        indicatorAnim={packageModal.indicatorAnim}
        isTransitioning={packageModal.isTransitioning}
        canSwipe={packageModal.canSwipe}
        panResponder={packageModal.panResponder}
        showBookButton={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    marginBottom: 20, // Thêm margin bottom
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    marginBottom: 20, // Thêm margin bottom
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4299e1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#ff6b6b",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  userDetails: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe5e5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifyText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  scrollContent: {
    paddingBottom: 20, // Much more padding for bottom navigation and system bars
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    height: 180,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  bannerTextContainer: {
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 16,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  bannerSubtitle: {
    color: "#fff",
    fontSize: 14,
    marginTop: 4,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  seeAllText: {
    color: "#4299e1",
    fontSize: 16,
    fontWeight: "600",
  },
  packageCard: {
    width: width * 0.7,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  packageCardContent: {
    padding: 16,
    height: 200, // Đặt chiều cao cố định cho card content
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  packageName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 16,
    color: "#4299e1",
    fontWeight: "bold",
    marginBottom: 8,
  },
  packageDescriptionContainer: {
    minHeight: 40, // Đặt chiều cao tối thiểu cho phần mô tả
    marginBottom: 12,
  },
  packageDescription: {
    fontSize: 14,
    color: "#666",
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#0071CE",
    marginLeft: 4,
  },
  serviceCard: {
    width: width * 0.6,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
    marginBottom: 10,
    overflow: "hidden",
  },
  serviceCardContent: {
    padding: 16,
    height: 160, // Increased height to accommodate the button
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 14,
    color: "#4299e1",
    fontWeight: "bold",
    marginBottom: 8,
  },
  serviceDescriptionContainer: {
    minHeight: 40, // Đặt chiều cao tối thiểu cho phần mô tả
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
  verifyBanner: {
    backgroundColor: "#4299e1",
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    flexDirection: "column",
    alignItems: "center",
  },
  verifyBannerText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
  },
  verifyBannerButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  verifyBannerButtonText: {
    color: "#4299e1",
    fontWeight: "bold",
  },
});

export default HomeScreen;
