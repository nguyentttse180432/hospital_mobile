import api from "./api";

// Lấy danh sách ngày làm việc trong tháng hiện tại
export const getCurrentMonthDate = async () => {
  try {
    const response = await api.get(`/WorkingDates`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching working dates:`, error);
    throw error;
  }
};

// Lấy danh sách ngày làm việc  trong tuần hiện tại
export const getCurrentWeekDate = async () => {
  try {
    const response = await api.get(`/WorkingDates/weeks`);
    console.log("Fetched working dates by week:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching working dates by week:`, error);
    throw error;
  }
};

// Lấy danh sách khung giờ làm việc trong ngày
export const getAvailableBookingTime = async (dateTime) => {
  try {
    const response = await api.get(
      `/WorkingDates/availables?dateTime=${dateTime}`
    );
    console.log("Fetched working dates by day:", response.data.value);
    return response.data;
  } catch (error) {
    console.error(`Error fetching working dates by day:`, error);
    throw error;
  }
};

// Lấy danh sách khung giờ làm việc trong ngày cụ thể
export const getAvailableTimeSlotsByDate = async (date) => {
  try {
    // Chuyển đổi date từ DD/MM/YYYY sang YYYY-MM-DDTHH:mm:ss format
    const [day, month, year] = date.split("/");
    const formattedDateTime = `${year}-${month.padStart(2, "0")}-${day.padStart(
      2,
      "0"
    )}T00:00:00`;

    // Sử dụng API có sẵn với parameter dateTime
    const response = await getAvailableBookingTime(formattedDateTime);
    console.log(
      "Fetched available time slots for date:",
      formattedDateTime,
      response.blocks
    );
    return response;
  } catch (error) {
    console.error(
      `Error fetching available time slots for date ${date}:`,
      error
    );
    throw error;
  }
};

//lấy giờ theo hệ thống
export const getSystemTime = async () => {
  try {
    const response = await api.get("/WorkingDates/datetime-server");

    const utcString = response.data.value;
    const dateUTC = new Date(utcString);

    // Tạo ngày mới theo múi giờ Việt Nam (GMT+7)
    const dateVN = new Date(dateUTC.getTime() + 7 * 60 * 60 * 1000);

    return {
      ...response.data,
      vnDateTime: dateVN.toLocaleDateString("vi-VN"),
    };
  } catch (error) {
    console.error(`Error fetching system time:`, error);
    throw error;
  }
};

