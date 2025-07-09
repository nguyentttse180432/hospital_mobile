import { Platform } from "react-native";

/**
 * Calculate bottom padding to avoid bottom tab bar overlap
 * @param {object} insets - Safe area insets from useSafeAreaInsets
 * @param {number} additionalPadding - Additional padding if needed
 * @returns {number} Bottom padding value
 */
export const getBottomTabSafePadding = (insets, additionalPadding = 0) => {
  const baseTabBarHeight = Platform.OS === "android" ? 75 : 60;
  const safeBottom = insets.bottom || 0;
  const totalTabBarHeight = baseTabBarHeight + safeBottom;

  return totalTabBarHeight + additionalPadding;
};

/**
 * Get safe area styles for screens with bottom tab navigation
 * @param {object} insets - Safe area insets from useSafeAreaInsets
 * @param {number} additionalPadding - Additional padding if needed
 * @returns {object} Style object with paddingBottom
 */
export const getBottomTabSafeStyle = (insets, additionalPadding = 0) => ({
  paddingBottom: getBottomTabSafePadding(insets, additionalPadding),
});
