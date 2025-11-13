import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions, 
  SafeAreaView,
  Modal,
  Animated,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

// ---------- Layout & Helpers ------------------
const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

// Ideal phone Dimensions
const PHONE_W = 412;
const PHONE_H = 732;

// Scaling factor so we preserve aspect ratio of ideal phone dimension, for ANY screen
const scale = Math.min(windowWidth / PHONE_W, windowHeight / PHONE_H);

// scaling factor: scales the raw pixels proportional to the window width or height of device, whichever is smaller
const sf = (v) => Math.round(v * scale);

// fisher-yates
function shuffle(array) {
  // local copy
  const newArray = [...array];

  // go backwards from the last item
  for (let i = newArray.length - 1; i > 0; i--) {
    // pick a random index from 0 up to the current position (i)
    const j = Math.floor(Math.random() * (i + 1));

    // switch the current item with the random one
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  // return the shuffled arr
  return newArray;
}

export default function FlashcardLearning({ items, onNextGame }) {
  const currentItem = items[0]; // items pruned to a single item
  /*
    items: 
        [
          {
            id: "waryaa",
            prompt: "Hey! (Male form)",
            translation: "Waryaa",
            options: ["Waryaa", "Nabad", "Fiican", "Waa"],
          }
        ]
*/

  // --------- State --------
  const [options, setOptions] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [selectedCorrect, setSelectedCorrect] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // sliding the modal from offscreen (windowHeight) to on-screen (0)
  const slideAnim = useRef(new Animated.Value(windowHeight)).current;


  // ------------ Logic ---------------
  
  // Initialize the game (shuffle options, reset selection)
  useEffect(() => {
    if (currentItem) {
      setOptions(shuffle(currentItem.options));
      setSelectedChoice(null);
      setSelectedCorrect(null);
    }
  }, [currentItem]); // initialize when currentItem changes


  // Modal sliding into frame logic
  const animateModalIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // modal sliding out of frame logic
  const animateModalOut = (onComplete) => {
    Animated.timing(slideAnim, {
      toValue: windowHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // asynchronous function calls,
      // once the animation is done running, it:
      // 1) does cleanup by resetting showModal to false
      // 2) also, it calls the onComplete function, which triggers parent (LessonGames) to switch games 
      setShowModal(false);
      onComplete();
    });
  };

  // selection logic
  const handleSelect = (e) => {
    if (showModal) return;
    setSelectedChoice(e);
    setSelectedCorrect(e === currentItem.translation);
  };

  // logic for when user submits their answer
  const checkAnswer = () => {
    if (!selectedChoice || showModal) return; 
    setShowModal(true);
    requestAnimationFrame(animateModalIn); // wait for modal to be shown, giving slight delay for setShowModal to trigger repaint
  };

  // logic to proceed to the next game
  const handleContinue = () => {
    const score = selectedCorrect ? 10 : 0; // calculate the score which is passed to parent (LessonGames)
    animateModalOut(() => {
      onNextGame(score);
    });
  };

  // ----------------- Render Component ------------------

  // If no data loaded in the component, show an empty state
  if (!currentItem) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTxt}>No flashcard item.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Feedback modal component (tells user correct or incorrect, and continue to next game button)
  const FeedbackModal = () => {
    if (!showModal) return null;

    const isCorrect = selectedCorrect;
    const bannerStyle = isCorrect
      ? styles.correctBanner
      : styles.incorrectBanner;
    const buttonTextColor = isCorrect
      ? styles.correctBanner.backgroundColor
      : styles.incorrectBanner.backgroundColor;

    return (
      <Modal
        transparent={true} // hide default modal background
        visible={showModal} // show modal based on showModal state
        onRequestClose={handleContinue} // compatibility with apple TV and android
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              bannerStyle,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.feedbackHeader}>
              <FontAwesome5
                name={isCorrect ? "check-circle" : "times-circle"}
                size={sf(24)}
                color="#fff"
              />
              <Text style={styles.feedbackTitle}>
                {isCorrect ? "Correct!" : "Nice try!"}
              </Text>
            </View>
            {!isCorrect && (
              <Text style={styles.feedbackSubtitle}>
                Correct answer:{" "}
                <Text style={styles.boldTxt}>{currentItem.translation}</Text>.
              </Text>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.whiteButton]}
              onPress={handleContinue}
            >
              <Text
                style={[styles.modalButtonText, { color: buttonTextColor }]}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  // Main component 
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, paddingBottom: sf(90), marginTop: sf(90) }}>
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTxt}>
            Tap the correct Somali translation
          </Text>
        </View>

        <View style={styles.promptCard}>
          <Text style={styles.promptText}>{currentItem.prompt}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {options.map((e) => (
            <TouchableOpacity
              key={e}
              onPress={() => handleSelect(e)}
              disabled={showModal}
              style={[
                styles.optionButton,
                e === selectedChoice && styles.selectedButton,
              ]}
            >
              <Text style={styles.optionText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sticky footer button using css abs position */}
      <TouchableOpacity
        style={[styles.checkButton, !selectedChoice && styles.disabledButton]}
        disabled={!selectedChoice || showModal}
        onPress={checkAnswer}
      >
        <Text style={styles.checkButtonText}>Check</Text>
      </TouchableOpacity>

      <FeedbackModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFCF8" },
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTxt: { fontSize: sf(18), color: "#4b4b4b" },
  boldTxt: { fontWeight: "bold" },

  // Prompt
  instructionsContainer: { padding: sf(16), alignItems: "center" },
  instructionsTxt: { fontSize: sf(22), fontWeight: "600", color: "#4A0E0E" },
  promptCard: {
    backgroundColor: "#fff",
    padding: sf(20),
    borderRadius: sf(20),
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderBottomWidth: 4,
    minHeight: sf(150), 
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: sf(16), 
  },
  promptText: {
    fontSize: sf(24),
    fontWeight: "bold",
    textAlign: "center",
    color: "#4b4b4b",
  },

  // Options
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: sf(16),
    paddingTop: sf(20), 
    marginTop: sf(20),
  },
  optionButton: {
    width: "45%", 
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderBottomWidth: 4,
    borderRadius: sf(16),
    marginBottom: sf(16),
    paddingVertical: sf(20),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  optionText: { fontSize: sf(18), fontWeight: "bold", color: "#4b4b4b" },
  selectedButton: {
    borderColor: "#84d8ff",
    backgroundColor: "#ddf4ff",
    borderBottomWidth: 2,
    transform: [{ translateY: 2 }],
    elevation: 1,
    shadowOpacity: 0.05,
  },

  // Check Button (footer)
  checkButton: {
    position: "absolute",
    bottom: sf(35),
    left: sf(16),
    right: sf(16),
    backgroundColor: "#58cc02",
    paddingVertical: sf(16),
    borderRadius: sf(16),
    alignItems: "center",
    elevation: 4,
  },
  checkButtonText: {
    fontSize: sf(18),
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
  },
  disabledButton: { backgroundColor: "#d3d3d3", elevation: 0 },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center", 
  },
  modalContent: {
    width: "100%",
    maxWidth: PHONE_W,
    padding: sf(20),
    borderTopLeftRadius: sf(20),
    borderTopRightRadius: sf(20),
    paddingBottom: sf(50), 
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: sf(8),
  },
  feedbackTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: sf(22),
    marginLeft: sf(10),
  },
  feedbackSubtitle: {
    color: "#fff",
    fontSize: sf(16),
    marginBottom: sf(20),
    lineHeight: sf(24),
  },
  modalButton: {
    paddingVertical: sf(15),
    borderRadius: sf(15),
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: sf(18),
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  correctBanner: { backgroundColor: "#58cc02" },
  incorrectBanner: { backgroundColor: "#ff4b4b" },
  whiteButton: { backgroundColor: "#fff" },
});
