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
import InputField from "../../common/InputFieldIcon";
import Card from "../../common/Card";
import Button from "../../common/Button";
import { getPatients } from "../../../services/patientService";

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

  // Function to calculate age from birth date
  const calculateAge = (dobString) => {
    if (!dobString) return "N/A";

    const dob = new Date(dobString);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    // If birthday hasn't occurred yet this year, subtract a year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age + " tuổi";
  };

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
          console.log("Current user from AsyncStorage:", mainUser);
          setCurrentUser(mainUser);
        } // Lấy danh sách người thân từ API
        const patientsResponse = await getPatients();
        console.log("Fetched patients:", patientsResponse);

        let patients = [];
        if (
          patientsResponse &&
          patientsResponse.isSuccess &&
          patientsResponse.value
        ) {
          patients = patientsResponse.value;
        }

        if (patients && Array.isArray(patients)) {
          // Normalize patient data to handle any formatting issues
          patients = patients.map((p) => ({
            ...p,
            // Fix gender field if needed
            gender: p.gender || p["g   gender"] || "Unknown",
          }));

          // Lọc ra danh sách người thân (loại bỏ người dùng chính nếu có)
          const relatives =
            mainUser && mainUser.id
              ? patients.filter((p) => p.id !== mainUser.id)
              : patients;
          setFamilyMembers(relatives);

          if (relatives.length === 0) {
            console.log("No family members found");
          }
        } else {
          console.log("Invalid patients data format:", patients);
          setFamilyMembers([]);
        }
      } catch (error) {
        console.error("Failed to fetch user or patient profiles:", error);
        setFamilyMembers([]);
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
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e88e5" />
          <Text style={styles.loadingText}>Đang tải hồ sơ người khám...</Text>
        </View>
      ) : (
        <>
          {familyMembers.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Hồ sơ của bạn</Text>
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
                        {member.fullName ||
                          member.name ||
                          `${member.firstName || ""} ${
                            member.lastName || ""
                          }`.trim()}
                      </Text>
                      <Text style={styles.cardDetail}>
                        {member.dob ? `Tuổi: ${calculateAge(member.dob)}` : ""}
                      </Text>
                      <Text style={styles.cardDetail}>
                        Giới tính:{" "}
                        {member.gender === "Male" || member.gender === true
                          ? "Nam"
                          : "Nữ"}
                      </Text>
                    </View>
                    {selectedProfile?.id === member.id && (
                      <Icon name="checkmark-circle" size={24} color="#2ecc71" />
                    )}
                  </View>
                </Card>
              ))}
            </>
          ) : (
            <View style={styles.noProfilesContainer}>
              <Icon name="information-circle-outline" size={24} color="#888" />
              <Text style={styles.noProfilesText}>Chưa có hồ sơ nào</Text>
            </View>
          )}

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
  noProfilesContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginVertical: 20,
  },
  noProfilesText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
});
export default ProfileSelection;
