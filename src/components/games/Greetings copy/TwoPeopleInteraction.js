// Import necessary components and hooks from React and React Native.
import React, {
  useState, // For managing component state (e.g., current turn, modal visibility).
  useRef, // For getting references to components (like ScrollView) or storing mutable values that don't trigger re-renders (like animation values).
  useEffect, // For running side effects (e.g., starting animations when a value changes).
  useCallback, // For memoizing functions to prevent unnecessary re-creations.
  useContext, // For consuming data from a React Context.
  createContext, // For creating a React Context to share state across components.
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity, // A pressable component with feedback.
  Image,
  ScrollView, // A scrollable container for the chat history.
  Dimensions, // For getting the screen dimensions to make the UI responsive.
  Animated, // The library for creating animations.
  Modal, // A component for presenting content on top of an enclosing view.
  ActivityIndicator, // A loading spinner.
  Pressable, // A more flexible pressable component.
} from "react-native";
// A component that handles safe areas on devices with notches (like iPhones).
import { SafeAreaView } from "react-native-safe-area-context";
// Icon library for vector icons.
import { FontAwesome5 } from "@expo/vector-icons";
import { Audio } from "expo-av";

// --- ADD NEW FUNCTION TO HANDLE PLAYING AUDIO ---

/* ── SIZING HELPERS ── */
// These helpers make the UI responsive across different screen sizes.

// Base dimensions from the design mockups (e.g., an iPhone 8 or similar).
const PHONE_WIDTH = 412;
const PHONE_HEIGHT = 732;
// Get the actual screen dimensions of the current device.
const { width: W, height: H } = Dimensions.get("window");
// Calculate a scale factor based on the difference between the design and actual screen sizes.
const scale = Math.min(W / PHONE_WIDTH, H / PHONE_HEIGHT);
// A helper function 'ns' (normalized size) to apply the scale factor to any size value.
const ns = (v) => Math.round(v * scale);

/* ── ASSETS ── */
// Import local image assets for the avatars.
const FemaleCPUAvatar = require("../../../../public/assets/somali_girls/hijab_girl.png");
const FemaleUserAvatar = require("../../../../public/assets/somali_girls/hijab_girl_1.png");
// NEW: Import male avatars (replace paths with your actual male avatar files).

const MaleCPUAvatar = require("../../../../public/assets/greetings/boy1.png");
const MaleUserAvatar = require("../../../../public/assets/greetings/boy2.png");

/* ── TOOLTIP CONTEXT: KEEPS A SINGLE WORD OPEN AT A TIME ── */
// Create a React Context to manage the state of the tooltips.
// This ensures that only one word's translation can be shown at any given time.
const TooltipCtx = createContext({
  currentId: null, // The ID of the currently open word's tooltip.
  open: (_id) => {}, // A function to open a specific tooltip.
  close: () => {}, // A function to close any open tooltip.
});

