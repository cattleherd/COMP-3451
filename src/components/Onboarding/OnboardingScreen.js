import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

const MAX_PHONE_WIDTH = 412; // max viewport width, web app made for mobile phones

/* --------------------------- Button Component --------------------------- */
const PrimaryButton = ({ label, style, onPress, textStyle }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

/* --------------------------- Welcome Screen --------------------------- */
const WelcomeStep = ({ onNextPress }) => {
  return (
    <View style={styles.page}>
      <Text style={styles.brandText}>SomaliLearn</Text>

      <View style={styles.textContainer}>
        <Text style={styles.mainText}>Aqoonla'aani waa iftiinla'aan.</Text>
        <Text style={styles.subText}>
          The absence of knowledge is the absence of light
        </Text>
      </View>

      <PrimaryButton
        label="Start"
        onPress={onNextPress} // navigation handling, trigger next page when clicked, or navigate to the next screen in stack navigator
        style={styles.bottomButtonContainer}
      />
    </View>
  );
};

/* --------------------------- Second Screen --------------------------- */
const IntroStep = ({ onNextPress }) => {
  return (
    <View style={styles.page}>
      <View style={[styles.textContainer, { marginTop: 0 }]}>
        <Text style={styles.title}>Optimized for fun</Text>
        <Text style={styles.description}>
          These bite-sized lessons are perfect for you to learn whenever you
          have a few free minutes.
        </Text>
      </View>

      <PrimaryButton
        label="Continue"
        onPress={onNextPress}
        style={styles.bottomButtonContainer}
      />
    </View>
  );
};

/* ------------------------- Questionnaire Screen ------------------------- */
const AssessmentStep = ({ onFinish }) => {
  const [selected, setSelected] = useState(null);
  const [showError, setShowError] = useState(false);

  const options = ["None", "Some Words", "Basic Sentences"];

  const handleFinishPress = () => {
    if (selected) {
      onFinish(selected);
    } else {
      setShowError(true);
    }
  };

  const handleOptionPress = (option) => {
    setSelected(option);
    if (showError) setShowError(false);
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>How comfortable are you with Somali?</Text>

      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selected === option && styles.selectedOption,
              showError && !selected && styles.errorOption,
            ]}
            onPress={() => handleOptionPress(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <PrimaryButton
        label="Finish Setup"
        onPress={handleFinishPress}
        style={[styles.finishButton, styles.bottomButtonContainer]}
        textStyle={styles.finishButtonText}
      />
    </View>
  );
};

/* --------------------------- Main App, including the Screens and nav flow -------------------------- */
const OnboardingScreen = ({ navigation }) => {
  // 0 = welcome, 1 = intro, 2 = assessment
  const [page, setpage] = useState(0);
  const { width, height } = useWindowDimensions();

  const handleNext = () => {
    setpage((prev) => Math.min(prev + 1, 2));
  };

  const handleFinishSetup = () => {
    navigation.replace("LearningMap");
  };

  let content; // we conditionally render the content based on page number
  if (page === 0) {
    content = <WelcomeStep onNextPress={handleNext} />;
  } else if (page === 1) {
    content = <IntroStep onNextPress={handleNext} />;
  } else {
    content = <AssessmentStep onFinish={handleFinishSetup} />;
  }

  return (
    <View style={styles.page}>
      <View
        style={[
          styles.container,
          {
            width: Math.min(width, MAX_PHONE_WIDTH),
            height, // full viewport height
          },
        ]}
      >
        {content} {/* Conditionally render the pages */}
      </View>
    </View>
  );
};

/* -------------------------------- Styles -------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  page: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  button: {
    width: "100%",
    maxWidth: 350,
    borderRadius: 20,
    backgroundColor: "#521979",
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginTop: 30,
    alignItems: "center",
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  bottomButtonContainer: {
    marginTop: 40,
    alignSelf: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffef96ff",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 20,
    fontWeight: "400",
    color: "#E6E6FA",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 20,
  },

  brandText: {
    marginLeft: 6,
    fontSize: 46,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: "#62C5FF",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },

  textContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    marginTop: 60,
  },
  mainText: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff4b3ff",
  },
  subText: {
    textAlign: "center",
    fontSize: 18,
    fontStyle: "italic",
    color: "#E6E6FA",
  },

  optionsContainer: {
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    marginBottom: 50,
  },
  errorOption: {
    borderColor: "red",
    borderWidth: 1,
    backgroundColor: "rgba(255,0,0,0.2)",
  },
  optionButton: {
    width: "100%",
    paddingVertical: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "transparent",
    marginBottom: 15,
  },
  selectedOption: {
    borderColor: "#FFD700",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
  },
  optionText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  finishButton: {
    backgroundColor: "#ffec83ff",
    borderColor: "#FFE28A",
  },
  finishButtonText: {
    color: "#191970",
  },
});

export default OnboardingScreen;
