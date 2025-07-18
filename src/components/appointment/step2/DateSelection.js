import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Button from "../../common/Button";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getCurrentMonthDate } from "../../../services/workingDateService";
import { getSystemTime } from "../../../services/workingDateService";

const { width: screenWidth } = Dimensions.get("window");

const DateSelection = ({
  currentDate,
  setCurrentDate,
  setCurrentTime,
  setStep,
}) => {
  // State for system time
  const [systemTime, setSystemTime] = React.useState(null);
  const [systemTimeLoading, setSystemTimeLoading] = React.useState(true);
  const [systemTimeError, setSystemTimeError] = React.useState(null);

  // Fetch system time on mount
  React.useEffect(() => {
    const fetchSystemTime = async () => {
      setSystemTimeLoading(true);
      setSystemTimeError(null);
      try {
        const response = await getSystemTime();
        if (response && response.isSuccess && response.value) {
          setSystemTime(new Date(response.value));
        } else {
          setSystemTimeError("Không lấy được thời gian hệ thống.");
        }
      } catch (err) {
        setSystemTimeError("Lỗi khi lấy thời gian hệ thống.");
      } finally {
        setSystemTimeLoading(false);
      }
    };
    fetchSystemTime();
  }, []);

  // Use systemTime instead of today
  const today = systemTime || new Date();
  console.log("Current system time:", today);

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-based (0 = January)
  const currentDay = today.getDate();

  // Calculate tomorrow's date
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Calculate the next valid date (tomorrow, or Monday if tomorrow is Sunday)
  const nextValidDate = new Date(tomorrow);
  if (nextValidDate.getDay() === 0) {
    // 0 = Sunday
    nextValidDate.setDate(nextValidDate.getDate() + 1); // Move to Monday
  }

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
      // The API doesn't accept parameters - it returns all working dates for the current month
      const response = await getCurrentMonthDate();
      console.log("API response:", response);

      if (response && response.isSuccess) {
        console.log("Working dates data:", response.value);
        setWorkingDates(response.value || []);
      } else {
        console.log("API returned no data, using fallback dates");
        setError(null); // Clear error since we're using fallback data
        // Use fallback dates if API doesn't return expected data
        setWorkingDates(generateFallbackWorkingDates());
      }
    } catch (err) {
      console.error("Error fetching working dates:", err);
      console.log("Using fallback dates due to API error");
      setError(null); // Clear error since we're using fallback data
      // Use fallback dates if API call fails
      setWorkingDates(generateFallbackWorkingDates());
    } finally {
      setLoading(false);
    }
  }, []);

  // Load working dates when component mounts and refresh when display month/year changes
  React.useEffect(() => {
    fetchWorkingDates();
    // We've removed displayMonth and displayYear from dependencies since the API doesn't support filtering by month
  }, [fetchWorkingDates]);

  // Add debugging to inspect the received data
  React.useEffect(() => {
    if (workingDates && workingDates.length > 0) {
      console.log("Working dates loaded:", workingDates.length);
    }
  }, [workingDates]);

  // Helper function to check if a date is a working day
  const isWorkingDay = (year, month, day) => {
    const dateToCheck = new Date(year, month, day);
    dateToCheck.setHours(0, 0, 0, 0);

    // If API data is not loaded yet, do not allow selection
    if (!workingDates || workingDates.length === 0) {
      return false;
    }

    // Try to match with API data if available
    return workingDates.some((workingDate) => {
      // Handle different possible formats from the API
      if (workingDate.workDate) {
        const apiDate = new Date(workingDate.workDate);
        apiDate.setHours(0, 0, 0, 0);
        return (
          dateToCheck.getTime() === apiDate.getTime() &&
          workingDate.isWorkingDay
        );
      } else if (workingDate.date) {
        // Handle DD/MM/YYYY format if that's what the API returns
        const [apiDay, apiMonth, apiYear] = workingDate.date
          .split("/")
          .map(Number);
        return (
          day === apiDay &&
          month + 1 === apiMonth && // +1 because month is 0-based in JS
          year === apiYear &&
          workingDate.isWorkingDay
        );
      }
      return false;
    });
  };

  // Calculate days in selected month
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Function to move to previous/next month
  const goToPreviousMonth = () => {
    // Only allow navigation to the current month
    if (displayMonth === currentMonth && displayYear === currentYear) {
      return;
    }

    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
    setCurrentDate(null); // Clear date selection when changing month
  };

  const goToNextMonth = () => {
    // Only allow navigation to the next month if the next valid date is in that month
    const nextValidMonth = nextValidDate.getMonth();
    const nextValidYear = nextValidDate.getFullYear();

    if (
      (displayMonth === nextValidMonth && displayYear === nextValidYear) ||
      displayYear > nextValidYear ||
      (displayYear === nextValidYear && displayMonth >= nextValidMonth)
    ) {
      return;
    }

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

  // Handle continuing to next step
  const handleContinue = () => {
    if (currentDate) {
      // Use the step value provided in props (2.4) instead of hardcoded value
      setStep(2.4); // Move to time selection
    }
  };

  // Check if a specific date is within the allowed booking window (24 hours or next valid day)
  const isWithinBookingWindow = (year, month, day) => {
    const dateToCheck = new Date(year, month, day);

    // Set time to 00:00:00 for date-only comparison
    dateToCheck.setHours(0, 0, 0, 0);

    const todayDateOnly = new Date(today);
    todayDateOnly.setHours(0, 0, 0, 0);

    const nextValidDateOnly = new Date(nextValidDate);
    nextValidDateOnly.setHours(0, 0, 0, 0);

    // Check if the date matches today or the next valid date
    return (
      dateToCheck.getTime() === todayDateOnly.getTime() ||
      dateToCheck.getTime() === nextValidDateOnly.getTime()
    );
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
      const selectedDay = currentDate
        ? parseInt(currentDate.split("/")[0])
        : null;
      const isSelected = selectedDay === day;

      const dateToCheck = new Date(displayYear, displayMonth, day);
      const todayDate = new Date();

      const isPast =
        dateToCheck <
        new Date(
          todayDate.getFullYear(),
          todayDate.getMonth(),
          todayDate.getDate()
        );

      const isWorkingDayFromApi = isWorkingDay(displayYear, displayMonth, day);

      const isInBookingWindow = isWithinBookingWindow(
        displayYear,
        displayMonth,
        day
      );

      const isAvailable = !isPast && isWorkingDayFromApi && isInBookingWindow;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.day,
            isSelected && styles.selectedDay,
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

  // Function to generate dummy working dates for testing or fallback
  const generateFallbackWorkingDates = () => {
    const dates = [];
    const today = new Date();

    // Add today
    dates.push({
      workDate: today.toISOString(),
      isWorkingDay: true,
    });

    // Add tomorrow or next valid day (Monday if tomorrow is Sunday)
    dates.push({
      workDate: nextValidDate.toISOString(),
      isWorkingDay: true,
    });

    return dates;
  };

  // Show loading/error if system time is not ready
  if (systemTimeLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang lấy thời gian hệ thống...</Text>
      </View>
    );
  }
  if (systemTimeError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{systemTimeError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>
            Đang tải thông tin ngày làm việc...
          </Text>
        </View>
      ) : (
        <View style={styles.calendar}>
          {/* Month navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={[
                styles.navButton,
                (displayYear < currentYear ||
                  (displayYear === currentYear &&
                    displayMonth < currentMonth)) &&
                  styles.navButtonDisabled,
              ]}
              onPress={goToPreviousMonth}
              disabled={
                displayYear < currentYear ||
                (displayYear === currentYear && displayMonth < currentMonth)
              }
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={
                  displayYear < currentYear ||
                  (displayYear === currentYear && displayMonth < currentMonth)
                    ? "#BDBDBD"
                    : "#2196F3"
                }
              />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              Tháng {displayMonth + 1} - {displayYear}
            </Text>

            <TouchableOpacity
              style={[
                styles.navButton,
                ((displayYear === nextValidDate.getFullYear() &&
                  displayMonth >= nextValidDate.getMonth()) ||
                  displayYear > nextValidDate.getFullYear()) &&
                  styles.navButtonDisabled,
              ]}
              onPress={goToNextMonth}
              disabled={
                (displayYear === nextValidDate.getFullYear() &&
                  displayMonth >= nextValidDate.getMonth()) ||
                displayYear > nextValidDate.getFullYear()
              }
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={
                  (displayYear === nextValidDate.getFullYear() &&
                    displayMonth >= nextValidDate.getMonth()) ||
                  displayYear > nextValidDate.getFullYear()
                    ? "#BDBDBD"
                    : "#2196F3"
                }
              />
            </TouchableOpacity>
          </View>

          {/* Booking window notice */}
          <View style={styles.noticeContainer}>
            <Ionicons name="information-circle" size={18} color="#2196F3" />
            <Text style={styles.noticeText}>
              {nextValidDate.getDate() === tomorrow.getDate()
                ? "Bạn chỉ có thể đặt lịch cho hôm nay hoặc ngày mai"
                : "Bạn chỉ có thể đặt lịch cho hôm nay hoặc thứ 2 tới (vì ngày mai là chủ nhật)"}
            </Text>
          </View>

          {/* Week days header */}
          <View style={styles.weekDaysContainer}>
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, index) => (
              <View key={day} style={styles.weekDayItem}>
                <Text
                  style={[
                    styles.weekDayText,
                    (index === 0 || index === 6) && styles.weekendText,
                  ]}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>{renderCalendarDays()}</View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.selectedLegendDot]} />
              <Text style={styles.legendText}>Đã chọn</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.unavailableLegendDot]} />
              <Text style={styles.legendText}>Không khả dụng</Text>
            </View>
          </View>
        </View>
      )}

      <Button
        title="Tiếp Tục"
        onPress={handleContinue}
        disabled={!currentDate}
        style={[
          styles.continueButton,
          {
            opacity: currentDate ? 1 : 0.5,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },
  calendar: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF3",
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8EDF3",
  },
  navButtonDisabled: {
    backgroundColor: "#F5F5F5",
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2196F3",
    textAlign: "center",
  },
  noticeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  noticeText: {
    fontSize: 12,
    color: "#1976D2",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  weekDaysContainer: {
    flexDirection: "row",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  weekDayItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  weekendText: {
    color: "#EF4444",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 4,
  },
  day: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#334155",
  },
  selectedDay: {
    backgroundColor: "#2196F3",
    shadowColor: "#2196F3",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  unavailableDay: {
    backgroundColor: "#F8FAFC",
    opacity: 0.5,
  },
  unavailableDayText: {
    color: "#CBD5E1",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8EDF3",
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  selectedLegendDot: {
    backgroundColor: "#2196F3",
  },
  unavailableLegendDot: {
    backgroundColor: "#CBD5E1",
  },
  legendText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  continueButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default DateSelection;
