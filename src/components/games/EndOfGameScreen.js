import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from '@expo/vector-icons';

const EndOfGameScreen = ({ route, navigation }) => {
  const { scores, totalScore, lessonTitle } = route.params;

  const handleReturnToMap = () => {
    navigation.navigate("LearningMap");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Lesson Complete!</Text>
        <FontAwesome5 name="trophy" size={50} color="#FFD700" style={styles.icon} />
        <Text style={styles.lessonTitle}>{lessonTitle}</Text>
        <Text style={styles.scoreText}>Total Score: {totalScore}</Text>
        <TouchableOpacity style={styles.returnButton} onPress={handleReturnToMap}>
          <Text style={styles.returnButtonText}>Return to Map</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFE4B5",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffd058",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#FF4500",
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FF8C00",
  },
  icon: {
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#00CED1",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  returnButton: {
    backgroundColor: "#FF8C00",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  returnButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EndOfGameScreen;