import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, CommonActions } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { logout } from "../../services/authService";
import ScreenContainer from "../../components/common/ScreenContainer";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    loadUserProfile();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadUserProfile = async () => {
    try {
      setRefreshing(true);
      const userDataString = await AsyncStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserProfile(userData);
      } else {
        console.warn("No user data found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        onPress: async () => {
          try {
            const result = await logout();
            if (result.isSuccess) {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                })
              );
            } else {
              throw new Error(result.error?.message || "Lỗi không xác định");
            }
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer
      scrollable={false}
      hasBottomTabs={true}
      title="Hồ sơ cá nhân"
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadUserProfile} />
        }
      >
        <Animated.View style={[styles.profileCard, { opacity: fadeAnim }]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarBorder}>
                <Icon name="person-circle" size={80} color="#1E3A8A" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile?.name || "Chưa cập nhật"}
              </Text>
              <View style={styles.profileDetailContainer}>
                <Icon name="call-outline" size={16} color="#4B5563" />
                <Text style={styles.profileDetail}>
                  {userProfile?.phoneNumber || "Chưa cập nhật"}
                </Text>
              </View>
              <View style={styles.profileDetailContainer}>
                <Icon
                  name="mail-outline"
                  size={16}
                  color="#4B5563"
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.profileDetailFull}>
                  {userProfile?.email ||
                    userProfile?.username ||
                    "Chưa cập nhật"}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate("EditProfile")}
            activeOpacity={0.7}
          >
            <View style={styles.editButton}>
              <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
              <Icon name="create-outline" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Spacer view to ensure content fills the screen */}
        <View style={{ flex: 1, minHeight: screenHeight * 0.3 }} />

        {/* Logout button with fixed position at bottom of scrollable content */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutButtonGradient}>
            <Icon name="log-out-outline" size={26} color="#FFFFFF" />
            <Text style={styles.logoutText}>ĐĂNG XUẤT</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === "ios" ? 100 : 120, // Extra space for bottom tabs
  },
  profileCard: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#EBF2F7",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarBorder: {
    borderRadius: 40,
    padding: 4,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  profileDetailContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  profileDetail: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  profileDetailFull: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    flexShrink: 1,
    flexWrap: "wrap",
    maxWidth: "100%",
  },
  editProfileButton: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#1E88E5",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  editProfileText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  logoutButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#EF4444",
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
});

export default ProfileScreen;
