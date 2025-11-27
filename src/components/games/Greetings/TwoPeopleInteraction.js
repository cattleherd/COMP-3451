import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
  ActivityIndicator, // spinner
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
//icons
import { FontAwesome5 } from "@expo/vector-icons";
import { Audio } from "expo-av";

// -------- Constants and helpers ----------------

// ideal dimensions (e.g., an iPhone 13)
const PHONE_WIDTH = 412;
const PHONE_HEIGHT = 732;

// get the actual viewport dimensions of the viewing device, destructured
const { width, height } = Dimensions.get("window");
// scale pixels based on current device viewport, based on limiting dimension (width of height)
const scale = Math.min(width / PHONE_WIDTH, height / PHONE_HEIGHT);
// scaling factor
const sf = (v) => Math.round(v * scale);

//  image assets for the avatars
const FemaleCPUAvatar = require("../../../../public/assets/woman.png");
const FemaleUserAvatar = require("../../../../public/assets/woman-2.png");
const MaleCPUAvatar = require("../../../../public/assets/boy.png");
const MaleUserAvatar = require("../../../../public/assets/boy-2.png");

// --------- main component -------------------
export default function TwoPeopleInteraction({ scenarioData, onComplete }) {
  // check for images loaded so no blank avatars when component is running
  const [femaleCpuAvatarLoaded, setFemaleCpuAvatarLoaded] = useState(false);
  const [femaleUserAvatarLoaded, setFemaleUserAvatarLoaded] = useState(false);
  const [maleCpuAvatarLoaded, setMaleCpuAvatarLoaded] = useState(false);
  const [maleUserAvatarLoaded, setMaleUserAvatarLoaded] = useState(false);

  // conversation flow state management
  const [turn, setTurn] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false); // did user select an option from wordbank
  const [isCorrect, setIsCorrect] = useState(false); // if the user got the option correct
  const [showModal, setShowModal] = useState(false); // when to show feedback modal

  // sound assets
  const [sound, setSound] = useState(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null); // Tracks index of playing audio

  // --------- audio logic helpers and lifecycle -------------------------

  // automatically play audio for CPU turns (interactive dialogue)
  useEffect(() => {
    const data = scenarioData.turns[turn];
    // check if turn has audio AND is NOT interactive (CPU turn)
    if (data && data.audio && !data.isInteractive) {
      // a small delay (chat bubble animates first before audio plays)
      const autoplay = setTimeout(() => {
        handlePlayAudio(data.audio, turn);
      }, 300); // 300ms delay

      // cleanup
      return () => clearTimeout(autoplay);
    }
  }, [turn, scenarioData]); // this effect runs whenever theres a new turn, or scenario data changes (first mount)

  // cleanup audio whenever component unmounts, or sound changes (which stops and unloads old sound even if its playing )
  useEffect(() => {
    return sound // if a sound has already played, unload it before the next sound can be played
      ? () => {
          sound.unloadAsync();
        }
      : undefined; // return nothing (no cleanup) otherwise
  }, [sound]);

  // logic for playing audio
  const handlePlayAudio = async (audioClip, turnIndex) => {
    // if no audio passed, return
    if (!audioClip) return;

    // check if sound has already played, if so, stop the sound which also performs memory cleanup (unloadAsync)
    // also perform state cleanup (remove old audio clip from state)
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      // if the user presses the play button twice, it stops the sound
      // otherwise, if the user presses a different play button, it skips this logic and instead plays that sound
      if (currentlyPlayingId === turnIndex) {
        setCurrentlyPlayingId(null);
        return;
      }
    }
    try {
      // load the sound and play!

      // store the sound object into variable newSound, using destructuring.
      const { sound: newSound } = await Audio.Sound.createAsync(audioClip);
      setSound(newSound); // app now knows a sound is playing

      setCurrentlyPlayingId(turnIndex); // track which audioclip is playing based on the turnIndex of each chat bubble
      // if the play button on the currently played track is pressed, it stops the audio
      // also manages the play/stop button icon state

      // callback for when the sound finishes playing to reset the UI
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setCurrentlyPlayingId(null); // clear the tracking to reset the play/stop button icon, as well as logic when pressing play button
          newSound.unloadAsync(); // Unload to free up memory
          setSound(null); // clear sound state, so the app knows no sound is currently loaded.
        }
      });

      await newSound.playAsync(); // play sound, which triggers the callback to perform cleanup afterwards
    } catch (error) {
      console.error("Cannot play audio:", error);
      setCurrentlyPlayingId(null); // reset
    }
  };

  // Animation values stored in useref
  const slideAnim = useRef(new Animated.Value(height)).current; // animation reference for feedback modal
  const messageSlideAnim = useRef(new Animated.Value(0)).current; // animation ref for slide in messages
  const scrollRef = useRef(null); // animation reference for ScrollView (auto scroll per turn)
  const nextButtonAnim = useRef(new Animated.Value(0)).current; // for the CTA animation button
  const earnedXPRef = useRef(0); // total XP for the game
  const scoredThisTurnRef = useRef(false); // guard so we add once per turn

