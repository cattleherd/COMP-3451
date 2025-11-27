import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";

// ── CONSTANTS ──
const PHONE_WIDTH = 412;
const PHONE_HEIGHT = 732;
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const scale = Math.min(windowWidth / PHONE_WIDTH, windowHeight / PHONE_HEIGHT);

const TILE_SIZE = PHONE_WIDTH * 0.3;
const TILE_MARGIN = 10;
const sf = (v) => Math.round(v * scale);

const TileMatchingGame = React.memo(({ onNextGame, data }) => {
  // state
  const [tiles, setTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [showWinModal, setShowWinModal] = useState(false);
  const [score, setScore] = useState(0);

  // animation value for modal
  const slideAnim = useRef(new Animated.Value(windowHeight)).current;

  // ------------------helpers ------------------------------

  // shuffle tiles
  const shuffleTiles = useCallback((arr) => {
    const a = arr.slice();
    const newArray = [...a];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray; // return the newly shuffled array
  }, []);

  const handleTilePress = useCallback(
    (tile) => {
      // dont trigger under these conditions
      if (showWinModal) return;
      if (selectedTiles.length >= 2) return; // guard

      // check if tile pressed is already selected, do nothing
      const alreadySelected = selectedTiles.some(
        (t) => t.id === tile.id && t.type === tile.type
      );
      if (alreadySelected) return;

      // if all prev conditions false, make the pressed tile selected
      setSelectedTiles((prev) => [...prev, tile]);
    },
    [selectedTiles, showWinModal]
  );
  // reset state for good practise
  const resetGame = useCallback(() => {
    setMatchedPairs(0);
    setSelectedTiles([]);
    setScore(0);
    setTiles(shuffleTiles([...data.tiles]));
    slideAnim.setValue(windowHeight);
  }, [data.tiles, shuffleTiles, slideAnim]);

  // animate modal in
  const animateModalIn = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // animate modal out
  const animateModalOut = useCallback(
    (after) => {
      Animated.timing(slideAnim, {
        toValue: windowHeight,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setShowWinModal(false);
        after?.();
      });
    },
    [slideAnim]
  );

  // switch to the next game (all tiles matched)
  const handleNextGamePress = useCallback(() => {
    animateModalOut(() => {
      const lastScore = score;
      resetGame();
      onNextGame(lastScore);
    });
  }, [score, resetGame, onNextGame, animateModalOut]);

  // set up the tiles
  useEffect(() => {
    setTiles(shuffleTiles([...data.tiles]));
  }, [data.tiles, shuffleTiles, slideAnim]);

  // determine a match
  useEffect(() => {
    if (selectedTiles.length !== 2) return;

    // check if selected tiles have same id
    const [i, j] = selectedTiles;
    const isMatch = i.id === j.id && i.type !== j.type;

    if (isMatch) {
      // 250ms buffer time period to update state
      // filter out all tiles with the matched tile ids (removes 2 tiles each time if they match)
      const timeout = setTimeout(() => {
        setTiles((prev) => prev.filter((t) => t.id !== i.id));
        setMatchedPairs((p) => p + 1); // increment the number of matched tiles, win condition
        setScore((s) => s + 10); // increment score
        setSelectedTiles([]); // clear selected tiles state
      }, 250);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setSelectedTiles([]);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [selectedTiles]);

  // win check
  useEffect(() => {
    if (matchedPairs === 0) return; // guard check
    if (matchedPairs === data.tiles.length / 2) {
      setShowWinModal(true); // show modal
      requestAnimationFrame(animateModalIn); // animate modal only after UI ready
    }
  }, [matchedPairs, data.tiles.length, animateModalIn]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Text style={styles.score}>Match the correct tiles</Text>

          <View style={styles.grid}>
            
            {
            // each child must have a unique key
            tiles.map((tile, idx) => {
              const key = `${tile.id}-${tile.type}-${idx}`;
              const isSelected = selectedTiles.some(
                (t) => t.id === tile.id && t.type === tile.type
              );

              return (
                <Pressable
                  key={key}
                  onPress={() => handleTilePress(tile)}
                  style={({ pressed }) => {
                    const baseTransform = [];
                    if (pressed) baseTransform.push({ scale: 0.95 });
                    if (isSelected) baseTransform.push({ translateY: 3 });

                    return [styles.tileWrapper, { transform: baseTransform }];
                  }}
                  disabled={showWinModal} // disable the tiles when game over
                >
                  <View
                    style={[styles.tile, isSelected && styles.selectedTile]}
                  >
                    <Text
                      style={[
                        styles.tileText,
                        isSelected && styles.selectedTileText,
                      ]}
                    >
                      {tile.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={showWinModal}
        onRequestClose={handleNextGamePress}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              styles.correctBanner,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.feedbackHeader}>
              <FontAwesome5 name="check-circle" size={24} color="#fff" />
              <Text style={styles.feedbackTitle}>Great!</Text>
            </View>
            <Text style={styles.feedbackSubtitle}>
              You’ve matched all the pairs!
            </Text>
            <Pressable
              style={[styles.modalButton, styles.whiteBtn]}
              onPress={handleNextGamePress}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  { color: styles.correctBanner.backgroundColor },
                ]}
              >
                Next Game
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFCF8",
    marginTop: 30,
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    transform: [{ scale: 2 }],
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 10,
  },
  container: {
    alignItems: "center",
    paddingVertical: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tileWrapper: {
    margin: TILE_MARGIN,
  },
  tile: {
    width: TILE_SIZE * 1.3,
    height: TILE_SIZE * 1.3,
    backgroundColor: "#7F86EB",
    borderRadius: 16,
    borderBottomWidth: 8,
    borderBottomColor: "#BFA6FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  selectedTile: {
    backgroundColor: "#BFA6FF",
    borderBottomWidth: 8,
    borderBottomColor: "#7F86EB",
  },
  tileText: {
    fontSize: 24,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
  },
  selectedTileText: {
    fontSize: 26,
  },
  score: {
    marginTop: 20,
    marginBottom: 30,
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A0E0E",
  },
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
    paddingBottom: sf(50),
    paddingTop: sf(20),
    borderTopLeftRadius: sf(20),
    borderTopRightRadius: sf(20),
  },
  correctBanner: {
    backgroundColor: "#58cc02",
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  feedbackTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
    marginLeft: 10,
  },
  feedbackSubtitle: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  whiteBtn: {
    backgroundColor: "#fff",
  },
});

export default TileMatchingGame;
