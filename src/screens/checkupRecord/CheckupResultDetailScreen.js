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
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../components/common/ScreenContainer";
import Card from "../../components/common/Card";
import { getCheckupRecordServiceResults } from "../../services/checkupRecordService";
import * as FileUtils from "../../utils/fileUtils";
import Icon from "react-native-vector-icons/Ionicons";

const CheckupResultDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { serviceId, serviceName, serviceCode } = route.params;

  const [loading, setLoading] = useState(true);
  const [serviceResult, setServiceResult] = useState(null);
  const [processedFiles, setProcessedFiles] = useState([]);

  useEffect(() => {
    fetchServiceResults();
  }, [serviceId]);

  const fetchServiceResults = async () => {
    try {
      setLoading(true);
      const response = await getCheckupRecordServiceResults(serviceId);

      if (response && response.isSuccess) {
        const result = response.value;
        setServiceResult(result);

        // Process test results files
        if (result.testResults && result.testResults.length > 0) {
          const processed = FileUtils.processTestResults(result.testResults);
          setProcessedFiles(processed);
        }
      } else {
        Alert.alert("Lỗi", "Không thể tải kết quả kiểm tra");
      }
    } catch (error) {
      console.error("Error fetching service results:", error);
      Alert.alert("Lỗi", "Không thể tải kết quả kiểm tra");
    } finally {
      setLoading(false);
    }
  };

  const openFile = async (fileItem) => {
    try {
      const fileUrl = FileUtils.getFileUrl(fileItem.resultFieldLink);

      if (FileUtils.isImageFile(fileItem.resultFieldLink)) {
        // Navigate to image viewer
        navigation.navigate("ImageViewer", {
          imageUrl: fileUrl,
          title: fileItem.fileName || "Hình ảnh kết quả",
        });
      } else if (FileUtils.isPdfFile(fileItem.resultFieldLink)) {
        // Open PDF in browser or PDF viewer
        const canOpen = await Linking.canOpenURL(fileUrl);
        if (canOpen) {
          await Linking.openURL(fileUrl);
        } else {
          Alert.alert("Lỗi", "Không thể mở file PDF");
        }
      } else {
        // For other file types, try to open with default app
        const canOpen = await Linking.canOpenURL(fileUrl);
        if (canOpen) {
          await Linking.openURL(fileUrl);
        } else {
          Alert.alert("Lỗi", "Không thể mở file này");
        }
      }
    } catch (error) {
      console.error("Error opening file:", error);
      Alert.alert("Lỗi", "Không thể mở file");
    }
  };

  const renderCustomHeader = () => (
    <View style={styles.customHeader}>
      <TouchableOpacity
        style={styles.headerBackButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Kết quả kiểm tra</Text>
      <View style={styles.headerRightPlaceholder} />
    </View>
  );

  const renderStepValueItem = ({ item }) => (
    <View style={styles.valueItem}>
      <Text style={styles.valueName}>{item.name}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{item.value}</Text>
        <Text style={styles.maxValueText}>/{item.maxValue}</Text>
      </View>
      {item.note && <Text style={styles.valueNote}>{item.note}</Text>}
    </View>
  );

  const renderStepItem = ({ item }) => (
    <Card style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <Icon
          name={item.isCompleted ? "checkmark-circle" : "ellipse-outline"}
          size={20}
          color={item.isCompleted ? "#4CAF50" : "#9E9E9E"}
        />
        <Text style={styles.stepName}>{item.stepName}</Text>
      </View>

      {item.stepServiceValueTrackings &&
        item.stepServiceValueTrackings.length > 0 && (
          <View style={styles.valuesContainer}>
            <FlatList
              data={item.stepServiceValueTrackings}
              renderItem={renderStepValueItem}
              keyExtractor={(valueItem) => valueItem.id}
              scrollEnabled={false}
            />
          </View>
        )}
    </Card>
  );

  const renderFileItem = ({ item }) => (
    <TouchableOpacity style={styles.fileItem} onPress={() => openFile(item)}>
      <View style={styles.fileIconContainer}>
        <Icon
          name={
            FileUtils.isImageFile(item.resultFieldLink)
              ? "image"
              : FileUtils.isPdfFile(item.resultFieldLink)
              ? "document-text"
              : "document"
          }
          size={24}
          color="#4299e1"
        />
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName}>{item.fileName}</Text>
        <Text style={styles.fileType}>{item.fileType}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenContainer
        header={renderCustomHeader()}
        headerBackgroundColor="#4299e1"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4299e1" />
          <Text style={styles.loadingText}>Đang tải kết quả...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!serviceResult) {
    return (
      <ScreenContainer
        header={renderCustomHeader()}
        headerBackgroundColor="#4299e1"
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có dữ liệu kết quả</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Determine if this is a measurement service (has step values) or file-based service
  const hasStepValues =
    serviceResult.stepServiceTrackingResponses &&
    serviceResult.stepServiceTrackingResponses.some(
      (step) =>
        step.stepServiceValueTrackings &&
        step.stepServiceValueTrackings.length > 0
    );

  return (
    <ScreenContainer
      scrollable={false}
      style={{ padding: 0 }}
      header={renderCustomHeader()}
      headerBackgroundColor="#4299e1"
    >
      <ScrollView style={styles.container}>
        {/* Service Info Card */}
        <Card style={styles.serviceInfoCard}>
          <Text style={styles.serviceTitle}>{serviceResult.serviceName}</Text>
          <Text style={styles.serviceCode}>
            Mã dịch vụ: {serviceResult.serviceCode?.trim()}
          </Text>
          {serviceResult.serviceNote && (
            <Text style={styles.serviceNote}>{serviceResult.serviceNote}</Text>
          )}
          {serviceResult.resultDescription && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Mô tả kết quả:</Text>
              <Text style={styles.descriptionText}>
                {serviceResult.resultDescription}
              </Text>
            </View>
          )}
        </Card>

        {/* Step Values (for measurement services) */}
        {hasStepValues && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết thông số</Text>
            <FlatList
              data={serviceResult.stepServiceTrackingResponses}
              renderItem={renderStepItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Files Section */}
        {processedFiles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tệp kết quả</Text>
            <Card style={styles.filesCard}>
              <FlatList
                data={processedFiles}
                renderItem={renderFileItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </Card>
          </View>
        )}

        {/* Empty state for no results */}
        {!hasStepValues && processedFiles.length === 0 && (
          <View style={styles.emptyResultContainer}>
            <Icon name="document-text-outline" size={48} color="#9E9E9E" />
            <Text style={styles.emptyResultText}>Chưa có kết quả chi tiết</Text>
            <Text style={styles.emptyResultSubtext}>
              Kết quả sẽ được cập nhật sau khi hoàn thành
            </Text>
          </View>
        )}
      </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4299e1",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  headerRightPlaceholder: {
    width: 40,
  },
  serviceInfoCard: {
    margin: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4299e1",
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  serviceCode: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  serviceNote: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 8,
  },
  descriptionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  stepCard: {
    marginBottom: 8,
    padding: 12,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stepName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  valuesContainer: {
    marginTop: 8,
  },
  valueItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    marginBottom: 4,
  },
  valueName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4299e1",
  },
  maxValueText: {
    fontSize: 14,
    color: "#666",
  },
  valueNote: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
  },
  filesCard: {
    padding: 8,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  fileType: {
    fontSize: 14,
    color: "#666",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 8,
  },
  emptyResultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyResultText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  emptyResultSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
});

export default CheckupResultDetailScreen;
