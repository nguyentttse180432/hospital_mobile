import React, { useState, useEffect } from "react";
import {
  View,
  Alert,
  ScrollView,
  Linking,
  Animated,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../components/common/ScreenContainer";
import {
  getCheckupRecordServiceResults,
  getVitalSignsResults,
} from "../../services/checkupRecordService";
import * as FileUtils from "../../utils/fileUtils";

// Import all the new components
import {
  ResultHeader,
  ServiceInfoCard,
  VitalSignsDisplay,
  EyeTestResult,
  StepValuesSection,
  FilesSection,
  EmptyResultState,
  LoadingState,
} from "../../components/checkupResult";
import colors from "../../constant/colors";

const CheckupResultDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { serviceId, serviceName, serviceCode, isVitalSign } = route.params;

  const [loading, setLoading] = useState(true);
  const [serviceResult, setServiceResult] = useState(null);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0)); // For fade-in animation
  const [isEyeTestService, setIsEyeTestService] = useState(false);

  useEffect(() => {
    fetchServiceResults();

    // Kiểm tra có phải là dịch vụ đo thị lực hay không
    if (
      serviceName === "Đo thị lực" ||
      (serviceCode && serviceCode.trim() === "MS018")
    ) {
      setIsEyeTestService(true);
    }
  }, [serviceId]);

  // Animation effect when data is loaded
  useEffect(() => {
    if (!loading && serviceResult) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, serviceResult]);

  const fetchServiceResults = async () => {
    try {
      setLoading(true);
      let response;

      // Sử dụng API riêng cho đo sinh hiệu
      if (isVitalSign) {
        response = await getVitalSignsResults(serviceId);
        console.log("Fetched vital signs results:", response);
      } else {
        response = await getCheckupRecordServiceResults(serviceId);
        console.log("Fetched service results:", response);
      }

      if (response && response.isSuccess) {
        const result = response.value;
        console.log("Service result data:", result);
        
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

  if (loading) {
    return (
      <ScreenContainer
        header={
          <ResultHeader
            title={isVitalSign ? "Kết quả đo sinh hiệu" : "Kết quả kiểm tra"}
            onBack={() => navigation.goBack()}
          />
        }
      >
        <LoadingState />
      </ScreenContainer>
    );
  }

  if (!serviceResult) {
    return (
      <ScreenContainer
        header={
          <ResultHeader
            title={isVitalSign ? "Kết quả đo sinh hiệu" : "Kết quả kiểm tra"}
            onBack={() => navigation.goBack()}
          />
        }
      >
        <View style={styles.emptyContainer}>
          <EmptyResultState />
        </View>
      </ScreenContainer>
    );
  }

  // Determine if this is a measurement service (has step values) or file-based service
  const hasStepValues =
    !isVitalSign &&
    serviceResult.stepServiceTrackingResponses &&
    serviceResult.stepServiceTrackingResponses.some(
      (step) =>
        step.stepServiceValueTrackings &&
        step.stepServiceValueTrackings.length > 0
    );

  return (
    <ScreenContainer
      scrollable={false}
      header={
        <ResultHeader
          title={isVitalSign ? "Kết quả đo sinh hiệu" : "Kết quả kiểm tra"}
          onBack={() => navigation.goBack()}
        />
      }
      hasBottomTabs={true}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Service Info Card with enhanced UI */}
        {!isVitalSign && !isEyeTestService && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <ServiceInfoCard serviceResult={serviceResult} />
          </Animated.View>
        )}

        {/* Vital Signs Section with modern UI */}
        {isVitalSign && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <VitalSignsDisplay
              serviceResult={serviceResult}
              fadeAnim={fadeAnim}
            />
          </Animated.View>
        )}

        {/* Eye Test Result with modern UI */}
        {isEyeTestService && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <EyeTestResult
              serviceResult={serviceResult}
            />
          </Animated.View>
        )}

        {/* Files Section */}
        {processedFiles.length > 0 && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0],
                  }),
                },
              ],
              marginTop: 16,
            }}
          >
            <FilesSection files={processedFiles} onFilePress={openFile} />
          </Animated.View>
        )}

        {/* Empty state for no results */}
        {!isVitalSign && !hasStepValues && processedFiles.length === 0 && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              flex: 1,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            }}
          >
            <EmptyResultState />
          </Animated.View>
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
  contentContainer: {
    paddingBottom: 10, // Increased padding to ensure content isn't cut off by bottom tabs
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default CheckupResultDetailScreen;
