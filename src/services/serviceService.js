import api from "./api";

export const getServices = async () => {
  try {
    const response = await api.get("/Services");

    // Return the entire response including isSuccess flag
    return {
      isSuccess:
        response.data?.isSuccess ||
        (response.status >= 200 && response.status < 300),
      value: processServiceResponse(response.data),
      error: response.data?.error,
    };
  } catch (error) {
    console.error("Error fetching services:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể lấy danh sách dịch vụ" },
    };
  }
};

export const getServiceById = async (id) => {
  try {
    const response = await api.get(`/Services/${id}`);
    console.log("Fetched service:", response.data);

    // Return the entire response including isSuccess flag
    return {
      isSuccess:
        response.data?.isSuccess ||
        (response.status >= 200 && response.status < 300),
      value: formatService(response.data?.value || response.data),
      error: response.data?.error,
    };
  } catch (error) {
    console.error(`Error fetching service with id ${id}:`, error);
    return {
      isSuccess: false,
      error: { message: "Không thể lấy thông tin dịch vụ" },
    };
  }
};

// Helper function to process different response formats
function processServiceResponse(data) {
  if (data && data.value && data.value.items) {
    return data.value.items.map(formatService);
  } else if (data && data.items) {
    return data.items.map(formatService);
  } else if (Array.isArray(data)) {
    return data.map(formatService);
  } else if (data && data.value) {
    return [formatService(data.value)];
  } else {
    console.error("Unexpected response format:", data);
    return [];
  }
}

// Helper function to format service data consistently
function formatService(service) {
  return {
    id: service.id,
    name: service.name || service.title, // Support both name and title fields
    description: service.description || service.note || service.symptom || "",
    price: service.price || 0,
    code: service.code,
    imageUrl: service.imageUrl || null,
    // Include any additional fields that might be needed
    status: service.status,
    duration: service.duration,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}
