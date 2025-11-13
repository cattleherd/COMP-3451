import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import LottieView from "lottie-react-native";
import myAnimation from "../../public/assets/lottie/lightning.json"; // lightning animation

// This local component renders the Lottie animation as a full-screen background
const FullScreenLottie = ({ data }) => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <View style={styles.clip}>
        <LottieView
          source={data}
          autoPlay
          loop={true} //l oop the  animation
          speed={1}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

// --- Main Screen Component ---
const EndOfGameScreen = ({ navigation, route }) => {
  // Get the total score, with a fallback to 0
  const { totalScore } = route.params ?? { totalScore: 0 };

  // We only need one animation value to fade everything in
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation Logic: Fade in all content at once
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, // Fade from 0 (invisible) to 1 (visible)
      duration: 600,
      delay: 200, // A slight delay to let the animation start
      useNativeDriver: true,
    }).start();
  }, []); // Empty array so it only runs once on mount

  // Handler to go back to the main map
  const handleReturnToMap = () => {
    // popToTop clears the lesson history stack and returns to the first screen
    navigation.popToTop();
  };

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <FullScreenLottie data={myAnimation} />

      <SafeAreaView style={styles.contentContainer} edges={["top", "bottom"]}>
        <View style={styles.mainContent}>
          <Animated.View
            style={[{ opacity: fadeAnim }, styles.titleContainer]}
          >
            <Text style={styles.title}>Lesson Complete!</Text>
            <Text style={styles.subtitle}>Your Score: {totalScore}</Text>
          </Animated.View>
        </View>

        {/* Footer (bottom-aligned) */}
        <View style={styles.footerContent}>
          <Animated.View style={{ opacity: fadeAnim, width: "90%" }}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleReturnToMap}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#0D0D2B", 
  },
  // Lottie 
  clip: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  // Layout  
  contentContainer: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footerContent: {
    alignItems: "center",
    paddingBottom: 20,
  },
  // Title 
  titleContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#E0E0E0",
    marginTop: 10,
  },
  // Button 
  button: {
    backgroundColor: "#FFD300", 
    paddingVertical: 18,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 8,
    borderBottomColor: "#FFAA00", 
    elevation: 8,
  },
  buttonText: {
    fontSize: 20,
    color: "#0D0D2B",
    fontWeight: "800",
    textTransform: "uppercase",
  },
});

export default EndOfGameScreen;