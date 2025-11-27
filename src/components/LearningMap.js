import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  FlatList,
} from "react-native";
import Sprite from "./Sprite.js";
import spriteSheetFront from "../../public/assets/sprite-front.png";
import spriteSheetBack from "../../public/assets/sprite-back.png";
import LessonConfig from "../components/lessons/beginner/LessonConfig";

/* ------ constants -------- */
const TILE_SIZE = 120;
const TILE_MARGIN = 60;
const SPRITE_SIZE = 50;
const PHONE_WIDTH = 412;
const PHONE_HEIGHT = 732;

const scale = Math.min(
  Dimensions.get("window").width / PHONE_WIDTH,
  Dimensions.get("window").height / PHONE_HEIGHT
);

const sf = (v) => Math.round(v * scale); // scaling factor for all screens

// set tile color based on chapter
const sectionColors = {
  greetings: "rgba(255, 183, 77, 1)", // Orange
  everydayActions: "rgba(186, 255, 118, 1)", // Green
  grammarBasics: "rgba(97, 205, 255, 1)", // Blue
  Misc: "rgba(243, 173, 255, 1)", // Purple (fallback)
};
// set tile color based on chapter
const sectionBorderColors = {
  greetings: "rgba(160, 60, 0, 1)",
  everydayActions: "rgba(40, 120, 10, 1)",
  grammarBasics: "rgba(0, 60, 140, 1)",
  Misc: "rgba(80, 0, 90, 1)",
};