/* ── ANIMATED TOOLTIP COMPONENT ── */
// A reusable component for the translation tooltip with fade and scale animations.
const AnimatedTooltip = ({ text, style, onLayout, visible }) => {
  // Use `useRef` to store animation values. This persists them across re-renders without causing them.
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  // `useEffect` hook to run animations when the `visible` prop changes.
  useEffect(() => {
    // If the tooltip should be visible, animate it in.
    if (visible) {
      Animated.parallel([
        // Run fade and scale animations simultaneously.
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Otherwise, animate it out.
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, scaleAnim]);

  // The component is always mounted to allow the "out" animation to play.
  // `pointerEvents` is set to 'none' when hidden so it can't be interacted with.
  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      onLayout={onLayout} // `onLayout` is used to measure the tooltip's width for positioning.
      style={[
        styles.tooltipContainer,
        style,
        { opacity, transform: [{ scale: scaleAnim }] }, // Apply animated styles.
      ]}
    >
      <Text style={styles.tooltipText}>{text}</Text>
      <View style={styles.tooltipArrow} />
    </Animated.View>
  );
};

/* ── TRANSLATABLE WORD COMPONENT ── */
// A component that wraps a single word which can be pressed to show a translation tooltip.
const TranslatableWord = ({ id, word, translation }) => {
  // Consume the Tooltip Context to get the global open/close state.
  const { currentId, open, close } = useContext(TooltipCtx);
  const isOpen = currentId === id; // Check if this specific word's tooltip should be open.

  // State to store the position and size of the word on the screen.
  const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0, h: 0 });
  // State to store the width of the tooltip itself.
  const [tipW, setTipW] = useState(0);

  // Function to toggle the tooltip's visibility.
  const toggle = () => (isOpen ? close() : open(id));

  return (
    <View style={styles.wordWrap}>
      <Pressable
        // `onLayout` event fires after render to get the component's position and dimensions.
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          setAnchor({ x, y, w: width, h: height });
        }}
        onPress={toggle}
        android_ripple={null} // Disable Android's default ripple effect.
      >
        <Text style={styles.bubbleText}>{word} </Text>
      </Pressable>

      <AnimatedTooltip
        text={translation}
        visible={isOpen}
        // Get the tooltip's width once it's laid out.
        onLayout={(e) => setTipW(e.nativeEvent.layout.width)}
        // Dynamically calculate the tooltip's position to center it above the word.
        style={{
          left: anchor.x + anchor.w / 2 - tipW / 2, // Center horizontally.
          bottom: anchor.h + ns(8), // Position above the word with a small margin.
        }}
      />
    </View>
  );
};

