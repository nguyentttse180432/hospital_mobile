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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBottomTabSafeStyle } from "../../utils/safeAreaHelper";
import colors from "../../constant/colors"; // Import file colors.js mới

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

  // Tính toán kiểu dáng an toàn cho bố cục
  const getContainerStyle = () => ({
    ...styles.container,
    // Loại bỏ padding dưới để tránh padding kép
  });

  const getHeaderStyle = () => ({
    ...styles.header,
    paddingTop:
      Platform.OS === "android"
        ? Math.max(insets.top + 15, 55) // Xử lý thanh trạng thái Android tốt hơn
        : Math.max(insets.top + 10, 50),
  });

  const getScrollContentStyle = () => ({
    ...styles.scrollContent,
    ...getBottomTabSafeStyle(insets, 20), // Thêm padding 20px
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userProfile = await AsyncStorage.getItem("user");
        const isPhoneVerified = JSON.parse(
          (await AsyncStorage.getItem("phoneVerified")) || "false"
        );
        // Lấy avatar và tên Google từ AsyncStorage
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

        // Kiểm tra nếu không ở trong tab navigator nhưng cần phải ở đó
        if (
          route.name === "HomeScreen" ||
          route.name === "FullAccessHomeScreen"
        ) {
          // Nếu không ở trong tab navigator, chuyển hướng sang Main
          if (isPhoneVerified) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
            return;
          }
        }

        setLoading(false);

        // Hiệu ứng chuyển động nội dung
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

        // Lấy danh sách gói khám và dịch vụ
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
      console.error("Lỗi khi lấy gói khám:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await getServices();
      if (response.isSuccess) {
        setServices(response.value);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dịch vụ:", error);
    }
  };

  const handleBookAppointment = async (itemId, isService = false) => {
    // Kiểm tra xem số điện thoại đã được xác minh chưa
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
      // Điều hướng sang màn hình đặt lịch khám với ID tương ứng
      if (isService) {
        navigation.navigate("AppointmentBookingScreen", { serviceId: itemId });
      } else {
        navigation.navigate("AppointmentBookingScreen", { packageId: itemId });
      }
    }
  };

  const handleViewServiceDetail = (serviceId) => {
    // Điều hướng sang màn hình chi tiết dịch vụ
    // Được phép ở chế độ ViewOnly
    navigation.navigate("ServiceDetailScreen", { serviceId });
  };

  const handleLogout = async () => {
    setShowLogoutAlert(false);
    try {
      // Gọi dịch vụ đăng xuất
      const result = await logout();

      // Xóa các mục bổ sung không được xử lý bởi dịch vụ đăng xuất
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("phoneVerified");
      await AsyncStorage.removeItem("googleUserAvatar");
      await AsyncStorage.removeItem("googleUserName");
      await AsyncStorage.removeItem("otpAlreadySent");

      // Điều hướng sang màn hình đăng nhập
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

  // Avatar mặc định cải tiến
  const DefaultAvatar = ({ firstName }) => {
    // Sử dụng firstName nếu có, nếu không thì kiểm tra userData.name hoặc googleUserName
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
      <StatusBar backgroundColor={colors.lightGray} barStyle="dark-content" />

      {/* Header với thông tin người dùng */}
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
                <Icon name="log-out-outline" size={12} color={colors.white} />
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
            <Icon
              name="alert-circle-outline"
              size={18}
              color={colors.alertRed}
            />
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

        {/* Phần gói khám */}
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
                onPress={() => {
                  // Chuyển qua PackageDetailScreen với danh sách và index
                  navigation.navigate("PackageDetailScreen", {
                    packages: medicalPackages,
                    initialIndex: medicalPackages.findIndex(
                      (p) => p.id === item.id
                    ),
                  });
                }}
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
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => {
                      navigation.navigate("PackageDetailScreen", {
                        packages: medicalPackages,
                        initialIndex: medicalPackages.findIndex(
                          (p) => p.id === item.id
                        ),
                      });
                    }}
                  >
                    <Icon
                      name="eye-outline"
                      size={18}
                      color={colors.primaryBlue}
                    />
                    <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Không có gói khám nào</Text>
            }
          />
        </View>

        {/* Phần dịch vụ */}
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

        {/* Banner xác minh */}
        {!phoneVerified && (
          <View style={styles.verifyBanner}>
            <Icon
              name="information-circle-outline"
              size={24}
              color={colors.white}
            />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGray,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    marginBottom: 20,
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
    color: colors.primaryBlue,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.textDark,
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
    backgroundColor: colors.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.alertRed,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.white,
  },
  userDetails: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    color: colors.textLight,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.alertBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scrollContent: {
    paddingBottom: 20, // Padding lớn hơn cho thanh điều hướng dưới và thanh hệ thống
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
    backgroundColor: colors.bannerOverlay,
    padding: 16,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bannerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  bannerSubtitle: {
    color: colors.white,
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
    color: colors.textDark,
  },
  seeAllText: {
    color: colors.primaryBlue,
    fontSize: 16,
    fontWeight: "600",
  },
  packageCard: {
    width: width * 0.7,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    elevation: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  packageCardContent: {
    padding: 16,
    height: 200, // Chiều cao cố định cho nội dung card
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  packageName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 16,
    color: colors.primaryBlue,
    fontWeight: "bold",
    marginBottom: 8,
  },
  packageDescriptionContainer: {
    minHeight: 40, // Chiều cao tối thiểu cho phần mô tả
    marginBottom: 12,
  },
  packageDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: colors.primaryBlue,
    marginLeft: 4,
  },
  serviceCard: {
    width: width * 0.6,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    elevation: 2,
    marginBottom: 10,
    overflow: "hidden",
  },
  serviceCardContent: {
    padding: 16,
    height: 160, // Tăng chiều cao để chứa nội dung
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textDark,
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 14,
    color: colors.primaryBlue,
    fontWeight: "bold",
    marginBottom: 8,
  },
  serviceDescriptionContainer: {
    minHeight: 40, // Chiều cao tối thiểu cho phần mô tả
  },
  serviceDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textEmpty,
    textAlign: "center",
    marginTop: 20,
  },
  verifyBanner: {
    backgroundColor: colors.primaryBlue,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    flexDirection: "column",
    alignItems: "center",
  },
  verifyBannerText: {
    color: colors.white,
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
  },
  verifyBannerButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  verifyBannerButtonText: {
    color: colors.primaryBlue,
    fontWeight: "bold",
  },
});

export default HomeScreen;
