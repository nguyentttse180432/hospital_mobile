import api from "./api";

export const getPatients = async () => {
  try {
    const response = await api.get(
      "/Accounts/patients?pageSize=10&pageNumber=1"
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
