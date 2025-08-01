import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMedicalPackages } from "../../../services/medicalPackageService";
import Icon from "react-native-vector-icons/Ionicons";
import PackageDetailModal from "../../common/PackageDetailModal";
import { usePackageModal } from "../../../hooks/usePackageModal";

const MedicalPackageSelection = ({
  currentPackage,
  setCurrentPackage,
  setStep,
  selectedProfile,
}) => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get safe area insets to handle bottom tab bar
  const insets = useSafeAreaInsets();

  // Use our custom hook for package modal
  const packageModal = usePackageModal(filteredPackages);

  // Tính tuổi từ ngày sinh
  const calculateAge = (dobString) => {
    if (!dobString) return 0;

    const dob = new Date(dobString);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    // If birthday hasn't occurred yet this year, subtract a year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  };
  useEffect(() => {
    // When selectedProfile changes, fetch medical packages with appropriate filters
    if (selectedProfile) {
      fetchMedicalPackages(selectedProfile);
    } else {
      fetchMedicalPackages();
    }
  }, [selectedProfile]);
  const fetchMedicalPackages = async (profile = null) => {
    try {
      setLoading(true);
      setSearchQuery(""); // Reset search query when fetching new packages

      let gender = null;
      let age = null;

      if (profile) {
        // Map gender values to match API expectations (Male/Female)
        if (profile.gender) {
          gender =
            profile.gender === "Nam"
              ? "Male"
              : profile.gender === "Nữ"
              ? "Female"
              : profile.gender;
        }

        // Calculate age if dob exists
        if (profile.dob) {
          age = calculateAge(profile.dob);
        }
      }

      // Call API with gender and age parameters
      const data = await getMedicalPackages(gender, age);

      setPackages(data.value);
      setFilteredPackages(data.value);
      setError(null);
    } catch (err) {
      setError("Không thể tải gói khám. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectPackage = (pkg) => {
    setCurrentPackage(pkg);
    setStep(2); // Return to main appointment selection screen instead of going directly to date selection
  };

  const showPackageDetails = (pkg, e) => {
    if (e) e.stopPropagation();
    packageModal.showPackageDetails(pkg);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      // If search is empty, show all packages
      setFilteredPackages(packages);
      return;
    }

    const searchTerms = text.toLowerCase().trim().split(/\s+/);

    // Filter packages based on search terms
    const results = packages.filter((pkg) => {
      const nameMatch =
        pkg.name &&
        searchTerms.some((term) => pkg.name.toLowerCase().includes(term));

      const descriptionMatch =
        pkg.description &&
        searchTerms.some((term) =>
          pkg.description.toLowerCase().includes(term)
        );

      const typeMatch =
        pkg.type &&
        searchTerms.some((term) => pkg.type.toLowerCase().includes(term));

      const targetGroupMatch =
        pkg.targetGroup &&
        searchTerms.some((term) =>
          pkg.targetGroup.toLowerCase().includes(term)
        );

      return nameMatch || descriptionMatch || typeMatch || targetGroupMatch;
    });

    setFilteredPackages(results);
  };
  const renderPackageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.packageItem,
        currentPackage?.id === item.id && styles.selectedPackageItem,
      ]}
      onPress={() => handleSelectPackage(item)}
    >
      <View style={styles.packageDetails}>
        <View style={styles.headerRow}>
          <Text style={styles.packageName}>{item.name}</Text>
          <Text style={styles.packagePrice}>
            {item.price.toLocaleString("vi-VN")}
          </Text>
        </View>
        <Text style={styles.packageDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={(e) => showPackageDetails(item, e)}
        >
          <Icon name="eye-outline" size={18} color="#0071CE" />
          <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0071CE" />
        <Text style={styles.loadingText}>Đang tải gói khám...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="alert-circle" size={40} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchMedicalPackages}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {selectedProfile && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterInfoText}>
            Những gói khám phù hợp với {selectedProfile.fullName.toUpperCase()}{" "}
            ({selectedProfile.gender === "Male" ? "Nam" : "Nữ"}{" "}
            {calculateAge(selectedProfile.dob)} tuổi)
          </Text>
        </View>
      )}

      {/* Search input */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm gói khám..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleSearch("")}
          >
            <Icon name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPackages}
        renderItem={renderPackageItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.packagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="alert-circle-outline" size={40} color="#666" />
            <Text style={styles.emptyText}>
              {searchQuery.length > 0
                ? `Không tìm thấy gói khám phù hợp với từ khóa "${searchQuery}"`
                : "Không tìm thấy gói khám phù hợp"}
            </Text>
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => handleSearch("")}
              >
                <Text style={styles.clearSearchText}>Xóa tìm kiếm</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Use our reusable Package Detail Modal with swipe functionality */}
      <PackageDetailModal
        visible={packageModal.modalVisible}
        onClose={packageModal.closeModal}
        packageDetails={packageModal.selectedPackageDetails}
        packages={filteredPackages}
        currentIndex={packageModal.currentPackageIndex}
        onNavigate={packageModal.handleNavigatePackage}
        onBookPackage={(packageId) => {
          const selectedPkg = filteredPackages.find(
            (pkg) => pkg.id === packageId
          );
          if (selectedPkg) {
            setCurrentPackage(selectedPkg);
            packageModal.closeModal();
            setStep(2);
          }
        }}
        swipeDistance={packageModal.swipeDistance}
        fadeAnim={packageModal.fadeModalAnim}
        scaleAnim={packageModal.scaleAnim}
        indicatorAnim={packageModal.indicatorAnim}
        isTransitioning={packageModal.isTransitioning}
        canSwipe={packageModal.canSwipe}
        panResponder={packageModal.panResponder}
        showBookButton={true}
        bookButtonText="Chọn gói này"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f7fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  filterInfo: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  filterInfoText: {
    color: "#0071CE",
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    height: "100%",
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  packagesList: {
    paddingBottom: 16,
  },
  packageItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: "relative",
  },
  selectedPackageItem: {
    borderWidth: 2,
    borderColor: "#0363b3ff",
    backgroundColor: "#e6f0f9",
  },
  packageImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 16,
  },
  packageImage: {
    width: "100%",
    height: "100%",
  },
  packageImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e6f0f9",
    justifyContent: "center",
    alignItems: "center",
  },
  packageDetails: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  packageName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  packageDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0071CE",
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
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#f44336",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0071CE",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  skipButton: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    color: "#0071CE",
    fontSize: 15,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  clearSearchButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  clearSearchText: {
    color: "#0071CE",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default MedicalPackageSelection;