const LearningMap = ({ navigation }) => {
  // create an array of the lesson objects
  const allLessons = Object.values(LessonConfig).map((lesson, index) => ({
    ...lesson,
    flatIndex: index,
  }));
  /* 
      [
      // first item
      {
        id: "Greetings_IskaWarran",
        title: "Greetings Vocab",
        description: ...,
        section: "Greetings",
        key: "greetings",
        games: {...},
        flatIndex: 0
      },
      {...}
      ]
  */

  // --- handler to calculate and store the y positions of the top of each tile
  // this is used to calculate where the sprite needs to move to, to land on a specific tile
  const yPositions = useMemo(() => {
    let y = sf(50); // offset 20 from paddingTop tileContainer and 30 from contentContainer
    const pos = {}; // list of the y positions (top) of each tile
    // calculate and store the Y position for the top of each tile
    allLessons.forEach((tile) => {
      // 1. Move the y position down by the margin ABOVE the tile
      y += sf(TILE_MARGIN);
      // 2. save this y position as the tile's y position
      pos[tile.flatIndex] = y;
      // 3. move the y position down past the tile's height and the margin BELOW it
      //    which prepares 'y' for the next tile's calculation.
      y += sf(TILE_SIZE) + sf(TILE_MARGIN);
    });
    return pos;
  }, [allLessons]); // populate the list when lessonData is initialized or changes

  // ------ state --------
  const [selectedFlat, setSelectedTilePosition] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTile, setSelectedTile] = useState(null);
  const [spriteAnim, setSpriteAnim] = useState(false);
  const [spriteDir, setSpriteDir] = useState("front");

  const listRef = useRef(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const spritePos = useRef(new Animated.Value(yPositions[0])).current;

  // ------------- handlers -----------------

  // prevent unecessary re-render for performance (since each tile)
  const handleTilePress = useCallback(
    (lesson) => {
      const flatIdx = lesson.flatIndex; // the position
      const targetY = yPositions[flatIdx];
      const currentY = spritePos.__getValue();
      const dir = targetY > currentY ? "front" : "back";

      if (flatIdx !== selectedFlat) {
        setSpriteDir(dir);
        setSpriteAnim(true);
      }
      setSelectedTilePosition(flatIdx);

      listRef.current?.scrollToOffset({
        offset: targetY - sf(TILE_SIZE),
        animated: true,
      });

      Animated.timing(spritePos, {
        toValue: targetY,
        duration: 700,
        useNativeDriver: true,
      }).start(() => {
        setSpriteAnim(false);
        setSelectedTile(lesson);
        setModalVisible(true);
      });
    },
    [selectedFlat, spritePos, yPositions, navigation]
  );

  const spriteY = Animated.add(spritePos, Animated.multiply(scrollY, -1));

  return (
    <View style={styles.innerContainer}>
      <View style={styles.contentContainer}>
        {/* -------- Sprite styles ----------- */}
        <Animated.View
          style={[
            styles.sprite,
            {
              transform: [{ translateY: spriteY }, { translateY: sf(-60) }],
            },
          ]}
        >
          <Sprite
            spriteSheet={spriteSheetFront}
            spriteSheetBack={spriteSheetBack}
            isAnimating={spriteAnim}
            direction={spriteDir}
          />
        </Animated.View>

        {/* --------- Tiles List UI --------- */}
        <FlatList
          /* Flatlist data structure
        
        {
          item: { lesson data },
          index: 0,
        }   

        */
          ref={listRef}
          data={allLessons}
          keyExtractor={(item) => item.flatIndex.toString()}
          renderItem={({ item }) => {
            const tileKey = item.key || "Misc";
            const tileColor = sectionColors[tileKey];
            const borderColor = sectionBorderColors[tileKey];
            return (
              <View>
                <TouchableOpacity
                  style={[
                    styles.tile,
                    {
                      borderBottomColor: borderColor,
                      backgroundColor: tileColor,
                    },
                  ]}
                  onPress={() => handleTilePress(item)}
                >
                  <View style={styles.tileContent}>
                    <Text
                      style={[
                        styles.tileText,
                        item.flatIndex === selectedFlat &&
                          styles.selectedTileText,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
          contentContainerStyle={styles.tileContainer}
          // this connects the scroll position of flatlist to scrollY ref, which is used to
          // move the sprite so it moves relative to the tile evne during scroll
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16} // limit updates
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* --------- modal styles -------- */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOuterContainer}>
          <View
            style={[styles.modalInnerContainer, { transform: [{ scale }] }]}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{selectedTile?.title}</Text>
                <Text style={styles.modalDetails}>
                  {selectedTile?.description}
                </Text>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate("LessonGames", {
                      lessonData: selectedTile,
                    });
                  }}
                >
                  <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // container styles
  innerContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ffed7aff",
    overflow: "hidden",
    marginTop: sf(30),
  },
  contentContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingTop: sf(30),
  },

  // tile styles
  tileContainer: {
    alignItems: "center",
    paddingTop: sf(20),
    paddingBottom: sf(150),
  },
  tile: {
    height: sf(TILE_SIZE),
    width: sf(TILE_SIZE),
    justifyContent: "center",
    alignItems: "center",
    marginVertical: sf(TILE_MARGIN),
    borderRadius: sf(TILE_SIZE) / 2,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: sf(3.5),
    borderBottomWidth: sf(10),
    overflow: "hidden",
  },
  tileContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  tileText: {
    fontSize: sf(18),
    fontWeight: "900",
    color: "#5b3000ff",
    textAlign: "center",
  },
  selectedTileText: {
    fontSize: sf(18),
    color: "white",
    fontWeight: "900",
  },
  sprite: {
    position: "absolute",
    left: "44%",
    width: sf(SPRITE_SIZE),
    height: sf(SPRITE_SIZE),
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  // modal styles
  modalOuterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalInnerContainer: {
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    overflow: "hidden",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF9E6",
    padding: sf(24),
    borderRadius: sf(20),
    alignItems: "center",
    width: "85%",
    elevation: sf(5),
    shadowColor: "#8B4513",
    shadowOpacity: 0.3,
    shadowRadius: sf(6),
  },
  closeButton: {
    position: "absolute",
    top: sf(5),
    right: sf(5),
    backgroundColor: "#F28C38",
    borderRadius: sf(18),
    width: sf(36),
    height: sf(36),
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: sf(16),
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: sf(32),
    fontWeight: "800",
    marginBottom: sf(12),
    color: "#4A0E0E",
    textAlign: "center",
  },
  modalDetails: {
    fontSize: sf(22),
    textAlign: "center",
    marginBottom: sf(20),
    color: "#5A5A5A",
    lineHeight: sf(28),
  },
  startButton: {
    backgroundColor: "#F28C38",
    paddingVertical: sf(14),
    paddingHorizontal: sf(32),
    borderRadius: sf(16),
    width: "100%",
    alignItems: "center",
    marginTop: sf(24),
    elevation: sf(4),
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: sf(20),
    fontWeight: "700",
  },
});

export default LearningMap;
