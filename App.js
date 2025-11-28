import React from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Screens
import ReplayTransitionScreen from "./src/components/ReplayTransitionScreen";
import OnboardingScreen from "./src/components/Onboarding/OnboardingScreen";
import LearningMap from "./src/components/LearningMap";
import LessonGames from "./src/components/LessonGames";
import EndOfGameScreen from "./src/components/EndOfGameScreen";

const Stack = createStackNavigator();

// phone reference width just used to cap content width so it looks
const PHONE_W = 412;

// transparent navigation header theme
const TransparentTheme = {
  colors: {
    background: "transparent",
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.outerContainer}>
        <SafeAreaView style={styles.innerContainer}>
          <NavigationContainer theme={TransparentTheme}>
            <Stack.Navigator initialRouteName="OnboardingScreen">
              <Stack.Screen
                options={{ headerShown: false }}
                name="OnboardingScreen"
                component={OnboardingScreen}
              />

              <Stack.Screen
                name="LearningMap"
                component={LearningMap}
                options={{
                  headerShown: false,
                }}
              />

              <Stack.Screen
                name="LessonGames"
                component={LessonGames}
                options={{
                  headerShown: true,
                  headerTransparent: true,
                  headerTitle: "Lesson",
                }}
              />

              <Stack.Screen name="EndOfGame" component={EndOfGameScreen} />

              <Stack.Screen
                name="ReplayTransition"
                options={{
                  headerShown: true,
                  headerTransparent: true,
                  headerTitle: "Lesson",
                }}
                component={ReplayTransitionScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#0F0F23",
    alignItems: "center",
    justifyContent: "center",
  },
  innerContainer: {
    flex: 1,
    width: "100%",
    maxWidth: PHONE_W,
    alignSelf: "center",
  },
});
