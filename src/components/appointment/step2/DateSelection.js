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
import colors from "../../../constant/colors"; // Cập nhật import để sử dụng file colors.js mới

const { width: screenWidth } = Dimensions.get("window");

const DateSelection = ({
  currentDate,
  setCurrentDate,
  setCurrentTime,
  setStep,
}) => {
  // State cho thời gian hệ thống
  const [systemTime, setSystemTime] = React.useState(null);
  const [systemTimeLoading, setSystemTimeLoading] = React.useState(true);
  const [systemTimeError, setSystemTimeError] = React.useState(null);

  // Lấy thời gian hệ thống khi component được mount
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

  // Sử dụng systemTime thay cho today
  const today = systemTime || new Date();
  console.log("Thời gian hệ thống hiện tại:", today);

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-based (0 = Tháng 1)
  const currentDay = today.getDate();

  // Tính ngày mai
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Tính ngày hợp lệ tiếp theo (ngày mai, hoặc thứ Hai nếu ngày mai là Chủ nhật)
  const nextValidDate = new Date(tomorrow);
  if (nextValidDate.getDay() === 0) {
    // 0 = Chủ nhật
    nextValidDate.setDate(nextValidDate.getDate() + 1); // Chuyển sang thứ Hai
  }

  // Cài đặt hiển thị lịch
  // Hiển thị tháng hiện tại theo mặc định
  const [displayMonth, setDisplayMonth] = React.useState(currentMonth);
  const [displayYear, setDisplayYear] = React.useState(currentYear);
  const [workingDates, setWorkingDates] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Lấy danh sách ngày làm việc từ API
  const fetchWorkingDates = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // API không nhận tham số - trả về tất cả ngày làm việc trong tháng hiện tại
      const response = await getCurrentMonthDate();
      console.log("Phản hồi API:", response);

      if (response && response.isSuccess) {
        console.log("Dữ liệu ngày làm việc:", response.value);
        setWorkingDates(response.value || []);
      } else {
        console.log("API không trả dữ liệu, sử dụng dữ liệu dự phòng");
        setError(null); // Xóa lỗi vì đang sử dụng dữ liệu dự phòng
        // Sử dụng dữ liệu dự phòng nếu API không trả dữ liệu mong muốn
        setWorkingDates(generateFallbackWorkingDates());
      }
    } catch (err) {
      console.error("Lỗi khi lấy ngày làm việc:", err);
      console.log("Sử dụng dữ liệu dự phòng do lỗi API");
      setError(null); // Xóa lỗi vì đang sử dụng dữ liệu dự phòng
      // Sử dụng dữ liệu dự phòng nếu gọi API thất bại
      setWorkingDates(generateFallbackWorkingDates());
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải ngày làm việc khi component mount và làm mới khi tháng/năm hiển thị thay đổi
  React.useEffect(() => {
    fetchWorkingDates();
    // Đã loại bỏ displayMonth và displayYear khỏi dependencies vì API không hỗ trợ lọc theo tháng
  }, [fetchWorkingDates]);

  // Gỡ lỗi để kiểm tra dữ liệu nhận được
  React.useEffect(() => {
    if (workingDates && workingDates.length > 0) {
      console.log("Đã tải ngày làm việc:", workingDates.length);
    }
  }, [workingDates]);

  // Hàm hỗ trợ kiểm tra xem một ngày có phải là ngày làm việc không
  const isWorkingDay = (year, month, day) => {
    const dateToCheck = new Date(year, month, day);
    dateToCheck.setHours(0, 0, 0, 0);

    // Nếu dữ liệu API chưa tải, không cho phép chọn
    if (!workingDates || workingDates.length === 0) {
      return false;
    }

    // Kiểm tra khớp với dữ liệu API nếu có
    return workingDates.some((workingDate) => {
      // Xử lý các định dạng khác nhau từ API
      if (workingDate.workDate) {
        const apiDate = new Date(workingDate.workDate);
        apiDate.setHours(0, 0, 0, 0);
        return (
          dateToCheck.getTime() === apiDate.getTime() &&
          workingDate.isWorkingDay
        );
      } else if (workingDate.date) {
        // Xử lý định dạng DD/MM/YYYY nếu API trả về
        const [apiDay, apiMonth, apiYear] = workingDate.date
          .split("/")
          .map(Number);
        return (
          day === apiDay &&
          month + 1 === apiMonth && // +1 vì tháng trong JS là 0-based
          year === apiYear &&
          workingDate.isWorkingDay
        );
      }
      return false;
    });
  };

  // Tính số ngày trong tháng được chọn
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay(); // 0 = Chủ nhật, 1 = Thứ Hai, v.v.

  // Hàm chuyển đến tháng trước/sau
  const goToPreviousMonth = () => {
    // Chỉ cho phép điều hướng đến tháng hiện tại
    if (displayMonth === currentMonth && displayYear === currentYear) {
      return;
    }

    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
    setCurrentDate(null); // Xóa lựa chọn ngày khi đổi tháng
  };

  const goToNextMonth = () => {
    // Chỉ cho phép điều hướng đến tháng tiếp theo nếu ngày hợp lệ nằm trong tháng đó
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
    setCurrentDate(null); // Xóa lựa chọn ngày khi đổi tháng
  };

  const handleDateSelect = (day) => {
    // Định dạng ngày thành DD/MM/YYYY
    const month = displayMonth + 1; // Chuyển tháng 0-based thành 1-based
    const selectedDate = `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${displayYear}`;
    setCurrentDate(selectedDate);
    setCurrentTime(null); // Xóa lựa chọn thời gian khi ngày thay đổi
  };

  // Xử lý tiếp tục đến bước tiếp theo
  const handleContinue = () => {
    if (currentDate) {
      // Sử dụng giá trị step từ props (2.4) thay vì hardcode
      setStep(2.4); // Chuyển sang chọn thời gian
    }
  };

  // Kiểm tra xem một ngày cụ thể có nằm trong khoảng thời gian đặt lịch cho phép không (24 giờ hoặc ngày hợp lệ tiếp theo)
  const isWithinBookingWindow = (year, month, day) => {
    const dateToCheck = new Date(year, month, day);

    // Đặt thời gian về 00:00:00 để so sánh chỉ ngày
    dateToCheck.setHours(0, 0, 0, 0);

    const todayDateOnly = new Date(today);
    todayDateOnly.setHours(0, 0, 0, 0);

    const nextValidDateOnly = new Date(nextValidDate);
    nextValidDateOnly.setHours(0, 0, 0, 0);

    // Kiểm tra xem ngày có khớp với hôm nay hoặc ngày hợp lệ tiếp theo không
    return (
      dateToCheck.getTime() === todayDateOnly.getTime() ||
      dateToCheck.getTime() === nextValidDateOnly.getTime()
    );
  };

  // Tạo lưới lịch với bố cục phù hợp
  const renderCalendarDays = () => {
    const days = [];

    // Thêm các ô trống cho các ngày trước ngày đầu tiên của tháng
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.day}>
          <Text style={styles.dayText}></Text>
        </View>
      );
    }

    // Thêm các ngày thực tế
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

  // Hàm tạo dữ liệu ngày làm việc giả lập để thử nghiệm hoặc dự phòng
  const generateFallbackWorkingDates = () => {
    const dates = [];
    const today = new Date();

    // Thêm hôm nay
    dates.push({
      workDate: today.toISOString(),
      isWorkingDay: true,
    });

    // Thêm ngày mai hoặc ngày hợp lệ tiếp theo (Thứ Hai nếu ngày mai là Chủ nhật)
    dates.push({
      workDate: nextValidDate.toISOString(),
      isWorkingDay: true,
    });

    return dates;
  };

  // Hiển thị loading/error nếu thời gian hệ thống chưa sẵn sàng
  if (systemTimeLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
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
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={styles.loadingText}>
            Đang tải thông tin ngày làm việc...
          </Text>
        </View>
      ) : (
        <View style={styles.calendar}>
          {/* Điều hướng tháng */}
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
                    ? colors.gray
                    : colors.primaryBlue
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
                    ? colors.gray
                    : colors.primaryBlue
                }
              />
            </TouchableOpacity>
          </View>

          {/* Thông báo khung thời gian đặt lịch */}
          <View style={styles.noticeContainer}>
            <Ionicons
              name="information-circle"
              size={18}
              color={colors.primaryBlue}
            />
            <Text style={styles.noticeText}>
              {nextValidDate.getDate() === tomorrow.getDate()
                ? "Bạn chỉ có thể đặt lịch cho hôm nay hoặc ngày mai"
                : "Bạn chỉ có thể đặt lịch cho hôm nay hoặc thứ 2 tới (vì ngày mai là chủ nhật)"}
            </Text>
          </View>

          {/* Tiêu đề ngày trong tuần */}
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

          {/* Lưới lịch */}
          <View style={styles.calendarGrid}>{renderCalendarDays()}</View>

          {/* Chú thích */}
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
    backgroundColor: colors.background, // Thay "#F5F7FA" bằng colors.background
    padding: 16,
  },
  calendar: {
    backgroundColor: colors.white, // Thay "#FFFFFF" bằng colors.white
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.textDark, // Thay "#000" bằng colors.textDark
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
    borderBottomColor: colors.background, // Thay "#E8EDF3" bằng colors.background
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white, // Thay "#F8FAFC" bằng colors.white
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.background, // Thay "#E8EDF3" bằng colors.background
  },
  navButtonDisabled: {
    backgroundColor: colors.background, // Thay "#F5F5F5" bằng colors.background
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primaryBlue, // Thay "#2196F3" bằng colors.primaryBlue
    textAlign: "center",
  },
  noticeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background, // Thay "#E3F2FD" bằng colors.background
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryBlue, // Thay "#2196F3" bằng colors.primaryBlue
  },
  noticeText: {
    fontSize: 12,
    color: colors.primaryBlue, // Thay "#1976D2" bằng colors.primaryBlue
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
    color: colors.textLight, // Thay "#64748B" bằng colors.textLight
  },
  weekendText: {
    color: colors.primaryOrange, // Thay "#EF4444" bằng colors.primaryOrange
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
    color: colors.textDark, // Thay "#334155" bằng colors.textDark
  },
  selectedDay: {
    backgroundColor: colors.primaryBlue, // Thay "#2196F3" bằng colors.primaryBlue
    shadowColor: colors.primaryBlue, // Thay "#2196F3" bằng colors.primaryBlue
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDayText: {
    color: colors.white, // Thay "#FFFFFF" bằng colors.white
    fontWeight: "700",
  },
  unavailableDay: {
    backgroundColor: colors.white, // Thay "#F8FAFC" bằng colors.white
    opacity: 0.5,
  },
  unavailableDayText: {
    color: colors.gray, // Thay "#CBD5E1" bằng colors.gray
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.background, // Thay "#E8EDF3" bằng colors.background
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
    backgroundColor: colors.primaryBlue, // Thay "#2196F3" bằng colors.primaryBlue
  },
  unavailableLegendDot: {
    backgroundColor: colors.gray, // Thay "#CBD5E1" bằng colors.gray
  },
  legendText: {
    fontSize: 12,
    color: colors.textLight, // Thay "#64748B" bằng colors.textLight
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
    backgroundColor: colors.white, // Thay "#FFFFFF" bằng colors.white
    borderRadius: 16,
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight, // Thay "#64748B" bằng colors.textLight
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white, // Thay "#FFFFFF" bằng colors.white
    borderRadius: 16,
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.primaryOrange, // Thay "#EF4444" bằng colors.primaryOrange
    textAlign: "center",
    lineHeight: 24,
  },
});

export default DateSelection;
