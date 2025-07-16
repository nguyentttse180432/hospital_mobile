import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../components/common/ScreenContainer";
import Card from "../../components/common/Card";
import {
  getCheckupRecordResults,
  getMedicationsByCheckupRecord,
} from "../../services/checkupRecordService";
import * as FileUtils from "../../utils/fileUtils";
import Icon from "react-native-vector-icons/Ionicons";

const CheckupResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { checkupCode, patientName } = route.params;

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [prescription, setPrescription] = useState(null);

  useEffect(() => {
    fetchResults();
    fetchPrescription();
  }, [checkupCode]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await getCheckupRecordResults(checkupCode);

      if (response && response.isSuccess) {
        const items = response.value.items || [];

        // Process test results for each service
        const processedItems = items.map((item) => ({
          ...item,
          testResults: FileUtils.processTestResults(item.testResults || []),
        }));

        setResults(processedItems);
      } else {
        Alert.alert("Lỗi", "Không thể tải kết quả kiểm tra");
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      Alert.alert("Lỗi", "Không thể tải kết quả kiểm tra");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescription = async () => {
    try {
      const response = await getMedicationsByCheckupRecord(checkupCode);
      setPrescription(response.value);
    } catch (error) {
      console.error("Error fetching prescription:", error);
      Alert.alert("Lỗi", "Không thể tải đơn thuốc");
    }
  };

  const navigateToServiceDetail = (service) => {
    navigation.navigate("CheckupResultDetail", {
      serviceId: service.id,
      serviceName: service.serviceName,
      serviceCode: service.serviceCode,
    });
  };

  const getServiceIcon = (serviceName, hasFiles, hasStepValues) => {
    const name = serviceName?.toLowerCase() || "";

    if (name.includes("thị lực") || name.includes("đo")) {
      return "eye-outline";
    } else if (name.includes("máu")) {
      return "water-outline";
    } else if (name.includes("x-quang") || name.includes("chụp")) {
      return "camera-outline";
    } else if (name.includes("nước tiểu")) {
      return "flask-outline";
    } else if (hasFiles) {
      return "document-text-outline";
    } else if (hasStepValues) {
      return "analytics-outline";
    }
    return "medical-outline";
  };

  const getServiceCategory = (service) => {
    const hasStepValues =
      service.stepServiceTrackingResponses &&
      service.stepServiceTrackingResponses.some(
        (step) =>
          step.stepServiceValueTrackings &&
          step.stepServiceValueTrackings.length > 0
      );
    const hasFiles = service.testResults && service.testResults.length > 0;

    if (hasStepValues) {
      return "Dạng chỉ số";
    } else if (hasFiles) {
      return "Dạng file";
    }
    return "Chưa có kết quả";
  };

  const renderServiceItem = ({ item, index }) => {
    const hasStepValues =
      item.stepServiceTrackingResponses &&
      item.stepServiceTrackingResponses.some(
        (step) =>
          step.stepServiceValueTrackings &&
          step.stepServiceValueTrackings.length > 0
      );
    const hasFiles = item.testResults && item.testResults.length > 0;
    const hasResults = hasStepValues || hasFiles;

    const serviceIcon = getServiceIcon(
      item.serviceName,
      hasFiles,
      hasStepValues
    );
    const category = getServiceCategory(item);

    return (
      <TouchableOpacity
        style={[styles.serviceCard, !hasResults && styles.serviceCardDisabled]}
        onPress={() => hasResults && navigateToServiceDetail(item)}
        disabled={!hasResults}
      >
        <View style={styles.serviceContent}>
          <View
            style={[
              styles.serviceIconContainer,
              { backgroundColor: hasResults ? "#e3f2fd" : "#f5f5f5" },
            ]}
          >
            <Icon
              name={serviceIcon}
              size={24}
              color={hasResults ? "#4299e1" : "#9E9E9E"}
            />
          </View>

          <View style={styles.serviceInfo}>
            <Text
              style={[
                styles.serviceName,
                !hasResults && styles.serviceNameDisabled,
              ]}
            >
              {item.serviceName}
            </Text>
            <Text style={styles.serviceCode}>
              Mã: {item.serviceCode?.trim()}
            </Text>
            <View style={styles.categoryContainer}>
              <Text
                style={[
                  styles.categoryText,
                  { color: hasResults ? "#4299e1" : "#9E9E9E" },
                ]}
              >
                {category}
              </Text>
              {hasFiles && (
                <Text style={styles.fileCount}>
                  {item.testResults.length} file
                </Text>
              )}
            </View>

            {item.resultDescription && (
              <Text style={styles.resultDescription} numberOfLines={2}>
                {item.resultDescription}
              </Text>
            )}
          </View>

          <View style={styles.serviceActions}>
            {hasResults ? (
              <>
                <Icon name="chevron-forward" size={20} color="#4299e1" />
                <Text style={styles.viewResultText}>Xem</Text>
              </>
            ) : (
              <Text style={styles.noResultText}>Chưa có kết quả</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenContainer
        title="Kết quả khám bệnh"
        onBack={() => navigation.goBack()}
        headerBackgroundColor="#4299e1"
        hasBottomTabs={true}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4299e1" />
          <Text style={styles.loadingText}>Đang tải kết quả...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable={false}
      style={{ padding: 0 }}
      title="Kết quả khám bệnh"
      onBack={() => navigation.goBack()}
      headerBackgroundColor="#4299e1"
      hasBottomTabs={true}
    >
      <View style={styles.container}>
        {/* Patient Info */}
        <Card style={styles.patientCard}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.checkupCode}>Mã phiếu: {checkupCode}</Text>
          </View>
        </Card>

        {/* Services List */}
        {results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="document-text-outline" size={48} color="#9E9E9E" />
            <Text style={styles.emptyText}>Không có kết quả kiểm tra</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderServiceItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.servicesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              checkupCode && prescription ? (
                <TouchableOpacity
                  style={styles.prescriptionButton}
                  onPress={() =>
                    navigation.navigate("PrescriptionScreen", { checkupCode })
                  }
                >
                  <Text style={styles.prescriptionButtonText}>
                    {prescription.prescriptionStatus === "Unpaid"
                      ? "Lấy thuốc"
                      : "Xem thuốc"}
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  patientCard: {
    margin: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4299e1",
  },
  patientInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  checkupCode: {
    marginLeft: 12,
    fontSize: 14,
    color: "#666",
  },
  prescriptionButton: {
    backgroundColor: "#4299e1",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 30,
    marginHorizontal: 12,
    marginTop: 10,
    alignSelf: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  prescriptionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  servicesList: {
    paddingHorizontal: 12,
    paddingBottom: 10, // Added paddingBottom to ensure button has space at the bottom
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceCardDisabled: {
    opacity: 0.6,
  },
  serviceContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  serviceNameDisabled: {
    color: "#9E9E9E",
  },
  serviceCode: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  fileCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  resultDescription: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
  serviceActions: {
    alignItems: "center",
  },
  viewResultText: {
    fontSize: 12,
    color: "#4299e1",
    marginTop: 2,
  },
  noResultText: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
});

export default CheckupResultsScreen;
