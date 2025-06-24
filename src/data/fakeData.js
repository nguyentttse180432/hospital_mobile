// Dữ liệu giả cho hồ sơ người dùng
export const fakeUserProfile = {
  id: "user123",
  fullName: "Nguyễn Văn A",
  gender: "Male",
  phone: "0987654321",
  email: "nguyenvana@example.com",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  bhyt: "SV12345678",
  idNumber: "079123456789",
  dob: "01/01/1990",
};

// Dữ liệu giả cho lịch hẹn sắp tới
export const fakeUpcomingAppointments = [
  {
    id: "app001",
    code: "2506001",
    patientId: "user123",
    bookingDate: "2025-06-25T09:00:00.000Z",
    status: "Scheduled",
    room: "Phòng 101",
    doctor: "BS. Nguyễn Văn B",
    services: {
      packages: {
        id: "pkg001",
        name: "Gói khám tổng quát",
        price: 1500000,
      },
      services: [],
    },
  },
  {
    id: "app002",
    code: "2806002",
    patientId: "user123",
    bookingDate: "2025-06-28T14:00:00.000Z",
    status: "Scheduled",
    room: "Phòng 205",
    doctor: "BS. Trần Thị C",
    services: {
      packages: null,
      services: [
        {
          id: "srv001",
          name: "Khám tim mạch",
          price: 450000,
        },
        {
          id: "srv002",
          name: "Xét nghiệm máu",
          price: 350000,
        },
      ],
    },
  },
];

// Dữ liệu giả cho lịch sử khám đã hoàn thành
export const fakeCompletedAppointments = [
  {
    id: "app003",
    code: "1006003",
    patientId: "user123",
    bookingDate: "2025-06-10T10:00:00.000Z",
    status: "Completed",
    room: "Phòng 103",
    doctor: "BS. Lê Thị D",
    services: {
      packages: {
        id: "pkg002",
        name: "Khám sức khỏe định kỳ",
        price: 1200000,
      },
      services: [],
    },
    diagnosis: "Sức khỏe tốt, cần bổ sung dinh dưỡng",
    hasFeedback: false,
  },
  {
    id: "app004",
    code: "0506004",
    patientId: "user123",
    bookingDate: "2025-06-05T15:30:00.000Z",
    status: "Completed",
    room: "Phòng 202",
    doctor: "BS. Phạm Văn E",
    services: {
      packages: null,
      services: [
        {
          id: "srv003",
          name: "Siêu âm ổ bụng",
          price: 500000,
        },
      ],
    },
    diagnosis: "Viêm dạ dày nhẹ, cần điều trị và theo dõi",
    hasFeedback: true,
    feedback: {
      rating: 4,
      comment: "Bác sĩ tận tình, nhưng thời gian chờ đợi hơi lâu",
    },
  },
  {
    id: "app005",
    code: "2005005",
    patientId: "user123",
    bookingDate: "2025-05-20T08:00:00.000Z",
    status: "Completed",
    room: "Phòng 105",
    doctor: "BS. Hoàng Thị F",
    services: {
      packages: null,
      services: [
        {
          id: "srv004",
          name: "Khám tai mũi họng",
          price: 400000,
        },
        {
          id: "srv005",
          name: "Nội soi tai mũi họng",
          price: 700000,
        },
      ],
    },
    diagnosis: "Viêm xoang mạn tính, cần dùng thuốc đều đặn",
    hasFeedback: true,
    feedback: {
      rating: 5,
      comment: "Rất hài lòng với dịch vụ và chuyên môn của bác sĩ",
    },
  },
];

// Hàm mô phỏng API call để lấy thông tin người dùng
export const getFakeUserProfile = async () => {
  // Giả lập delay mạng
  await new Promise((resolve) => setTimeout(resolve, 800));
  return fakeUserProfile;
};

// Hàm mô phỏng API call để lấy lịch hẹn của người dùng
export const getFakePatientAppointments = async (patientId) => {
  try {
    if (!patientId) {
      console.warn("getFakePatientAppointments: Missing patientId");
      return [];
    }

    // Giả lập delay mạng
    await new Promise((resolve) => setTimeout(resolve, 1200));

    console.log(`Looking for appointments with patient ID: ${patientId}`);

    // DEBUG: In ra tất cả ID người dùng trong dữ liệu giả để kiểm tra
    console.log(
      "Available upcoming appointment patient IDs:",
      fakeUpcomingAppointments.map((a) => a.patientId)
    );
    console.log(
      "Available completed appointment patient IDs:",
      fakeCompletedAppointments.map((a) => a.patientId)
    );

    // Khi sử dụng fake data, luôn trả về tất cả lịch hẹn mà không cần lọc theo ID
    // Điều này giúp đảm bảo có dữ liệu để hiển thị trong quá trình demo
    return [...fakeUpcomingAppointments, ...fakeCompletedAppointments];
  } catch (error) {
    console.error("Error in getFakePatientAppointments:", error);
    return []; // Trả về mảng rỗng khi có lỗi
  }
};

// Hàm mô phỏng API call để lấy chi tiết một lịch hẹn
export const getFakeAppointmentById = async (appointmentId) => {
  try {
    if (!appointmentId) {
      console.warn("getFakeAppointmentById: Missing appointmentId");
      return null;
    }

    // Giả lập delay mạng
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Tìm lịch hẹn trong cả hai danh sách
    const allAppointments = [
      ...fakeUpcomingAppointments,
      ...fakeCompletedAppointments,
    ];
    const appointment = allAppointments.find(
      (appt) => appt.id === appointmentId
    );

    if (!appointment) {
      console.warn(`Appointment with ID ${appointmentId} not found`);
      return null;
    }

    console.log(`Found appointment with ID: ${appointmentId}`);
    return appointment;
  } catch (error) {
    console.error("Error in getFakeAppointmentById:", error);
    return null; // Trả về null khi có lỗi
  }
};

// Hàm mô phỏng API call để gửi đánh giá
export const submitFakeFeedback = async (appointmentId, feedbackData) => {
  try {
    if (!appointmentId) {
      console.warn("submitFakeFeedback: Missing appointmentId");
      return {
        isSuccess: false,
        message: "Missing appointment ID",
        data: null,
      };
    }

    // Giả lập delay mạng
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log(
      `Submitting feedback for appointment ID: ${appointmentId}`,
      feedbackData
    );

    // Trả về kết quả giả
    return {
      isSuccess: true,
      message: "Feedback submitted successfully",
      data: {
        appointmentId,
        ...feedbackData,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error in submitFakeFeedback:", error);
    return {
      isSuccess: false,
      message: "Error submitting feedback",
      data: null,
    };
  }
};
