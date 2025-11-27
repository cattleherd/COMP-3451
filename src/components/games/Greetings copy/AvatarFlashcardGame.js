import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

/* ───────── design constants ───────── */
const PHONE_WIDTH  = 412;
const PHONE_HEIGHT = 732;
const { width: W, height: H } = Dimensions.get("window");
const SCALE = Math.min(W / PHONE_WIDTH, H / PHONE_HEIGHT);
const ns = (v) => Math.round(v * SCALE);
/* ───────────────────────────────────── */

export default function AvatarFlashcard({
  items = [],
  onNextGame,
  hasNextSection = false,          // default = none left
}) {
  const [index,      setIndex]      = useState(0);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [showDesc,   setShowDesc]   = useState(false);

  const slideAnim = useRef(new Animated.Value(W)).current;

  /* slide-in animation for each new card */
  useEffect(() => {
    slideAnim.setValue(W);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowDesc(false);
  }, [index]);

  /* NEXT / DONE button */
  const nextCard = () => {
    if (index < items.length - 1) {
      setIndex(index + 1);                       // more cards in this set
    } else {
      if (hasNextSection) {
        setModalOpen(true);                      // show “Great job” modal
      } else {
        onNextGame?.();                          // finished the lesson → parent
      }
    }
  };

  /* Continue from the modal */
  const continueLesson = () => {
    setModalOpen(false);
    setIndex(0);
    onNextGame?.();                              // load next set in parent
  };

  if (!items.length) return null;
  const { word, translation, description } = items[index];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Image
          source={require("../../../../public/assets/greetings/camel.png")}
          style={styles.avatar}
          resizeMode="contain"
        />

        {/* speech bubble */}
        <Animated.View
          style={[
            styles.bubbleContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.bubble}>
            <Text style={styles.word}>{word}</Text>
            <Text style={styles.translation}>{translation}</Text>
            {description && (
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => setShowDesc(true)}
              >
                <Ionicons name="help-circle-sharp" size={ns(35)} color="#5b2a00" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.triangleDown} />
        </Animated.View>

        {/* tooltip */}
        {showDesc && description && (
          <View style={styles.descContainer}>
            <Text style={styles.descText}>{description}</Text>
            <TouchableOpacity onPress={() => setShowDesc(false)}>
              <Text style={styles.closeDesc}>Close</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* NEXT / DONE */}
        <TouchableOpacity style={styles.nextBtn} onPress={nextCard}>
          <Text style={styles.nextTxt}>
            {index < items.length - 1 ? "NEXT" : "DONE"}
          </Text>
        </TouchableOpacity>

        {/* internal modal only if another set follows */}
        {hasNextSection && (
          <Modal transparent visible={modalOpen} animationType="fade">
            <View style={styles.modalOuterContainer}>
              <View
                style={[
                  styles.modalInnerContainer,
                  { transform: [{ scale: SCALE }] },
                ]}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>Great job!</Text>
                    <Text style={styles.modalText}>
                      You’ve finished this set. Ready for the next one?
                    </Text>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={continueLesson}
                    >
                      <Text style={styles.modalButtonText}>Continue</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ───────── styles (unchanged except for spacing) ───────── */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFCF8" },
  card:     { flex: 1, alignItems: "center", justifyContent: "center" },

  avatar: { width: "60%", height: "45%" },

  bubbleContainer: {
    position: "absolute", top: ns(30), left: 0, right: 0,
    alignItems: "center", paddingHorizontal: ns(10),
  },
  bubble: {
    backgroundColor: "#F2D7AE", borderRadius: ns(16),
    paddingVertical: ns(14), paddingHorizontal: ns(20),
    maxWidth: "90%", alignItems: "center", paddingBottom: ns(28),
  },
  triangleDown: {
    width: 0, height: 0,
    borderLeftWidth: ns(12), borderRightWidth: ns(12), borderTopWidth: ns(16),
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderTopColor: "#F2D7AE", marginTop: -1,
  },
  word:         { fontSize: ns(34), fontWeight: "bold", color: "#4A0E0E", textAlign: "center" },
  translation:  { fontSize: ns(20), color: "#5A5A5A", textAlign: "center", marginTop: ns(4) },

  infoButton: { position: "absolute", top: ns(5), right: ns(7) },

  descContainer: {
    position: "absolute", top: H * 0.044, left: ns(20), right: ns(20),
    backgroundColor: "#FFF9E6", borderRadius: ns(12), padding: ns(12),
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: ns(4),
  },
  descText:  { fontSize: ns(16), color: "#333", marginBottom: ns(8) },
  closeDesc: { fontSize: ns(14), color: "#F28C38", textAlign: "right" },

  nextBtn: {
    position: "absolute", bottom: ns(40),
    backgroundColor: "#F28C38",
    paddingVertical: ns(14), paddingHorizontal: ns(60),
    borderRadius: ns(10),
  },
  nextTxt: { color: "#FFF", fontSize: ns(18), fontWeight: "bold" },

  /* modal wrapper */
  modalOuterContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)" },
  modalInnerContainer: { width: PHONE_WIDTH, height: PHONE_HEIGHT, overflow: "hidden" },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalCard: {
    width: "85%", backgroundColor: "#FFF9E6", borderRadius: ns(20), padding: ns(20),
    alignItems: "center", elevation: 5, shadowColor: "#8B4513",
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  modalTitle: { fontSize: 32, fontWeight: "800", marginBottom: 12, color: "#4A0E0E", textAlign: "center" },
  modalText:  { fontSize: 22, textAlign: "center", marginBottom: 20, color: "#5A5A5A", lineHeight: 28 },
  modalButton:      { backgroundColor: "#F28C38", paddingVertical: ns(14), paddingHorizontal: ns(40), borderRadius: ns(10) },
  modalButtonText:  { color: "#FFF", fontSize: ns(18), fontWeight: "bold" },
});
