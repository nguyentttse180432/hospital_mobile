import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import Button from "../../components/common/Button";
import ScreenContainer from "../../components/common/ScreenContainer";

const EditProfileScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserProfile({
          fullName: userData.name || "",
          phone: userData.phoneNumber || "",
          email: userData.email || "",
          address: userData.address || "",
          dateOfBirth: userData.dateOfBirth || "",
          gender: userData.gender === "Male" ? "Nam" : "Nữ",
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải thông tin người dùng. Vui lòng thử lại sau."
      );
    }
  };

  const handleUpdateProfile = async () => {
    // Validate fields
    if (!userProfile.fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên");
      return;
    }

    if (!userProfile.phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    // For a real app, you would call an API to update the profile
    // For now, we'll just update the local storage
    try {
      setIsSubmitting(true);

      // Get existing user data
      const userDataString = await AsyncStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);

        // Update with new values
        const updatedUserData = {
          ...userData,
          fullName: userProfile.fullName,
          phone: userProfile.phone,
          email: userProfile.email,
          address: userProfile.address,
          dateOfBirth: userProfile.dateOfBirth,
          gender: userProfile.gender,
        };

        // Save back to storage
        await AsyncStorage.setItem("user", JSON.stringify(updatedUserData));

        Alert.alert("Thành công", "Thông tin cá nhân đã được cập nhật", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
          <View style={styles.rightPlaceholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.avatarContainer}>
            <Icon name="person-circle" size={100} color="#1976d2" />
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Thay đổi ảnh</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên</Text>
              <TextInput
                style={styles.textInput}
                value={userProfile.fullName}
                onChangeText={(text) =>
                  setUserProfile({ ...userProfile, fullName: text })
                }
                placeholder="Nhập họ và tên"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.textInput}
                value={userProfile.phone}
                onChangeText={(text) =>
                  setUserProfile({ ...userProfile, phone: text })
                }
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={userProfile.email}
                onChangeText={(text) =>
                  setUserProfile({ ...userProfile, email: text })
                }
                placeholder="Nhập email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Địa chỉ</Text>
              <TextInput
                style={styles.textInput}
                value={userProfile.address}
                onChangeText={(text) =>
                  setUserProfile({ ...userProfile, address: text })
                }
                placeholder="Nhập địa chỉ"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngày sinh</Text>
              <TextInput
                style={styles.textInput}
                value={userProfile.dateOfBirth}
                onChangeText={(text) =>
                  setUserProfile({ ...userProfile, dateOfBirth: text })
                }
                placeholder="Nhập ngày sinh (dd/mm/yyyy)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giới tính</Text>
              <View style={styles.genderOptions}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    userProfile.gender === "Nam" && styles.genderOptionSelected,
                  ]}
                  onPress={() =>
                    setUserProfile({ ...userProfile, gender: "Nam" })
                  }
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      userProfile.gender === "Nam" &&
                        styles.genderOptionTextSelected,
                    ]}
                  >
                    Nam
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    userProfile.gender === "Nữ" && styles.genderOptionSelected,
                  ]}
                  onPress={() =>
                    setUserProfile({ ...userProfile, gender: "Nữ" })
                  }
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      userProfile.gender === "Nữ" &&
                        styles.genderOptionTextSelected,
                    ]}
                  >
                    Nữ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    userProfile.gender === "Khác" &&
                      styles.genderOptionSelected,
                  ]}
                  onPress={() =>
                    setUserProfile({ ...userProfile, gender: "Khác" })
                  }
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      userProfile.gender === "Khác" &&
                        styles.genderOptionTextSelected,
                    ]}
                  >
                    Khác
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Button
            title={isSubmitting ? "Đang cập nhật..." : "Cập nhật thông tin"}
            onPress={handleUpdateProfile}
            disabled={isSubmitting}
            style={styles.updateButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1976d2",
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  rightPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  changePhotoButton: {
    marginTop: 8,
  },
  changePhotoText: {
    color: "#1976d2",
    fontSize: 14,
    fontWeight: "600",
  },
  formSection: {
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  genderOptions: {
    flexDirection: "row",
  },
  genderOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#f9f9f9",
  },
  genderOptionSelected: {
    borderColor: "#1976d2",
    backgroundColor: "#e3f2fd",
  },
  genderOptionText: {
    color: "#555",
    fontWeight: "500",
  },
  genderOptionTextSelected: {
    color: "#1976d2",
    fontWeight: "600",
  },
  updateButton: {
    marginBottom: 40,
  },
});

export default EditProfileScreen;
