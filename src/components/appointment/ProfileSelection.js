import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import InputField from "../common/InputFieldIcon";
import Card from "../common/Card";
import Button from "../common/Button";
import { getPatients } from "../../services/patientService";

const ProfileSelection = ({
  selectedProfile,
  setSelectedProfile,
  newProfile,
  setNewProfile,
  canProceed,
  handleNext,
}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewProfileForm, setShowNewProfileForm] = useState(false);

  // Fetch profiles on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Lấy thông tin người dùng hiện tại từ AsyncStorage
        const userJSON = await AsyncStorage.getItem("user");
        let mainUser = null;

        if (userJSON) {
          mainUser = JSON.parse(userJSON);
          setCurrentUser(mainUser);
        }

        // Lấy danh sách người thân từ API
        const response = await getPatients();

        if (response && Array.isArray(response)) {
          // Lọc ra danh sách người thân (loại bỏ người dùng chính)
          const relatives = mainUser
            ? response.filter((p) => p.id !== mainUser.id)
            : response;
          setFamilyMembers(relatives);
        }
      } catch (error) {
        console.error("Failed to fetch user or patient profiles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewProfileChange = (field, value) => {
    setNewProfile({ ...newProfile, [field]: value });
    setSelectedProfile(null); // Bỏ chọn profile khác khi điền thông tin mới
  };

  const resetNewProfile = () => {
    setNewProfile({
      fullName: "",
      gender: "",
      phone: "",
      email: "",
      idNumber: "",
      dob: "",
      address: "",
      bhyt: "",
    });
  };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setShowNewProfileForm(false);
    resetNewProfile();
  };

  const handleShowNewForm = () => {
    setShowNewProfileForm(true);
    setSelectedProfile(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Chọn Hồ Sơ Bệnh Nhân</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e88e5" />
          <Text style={styles.loadingText}>Đang tải hồ sơ bệnh nhân...</Text>
        </View>
      ) : (
        <>
          {/* Hồ sơ chủ tài khoản */}
          {currentUser && (
            <>
              <Text style={styles.sectionTitle}>Hồ sơ của bạn</Text>
              <Card
                onPress={() => handleProfileSelect(currentUser)}
                selected={selectedProfile?.id === currentUser.id}
              >
                <View style={styles.cardContent}>
                  <View style={styles.profileIconContainer}>
                    <Icon name="person" size={24} color="#1e88e5" />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>
                      {currentUser.fullName || currentUser.name}
                    </Text>
                    <Text style={styles.cardDetail}>
                      Tuổi: {currentUser.age || "40 tuổi"}
                    </Text>
                    <Text style={styles.cardDetail}>
                      Giới tính: {currentUser.gender}
                    </Text>
                  </View>
                  {selectedProfile?.id === currentUser.id && (
                    <Icon name="checkmark-circle" size={24} color="#2ecc71" />
                  )}
                </View>
              </Card>
            </>
          )}

          {/* Hồ sơ người thân */}
          {familyMembers.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Người thân</Text>
              {familyMembers.map((member) => (
                <Card
                  key={member.id}
                  onPress={() => handleProfileSelect(member)}
                  selected={selectedProfile?.id === member.id}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.profileIconContainer}>
                      <Icon name="people" size={24} color="#9c27b0" />
                    </View>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>
                        {member.fullName || member.name}
                      </Text>
                      <Text style={styles.cardDetail}>Tuổi: {member.age || "40 tuổi"}</Text>
                      <Text style={styles.cardDetail}>
                        Giới tính: {member.gender}
                      </Text>
                      <Text style={styles.relationBadge}>
                        {member.relationship || "Người thân"}
                      </Text>
                    </View>
                    {selectedProfile?.id === member.id && (
                      <Icon name="checkmark-circle" size={24} color="#2ecc71" />
                    )}
                  </View>
                </Card>
              ))}
            </>
          )}

          {/* Nút tạo hồ sơ người thân mới */}
          <View style={styles.addProfileSection}>
            <TouchableOpacity
              style={styles.addProfileButton}
              onPress={handleShowNewForm}
            >
              <Icon name="add-circle" size={20} color="#1e88e5" />
              <Text style={styles.addProfileButtonText}>
                Tạo hồ sơ người thân mới
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form tạo hồ sơ mới */}
          {showNewProfileForm && (
            <>
              <Text style={styles.sectionTitle}>Thông tin người thân mới</Text>
              <InputField
                placeholder="Họ tên *"
                value={newProfile.fullName}
                onChangeText={(text) =>
                  handleNewProfileChange("fullName", text)
                }
                icon="person"
              />
              <InputField
                placeholder="Giới tính *"
                value={newProfile.gender}
                onChangeText={(text) => handleNewProfileChange("gender", text)}
                icon="transgender"
              />
              <InputField
                placeholder="Số điện thoại *"
                value={newProfile.phone}
                onChangeText={(text) => handleNewProfileChange("phone", text)}
                icon="call"
              />
              <InputField
                placeholder="Email"
                value={newProfile.email}
                onChangeText={(text) => handleNewProfileChange("email", text)}
                icon="mail"
              />
              <InputField
                placeholder="Số BHYT (nếu có)"
                value={newProfile.bhyt}
                onChangeText={(text) => handleNewProfileChange("bhyt", text)}
                icon="card"
              />
              <InputField
                placeholder="CCCD/CMND/Passport"
                value={newProfile.idNumber}
                onChangeText={(text) =>
                  handleNewProfileChange("idNumber", text)
                }
                icon="card"
              />
              <InputField
                placeholder="Ngày sinh *"
                value={newProfile.dob}
                onChangeText={(text) => handleNewProfileChange("dob", text)}
                icon="calendar"
              />
              <InputField
                placeholder="Địa chỉ"
                value={newProfile.address}
                onChangeText={(text) => handleNewProfileChange("address", text)}
                icon="location"
              />
            </>
          )}
        </>
      )}

      <Button
        title="Tiếp Tục"
        onPress={handleNext}
        disabled={!canProceed() || isLoading}
        style={{ marginTop: 16, marginBottom: 20 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginVertical: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardText: {
    flex: 1,
    marginLeft: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cardDetail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  mainAccountBadge: {
    fontSize: 12,
    color: "#1e88e5",
    fontWeight: "500",
    marginTop: 4,
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  relationBadge: {
    fontSize: 12,
    color: "#9c27b0",
    fontWeight: "500",
    marginTop: 4,
    backgroundColor: "#f3e5f5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  addProfileSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  addProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addProfileButtonText: {
    fontSize: 16,
    color: "#1e88e5",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ProfileSelection;
