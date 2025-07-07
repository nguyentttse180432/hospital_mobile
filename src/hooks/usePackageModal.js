import { useState, useRef } from "react";
import { Animated, PanResponder, Dimensions, Vibration } from "react-native";

const { width } = Dimensions.get("window");

export const usePackageModal = (packages, onNavigateCallback) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackageDetails, setSelectedPackageDetails] = useState(null);
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);

  // Animation values
  const [swipeDistance] = useState(new Animated.Value(0));
  const [fadeModalAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [indicatorAnim] = useState(new Animated.Value(0));

  // State for swipe management
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [canSwipe, setCanSwipe] = useState(true);
  const scrollViewRef = useRef(null);

  const showPackageDetails = (pkg) => {
    const packageIndex = packages.findIndex((p) => p.id === pkg.id);
    setSelectedPackageDetails(pkg);
    setCurrentPackageIndex(packageIndex);
    setModalVisible(true);

    // Reset animations
    swipeDistance.setValue(0);
    fadeModalAnim.setValue(1);
    scaleAnim.setValue(1);
    indicatorAnim.setValue(0);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPackageDetails(null);
    setCurrentPackageIndex(0);
    setCanSwipe(true);
    setIsTransitioning(false);

    // Reset all animations
    swipeDistance.setValue(0);
    fadeModalAnim.setValue(1);
    scaleAnim.setValue(1);
    indicatorAnim.setValue(0);
  };

  const handleNavigatePackage = (direction, fromSwipe = false) => {
    if (!selectedPackageDetails || packages.length <= 1 || isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    setCanSwipe(false);

    const currentIndex = packages.findIndex(
      (pkg) => pkg.id === selectedPackageDetails.id
    );

    if (currentIndex === -1) {
      setIsTransitioning(false);
      setCanSwipe(true);
      return;
    }

    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % packages.length;
    } else {
      newIndex = (currentIndex - 1 + packages.length) % packages.length;
    }

    // Animation sequence
    const animationDuration = 300;
    const exitDistance = direction === "next" ? -width * 0.5 : width * 0.5;

    if (!fromSwipe) {
      // If triggered by button press, start exit animation
      Animated.parallel([
        Animated.timing(swipeDistance, {
          toValue: exitDistance,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(fadeModalAnim, {
          toValue: 0.3,
          duration: animationDuration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update package data
        setSelectedPackageDetails(packages[newIndex]);
        setCurrentPackageIndex(newIndex);

        // Reset position and fade back in
        swipeDistance.setValue(
          direction === "next" ? width * 0.5 : -width * 0.5
        );

        Animated.parallel([
          Animated.spring(swipeDistance, {
            toValue: 0,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(fadeModalAnim, {
            toValue: 1,
            duration: animationDuration / 2,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsTransitioning(false);
          setCanSwipe(true);
        });
      });
    } else {
      // If triggered by swipe, complete the motion
      Animated.parallel([
        Animated.timing(swipeDistance, {
          toValue: exitDistance,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(fadeModalAnim, {
          toValue: 0.5,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update package data
        setSelectedPackageDetails(packages[newIndex]);
        setCurrentPackageIndex(newIndex);

        // Animate in from opposite side
        swipeDistance.setValue(
          direction === "next" ? width * 0.5 : -width * 0.5
        );

        Animated.parallel([
          Animated.spring(swipeDistance, {
            toValue: 0,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(fadeModalAnim, {
            toValue: 1,
            duration: animationDuration,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsTransitioning(false);
          setCanSwipe(true);
        });
      });
    }

    // Call the navigate callback if provided
    if (onNavigateCallback) {
      onNavigateCallback(packages[newIndex]);
    }

    // Reset scroll position
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  // Enhanced pan responder with better gesture handling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => canSwipe && !isTransitioning,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      if (!canSwipe || isTransitioning || packages.length <= 1) return false;

      // Only respond to horizontal swipes with minimum movement
      const isHorizontalSwipe =
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      const hasMinimumMovement = Math.abs(gestureState.dx) > 15;

      return isHorizontalSwipe && hasMinimumMovement;
    },
    onPanResponderGrant: () => {
      if (!canSwipe || isTransitioning) return;

      // Start swipe animation
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 150,
        useNativeDriver: true,
      }).start();

      // Show swipe indicator
      Animated.timing(indicatorAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!canSwipe || isTransitioning) return;

      // Apply progressive resistance for natural feel
      const resistance = 0.6;
      const maxDistance = width * 0.4;
      const clampedDx = Math.max(
        -maxDistance,
        Math.min(maxDistance, gestureState.dx * resistance)
      );

      swipeDistance.setValue(clampedDx);

      // Scale effect based on swipe distance
      const scaleValue = 1 - (Math.abs(clampedDx) / maxDistance) * 0.02;
      scaleAnim.setValue(scaleValue);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (!canSwipe || isTransitioning) return;

      const SWIPE_THRESHOLD = 50;
      const VELOCITY_THRESHOLD = 0.5;

      // Hide swipe indicator
      Animated.timing(indicatorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Reset scale
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Determine if swipe should trigger navigation
      const shouldNavigate =
        Math.abs(gestureState.dx) > SWIPE_THRESHOLD ||
        Math.abs(gestureState.vx) > VELOCITY_THRESHOLD;

      if (shouldNavigate) {
        // Provide haptic feedback
        Vibration.vibrate(20);

        if (gestureState.dx > 0) {
          // Swipe right - previous package
          handleNavigatePackage("prev", true);
        } else {
          // Swipe left - next package
          handleNavigatePackage("next", true);
        }
      } else {
        // Not enough swipe distance, spring back
        Animated.spring(swipeDistance, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  return {
    modalVisible,
    selectedPackageDetails,
    currentPackageIndex,
    swipeDistance,
    fadeModalAnim,
    scaleAnim,
    indicatorAnim,
    isTransitioning,
    canSwipe,
    panResponder,
    scrollViewRef,
    showPackageDetails,
    closeModal,
    handleNavigatePackage,
  };
};
