import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Card from "../common/Card";
import Button from "../common/Button";

const TimeSelection = ({
  currentDate,
  currentTime,
  setCurrentTime,
  setStep,
  timeSlots,
}) => {
  const allTimeSlots = [
    { id: "1", time: "06:00 - 07:00", room: "P101" },
    { id: "2", time: "07:00 - 08:00", room: "P102" },
    { id: "3", time: "08:00 - 09:00", room: "P103" },
    { id: "4", time: "09:00 - 10:00", room: "P104" },
    { id: "5", time: "10:00 - 11:00", room: "P105" },
    { id: "6", time: "11:00 - 12:00", room: "P106" },
    { id: "7", time: "13:30 - 14:30", room: "P201" },
    { id: "8", time: "14:30 - 15:30", room: "P202" },
    { id: "9", time: "15:30 - 16:30", room: "P203" },
  ];

  // For now, let's assume all time slots are available
  // Later we can fetch available time slots from the backend based on date and selected package/services
  const availableTimeSlots = allTimeSlots;

  const isTimeSlotAvailable = (timeSlot) => true; // All slots available for now

  const handleTimeSelect = (timeSlot) => {
    if (isTimeSlotAvailable(timeSlot)) {
      setCurrentTime(timeSlot);
    }
  };

  const handleConfirm = () => {
    if (currentTime) {
      setStep(2); // Return to main appointment selection screen
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Chọn Giờ Khám</Text>
      <Text style={styles.dateInfo}>Ngày khám: {currentDate}</Text>

      <FlatList
        data={allTimeSlots}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.timeSlotRow}
        renderItem={({ item }) => (
          <Card
            onPress={() => handleTimeSelect(item)}
            selected={currentTime?.id === item.id}
            disabled={!isTimeSlotAvailable(item)}
            style={styles.timeSlotCard}
          >
            <Text
              style={[
                styles.timeText,
                currentTime?.id === item.id && styles.selectedTimeText,
                !isTimeSlotAvailable(item) && styles.unavailableTimeText,
              ]}
            >
              {item.time}
            </Text>
            <Text
              style={[
                styles.roomText,
                currentTime?.id === item.id && styles.selectedRoomText,
                !isTimeSlotAvailable(item) && styles.unavailableRoomText,
              ]}
            >
              {item.room}
            </Text>
            {currentTime?.id === item.id && (
              <Icon
                name="checkmark-circle"
                size={20}
                color="#2ecc71"
                style={styles.checkIcon}
              />
            )}
          </Card>
        )}
      />

      <Button
        title="Xác Nhận"
        onPress={handleConfirm}
        disabled={!currentTime}
        style={{ marginTop: 16 }}
      />
    </View>
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
    marginBottom: 12,
  },
  dateInfo: {
    fontSize: 16,
    color: "#0071CE",
    marginBottom: 20,
  },
  timeSlotRow: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeSlotCard: {
    width: "48%",
    padding: 12,
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
  roomText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  selectedTimeText: {
    color: "#1e88e5",
    fontWeight: "600",
  },
  selectedRoomText: {
    color: "#1e88e5",
  },
  unavailableTimeText: {
    color: "#aaa",
  },
  unavailableRoomText: {
    color: "#aaa",
  },
  checkIcon: {
    marginTop: 6,
  },
});

export default TimeSelection;
