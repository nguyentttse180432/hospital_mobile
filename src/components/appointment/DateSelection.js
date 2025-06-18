import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Button from "../common/Button";

const DateSelection = ({
  currentDate,
  setCurrentDate,
  setCurrentTime,
  setStep,
}) => {
  const handleDateSelect = (day) => {
    const selectedDate = `${day.toString().padStart(2, "0")}/05/2025`;
    setCurrentDate(selectedDate);
    setCurrentTime(null); // Clear time selection when date changes
  };

  const handleContinue = () => {
    if (currentDate) {
      setStep(2.4); // Move to time selection
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Chọn Ngày Khám</Text>
      <View style={styles.calendar}>
        <Text style={styles.month}>Tháng 05 - 2025</Text>
        <View style={styles.weekDays}>
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.days}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const isToday = day === 24; // Current date: May 24, 2025
            const selectedDay = currentDate
              ? parseInt(currentDate.split("/")[0])
              : null;
            const isSelected = selectedDay === day;
            const isAvailable = day >= 24; // Only future dates are available

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.day,
                  isSelected && styles.selectedDay,
                  isToday && styles.todayDay,
                  !isAvailable && styles.unavailableDay,
                ]}
                onPress={() => {
                  if (isAvailable) {
                    handleDateSelect(day);
                  }
                }}
                disabled={!isAvailable}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && styles.todayDayText,
                    !isAvailable && styles.unavailableDayText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Button
        title="Tiếp Tục"
        onPress={handleContinue}
        disabled={!currentDate}
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
    marginBottom: 20,
  },
  calendar: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  month: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekDay: {
    width: 32,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  days: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  day: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 16,
  },
  dayText: {
    fontSize: 14,
    color: "#333",
  },
  todayDay: {
    backgroundColor: "#e3f2fd",
  },
  todayDayText: {
    fontWeight: "600",
    color: "#1976d2",
  },
  selectedDay: {
    backgroundColor: "#1e88e5",
  },
  selectedDayText: {
    color: "white",
    fontWeight: "600",
  },
  unavailableDay: {
    opacity: 0.4,
  },
  unavailableDayText: {
    color: "#aaa",
  },
});

export default DateSelection;
