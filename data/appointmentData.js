export const specialties = [
  { id: "1", name: "Thần Kinh", fee: "150.000đ" },
  { id: "2", name: "Da Liễu", fee: "150.000đ" },
  { id: "3", name: "Dị Ứng - Miễn Dịch Lâm", fee: "150.000đ" },
];

export const doctors = {
  "Thần Kinh": [
    {
      id: "101",
      name: "BSCKII. Huỳnh Quốc Bảo",
      room: "Phòng 66 - Lầu 1 Khu B",
    },
    {
      id: "102",
      name: "ThS BS. Nguyễn Ngọc Thôi",
      room: "Phòng 66 - Lầu 1 Khu B",
    },
    {
      id: "103",
      name: "BS. Nguyễn Văn Ân",
      room: "Phòng 66 - Lầu 1 Khu B",
    },
  ],
  "Da Liễu": [
    { id: "104", name: "BS. Trần Văn An", room: "Phòng 67 - Lầu 1 Khu B" },
    { id: "105", name: "BS. Trần Thị Thanh", room: "Phòng 67 - Lầu 1 Khu B" },
  ],
  "Dị Ứng - Miễn Dịch Lâm": [
    { id: "106", name: "BS. Nguyễn Văn Bình", room: "Phòng 68 - Lầu 1 Khu B" },
  ],
};

export const timeSlots = {
  "Thần Kinh": {
    "29/05/2025": {
      "BSCKII. Huỳnh Quốc Bảo": [
        { id: "1", time: "06:00 - 07:00", room: "Phòng 20 - Lầu 1 khu A" },
        { id: "2", time: "07:00 - 08:00", room: "Phòng 20 - Lầu 1 khu A" },
      ],
      "ThS BS. Nguyễn Ngọc Thôi": [
        { id: "3", time: "13:30 - 14:30", room: "Phòng 20 - Lầu 1 khu A" },
      ],
      "BS. Nguyễn Văn Ân": [
        { id: "4", time: "08:00 - 09:00", room: "Phòng 21 - Lầu 1 khu A" },
      ],
    },
  },
  "Da Liễu": {
    "29/05/2025": {
      "BS. Trần Văn An": [
        { id: "4", time: "08:00 - 09:00", room: "Phòng 21 - Lầu 1 khu A" },
      ],
      "BS. Trần Thị Thanh": [
        { id: "105", time: "08:00 - 09:00", room: "Phòng 21 - Lầu 1 khu A" },
      ],
    },
  },
  "Dị Ứng - Miễn Dịch Lâm": {
    "29/05/2025": {
      "BS. Nguyễn Văn Bình": [
        { id: "106", time: "08:00 - 09:00", room: "Phòng 68 - Lầu 1 Khu B" },
      ],
    },
  },
};

export const existingProfiles = [
  {
    id: "1",
    fullName: "Trần Thị Thảo Nguyên",
    gender: "Nữ",
    phone: "0914659705",
    address: "Xóm 1 Thôn Liên Trung, Xá Tân Hà, Huyện Lâm Hà, Lâm Đồng",
  },
];