/* ── MAIN COMPONENT: TWO PEOPLE INTERACTION SCENE ── */
export default function TwoPeopleInteraction({ scenarioData, onComplete }) {
  // State to track if avatar images have loaded to prevent a flash of missing images.
  const [femaleCpuAvatarLoaded, setFemaleCpuAvatarLoaded] = useState(false);
  const [femaleUserAvatarLoaded, setFemaleUserAvatarLoaded] = useState(false);
  // NEW: States for male avatars.
  const [maleCpuAvatarLoaded, setMaleCpuAvatarLoaded] = useState(false);
  const [maleUserAvatarLoaded, setMaleUserAvatarLoaded] = useState(false);

  // State for managing the conversation flow.
  const [turn, setTurn] = useState(0); // Index of the current turn in the conversation.
  const [isAnswered, setIsAnswered] = useState(false); // Whether the user has answered the current interactive question.
  const [isCorrect, setIsCorrect] = useState(false); // If the user's answer was correct.
  const [showModal, setShowModal] = useState(false); // Controls the visibility of the feedback modal.

  const [sound, setSound] = useState(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null); // Tracks index of playing audio

  // NEW: useEffect to automatically play audio for NON-INTERACTIVE turns.
  useEffect(() => {
    const currentTurnData = scenarioData.turns[turn];

    // Check if the current turn has audio AND is NOT interactive.
    if (
      currentTurnData &&
      currentTurnData.audio &&
      !currentTurnData.isInteractive
    ) {
      // A small delay makes the experience feel smoother, allowing the bubble to animate in first.
      const autoplayTimeout = setTimeout(() => {
        handlePlayAudio(currentTurnData.audio, turn);
      }, 300); // 300ms delay

      // Cleanup the timeout if the component unmounts or the turn changes again quickly.
      return () => clearTimeout(autoplayTimeout);
    }
  }, [turn, scenarioData]); // This effect runs whenever the 'turn' or 'scenarioData' changes

  // cleanup audio if component unmount
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handlePlayAudio = async (audioClip, turnIndex) => {
    // If no audio clip is provided for this turn, do nothing.
    if (!audioClip) return;

    // If a sound is already playing, unload it.
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      // If the user tapped the *same* button that was playing, we just stop it.
      if (currentlyPlayingId === turnIndex) {
        setCurrentlyPlayingId(null);
        return;
      }
    }
    try {
      // Load and play the new sound.
      const { sound: newSound } = await Audio.Sound.createAsync(audioClip);
      setSound(newSound);
      setCurrentlyPlayingId(turnIndex);

      // Add a callback for when the sound finishes playing to reset the UI.
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setCurrentlyPlayingId(null);
          newSound.unloadAsync(); // Unload to free up memory
          setSound(null);
        }
      });

      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing audio:", error);
      setCurrentlyPlayingId(null); // Reset state on error
    }
  };

  // Animation values stored in `useRef`.
  const slideAnim = useRef(new Animated.Value(H)).current; // For the feedback modal slide-up animation.
  const messageSlideAnim = useRef(new Animated.Value(0)).current; // For the new message slide-in animation.
  const scrollRef = useRef(null); // A reference to the ScrollView to programmatically scroll.

  const earnedXPRef = useRef(0); // total XP for this game
  const scoredThisTurnRef = useRef(false); // guard so we add once per turn

  /* Tooltip context state management */
  const [currentId, setCurrentId] = useState(null);
  // `useCallback` memoizes these functions so they aren't recreated on every render.
  const openTooltip = useCallback((id) => setCurrentId(id), []);
  const closeAll = useCallback(() => setCurrentId(null), []);

  // Helper function to check if the current speaker is the "CPU".
  const isCPU = (t) => t.speaker === "CPU";

  /* Modal animation functions */
  const animateModalIn = () => {
    slideAnim.setValue(H); // Reset position to the bottom of the screen.
    // Animate the modal sliding up from the bottom.
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  const animateModalOut = (after) => {
    // Animate the modal sliding back down.
    Animated.timing(slideAnim, {
      toValue: H,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false); // Hide the modal after the animation is complete.
      after?.(); // Execute a callback function if one was provided (e.g., advance to the next turn).
    });
  };

  // Function to advance the conversation to the next turn.
  const advanceToNextTurn = () => {
    closeAll(); // Close any open tooltips.
    // If this was the last turn, call the onComplete callback.
    if (turn + 1 >= scenarioData.turns.length) {
      onComplete?.(earnedXPRef.current); // ✅ pass total XP up
      console.log(`current xp earned: ${earnedXPRef.current}`);
      return;
    }
    const nextIdx = turn + 1;
    const fromCPU = isCPU(scenarioData.turns[nextIdx]);

    // Set the starting position for the new message bubble's slide-in animation (off-screen).
    messageSlideAnim.setValue(fromCPU ? -W : W);
    // Update the state for the new turn.
    setTurn(nextIdx);
    setIsAnswered(false);
    setIsCorrect(false);

    // Scroll to the end of the chat list to show the new message. `setTimeout` ensures the new message is rendered first.
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    scoredThisTurnRef.current = false; // ready for the new turn

    // Start the slide-in animation for the new message.
    Animated.timing(messageSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Handler for when the user selects a word from the word bank.
  const handleWordSelection = (word) => {
    closeAll();
    const current = scenarioData.turns[turn];
    // Check if the selected word is the correct answer.
    setIsCorrect(word === current.missingWord);
    setIsAnswered(true);
    setShowModal(true);
    // `requestAnimationFrame` ensures the modal is rendered before we try to animate it in.
    requestAnimationFrame(animateModalIn);
    if (current.audio) {
      handlePlayAudio(current.audio, turn);
    }
  };

  // Handler for the "Continue" button on the feedback modal.
  const handleModalContinue = () =>
    animateModalOut(() => {
      if (isAnswered && isCorrect && !scoredThisTurnRef.current) {
        earnedXPRef.current += 100;
        scoredThisTurnRef.current = true;
      }
      advanceToNextTurn();
    });

  /* Feedback Modal Sub-component */
  const FeedbackModal = () => {
    if (!showModal) return null; // Don't render if not visible.
    const currentTurnData = scenarioData.turns[turn];
    const isFinalTurn = turn + 1 >= scenarioData.turns.length;
    // Dynamically set the button's text color to match the banner color.
    const buttonTextColor = isCorrect
      ? styles.correctBanner.backgroundColor
      : styles.incorrectBanner.backgroundColor;

    return (
      <Modal
        animationType="none"
        transparent
        visible={showModal}
        onRequestClose={handleModalContinue}
      >
        {/* The overlay allows dismissing the modal by tapping the background */}
        <Pressable style={styles.modalOverlay} onPress={handleModalContinue}>
          <Animated.View
            style={[
              styles.modalContent,
              // Apply correct or incorrect styling based on the answer.
              isCorrect ? styles.correctBanner : styles.incorrectBanner,
              // Apply the slide-up animation and responsive scaling.
              { transform: [{ translateY: slideAnim }, { scale }] },
            ]}
          >
            <View style={styles.feedbackHeader}>
              <FontAwesome5
                name={isCorrect ? "check-circle" : "times-circle"} // Show check or X icon.
                size={ns(24)}
                color="#fff"
              />
              <Text style={styles.feedbackTitle}>
                {isCorrect ? "Correct!" : "Nice try!"}
              </Text>
            </View>
            {/* If the answer was incorrect, show the correct answer. */}
            {!isCorrect && (
              <Text style={styles.feedbackSubtitle}>
                Correct Answer:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {currentTurnData.missingWord}
                </Text>
              </Text>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.whiteBtn]}
              onPress={handleModalContinue}
            >
              <Text
                style={[styles.modalButtonText, { color: buttonTextColor }]}
              >
                {isFinalTurn ? "Finish" : "Continue"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    );
  };

  /* Chat Bubble Content Renderer */
  // This function decides what to display inside a chat bubble.
  const renderBubbleContent = (turnData, isCurrentTurn, bubbleIdx) => {
    // If it's an interactive prompt that hasn't been answered yet, show the version with a blank.
    const wordsToRender =
      turnData.isInteractive && isCurrentTurn && !isAnswered
        ? turnData.promptWords
        : turnData.words;

    return (
      <View style={styles.bubbleContentWrapper}>
        {wordsToRender.map((wordObj, i) => {
          // If the word has a translation, render it with the `TranslatableWord` component.
          if (wordObj.translation) {
            return (
              <TranslatableWord
                key={`${bubbleIdx}-${i}`}
                id={`${bubbleIdx}-${i}`} // A unique ID for each translatable word.
                word={wordObj.word}
                translation={wordObj.translation}
              />
            );
          }
          // Otherwise, render it as plain text.
          return (
            <Text key={`${bubbleIdx}-plain-${i}`} style={styles.bubbleText}>
              {wordObj.word}{" "}
            </Text>
          );
        })}
      </View>
    );
  };

  /* Loading State */
  // Display a loading indicator until the avatar images are loaded.
  if (
    !femaleCpuAvatarLoaded ||
    !femaleUserAvatarLoaded ||
    !maleCpuAvatarLoaded ||
    !maleUserAvatarLoaded
  ) {
    return (
      <SafeAreaView style={[styles.root, styles.loaderContainer]}>
        {/* These Image components are hidden but used to trigger the onLoad event. */}
        <Image
          source={FemaleCPUAvatar}
          onLoad={() => setFemaleCpuAvatarLoaded(true)}
          style={{ width: 0, height: 0 }}
        />
        <Image
          source={FemaleUserAvatar}
          onLoad={() => setFemaleUserAvatarLoaded(true)}
          style={{ width: 0, height: 0 }}
        />
        {/* NEW: Hidden images for male avatars. */}
        <Image
          source={MaleCPUAvatar}
          onLoad={() => setMaleCpuAvatarLoaded(true)}
          style={{ width: 0, height: 0 }}
        />
        <Image
          source={MaleUserAvatar}
          onLoad={() => setMaleUserAvatarLoaded(true)}
          style={{ width: 0, height: 0 }}
        />
        <ActivityIndicator size="large" color="#f2860a" style={styles.loader} />
        <Text style={styles.loaderText}>Loading conversation…</Text>
      </SafeAreaView>
    );
  }

  // Once loaded, render the main component UI.
  return (
    // Provide the tooltip context value to all children components.
    <TooltipCtx.Provider
      value={{ currentId, open: openTooltip, close: closeAll }}
    >
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={[styles.root, { paddingBottom: 0 }]}
      >
        {/* A full-screen pressable to close any open tooltip when tapping the background. */}
        <Pressable style={{ flex: 1 }} onPress={closeAll}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.chat}
            style={{ flex: 1 }}
            onScrollBeginDrag={closeAll} // Close tooltip on scroll.
            scrollEventThrottle={16} // How often the scroll event fires.
          >
            {/* Map over the turns data up to the current turn and render a chat bubble for each. */}
            {scenarioData.turns.slice(0, turn + 1).map((t, idx) => {
              const fromCPU = isCPU(t);
              const isLatest = idx === turn;
              const isPlaying = currentlyPlayingId === idx; // NEW: Check if this bubble's audio is active
              // NEW: Select avatar based on gender and whether it's CPU or user.
              const avatarSource = fromCPU
                ? t.gender === "male"
                  ? MaleCPUAvatar
                  : FemaleCPUAvatar
                : t.gender === "male"
                ? MaleUserAvatar
                : FemaleUserAvatar;

              return (
                <Animated.View
                  key={idx}
                  style={[
                    styles.row,
                    fromCPU ? styles.rowLeft : styles.rowRight,
                    isLatest && {
                      transform: [{ translateX: messageSlideAnim }],
                    },
                  ]}
                >
                  <Image source={avatarSource} style={styles.avatar} />

                  <View
                    style={[
                      styles.bubble,
                      fromCPU ? styles.cpuBubble : styles.userBubble,
                    ]}
                  >
                    {renderBubbleContent(t, isLatest, idx)}
                  </View>
                  {/* --- ADD PLAY BUTTON (for User messages) --- */}
                  {!fromCPU && t.audio && idx < turn && (
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => handlePlayAudio(t.audio, idx)}
                    >
                      <FontAwesome5
                        name={isPlaying ? "stop-circle" : "play-circle"}
                        style={styles.playButtonIcon}
                      />
                    </TouchableOpacity>
                  )}

                  {/* --- ADD PLAY BUTTON (for CPU messages) --- */}
                  {fromCPU && t.audio && (
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => handlePlayAudio(t.audio, idx)}
                    >
                      <FontAwesome5
                        name={isPlaying ? "stop-circle" : "play-circle"}
                        style={styles.playButtonIcon}
                      />
                    </TouchableOpacity>
                  )}
                </Animated.View>
              );
            })}
          </ScrollView>
        </Pressable>

        {/* Word Bank or "Next" button, shown at the bottom of the screen */}
        {/* If the current turn is interactive AND the user hasn't answered yet, show the word bank. */}
        {scenarioData.turns[turn].isInteractive && !isAnswered && (
          <View style={styles.wordBankContainer}>
            <Text style={styles.wordBankTitle}>Choose the correct word</Text>
            {scenarioData.turns[turn].options.map((word) => (
              <TouchableOpacity
                key={word}
                style={styles.wordOption}
                onPress={() => handleWordSelection(word)}
              >
                <Text style={styles.wordOptionText}>{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* If the turn is NOT interactive, show a simple "Next" button. */}
        {!scenarioData.turns[turn].isInteractive && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={advanceToNextTurn}
          >
            <Text style={styles.nextButtonText}>Next Turn</Text>
          </TouchableOpacity>
        )}

        {/* Render the feedback modal (it will only be visible when `showModal` is true). */}
        <FeedbackModal />
      </SafeAreaView>
    </TooltipCtx.Provider>
  );
}

/* ── STYLES ── */
// Using StyleSheet.create for performance optimizations. All sizes are scaled using `ns`.
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  // Styles for the initial loading screen.
  loaderContainer: { justifyContent: "center", alignItems: "center" },
  loader: { transform: [{ scale: 2 }] },
  loaderText: {
    marginTop: 30,
    color: "#4b4b4b",
    fontWeight: "600",
    fontSize: 20,
  },

  // Styles for the chat area.
  chat: { padding: ns(16), paddingBottom: ns(200) }, // Padding at the bottom to ensure last message is not covered by the word bank.

  // Styles for a single message row (avatar + bubble).
  row: {
    flexDirection: "row",
    marginBottom: ns(12),
    maxWidth: "95%",
    alignItems: "center",
    marginTop: ns(40),
    position: "relative",
  },
  rowLeft: { alignSelf: "flex-start" }, // Aligns CPU messages to the left.
  rowRight: { alignSelf: "flex-end", flexDirection: "row-reverse" }, // Aligns user messages to the right and reverses the order (bubble then avatar).

  avatar: {
    width: ns(100),
    height: ns(100),
    marginHorizontal: ns(6),
    resizeMode: "contain",
  },
  bubble: {
    padding: ns(12),
    borderRadius: ns(16),
    borderWidth: 2,
    borderColor: "#e0e0e0",
    flexShrink: 1,
    maxWidth: ns(280),
    position: "relative",
    overflow: "visible", // Important for the tooltip to render outside the bubble's bounds.
  },
  bubbleContentWrapper: {
    flexDirection: "row",
    flexWrap: "wrap", // Allows words to wrap to the next line.
    position: "relative",
  },
  wordWrap: { position: "relative" }, // Wrapper for each pressable word.

  cpuBubble: { backgroundColor: "#fff" }, // CPU bubble style.
  userBubble: { backgroundColor: "#dcf8c6" }, // User bubble style (WhatsApp-like).
  bubbleText: {
    fontSize: ns(22),
    fontWeight: "600",
    color: "#4b4b4b",
    lineHeight: ns(30),
  },
  playButton: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center", // Vertically center the button with the bubble
    marginHorizontal: ns(5),
    padding: ns(8), // Increases the tappable area without making the icon huge
  },
  playButtonIcon: {
    fontSize: ns(40),
    color: "#f2860a", // Your brand color
  },
  // Styles for the word selection area at the bottom.
  wordBankTitle: {
    width: "100%",
    textAlign: "center",
    fontSize: ns(16),
    fontWeight: "600",
    color: "#4b4b4b",
    marginBottom: ns(10),
    paddingBottom: ns(5),
  },
  wordBankContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: ns(10),
    paddingTop: ns(10),
    paddingBottom: ns(30),
    backgroundColor: "#fff",
    borderTopWidth: 2,
    borderColor: "#e5e5e5",
    zIndex: 1000,
  },
  wordOption: {
    paddingVertical: ns(10),
    paddingHorizontal: ns(20),
    margin: ns(5),
    backgroundColor: "#fff",
    borderRadius: ns(10),
    borderWidth: 2,
    borderColor: "#e5e5e5",
  },
  wordOptionText: { fontSize: ns(18), fontWeight: "bold", color: "#4b4b4b" },

  // Styles for the simple "Next" button (for non-interactive turns).
  nextButton: {
    backgroundColor: '#f2860a', // Main orange color
    paddingVertical: ns(16),
    borderRadius: ns(16),
    alignItems: 'center',
    // The 3D effect
    borderBottomWidth: ns(6),
    borderBottomColor: '#d97809', // A darker shade of the main orange
    marginBottom: ns(40),
    marginHorizontal: ns(20)
  },
  // Updated text style for the new button
  nextButtonText: {
    fontSize: ns(20),
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  // Styles for the feedback modal.
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Aligns modal to the bottom.
    backgroundColor: "rgba(0,0,0,0.2)", // Semi-transparent background.
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    maxWidth: PHONE_WIDTH,
    paddingHorizontal: ns(20),
    paddingBottom: ns(65),
    paddingTop: ns(20),
    borderTopLeftRadius: ns(20),
    borderTopRightRadius: ns(20),
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
  feedbackSubtitle: { color: "#fff", fontSize: ns(16), marginBottom: ns(20) },
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
  correctBanner: { backgroundColor: "#58cc02" }, // Green banner for correct answers.
  incorrectBanner: { backgroundColor: "#ff4b4b" }, // Red banner for incorrect answers.
  whiteBtn: { backgroundColor: "#fff" },

  // Styles for the tooltip popup.
  tooltipContainer: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: ns(8),
    paddingVertical: ns(8),
    paddingHorizontal: ns(12),
    minWidth: ns(100),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 10,
  },
  tooltipText: {
    color: "#fff",
    fontSize: ns(16),
    fontWeight: "bold",
    textAlign: "center",
  },
  tooltipArrow: {
    // This creates the little triangle arrow at the bottom of the tooltip.
    position: "absolute",
    bottom: -ns(10),
    width: 0,
    height: 0,
    borderLeftWidth: ns(10),
    borderRightWidth: ns(10),
    borderTopWidth: ns(10),
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(0, 0, 0, 0.8)",
  },
});
