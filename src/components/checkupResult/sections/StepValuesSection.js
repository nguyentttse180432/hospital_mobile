import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Card from "../../common/Card";
import Icon from "react-native-vector-icons/Ionicons";

const StepValueItem = ({ item }) => (
  <View style={styles.valueItem}>
    <Text style={styles.valueName}>{item.name}</Text>
    <View style={styles.valueContainer}>
      <Text style={styles.valueText}>{item.value}</Text>
      <Text style={styles.maxValueText}>/{item.maxValue}</Text>
    </View>
    {item.note && <Text style={styles.valueNote}>{item.note}</Text>}
  </View>
);

const StepItem = ({ item }) => (
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
            renderItem={({ item }) => <StepValueItem item={item} />}
            keyExtractor={(valueItem) => valueItem.id}
            scrollEnabled={false}
          />
        </View>
      )}
  </Card>
);

const StepValuesSection = ({ steps }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Chi tiết thông số</Text>
      <FlatList
        data={steps}
        renderItem={({ item }) => <StepItem item={item} />}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
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
});

export default StepValuesSection;
