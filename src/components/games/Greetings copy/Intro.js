/* Intro.js – intro modal + single-bubble dialogue */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
  Modal,
} from "react-native";

const PHONE_WIDTH = 412;
const PHONE_HEIGHT = 732;
const { width: W, height: H } = Dimensions.get("window");
const SCALE = Math.min(W / PHONE_WIDTH, H / PHONE_HEIGHT);
const ns = (v) => Math.round(v * SCALE);

const ELDER_AVATAR = require("../../../../public/assets/greetings/elder.png");
const HASSAN_SAD = require("../../../../public/assets/greetings/sad_boy.png");

export default function Intro({ scenarioData, onComplete }) {
  const [startModalVisible, setStartModalVisible] = useState(true);
  const [turn, setTurn] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isElder = (idx) => idx % 2 === 0;

  const handleNext = () => {
    const next = turn + 1;
    if (next < scenarioData.turns.length) {
      slideAnim.setValue(isElder(next) ? -W : W);
      setTurn(next);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      onComplete?.();
    }
  };

  const elderTurn = isElder(turn);
  const bubbleColor = elderTurn ? "#FFF5E6" : "#d0eaff";

  return (
    <SafeAreaView style={styles.root}>
      {/* ── splash ── */}
      <Modal transparent animationType="fade" visible={startModalVisible}>
        <View style={styles.modalOverlay}>
          {" "}
          {/* ★ changed */}
          <Animated.View
            /* scale card with same factor as everything else */
            style={{ transform: [{ scale: SCALE }] }} /* ★ changed */
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Scenario</Text>
              <Text style={styles.modalBody}>
                Many times we may feel embarrassed when elders greet us.{"\n"}
                <b>Let’s see how Hassan reacts.</b>
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setStartModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* ── main scene ── */}
      <View style={styles.sceneContainer}>
        {turn < scenarioData.turns.length - 1 ? (
          <>
            <Image source={ELDER_AVATAR} style={styles.elderStatic} />
            {!startModalVisible && (
              <Animated.View
                style={[
                  styles.bubbleContainer,
                  !elderTurn && { bottom: ns(20) },
                  elderTurn  && { top: "0%" },
                  { transform: [{ translateX: slideAnim }] },
                ]}
              >
                {/* 1. Bubble box */}
                <View
                  style={[
                    styles.bubble,
                    elderTurn ? null : styles.hassanBubble,
                    { backgroundColor: bubbleColor },
                  ]}
                >
                  <Text style={styles.bubbleText}>
                    {scenarioData.turns[turn]}
                  </Text>
                </View>

                {/* 2. Pointer */}
                <View
                  style={[
                    styles.triangleDown, // elder = down, hassan = up
                      { borderTopColor: bubbleColor }
                  ]}
                />
              </Animated.View>
            )}
          </>
        ) : (
          <>
            <Animated.View
              style={[
                styles.banner,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <Text style={styles.bannerText}>
                Learn how to handle everyday greetings, so you don't end up
                embarrassed like Hassan!
              </Text>
            </Animated.View>
            <Image source={HASSAN_SAD} style={styles.hassanStatic} />
          </>
        )}
      </View>

      {!startModalVisible && (
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            Next
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f9f9f9" },
  banner: {
    padding: "5%",
    backgroundColor: "#ffe082",
    borderRadius: ns(8),
    marginHorizontal: ns(10),
    marginTop: "30%",
    marginBottom: "5%"
  },
  bannerText: {
    fontSize: ns(18),
    fontWeight: "600",
    color: "#5d4037",
    textAlign: "center",
  },
  /* centred overlay */
  modalOverlay: {
    // ★ changed
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  modalCard: {
    width: ns(330), // design width, scales with SCALE
    backgroundColor: "#FFF9E6",
    borderRadius: 20,
    padding: ns(15),
    alignItems: "center",
  },
  modalTitle: {
    fontSize: ns(28),
    fontWeight: "800",
    color: "#4A0E0E",
    marginBottom: ns(12),
    textAlign: "center",
  },
  modalBody: {
    fontSize: ns(18),
    color: "#5A5A5A",
    textAlign: "center",
    marginBottom: ns(24),
    lineHeight: ns(26),
  },
  modalButton: {
    backgroundColor: "#F28C38",
    paddingVertical: ns(14),
    paddingHorizontal: ns(40),
    borderRadius: ns(14),
    elevation: 4,
    width: "90%",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: ns(20),
    fontWeight: "700",
    textAlign: "center",
  },

  /* rest unchanged … */
  sceneContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
  },
  elderStatic: {
    width: "65%",
    maxwidth: ns(350),
    maxheight: ns(450),
    height: "97%",
    resizeMode: "contain",
    marginBottom: ns(16),
  },
  hassanStatic: {
    width: "50%",
    height: "70%",
    maxwidth: ns(300),
    maxheight: ns(400),
    marginBottom: ns(5),
  },
  bubbleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bubble: {
    padding: ns(12),
    borderRadius: ns(16),
    maxWidth: "80%",
  },
  hassanBubble: { borderColor: "#a0cfee" },
  bubbleText: {
    fontSize: ns(22),
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  triangleUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginBottom: -1,
  },
  triangleDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -1,
  },
  nextBtn: {
    padding: ns(16),
    backgroundColor: "#F28C38",
    margin: ns(16),
    borderRadius: ns(20),
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
  },
  nextText: { color: "#fff", fontSize: ns(18), fontWeight: "600" },
});