// subtle floating animation for the Next button, it runs in a loop
useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(nextButtonAnim, {
        toValue: -sf(8),   
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(nextButtonAnim, {
        toValue: 0,        
        duration: 900,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, [nextButtonAnim]);

  // Helper function to check if the current speaker is the "CPU"
  const isCPU = (e) => e.speaker === "CPU";

  // feedback modal slide in
  const animateModalIn = () => {
    slideAnim.setValue(height); // Reset position to the bottom of the screen
    // slide in
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // feedback modal slide out
  const animateModalOut = (onComplete) => {
    // slide back down
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowModal(false); // hide modal AFTER animation finished
      onComplete?.(); // run the callback function defined in handleModalContinue
    });
  };

  // helper function, logic when turn changes
  const advanceToNextTurn = () => {
    // iff this was the last turn, call the onComplete callback which triggers parent to switch games
    if (turn + 1 >= scenarioData.turns.length) {
      onComplete?.(earnedXPRef.current); // forward total xp to parent (lessonGames) if last turn completed
      console.log(`final xp earned: ${earnedXPRef.current}`);
      return;
    }
    const nextTurnIndex = turn + 1; // the value we use to determine if its final turn, or access next turn data
    const fromUser = !isCPU(scenarioData.turns[nextTurnIndex]); // boolean, if its a users turn we slide from right otherwise from left

    // the starting position for the new message, slide in start position depends on fromUser
    messageSlideAnim.setValue(fromUser ? width : -width);
    // update state for the new turn
    setTurn(nextTurnIndex);
    setIsAnswered(false);
    setIsCorrect(false);

    // animate the slide in
    Animated.timing(messageSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // scroll to the end of the chat list to show the new message, and `setTimeout` ensures the new message is rendered first (wait for repaint from setTurn update)
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    scoredThisTurnRef.current = false; // reset the guard (user cant spam continue to get more xp)
  };

  // helper function, when user selects a word from wordbank
  const handleWordSelection = (word) => {
    const current = scenarioData.turns[turn];
    // Check if the selected word is the correct answer
    setIsCorrect(word === current.missingWord);
    setIsAnswered(true);
    setShowModal(true);
    // requestAnimationFrame ensures the modal is rendered before we try to animate it in
    requestAnimationFrame(animateModalIn);
    if (current.audio) {
      handlePlayAudio(current.audio, turn);
    }
  };

  // helper, when user selects continue to advance to next turn
  const handleModalContinue = () =>
    // we call the function to slide out the modal, but pass a callback function
    // the callback function advances the next turn and increase score
    animateModalOut(() => {
      if (isAnswered && isCorrect && !scoredThisTurnRef.current) {
        earnedXPRef.current += 100;
        scoredThisTurnRef.current = true; // guard, if user spams continue button without this guard, they can trigger xp increment
      }
      advanceToNextTurn();
    });

  //------------------- Feedback Modal Sub-component ---------------------------
  const FeedbackModal = () => {
    if (!showModal) return null; // wait until its loaded in state to show feedback
    const data = scenarioData.turns[turn];
    const isFinalTurn = turn + 1 >= scenarioData.turns.length;
    // the button text color dynamic
    const buttonTextColor = isCorrect
      ? styles.correctBanner.backgroundColor
      : styles.incorrectBanner.backgroundColor;

    return (
      <Modal
        animationType="none"
        transparent
        visible={showModal} // show if triggered
        onRequestClose={handleModalContinue} // when closed trigger helper which slides out modal and trigger advance turn logic
      >
        {/* Pressable allows closing the modal by tapping the background */}
        <Pressable style={styles.modalOverlay} onPress={handleModalContinue}>
          <Animated.View
            style={[
              styles.modalContent,
              // apply correct or incorrect styling based on the answer
              isCorrect ? styles.correctBanner : styles.incorrectBanner,
              // apply the slide animation
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
            {/* show answer if required */}
            {!isCorrect && (
              <Text style={styles.feedbackSubtitle}>
                Correct Answer:{" "}
                <Text style={{ fontWeight: "bold" }}>{data.missingWord}</Text>
              </Text>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.whiteBtn]}
              onPress={handleModalContinue} // slide modal out, advance turn
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

  /* Render chat bubble text, for CPU or User */

  // Display either CPU bubble text, or User text (before answered, after answered)
  const renderBubbleText = (turnData, isCurrentTurn) => {
    // if the turn is user, show the version with a blank
    const wordsToRender =
      turnData.isInteractive && isCurrentTurn && !isAnswered
        ? turnData.promptWords
        : turnData.words;

    // combine all the words to form a sentence
    const concatenatedString = wordsToRender
      .map((wordObj) => wordObj.word)
      .join(" ");

    return <Text style={styles.bubbleText}>{concatenatedString}</Text>;
  };

  /* ---------------------- Loading UI----------------  */
  if (
    !femaleCpuAvatarLoaded ||
    !femaleUserAvatarLoaded ||
    !maleCpuAvatarLoaded ||
    !maleUserAvatarLoaded
  ) {
    return (
      <SafeAreaView style={[styles.root, styles.loaderContainer]}>
        {/* These Image components are hidden but used to trigger the onLoad event. This is literally
            the easiest way to conditionally render the component AFTER the images have loaded (main resource loading bottleneck)
        */}
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

  // ------------------------- Main UI ------------------------------------
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.root, { paddingBottom: 0 }]}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.chat}
        style={{ flex: 1 }}
        scrollEventThrottle={16} // refresh rate
      >
        {/* Map over the turns data up to the current turn and show a message bubble for each turn */}
        {scenarioData.turns.slice(0, turn + 1).map((e, idx) => {
          const fromCPU = isCPU(e); // whether to render CPU or User bubble
          const isLatest = idx === turn; // whether to render the user chat bubble with blanks or not
          const isPlaying = currentlyPlayingId === idx; // if audio playing
          // choose avatar based on gender (scenario data) and whether it's CPU or user.
          const avatarSource = fromCPU
            ? e.gender === "male"
              ? MaleCPUAvatar
              : FemaleCPUAvatar
            : e.gender === "male"
            ? MaleUserAvatar
            : FemaleUserAvatar;

          return (
            <Animated.View
              key={idx}
              style={[
                styles.row,
                fromCPU ? styles.rowLeft : styles.rowRight,
                isLatest && {
                  transform: [{ translateX: messageSlideAnim }], // animate the chat bubble if its newest
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
                {renderBubbleText(e, isLatest)}
              </View>

              {/* play button */}
              {e.audio && (
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => handlePlayAudio(e.audio, idx)}
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

      {/* Render Word Bank or "Next" button */}
      {/* If the current turn is user AND the user hasn't answered yet, show the word bank */}
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
      {/* If the turn is CPU, show the next button to advance to next turn */}
      {!scenarioData.turns[turn].isInteractive && (
        <Animated.View
          style={{ transform: [{ translateY: nextButtonAnim }] }}
        >
          <TouchableOpacity
            style={styles.nextButton}
            onPress={advanceToNextTurn}
          >
            <Text style={styles.nextButtonText}>Next Turn</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Feedback modal (visible when showModal true) */}
      <FeedbackModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  // loading screen.
  loaderContainer: { justifyContent: "center", alignItems: "center" },
  loader: { transform: [{ scale: 2 }] },
  loaderText: {
    marginTop: 30,
    color: "#4b4b4b",
    fontWeight: "600",
    fontSize: 20,
  },

  // chat area.
  chat: { padding: sf(16), paddingBottom: sf(200) },

  // message row (avatar and chat bubble)
  row: {
    flexDirection: "row",
    marginBottom: sf(12),
    maxWidth: "95%",
    alignItems: "center",
    marginTop: sf(40),
    position: "relative",
  },
  // rowLeft and rowRight element ordering reflected
  rowLeft: { alignSelf: "flex-start" },
  rowRight: { alignSelf: "flex-end", flexDirection: "row-reverse" },

  avatar: {
    width: sf(100),
    height: sf(100),
    marginHorizontal: sf(6),
    resizeMode: "contain",
  },
  bubble: {
    padding: sf(12),
    borderRadius: sf(16),
    borderWidth: 2,
    borderColor: "#e0e0e0",
    flexShrink: 1,
    maxWidth: sf(280),
    position: "relative",
    overflow: "visible",
  },

  cpuBubble: { backgroundColor: "#fff" },
  userBubble: { backgroundColor: "#dcf8c6" },
  bubbleText: {
    fontSize: sf(22),
    fontWeight: "600",
    color: "#4b4b4b",
    lineHeight: sf(30),
  },
  playButton: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginHorizontal: sf(5),
    padding: sf(8),
  },
  playButtonIcon: {
    fontSize: sf(40),
    color: "#f2860a",
  },

  //wordbank
  wordBankTitle: {
    width: "100%",
    textAlign: "center",
    fontSize: sf(16),
    fontWeight: "600",
    color: "#4b4b4b",
    marginBottom: sf(10),
    paddingBottom: sf(5),
  },
  wordBankContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: sf(10),
    paddingTop: sf(10),
    paddingBottom: sf(30),
    backgroundColor: "#fff",
    borderTopWidth: 2,
    borderColor: "#e5e5e5",
    zIndex: 1000,
  },
  wordOption: {
    paddingVertical: sf(10),
    paddingHorizontal: sf(20),
    margin: sf(5),
    backgroundColor: "#fff",
    borderRadius: sf(10),
    borderWidth: 2,
    borderColor: "#e5e5e5",
  },
  wordOptionText: { fontSize: sf(18), fontWeight: "bold", color: "#4b4b4b" },

  // next button
  nextButton: {
    backgroundColor: "#4acf26ff",
    paddingVertical: sf(16),
    borderRadius: sf(16),
    alignItems: "center",
    borderBottomWidth: sf(6),
    borderBottomColor: "#025915ff",
    marginBottom: sf(40),
    marginHorizontal: sf(20),
  },
  nextButtonText: {
    fontSize: sf(20),
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  //feedback modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    maxWidth: PHONE_WIDTH,
    paddingHorizontal: sf(20),
    paddingBottom: sf(65),
    paddingTop: sf(20),
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
  feedbackSubtitle: { color: "#fff", fontSize: sf(16), marginBottom: sf(20) },
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
  whiteBtn: { backgroundColor: "#fff" },
});
