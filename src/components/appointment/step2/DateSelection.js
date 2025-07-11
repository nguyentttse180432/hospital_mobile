import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Button from "../../common/Button";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getCurrentMonthDate } from "../../../services/workingDateService";

const DateSelection = ({
  currentDate,
  setCurrentDate,
  setCurrentTime,
  setStep,
}) => {
  // Get current date info
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-based (0 = January)
  const currentDay = today.getDate();

  // Calendar display settings
  // Show the current month by default
  const [displayMonth, setDisplayMonth] = React.useState(currentMonth);
  const [displayYear, setDisplayYear] = React.useState(currentYear);
  const [workingDates, setWorkingDates] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Fetch working dates from API
  const fetchWorkingDates = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCurrentMonthDate();
      if (response.isSuccess && response.value) {
        setWorkingDates(response.value);
      } else {
        setError("Không thể tải thông tin ngày làm việc");
      }
    } catch (err) {
      console.error("Error fetching working dates:", err);
      setError("Lỗi khi tải thông tin ngày làm việc");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load working dates on component mount
  React.useEffect(() => {
    fetchWorkingDates();
  }, [fetchWorkingDates]);

  // Helper function to check if a date is a working day
  const isWorkingDay = (year, month, day) => {
    const targetDate = new Date(year, month, day);
    const targetDateString = targetDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    const workingDate = workingDates.find((wd) => {
      const workDate = new Date(wd.workDate);
      const workDateString = workDate.toISOString().split("T")[0];
      return workDateString === targetDateString;
    });

    return workingDate ? workingDate.isWorkingDay : false;
  };

  // Calculate days in selected month
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay(); // 0 = Sunday

  // Function to move to previous/next month
  const goToPreviousMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
    setCurrentDate(null); // Clear date selection when changing month
  };

  const goToNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
    setCurrentDate(null); // Clear date selection when changing month
  };
  const handleDateSelect = (day) => {
    // Format date as DD/MM/YYYY
    const month = displayMonth + 1; // Convert 0-based month to 1-based
    const selectedDate = `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${displayYear}`;
    setCurrentDate(selectedDate);
    setCurrentTime(null); // Clear time selection when date changes
  };

  const handleContinue = () => {
    if (currentDate) {
      setStep(2.4); // Move to time selection
    }
  };

  // Create calendar grid with proper layout
  const renderCalendarDays = () => {
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.day}>
          <Text style={styles.dayText}></Text>
        </View>
      );
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        displayYear === currentYear &&
        displayMonth === currentMonth &&
        day === currentDay;

      const selectedDay = currentDate
        ? parseInt(currentDate.split("/")[0])
        : null;
      const isSelected = selectedDay === day;

      const dateToCheck = new Date(displayYear, displayMonth, day);
      const todayDate = new Date();

      // Check if the date is in the past
      const isPast =
        dateToCheck <
        new Date(
          todayDate.getFullYear(),
          todayDate.getMonth(),
          todayDate.getDate()
        );

      // Check if it's a working day from API
      const isWorkingDayFromApi = isWorkingDay(displayYear, displayMonth, day);

      // Date is available if it's not in the past and it's a working day
      const isAvailable = !isPast && isWorkingDayFromApi;

      days.push(
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
          activeOpacity={isAvailable ? 0.7 : 1}
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
    }

    return days;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>
            Đang tải thông tin ngày làm việc...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchWorkingDates}
          >
            <Ionicons name="refresh" size={16} color="#1976d2" />
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.calendar}>
          {/* Month navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={goToPreviousMonth}
              // Disable going to past months
              disabled={
                displayYear < currentYear ||
                (displayYear === currentYear && displayMonth < currentMonth)
              }
            >
              <Ionicons
                name="chevron-back"
                size={24}
                style={[
                  styles.navButtonIcon,
                  (displayYear < currentYear ||
                    (displayYear === currentYear &&
                      displayMonth < currentMonth)) &&
                    styles.navButtonDisabled,
                ]}
              />
            </TouchableOpacity>
            <Text style={styles.month}>
              {
                [
                  "Tháng 1",
                  "Tháng 2",
                  "Tháng 3",
                  "Tháng 4",
                  "Tháng 5",
                  "Tháng 6",
                  "Tháng 7",
                  "Tháng 8",
                  "Tháng 9",
                  "Tháng 10",
                  "Tháng 11",
                  "Tháng 12",
                ][displayMonth]
              }
              - {displayYear}
            </Text>
            <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
              <Ionicons
                name="chevron-forward"
                size={24}
                style={styles.navButtonIcon}
              />
            </TouchableOpacity>
          </View>
          {/* Week days header */}
          <View style={styles.weekDays}>
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <View key={day} style={styles.weekDayContainer}>
                <Text style={styles.weekDay}>{day}</Text>
              </View>
            ))}
          </View>
          {/* Calendar grid */}
          <View style={styles.calendarGrid}>{renderCalendarDays()}</View>
          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.todayDay]} />
              <Text style={styles.legendText}>Hôm nay</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.selectedDay]} />
              <Text style={styles.legendText}>Đã chọn</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.unavailableDay]} />
              <Text style={styles.legendText}>Không khả dụng</Text>
            </View>
          </View>
        </View>
      )}

      {!loading && !error && (
        <Button
          title="Tiếp Tục"
          onPress={handleContinue}
          disabled={!currentDate}
          style={{
            marginTop: 16,
            opacity: currentDate ? 1 : 0.6,
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  calendar: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  navButtonIcon: {
    color: "#1976d2",
  },
  navButtonDisabled: {
    color: "#ccc",
  },
  month: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1976d2",
    textAlign: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  weekDayContainer: {
    width: 40,
    alignItems: "center",
    margin: 2, // Match the exact margin of day cells
  },
  weekDay: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 16,
  },
  day: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  dayText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  todayDay: {
    backgroundColor: "#e3f2fd",
    borderWidth: 2,
    borderColor: "#1976d2",
  },
  todayDayText: {
    fontWeight: "700",
    color: "#1976d2",
  },
  selectedDay: {
    backgroundColor: "#1976d2",
    elevation: 2,
    shadowColor: "#1976d2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  selectedDayText: {
    color: "white",
    fontWeight: "700",
  },
  unavailableDay: {
    opacity: 0.3,
    backgroundColor: "#f0f0f0",
  },
  unavailableDayText: {
    color: "#aaa",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  selectedDateText: {
    fontSize: 16,
    color: "#1976d2",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#1976d2",
  },
  retryText: {
    fontSize: 14,
    color: "#1976d2",
    marginLeft: 4,
    fontWeight: "500",
  },
});

export default DateSelection;
