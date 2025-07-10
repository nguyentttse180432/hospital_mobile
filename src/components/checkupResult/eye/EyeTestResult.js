import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const EyeTestResult = ({ serviceResult }) => {
  // Animation state for touch feedback
  const opacityAnim = useMemo(() => new Animated.Value(1), []);

  // Handle touch animation
  const handlePressIn = () => {
    Animated.timing(opacityAnim, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // Extract the steps from stepServiceTrackingResponses
  const steps = useMemo(
    () => serviceResult?.stepServiceTrackingResponses || [],
    [serviceResult]
  );

  // Find specific steps
  const visualAcuityStep = useMemo(
    () =>
      steps.find(
        (step) => step.stepName === "Kiểm tra thị lực bằng bảng chữ cái"
      ),
    [steps]
  );
  const refractionStep = useMemo(
    () =>
      steps.find((step) => step.stepName === "Đo độ cận/loạn/viễn bằng máy"),
    [steps]
  );

  // Extract values for visual acuity (Mắt trái, Mắt phải)
  const leftEyeAcuity = useMemo(
    () =>
      visualAcuityStep?.stepServiceValueTrackings?.find(
        (item) => item.name === "Mắt trái"
      ),
    [visualAcuityStep]
  );
  const rightEyeAcuity = useMemo(
    () =>
      visualAcuityStep?.stepServiceValueTrackings?.find(
        (item) => item.name === "Mắt phải"
      ),
    [visualAcuityStep]
  );

  // Extract values for refraction measurements
  const refractionValues = useMemo(
    () => refractionStep?.stepServiceValueTrackings || [],
    [refractionStep]
  );

  // Map measurement names to icons for better visual representation
  const measurementIcons = {
    PD: "resize-outline",
    CYL: "eye-outline",
    "OS / L": "eye-off-outline",
    "OD / R": "eye-outline",
    SPH: "glasses-outline",
    Axis: "compass-outline",
    ADD: "add-circle-outline",
  };

  // Fallback UI for missing data
  if (!visualAcuityStep && !refractionStep) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon name="eye-outline" size={22} color="#1b6cb0" />
          <Text style={styles.headerText}>Kết Quả Đo Thị Lực</Text>
        </View>
        <Text style={styles.noDataText}>
          Không có dữ liệu kết quả đo thị lực
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="eye-outline" size={22} color="#1b6cb0" />
        <Text style={styles.headerText}>Kết Quả Đo Thị Lực</Text>
      </View>

      {/* Visual Acuity Section */}
      {visualAcuityStep && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{visualAcuityStep.stepName}</Text>
          <View style={styles.acuityContainer}>
            <TouchableOpacity
              style={styles.acuityItem}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Animated.View
                style={[styles.acuityItemContent, { opacity: opacityAnim }]}
              >
                <Icon name="eye-outline" size={16} color="#4a5568" />
                <Text style={styles.label}>Mắt Trái</Text>
                <Text style={styles.value}>
                  {leftEyeAcuity?.value || "N/A"}/
                  {leftEyeAcuity?.maxValue || "10"}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acuityItem}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Animated.View
                style={[styles.acuityItemContent, { opacity: opacityAnim }]}
              >
                <Icon name="eye-outline" size={16} color="#4a5568" />
                <Text style={styles.label}>Mắt Phải</Text>
                <Text style={styles.value}>
                  {rightEyeAcuity?.value || "N/A"}/
                  {rightEyeAcuity?.maxValue || "10"}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Divider */}
      {visualAcuityStep && refractionStep && <View style={styles.divider} />}

      {/* Refraction Measurements Section */}
      {refractionStep && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{refractionStep.stepName}</Text>
          <View style={styles.grid}>
            {refractionValues.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridItem}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                <Animated.View
                  style={[styles.gridItemContent, { opacity: opacityAnim }]}
                >
                  <Icon
                    name={
                      measurementIcons[item.name] ||
                      "information-circle-outline"
                    }
                    size={14}
                    color="#4a5568"
                  />
                  <Text style={styles.label}>{item.name}</Text>
                  <Text style={styles.value}>
                    {item.value}/{item.maxValue}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f9fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#1a202c",
    marginLeft: 10,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2d3748",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  acuityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: -4,
  },
  acuityItem: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  acuityItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: -4,
  },
  gridItem: {
    width: "48%",
    marginBottom: 6,
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  gridItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4a5568",
    marginHorizontal: 6,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1b6cb0",
  },
  divider: {
    height: 0.5,
    backgroundColor: "#d1d9e6",
    marginVertical: 10,
  },
  noDataText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#718096",
    textAlign: "center",
    marginVertical: 8,
  },
});

export default EyeTestResult;
