import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Modal,
} from "react-native";

/* ─── constants & helpers ─── */
const PHONE_WIDTH = 412;
const PHONE_HEIGHT = 732;
const { width: W, height: H } = Dimensions.get("window");
const SCALE = Math.min(W / PHONE_WIDTH, H / PHONE_HEIGHT);
const ns = (v) => Math.round(v * SCALE);

/* ─── assets ─── */
const TEACHER = require("../../../../public/assets/greetings/camel_teacher.png");
const BLACKBOARD = require("../../../../public/assets/greetings/blackboard.png");

/* ─── component ─── */
export default function Particles({ data, onComplete }) {
  const { bannerText = "", turns = [] } = data;
  const [modalVisible, setModalVisible] = useState(true);
  const [idx, setIdx] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  /* advance to next slide or finish */
  const nextSlide = () => {
    if (idx < turns.length - 1) {
      Animated.sequence([
        Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start(() => setIdx(idx + 1));
    } else {
      onComplete?.();
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* ── opening modal ── */}
      <Modal transparent animationType="fade" visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { transform: [{ scale: SCALE }] }]}>
            <Text style={styles.modalTitle}>Why Particles Matter</Text>
            <Text style={styles.modalBody}>{bannerText}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalBtnTxt}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── main scene ── */}
      <View style={styles.scene}>
        {/* avatar */}
        <Image source={TEACHER} style={styles.avatar} />

        {/* board + overlay grouped so they move together */}
        <View style={styles.boardContainer}>
          <Image source={BLACKBOARD} style={styles.board} resizeMode="cover" />

          {!modalVisible && (
            <Animated.View style={[styles.overlay, { opacity: fade }]}>
              <Text style={styles.text}>{turns[idx]}</Text>
            </Animated.View>
          )}
        </View>
      </View>

      {/* next button */}
      {!modalVisible && (
        <TouchableOpacity style={styles.nextBtn} onPress={nextSlide}>
          <Text style={styles.nextTxt}>{idx < turns.length - 1 ? "Next" : "Finish"}</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

/* ─── styles ─── */
const styles = StyleSheet.create({
      /* root */
  root: {
    flex: 1,
    backgroundColor: "#FFFCF8",
  },

  /* modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: ns(330),
    backgroundColor: "#FFF9E6",
    borderRadius: ns(20),
    padding: ns(18),
    alignItems: "center",
  },
  modalTitle: {
    fontSize: ns(26),
    fontWeight: "800",
    color: "#4A0E0E",
    marginBottom: ns(10),
  },
  modalBody: {
    fontSize: ns(18),
    color: "#5A5A5A",
    textAlign: "center",
    marginBottom: ns(24),
  },
  modalBtn: {
    backgroundColor: "#F28C38",
    paddingVertical: ns(14),
    paddingHorizontal: ns(40),
    borderRadius: ns(14),
    width: "90%",
  },
  modalBtnTxt: {
    color: "#fff",
    fontSize: ns(20),
    fontWeight: "700",
    textAlign: "center",
  },

  /* main scene (everything below modal) */
  scene: {
    flex: 1,
    justifyContent: "flex-start", // push board to top
    alignItems: "center",         // keep horizontally centred
    paddingTop: ns(20),
  },

  /* board + overlay grouped here */
  boardContainer: {
    width: "100%",       // full screen width
    height: "80%",       // 70 % of screen height
    position: "relative",
    alignItems: "center", // centre children (board & overlay) horizontally
  },
  board: {
    width: "90%",        // chalkboard image = 90 % of screen width
    height: "100%",      // fill the 70 %-tall container
    alignSelf: "center",
  },

  /* overlay text centred on top of board */
  overlay: {
    position: "absolute",
    width: "75%",            // same strip as board image
    paddingHorizontal: ns(12),
    marginTop: "17%"
  },
  text: {
    fontSize: ns(20),
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
    lineHeight: ns(28),
  },

  /* teacher avatar */
  avatar: {
    position: "absolute",
    bottom: "3%",
    right: "-3%",
    width: "40%",
    height: "50%",
    zIndex: 30,
    resizeMode: "contain",
  },

  /* navigation button */
  nextBtn: {
    backgroundColor: "#F28C38",
    padding: ns(16),
    borderRadius: ns(20),
    alignSelf: "center",
    width: "90%",
    marginBottom: ns(18),
    alignItems: "center",
    marginBottom: "16%"
  },
  nextTxt: {
    color: "#fff",
    fontSize: ns(18),
    fontWeight: "600",
  },
})