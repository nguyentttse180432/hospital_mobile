// src/services/medicalPackageService.js
import api from "./api";

export const getMedicalPackages = async (gender = null, age = null) => {
  try {
    // Build query parameters if gender and/or age are provided
    let url = "/MedicalPackages";
    const params = [];

    // Always set page size to 50
    params.push(`PageSize=50`);

    if (gender) {
      params.push(`Gender=${encodeURIComponent(gender)}`);
    }

    if (age !== null && age !== undefined) {
      params.push(`Age=${encodeURIComponent(age)}`);
    }

    // Add query parameters to URL if any exist
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    const response = await api.get(url);
    console.log("Fetched medical packages:", response.data);

    // Return the entire response including isSuccess flag
    return {
      isSuccess:
        response.data?.isSuccess ||
        (response.status >= 200 && response.status < 300),
      value: processPackageResponse(response.data),
      error: response.data?.error,
    };
  } catch (error) {
    console.error("Error fetching medical packages:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể lấy danh sách gói khám" },
    };
  }
};

export const getMedicalPackageById = async (id) => {
  try {
    const response = await api.get(`/MedicalPackages/${id}`);
    console.log("Fetched medical package:", response.data);

    // Return the entire response including isSuccess flag
    return {
      isSuccess:
        response.data?.isSuccess ||
        (response.status >= 200 && response.status < 300),
      value: response.data?.value || response.data,
      error: response.data?.error,
    };
  } catch (error) {
    console.error("Error fetching medical package details:", error);
    return {
      isSuccess: false,
      error: { message: "Không thể lấy thông tin gói khám" },
    };
  }
};

// Helper function to process different response formats
function processPackageResponse(data) {
  if (data && data.value && data.value.items) {
    return data.value.items.map(formatPackage);
  } else if (data && data.items) {
    return data.items.map(formatPackage);
  } else if (Array.isArray(data)) {
    return data.map(formatPackage);
  } else if (data && data.value) {
    return [formatPackage(data.value)];
  } else {
    console.error("Unexpected response format:", data);
    return [];
  }
}

// Helper function to format package data consistently
function formatPackage(pkg) {
  return {
    id: pkg.id,
    name: pkg.title || pkg.name,
    code: pkg.code,
    description: pkg.description || pkg.shortDescription || "",
    price: pkg.price || 0,
    type: pkg.type,
    targetGroup: pkg.targetGroup,
    imageUrl: pkg.imageUrl || null,
    details: pkg.details || {
      testCategories: pkg.testCategories || [],
    },
    status: pkg.status,
    duration: pkg.duration,
    createdAt: pkg.createdAt,
    updatedAt: pkg.updatedAt,
  };
}
