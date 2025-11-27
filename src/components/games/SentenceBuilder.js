import React, { useState, useEffect, useRef, useCallback } from "react";
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

// get screen dimensions
const { width: W, height: H } = Dimensions.get("window");

// ideal dimensions
const PHONE_W = 412;
const PHONE_H = 732;

// scaling factor
const scale = Math.min(W / PHONE_W, H / PHONE_H);
const sf = (v) => Math.round(v * scale);

// use screen height for slide animation
const windowHeight = H;

// ----------------- helper functions -----------------------------

// fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const newArray = [...array]; // create a local copy, so original isnt mutated
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function SentenceBuilder({ items, onNextGame }) {
  const [score, setScore] = useState(0);
  const [wordBank, setWordBank] = useState([]);

  // the words the user has clicked, in order
  const [constructedSentence, setConstructedSentence] = useState([]);

  // null = no answer yet, true = correct, false = incorrect
  const [isCorrect, setIsCorrect] = useState(null);

  const [showModal, setShowModal] = useState(false);

  // choose the first lesson (parent controls which items are passed)
  const lesson = items?.[0];

  // modal animation: start off-screen at bottom (windowHeight)
  const slideAnim = useRef(new Animated.Value(windowHeight)).current;

  // initialize game when lesson changes
  useEffect(() => {
    if (!lesson) return;

    // create word bank by combining filler words with correct words
    const words = lesson.translation
      .split(" ") // break sentence into array ["hello", "my", "name"...]
      .concat(lesson.filler.split("|")); // add filler words ["I", "like"...]

    // shuffle the words
    setWordBank(shuffleArray(words));

    // clear previous state
    setConstructedSentence([]);
    setIsCorrect(null);
    setShowModal(false);
    slideAnim.setValue(windowHeight); // keep sheet hidden off-screen
  }, [lesson, slideAnim]);

  // animate modal in (slide up)
  const animateModalIn = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // animate modal out (slide down)
  const animateModalOut = useCallback(
    (after) => {
      Animated.timing(slideAnim, {
        toValue: windowHeight,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setShowModal(false);
        after?.();
      });
    },
    [slideAnim]
  );

  // when showModal flips true, run the slide-up animation
  useEffect(() => {
    if (showModal) {
      animateModalIn();
    }
  }, [showModal, animateModalIn]);

  // when user clicks word in word bank
  const handleSelectWord = (word, wordIndex) => {
    // add word to constructed sentence
    setConstructedSentence((prev) => [...prev, word]);

    // remove word from the bottom bank (filter by index in case of duplicates)
    setWordBank((prev) => prev.filter((_, i) => i !== wordIndex));
  };

  // when user clicks word from sentence constructed at top to remove it
  const handleDeselectWord = (word, wordIndex) => {
    // add back the word to the bottom bank
    setWordBank((prev) => [...prev, word]);

    // remove it from the sentence being constructed, by index in case of duplicates
    setConstructedSentence((prev) =>
      prev.filter((_, i) => i !== wordIndex)
    );
  };

  // validate ans
  const handleCheck = () => {
    // guard
    if (!lesson) return;
    if (constructedSentence.length === 0 || showModal) return;

    const userAnswer = constructedSentence.join(" ");
    const correctAnswer = lesson.translation;

    // compare users constructed sentence with actual translation
    const correct = userAnswer === correctAnswer;

    setIsCorrect(correct);
    if (correct) setScore((s) => s + 100);

    // show end of game modal
    setShowModal(true);
  };

  // move to next game
  const handleContinue = () => {
    animateModalOut(() => {
      console.log(`total xp earned = ${score}`);
      onNextGame?.(score); // parent switches game, with updated score
    });
  };

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ marginTop: 40, textAlign: "center" }}>
          No lesson data.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        {/* the task description at top */}
        <View style={styles.promptContainer}>
          <View style={styles.bubble}>
            <Text style={styles.promptTxt}>{lesson.prompt}</Text>
          </View>
          <Text style={styles.instructionsTxt}>
            Translate the sentence above
          </Text>
        </View>

        {/* sentence area (dashed area) */}
        <View style={styles.sentenceContainer}>
          {constructedSentence.length === 0 ? (
            <Text style={styles.placeholderText}>
              Tap words below to begin
            </Text>
          ) : (
            // show the words the user has selected
            constructedSentence.map((word, idx) => (
              <TouchableOpacity
                key={`${word}-${idx}`}
                onPress={() => handleDeselectWord(word, idx)}
              >
                <Text style={styles.wordOption}>{word}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* word bank at bottom */}
        <View style={styles.wordBank}>
          {wordBank.map((word, idx) => (
            <TouchableOpacity
              key={`${word}-${idx}`}
              onPress={() => handleSelectWord(word, idx)}
              disabled={showModal} // disabled when modal is shown (guard)
            >
              <Text style={styles.wordOption}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* button to check ans, disabled unless atleast 1 word selected from bank */}
      <TouchableOpacity
        style={[
          styles.checkButton,
          constructedSentence.length === 0 && styles.disabledButton,
        ]}
        disabled={constructedSentence.length === 0 || showModal}
        onPress={handleCheck}
      >
        <Text style={styles.checkButtonText}>Check</Text>
      </TouchableOpacity>

      {/* modal */}
      <Modal
        animationType="none"
        transparent
        visible={showModal}
        onRequestClose={handleContinue}
      >
        <View style={styles.modalOverlay}>
          {/* animated sliding sheet */}
          <Animated.View
            style={[
              styles.modalContent,
              isCorrect ? styles.correctBanner : styles.incorrectBanner,
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

            {/* correct answer shown if incorrect */}
            {!isCorrect && (
              <Text style={styles.feedbackSubtitle}>
                Correct Answer:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {lesson.translation}
                </Text>
              </Text>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleContinue}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  { color: isCorrect ? "#58cc02" : "#ff4b4b" },
                ]}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFCF8", marginTop: 30 },

  // task description section
  promptContainer: {
    alignItems: "center",
    paddingTop: sf(40),
    paddingBottom: sf(20),
  },
  bubble: {
    width: "90%",
    backgroundColor: "#fff",
    padding: sf(20),
    borderRadius: sf(20),
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderBottomWidth: 4,
    alignItems: "center",
    marginBottom: sf(20),
  },
  promptTxt: {
    fontSize: sf(24),
    fontWeight: "bold",
    textAlign: "center",
    color: "#4b4b4b",
  },
  instructionsTxt: { fontSize: sf(20), fontWeight: "600", color: "#4A0E0E" },

  // sentence construction
  sentenceContainer: {
    minHeight: sf(70),
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    padding: sf(10),
    marginHorizontal: sf(16),
    backgroundColor: "#fff",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: sf(12),
  },
  placeholderText: {
    fontSize: sf(16),
    color: "#aaa",
  },

  // word bank styles
  wordBank: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "flex-start",
    paddingHorizontal: sf(16),
    paddingTop: sf(20),
  },
  wordOption: {
    fontSize: sf(18),
    fontWeight: "bold",
    color: "#4b4b4b",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderBottomWidth: 4,
    borderRadius: sf(12),
    paddingVertical: sf(12),
    paddingHorizontal: sf(18),
    margin: sf(5),
  },

  // button styles
  checkButton: {
    position: "absolute",
    bottom: sf(40),
    left: sf(16),
    right: sf(16),
    backgroundColor: "#58cc02",
    paddingVertical: sf(16),
    borderRadius: sf(16),
    alignItems: "center",
  },
  checkButtonText: {
    fontSize: sf(18),
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
  },
  disabledButton: { backgroundColor: "#d3d3d3" },

  // modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  modalContent: {
    width: "100%",
    maxWidth: PHONE_W,
    paddingHorizontal: sf(20),
    paddingTop: sf(20),
    paddingBottom: sf(40),
    borderTopLeftRadius: sf(20),
    borderTopRightRadius: sf(20),
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
  },
  modalButton: {
    backgroundColor: "#fff",
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
});
