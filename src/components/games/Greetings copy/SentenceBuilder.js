// SentenceBuilder.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Modal,
  Animated,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import boyImg from "../../../../public/assets/greetings/camera.png";

/* layout helpers */
const { width: W, height: H } = Dimensions.get("window");
const PHONE_W = 412;
const PHONE_H = 732;
const scale = Math.min(W / PHONE_W, H / PHONE_H);
const ns = (v) => Math.round(v * scale);

/* shuffle helper */
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export default function SentenceBuilder({ items, onNextGame }) {
  /* ─── state & refs ─── */
  const [imageLoaded, setImageLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0); // <<< --- ADD THIS LINE

  // NEW: State for sentence construction
  const [wordBank, setWordBank] = useState([]);
  const [constructedSentence, setConstructedSentence] = useState([]);

  const [isCorrect, setIsCorrect] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(H)).current;

  const currentItem = items[index];

  /* ─── effects & handlers ─── */

  // Effect to reset the component for the current question
  useEffect(() => {
    if (currentItem) {
      // Create word bank by splitting the translation and filler sentence and shuffling it
      setWordBank(
        shuffle(
          currentItem.translation
            .split(" ")
            .concat(currentItem.filler.split("|"))
        )
      );
      // Reset user's sentence
      setConstructedSentence([]);
      setIsCorrect(null);
    }
  }, [index, items]);

  const animateModalIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animateModalOut = (after) => {
    Animated.timing(slideAnim, {
      toValue: H,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false);
      after?.();
    });
  };

  // Handler for when a user taps a word in the word bank
  const handleSelectWord = (word, wordIndex) => {
    // Add word to the user's sentence
    setConstructedSentence([...constructedSentence, word]);
    // Remove word from the word bank
    setWordBank(wordBank.filter((_, i) => i !== wordIndex));
  };

  // Handler for when a user taps a selected word to remove it
  const handleDeselectWord = (word, wordIndex) => {
    // Add word back to the word bank
    setWordBank([...wordBank, word]);
    // Remove word from the user's sentence
    setConstructedSentence(
      constructedSentence.filter((_, i) => i !== wordIndex)
    );
  };

  const handleCheck = () => {
    if (constructedSentence.length === 0 || showModal) return;

    const userAnswer = constructedSentence.join(" ");
    const correctAnswer = currentItem.translation;
    setIsCorrect(userAnswer === correctAnswer);
    if (userAnswer === correctAnswer) {
      setScore((prevScore) => prevScore + 100);
    }
    setShowModal(true);
    requestAnimationFrame(animateModalIn);
  };

  const handleContinue = () => {
    const nextStep = () => {
      if (index < items.length - 1) {
        setIndex((i) => i + 1);
      } else {
        console.log(`total xp earned: ${score}`);
        onNextGame?.(score);
      }
    };
    animateModalOut(nextStep);
  };

  /* ─── Sub-Components ─── */
  const FeedbackModal = () => {
    if (!showModal) return null;
    const buttonTextColor = isCorrect
      ? styles.correctBanner.backgroundColor
      : styles.incorrectBanner.backgroundColor;
    return (
      <Modal
        animationType="none"
        transparent
        visible={showModal}
        onRequestClose={handleContinue}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              isCorrect ? styles.correctBanner : styles.incorrectBanner,
              { transform: [{ translateY: slideAnim }, { scale }] },
            ]}
          >
            <View style={styles.feedbackHeader}>
              <FontAwesome5
                name={isCorrect ? "check-circle" : "times-circle"}
                size={ns(24)}
                color="#fff"
              />
              <Text style={styles.feedbackTitle}>
                {isCorrect ? "Correct!" : "Nice try!"}
              </Text>
            </View>
            {!isCorrect && (
              <Text style={styles.feedbackSubtitle}>
                Correct Answer:{" "}
                <Text style={styles.boldTxt}>{currentItem.translation}</Text>
              </Text>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.whiteBtn]}
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

  /* ─── Main Render ─── */

  if (!imageLoaded) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loaderContainer]}>
        <Image
          source={boyImg}
          onLoad={() => {
            setImageLoaded(true);
          }}
          style={{ width: 0, height: 0 }}
        />
        <ActivityIndicator size="large" color="#F28C38" style={styles.loader} />
        <Text
          style={{
            marginTop: 30,
            color: "#4A0E0E",
            fontWeight: "600",
            fontSize: 20,
          }}
        >
          Loading exercise...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        <View style={styles.cardRow}>
          <Image source={boyImg} style={styles.image} resizeMode="contain" />
          <View style={styles.bubble}>
            <Text style={styles.promptTxt}>{currentItem.prompt}</Text>
            <View style={styles.bubbleTail} />
          </View>
        </View>
        <View style={styles.instructionsWrap}>
          <Text style={styles.instructionsTxt}>
            Translate the sentence above
          </Text>
        </View>

        {/* Area for the user to construct their sentence */}
        <View style={styles.sentenceContainer}>
          {constructedSentence.length === 0 ? (
            <Text style={styles.placeholderText}>Tap words below to begin</Text>
          ) : (
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

        {/* Word bank of available words */}
        <View style={styles.wordBank}>
          {wordBank.map((word, idx) => (
            <TouchableOpacity
              key={`${word}-${idx}`}
              onPress={() => handleSelectWord(word, idx)}
              disabled={showModal}
            >
              <Text style={styles.wordOption}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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

      <FeedbackModal />
    </SafeAreaView>
  );
}

/* styles */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFCF8", marginTop: 30 },
  loaderContainer: { justifyContent: "center", alignItems: "center" },
  loader: { transform: [{ scale: 2 }] },
  boldTxt: { fontWeight: "bold" },
  cardRow: {
    height: ns(320), // <--- This is the fix
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ns(16),
  },
  image: { width: "45%", height: "100%" },
  bubble: {
    position: "relative",
    width: "60%",
    backgroundColor: "#fff",
    padding: ns(20),
    borderRadius: ns(20),
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderBottomWidth: 4,
    transform: [{ translateX: -ns(20) }],
  },
  bubbleTail: {
    position: "absolute",
    left: -ns(11.2),
    top: "45%",
    width: ns(20),
    height: ns(20),
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#e5e5e5",
    transform: [{ rotate: "135deg" }],
    zIndex: -1,
  },
  promptTxt: {
    fontSize: ns(24),
    fontWeight: "bold",
    textAlign: "center",
    color: "#4b4b4b",
  },
  instructionsWrap: {
    paddingHorizontal: ns(16),
    paddingVertical: ns(10),
    alignItems: "center",
  },
  instructionsTxt: { fontSize: ns(20), fontWeight: "600", color: "#4A0E0E" },

  // NEW STYLES for sentence construction
  sentenceContainer: {
    minHeight: ns(70),
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    padding: ns(10),
    marginHorizontal: ns(16),
    backgroundColor: "#fff",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: ns(12),
  },
  placeholderText: {
    fontSize: ns(16),
    color: "#aaa",
  },
  wordBank: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "flex-start",
    paddingHorizontal: ns(16),
    paddingTop: ns(20),
  },
  wordOption: {
    fontSize: ns(18),
    fontWeight: "bold",
    color: "#4b4b4b",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderBottomWidth: 4,
    borderRadius: ns(12),
    paddingVertical: ns(12),
    paddingHorizontal: ns(18),
    margin: ns(5),
  },

  checkButton: {
    position: "absolute",
    bottom: ns(40),
    left: ns(16),
    right: ns(16),
    backgroundColor: "#58cc02",
    paddingVertical: ns(16),
    borderRadius: ns(16),
    alignItems: "center",
  },
  checkButtonText: {
    fontSize: ns(18),
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
  },
  disabledButton: { backgroundColor: "#d3d3d3" },

  // MODAL STYLES (unchanged)
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    maxWidth: PHONE_W,
    padding: ns(20),
    borderTopLeftRadius: ns(20),
    borderTopRightRadius: ns(20),
    paddingHorizontal: ns(20),
    paddingBottom: ns(50),
    paddingTop: ns(20),
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ns(8),
  },
  feedbackTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: ns(22),
    marginLeft: ns(10),
  },
  feedbackSubtitle: {
    color: "#fff",
    fontSize: ns(16),
    marginBottom: ns(20),
    lineHeight: ns(24),
  },
  modalButton: {
    paddingVertical: ns(15),
    borderRadius: ns(15),
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: ns(18),
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  correctBanner: { backgroundColor: "#58cc02" },
  incorrectBanner: { backgroundColor: "#ff4b4b" },
  whiteBtn: { backgroundColor: "#fff" },
});
