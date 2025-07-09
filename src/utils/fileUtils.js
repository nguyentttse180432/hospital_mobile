/**
 * Extract the original filename from a file path
 * @param {string} filePath - The file path (e.g., "uploads/9c0b0fe2-d817-4b4f-9d3a-ad36d5ba250a_lam-sang-tong-quat.pdf")
 * @returns {string} The original filename (e.g., "lam-sang-tong-quat.pdf")
 */
export const getFileName = (filePath) => {
  if (!filePath) return "";

  // Get the filename from the path
  const fileName = filePath.split("/").pop() || "";

  // Remove the UUID prefix (everything before and including the first underscore)
  const underscoreIndex = fileName.indexOf("_");

  if (underscoreIndex !== -1) {
    return fileName.substring(underscoreIndex + 1);
  }

  // If no underscore found, return the original filename
  return fileName;
};

/**
 * Create a full file URL from a file path
 * @param {string} filePath - The file path (e.g., "uploads/9c0b0fe2-d817-4b4f-9d3a-ad36d5ba250a_lam-sang-tong-quat.pdf")
 * @returns {string} The full file URL
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return "";

  // Use hardcoded base URL to avoid dependency issues
  const baseUrl = "https://hair-salon-fpt.io.vn";

  // Ensure filePath starts with '/'
  const cleanFilePath = filePath.startsWith("/") ? filePath : `/${filePath}`;

  return `${baseUrl}${cleanFilePath}`;
};

/**
 * Get file extension from a file path
 * @param {string} filePath - The file path
 * @returns {string} The file extension (e.g., "pdf", "jpg")
 */
export const getFileExtension = (filePath) => {
  if (!filePath) return "";

  const fileName = getFileName(filePath);
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex !== -1) {
    return fileName.substring(lastDotIndex + 1).toLowerCase();
  }

  return "";
};

/**
 * Check if a file is an image based on its extension
 * @param {string} filePath - The file path
 * @returns {boolean} True if the file is an image
 */
export const isImageFile = (filePath) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  const extension = getFileExtension(filePath);
  return imageExtensions.includes(extension);
};

/**
 * Check if a file is a PDF based on its extension
 * @param {string} filePath - The file path
 * @returns {boolean} True if the file is a PDF
 */
export const isPdfFile = (filePath) => {
  return getFileExtension(filePath) === "pdf";
};

/**
 * Check if a file is a CSV based on its extension
 * @param {string} filePath - The file path
 * @returns {boolean} True if the file is a CSV
 */
export const isCsvFile = (filePath) => {
  return getFileExtension(filePath) === "csv";
};

/**
 * Get file type for display purposes
 * @param {string} filePath - The file path
 * @returns {string} File type description
 */
export const getFileType = (filePath) => {
  const extension = getFileExtension(filePath);

  switch (extension) {
    case "pdf":
      return "PDF";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "bmp":
      return "Hình ảnh";
    case "csv":
      return "CSV";
    case "doc":
    case "docx":
      return "Word Document";
    case "xls":
    case "xlsx":
      return "Excel";
    case "txt":
      return "Text";
    default:
      return "File";
  }
};

/**
 * Process test results to include file metadata
 * @param {Array} testResults - Array of test result objects with resultFieldLink
 * @returns {Array} Processed test results with file metadata
 */
export const processTestResults = (testResults) => {
  if (!Array.isArray(testResults)) return [];

  return testResults.map((result) => ({
    ...result,
    fileName: getFileName(result.resultFieldLink),
    fileUrl: getFileUrl(result.resultFieldLink),
    fileExtension: getFileExtension(result.resultFieldLink),
    fileType: getFileType(result.resultFieldLink),
    isImage: isImageFile(result.resultFieldLink),
    isPdf: isPdfFile(result.resultFieldLink),
    isCsv: isCsvFile(result.resultFieldLink),
  }));
};
