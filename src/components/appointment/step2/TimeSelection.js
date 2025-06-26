import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Button from "../../common/Button";
import { getAvailableTimeSlotsByDate } from "../../../services/workingDateService";

const TimeSelection = ({
  currentDate,
  currentTime,
  setCurrentTime,
  setStep,
}) => {
  const [processedTimeSlots, setProcessedTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to convert API time blocks to display format
  const convertApiTimeToDisplayFormat = (blocks) => {
    if (!blocks || blocks.length === 0) return [];

    return blocks.map((block, index) => {
      // Parse ISO date strings
      const startTime = new Date(block.startBlock);
      const endTime = new Date(block.endBlock);

      // Format time to HH:MM - try both local and UTC to see which one makes sense
      const formatTime = (date) => {
        const localHours = date.getHours().toString().padStart(2, "0");
        const localMinutes = date.getMinutes().toString().padStart(2, "0");
        return `${localHours}:${localMinutes}`;
      };

      const timeSlot = {
        id: (index + 1).toString(),
        time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
        startHour: startTime.getHours(), // Use local time
        startMinute: startTime.getMinutes(),
        available: block.isAvailable,
        isPast: false, // Will be calculated later based on current time
        rawStartTime: startTime, // Keep raw time for debugging
        rawEndTime: endTime,
      };

      console.log(`Block ${index + 1}:`, {
        startBlock: block.startBlock,
        endBlock: block.endBlock,
        localStartTime: startTime.toLocaleString(),
        utcStartTime: startTime.toISOString(),
        formatted: timeSlot,
      });

      return timeSlot;
    });
  };

  // Fetch time slots from API
  const fetchTimeSlots = async (selectedDate) => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getAvailableTimeSlotsByDate(selectedDate);

      if (response.isSuccess && response.value && response.value.blocks) {
        const timeSlots = convertApiTimeToDisplayFormat(response.value.blocks);

        // Process time slots based on current time if it's today
        const now = new Date();
        const [day, month, year] = selectedDate
          .split("/")
          .map((num) => parseInt(num, 10));
        const selectedDateObj = new Date(year, month - 1, day);

        const isToday =
          selectedDateObj.getDate() === now.getDate() &&
          selectedDateObj.getMonth() === now.getMonth() &&
          selectedDateObj.getFullYear() === now.getFullYear();

        console.log("Is today:", isToday);
        console.log("Time slots from API:", timeSlots);

        // Use local time for comparison
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        console.log("Current time:", {
          currentHour,
          currentMinute,
          currentTime: now.toLocaleString(),
          isToday,
        });

        const processedSlots = timeSlots.map((slot) => {
          if (isToday) {
            const isPast =
              slot.startHour < currentHour ||
              (slot.startHour === currentHour &&
                slot.startMinute <= currentMinute);

            console.log(
              `Slot ${slot.time}: startHour=${slot.startHour}, currentHour=${currentHour}, isPast=${isPast}`
            );

            return {
              ...slot,
              available: slot.available && !isPast,
              isPast: isPast,
            };
          }
          return slot;
        });

        console.log("Processed slots:", processedSlots);
        setProcessedTimeSlots(processedSlots);

        // Clear selected time if it's no longer available
        if (currentTime) {
          const selectedSlot = processedSlots.find(
            (slot) => slot.id === currentTime.id
          );
          if (selectedSlot && !selectedSlot.available) {
            setCurrentTime(null);
          }
        }
      } else {
        setError("Không thể tải thông tin khung giờ");
        setProcessedTimeSlots([]);
      }
    } catch (err) {
      console.error("Error fetching time slots:", err);
      setError("Lỗi khi tải khung giờ khám");
      setProcessedTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };
  // Load time slots when date changes
  useEffect(() => {
    if (currentDate) {
      fetchTimeSlots(currentDate);
    }
  }, [currentDate]);

  // Helper function to check if a time slot is available
  const isTimeSlotAvailable = (timeSlot) => {
    return timeSlot.available !== false;
  };

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

  const renderTimeSlot = ({ item }) => {
    const isSelected = currentTime?.id === item.id;
    const isAvailable = isTimeSlotAvailable(item);

    return (
      <TouchableOpacity
        style={[
          styles.timeSlotCard,
          isSelected && styles.selectedTimeSlotCard,
          !isAvailable && styles.unavailableTimeSlotCard,
        ]}
        onPress={() => handleTimeSelect(item)}
        disabled={!isAvailable}
        activeOpacity={0.7}
      >
        <View style={styles.timeSlotContent}>
          <Text
            style={[
              styles.timeText,
              isSelected && styles.selectedTimeText,
              !isAvailable && styles.unavailableTimeText,
            ]}
          >
            {item.time}
          </Text>
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Icon name="checkmark-circle" size={20} color="#0071CE" />
            </View>
          )}
          {!isAvailable && (
            <View style={styles.unavailableContainer}>
              <Text style={styles.unavailableLabel}>
                {item.isPast ? "Đã qua" : "Đã hết"}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Chọn Giờ Khám</Text>

      <View style={styles.dateInfoContainer}>
        <Icon name="calendar" size={18} color="#0071CE" />
        <Text style={styles.dateInfo}>Ngày khám: {currentDate}</Text>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#0071CE" }]} />
          <Text style={styles.legendText}>Đã chọn</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
            ]}
          />
          <Text style={styles.legendText}>Có thể chọn</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#f5f5f5" }]} />
          <Text style={styles.legendText}>Đã hết/Đã qua</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0071CE" />
          <Text style={styles.loadingText}>Đang tải khung giờ...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={40} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchTimeSlots(currentDate)}
          >
            <Icon name="refresh" size={16} color="#0071CE" />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : processedTimeSlots && processedTimeSlots.length > 0 ? (
        <FlatList
          data={processedTimeSlots}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.timeSlotRow}
          renderItem={renderTimeSlot}
          contentContainerStyle={styles.timeSlotsList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="time-outline" size={40} color="#999" />
          <Text style={styles.emptyStateText}>
            Không có khung giờ nào khả dụng
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Vui lòng chọn ngày khám khác
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title="Xác Nhận Giờ Khám"
          onPress={handleConfirm}
          disabled={!currentTime}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    paddingHorizontal: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  dateInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateInfo: {
    fontSize: 16,
    color: "#0071CE",
    fontWeight: "500",
    marginLeft: 8,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  timeSlotsList: {
    paddingBottom: 16,
  },
  timeSlotRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timeSlotCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedTimeSlotCard: {
    borderColor: "#0071CE",
    borderWidth: 2,
    backgroundColor: "#f0f8ff",
  },
  unavailableTimeSlotCard: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },
  timeSlotContent: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  timeText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
  selectedTimeText: {
    color: "#0071CE",
    fontWeight: "600",
  },
  unavailableTimeText: {
    color: "#999",
  },
  checkmarkContainer: {
    marginTop: 8,
  },
  unavailableContainer: {
    marginTop: 4,
    alignItems: "center",
  },
  unavailableLabel: {
    fontSize: 11,
    color: "#f44336",
    marginTop: 2,
  },
  footer: {
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#f5f7fa",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginTop: 16,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginTop: 16,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginTop: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f44336",
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#0071CE",
  },
  retryText: {
    fontSize: 14,
    color: "#0071CE",
    marginLeft: 4,
    fontWeight: "500",
  },
});

export default TimeSelection;
