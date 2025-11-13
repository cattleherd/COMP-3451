import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native"; // to render lottie animations
import replayAnim from "../../public/assets/lottie/replay.json"; // lottie data file

// component to render a lottie animation, where data is the lottie animation JSON data
const FullScreenLottie = ({ data }) => {
  return (
    <View style={[StyleSheet.absoluteFillObject, { pointerEvents: "none" }]}>
      {" "}
      <View style={styles.clip}>
        <LottieView
          source={data}
          autoPlay
          loop={false}
          speed={0.4}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

const ReplayTransitionScreen = ({ route, navigation }) => {
  const { gamesToReplay, lessonData, lessonTitle, originalScores } =
    route.params ?? {}; // object destructuring to get the props from lessonGames, or {} of empty

  // Animation state (title cycles from 0 opacity to 100, same with button)
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;

  // Animation Logic - make the button and title fade from 0 to 100% opacity, in parallel
  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // the dependency array empty, so it plays once on mount

  // navigation logic -once the replay animation is played, switch over to LessonGames
  // but this time, the replay branch executes, and we forward over the props
  const handleStartReplay = () => {
    navigation?.replace?.("LessonGames", {
      lessonData,
      lessonTitle,
      gamesToReplay,
      isReplay: true,
      originalScores,
    });
  };

  // render UI
  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <FullScreenLottie data={replayAnim} />
      <SafeAreaView style={styles.contentContainer} edges={["top", "bottom"]}>
        <View style={styles.mainContent}>
          <Animated.View
            style={[{ opacity: titleFadeAnim }, styles.titleContainer]}
          >
            <Text style={styles.titleMain}>Review what you missed</Text>
          </Animated.View>
        </View>
        <View style={styles.footerContent}>
          <Animated.View style={{ opacity: buttonFadeAnim, width: "90%" }}>
            <TouchableOpacity style={styles.button} onPress={handleStartReplay}>
              <Text style={styles.buttonText}>CONTINUE</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: "#ff60a0ff" },
  // Lottie
  clip: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  // Main Layout
  contentContainer: { flex: 1 },
  mainContent: {
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
  },
  footerContent: {
    alignItems: "center",
    paddingBottom: 20,
  },
  // Title Styles
  titleContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  titleMain: {
    fontSize: 40,
    fontWeight: "1000",
    color: "#ff7da4ff",
    textAlign: "center",
  },
  // Button Styles
  button: {
    backgroundColor: "#ffa5c4ff",
    paddingVertical: 18,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 6,
    borderBottomColor: "#D94A80",
    shadowColor: "#D94A80",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
});

export default ReplayTransitionScreen;
