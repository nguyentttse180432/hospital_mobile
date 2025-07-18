import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from "react-native";
import { getMedicalPackages } from "../../services/medicalPackageService";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { usePackageModal } from "../../hooks/usePackageModal";
import ScreenContainer from "../../components/common/ScreenContainer";

const AllPackagesScreen = () => {
  const navigation = useNavigation();
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Use our custom hook for package modal
  const packageModal = usePackageModal(filteredPackages);

  useEffect(() => {
    fetchMedicalPackages();
  }, []);

  const fetchMedicalPackages = async () => {
    try {
      setLoading(true);
      setSearchQuery(""); // Reset search query when fetching new packages

      const response = await getMedicalPackages();

      if (response.isSuccess) {
        setPackages(response.value);
        setFilteredPackages(response.value);
      } else {
        setError("Không thể tải gói khám. Vui lòng thử lại sau.");
      }
    } catch (err) {
      setError("Không thể tải gói khám. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg) => {
    // Truyền toàn bộ danh sách và index hiện tại
    navigation.navigate("PackageDetailScreen", {
      packages: filteredPackages,
      initialIndex: filteredPackages.findIndex((p) => p.id === pkg.id),
    });
  };

  // Không dùng modal nữa, chỉ chuyển screen
  const showPackageDetails = (pkg) => {
    handleSelectPackage(pkg);
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
      style={styles.packageItem}
      onPress={() => showPackageDetails(item)}
    >
      <View style={styles.packageDetails}>
        <View style={styles.headerRow}>
          <Text style={styles.packageName}>{item.name}</Text>
          <Text style={styles.packagePrice}>
            {item.price.toLocaleString("vi-VN")} VNĐ
          </Text>
        </View>
        <Text style={styles.packageDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => showPackageDetails(item)}
        >
          <Icon name="eye-outline" size={18} color="#0071CE" />
          <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#0071CE" />
          <Text style={styles.loadingText}>Đang tải gói khám...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
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
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Tất cả gói khám" onBack={() => navigation.goBack()}>
      <View style={styles.container}>
        <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />

        {/* Search input */}
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
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

        {/* Đã bỏ modal, chỉ chuyển screen khi nhấn */}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  // ...existing code...
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    margin: 16,
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
    padding: 16,
    paddingTop: 0,
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

export default AllPackagesScreen;
