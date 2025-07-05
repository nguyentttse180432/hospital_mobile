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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { getMedicalPackages } from "../services/medicalPackageService";
import { getServices } from "../services/serviceService";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";

const { width } = Dimensions.get("window");

const HomeScreen = (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [medicalPackages, setMedicalPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [googleAvatar, setGoogleAvatar] = useState(null);
  const [googleUserName, setGoogleUserName] = useState(null);

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

  const handleViewPackageDetail = (packageId) => {
    // Navigate to package detail screen
    // This is allowed in ViewOnly mode
    navigation.navigate("PackageDetailScreen", { packageId });
  };

  const handleViewServiceDetail = (serviceId) => {
    // Navigate to service detail screen
    // This is allowed in ViewOnly mode
    navigation.navigate("ServiceDetailScreen", { serviceId });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("phoneVerified");
      await AsyncStorage.removeItem("googleUserAvatar");
      await AsyncStorage.removeItem("googleUserName");
      await AsyncStorage.removeItem("otpAlreadySent");

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
    <View style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />

      {/* Header with user info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {googleAvatar ? (
            <Image source={{ uri: googleAvatar }} style={styles.avatar} />
          ) : userData && userData.photo ? (
            <Image source={{ uri: userData.photo }} style={styles.avatar} />
          ) : (
            <DefaultAvatar firstName={userData?.name} />
          )}
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
        contentContainerStyle={styles.scrollContent}
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
            source={require("../assets/hospital.png")}
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
                onPress={() => handleViewPackageDetail(item.id)}
              >
                <View style={styles.packageCardContent}>
                  <Text style={styles.packageName}>{item.name}</Text>
                  <Text style={styles.packagePrice}>
                    {item.price.toLocaleString("vi-VN")} đ
                  </Text>
                  <View style={styles.packageDescriptionContainer}>
                    <Text style={styles.packageDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookAppointment(item.id, false)}
                  >
                    <Text style={styles.bookButtonText}>Đặt khám</Text>
                  </TouchableOpacity>
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
                    {item.price.toLocaleString("vi-VN")} đ
                  </Text>
                  <View style={styles.serviceDescriptionContainer}>
                    <Text style={styles.serviceDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookAppointment(item.id, true)}
                  >
                    <Text style={styles.bookButtonText}>Đặt khám</Text>
                  </TouchableOpacity>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
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
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    elevation: 2,
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
    paddingBottom: 20,
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
  bookButton: {
    backgroundColor: "#4299e1",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
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
    height: 180, // Increased height to accommodate the button
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
    backgroundColor: "#4CAF50",
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
    color: "#4CAF50",
    fontWeight: "bold",
  },
});

export default HomeScreen;
