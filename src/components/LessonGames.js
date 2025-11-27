import React, { useState, useEffect } from "react";
import { Text, StyleSheet, SafeAreaView } from "react-native";

// Games
import FlashcardLearning from "./games/FlashcardLearning.js";
import TwoPeopleInteraction from "./games/Greetings/TwoPeopleInteraction.js";
import TileMatchingGame from "./games/TileMatchingGame.js";
import SentenceBuilder from "./games/SentenceBuilder.js";

/* ----------------------------------- Helper functions --------------------------------------------- */

// For these games, we just want to show one question per lesson. This is so each lesson shown has a different set of questions, which is chosen randomly.
const SINGLE_ITEM_GAME = new Set(["FlashcardLearning", "SentenceBuilder"]);

// fisher yates shuffle implemented, used for shuffling tiles and the games etc (randomization so players can't just memorize patterns)
function shuffleArray(array) {
  // Create a local copy, so original isnt mutated
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray; // return the newly shuffled array
}

/**
 * This function takes one "lesson" object at a time (e.g., FlashcardLearning: [{data}...{data}], where {data} is a lesson object)
 * and selects just one item (question) from the items array, randomly.
 *
 * BEFORE: { data: { items: [question_A, question_B, question_C] } }`
 * AFTER: { data: { items: [question_B] } }
 *
 */
function pruneToSingleItem(gameKey, singleLesson) {
  // gameKey - The name of the game (e.g., "FlashcardLearning").
  // singleLesson - The single lesson object (e.g., { data: { items: [...] } })
  // so we iterate over the games (FlashcardLearning, Tilematching, etc), and passing the key name as GameKey
  // then for each game we iterate over each lesson object { data: { items: [...] } }, and pick out only one question in the item array
  // so for a game such as FlashcardLearning, with multiple lesson objects, FlashcardLearning: [{data}...{data}], we select just 1 question for each lesson afterwards

  const items = singleLesson?.data?.items;

  // 1. Check if this game type is NOT on our pruning list (e.g., "TileMatchingGame")
  // 2. Check if the items attribute is not a valid array (error handling)
  // 3. Check if the items array is empty (error handling)
  if (
    !SINGLE_ITEM_GAME.has(gameKey) ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    // If any check fails, just return the object data of a particular lesson (unchanged)
    // for example, the tilematchinggame, there is no items attribute, so it will fail
    // and instead, we use the prunetilepairs logic instead to just select 8 tiles
    return singleLesson;
  }

  // If this logic runs, means we have a lesson {data: ...} that has an items attribute with multiple questions {items: [...]}
  // now we must choose a random question from the items array from the lesson
  // then return the new entire lesson object, but this time with a single question
  const idx = Math.floor(Math.random() * items.length);
  return {
    ...singleLesson, // even though most lessons only contains the data property, we include this incase lessons have other attributes in other games (id, etc)
    data: { ...singleLesson.data, items: [items[idx]] },
  };
}

// this method is just for the tile game, where we just want to randomly select 8 tiles per game
function pruneTilePairs(singleLesson, maxTiles = 8) {
  const tiles = singleLesson?.data?.tiles; // grab the tile data

  // 1. does our lesson have a tiles attribute thats an array
  // 2. do we have atleast 2 tiles in the tiles array of a particular lesson
  if (!Array.isArray(tiles) || tiles.length < 2) {
    // If any check fails, return the lesson object unchanged.
    return singleLesson;
  }

  // Tiles pruning Logic
  // 1. Group all tiles by their 'id', since we have question tiles and answer tile pairs
  // {id: 1, name: "A"}, {id: 1, name: "B"} => one pair of tiles
  const groupById = {};

  // 2. loop over every tile
  tiles.forEach((e) => {
    const id = e.id;

    // 3. Check if a pair already exists for this ID
    if (groupById[id]) {
      // if so, push the tile into the existing pair
      groupById[id].push(e);
    } else {
      // If no, create a new array with this tile as the first item
      groupById[id] = [e];
    }
  });

  // 2. Filter the pairs in 'groupById', keeping only the arrays that are true pairs (length === 2).
  const pairs = Object.values(groupById).filter((p) => p.length === 2);

  /* now pairs looks like: 
  
  [
    [ {id: 1, name: "A"}, {id: 1, name: "C"} ],
    [ {id: 3, name: "D"}, {id: 3, name: "E"} ]
  ]

  */

  // 3. If no pairs were found, then return the original tiles object lesson
  if (pairs.length === 0) {
    return singleLesson;
  }

  // 4. Calculate how many pairs to pick
  // we want maxTiles/2 (e.g., 4 pairs for 8 tiles),
  // but no more than we have, and at least 1.
  const numPairsToTake = Math.max(
    1, // incase maxTiles passed is 1, which makes the Math.min function return 0. We want atleast 1 pair..
    Math.min(Math.floor(maxTiles / 2), pairs.length) // incase we want more pairs than we actually have in a lesson
  );

  // 5. Shuffle the pairs, take the amount we want, and flatten back into a single array
  const prunedTiles = shuffleArray(pairs).slice(0, numPairsToTake).flat();

  /*
  
  before: 
  [
    [ {id: 1, name: "A"}, {id: 1, name: "C"} ],
    [ {id: 3, name: "D"}, {id: 3, name: "E"} ]
  ]

  after:

  [
     {id: 1, name: "A"}, {id: 1, name: "C"} ,
     {id: 3, name: "D"}, {id: 3, name: "E"} 
  ]
  
  */

  return {
    ...singleLesson,
    data: { ...singleLesson.data, tiles: prunedTiles },
  };
}

// Games that should NEVER be replayed, even if the user "fails"
const NON_REPLAYABLE_GAME_TYPES = new Set(["TileMatchingGame"]);

// Minimum score to be considered a "pass" on a game
const SCORE_THRESHOLD = 1;

/* Main Driver (Controller)
 * This component manages the game flow, scoring, and replay logic for an entire lesson.
 */

const LessonGames = ({ route, navigation }) => {
  const { lessonData, lessonTitle, gamesToReplay, isReplay, originalScores } =
    route.params;

  const [currentGameIndex, setCurrentGameIndex] = useState(0); // the index that iterates over each game
  const [scores, setScores] = useState([]); // cumulative score, updated after each game played
  const [activeGames, setActiveGames] = useState([]); //The final, shuffled list of game "lessons", initially empty

  // This UseEffect builds the list of games once when the screen mounts, which gets shuffled for unpredictability
  // However, this effect also runs if we need to replay the games answered incorrectly,
  useEffect(() => {
    // -------------- Second run: replay mode ---------------
    // which just sets the games answered incorrectly in order to be replayed
    // gamesToReplay game data is passed as a prop from the transition screen
    if (isReplay && Array.isArray(gamesToReplay)) {
      setActiveGames(gamesToReplay);
      return;
    }

    // ------- First run: build games from lessonData ----------
    if (
      !lessonData ||
      !lessonData.games ||
      typeof lessonData.games !== "object"
    ) {
      setActiveGames([]);
      return;
    }

    const prunedGames = []; // Array to hold all pruned game rounds for this lesson
    // ie: 1 question per flashcardlearning game, 6 tiles per tilematchinggame, etc

    Object.entries(lessonData.games).forEach(([gameKey, gameData]) => {
      // .entries() transform the games object into a list of [key, value] arrays.
      // This is necessary because you cannot loop over an object with .forEach() directly.
      //
      // BEFORE .entries():
      // games: {
      //   FlashcardLearning: [ {question 1}, {questiom 2} ],
      //   TileMatchingGame: [ {question 3} ]
      // }
      //
      // AFTER .entries():
      // games: [
      //   [ "FlashcardLearning", [ {question 1}, {question 2}... ] ],
      //   [ "TileMatchingGame",  [ {question 3}... ] ]
      // ]
      //
      //
      // The .forEach() loop provides (value, index).
      // Our (value) (from Object.entries) is itself a [key, value] array, like:
      //   [ "FlashcardLearning", [ {question 1}, {question 2} ] ]
      //
      // The `([gameKey, gameData]) syntax is just array destructuring.
      // It's a shortcut to unpack that **value** array immediately as we get it:
      // gameKey: gets the first item (e.g., "FlashcardLearning")
      // gameData: gets the second item (e.g., [ {question 1}, {question 2} ])
      if (!Array.isArray(gameData) || gameData.length === 0) return;
      gameData.forEach((variation, idx) => {
        // choose single set of questions per game (lesson)
        // (e.g., [ {question 1}, {question 2} ] => (e.g., [ {question 1} ])
        // IF the gameKey is tilematching, the pruning function just returns the full gamedata
        // thus, config will hold the full gameData..(e.g., [ {question 1}, {question 2} ]
        let config = pruneToSingleItem(gameKey, variation);

        // secondary pruning, if the game (lesson) is tileMatching, select 6 tiles per game instead
        // here config holds the unaltered game data (e.g., [ {tile 1}, {tile 2}...{tile12} ])
        if (gameKey === "TileMatchingGame") {
          config = pruneTilePairs(config, 6);
          // after config is processed using helper fn, (e.g., [ {tile 1},...{tile 6} ]
        }

        prunedGames.push({
          gameKey: gameKey, // gameKey: "FlashcardLearning"
          ...config, // spread the lesson data object
          id: `${gameKey}_${idx}`, // unique ids for each game lesson
        });

        /*
         * Now we push the final, flat game object into the `prunedGames` array.
         *
         * Example of the object being pushed:
         * {
         * gameKey: "FlashcardLearning",
         * data: { items: [ {id: "subax", ...} ] },
         * id: "FlashcardLearning_0"
         * }
         */
      });
    });

    // shuffle the entire list of pruned games to make the lesson order random
    const shuffled = shuffleArray(prunedGames);
    // set the shuffled list into state, so React renders the first game
    setActiveGames(shuffled);
  }, [isReplay, gamesToReplay, lessonData]);
  // Dependency array:
  // This effect must re-run if the isReplay "switch" changes or
  // the data for either path (gamesToReplay or lessonData) changes after
  // the component first loads.
  //
  // example 1 (First Run):
  // 1. Component loads, isReplay is false
  // 2. lessonData might be undefined (still loading).
  // 3. The effect runs, sees isReplay is false, but lessonData is missing, so it does nothing.
  // 4. When lessonData finally arrives, this dependency triggers a re-run.
  // 5. The effect runs again, isReplay is false, but now lessonData exists,
  //    so it successfully builds, prunes, and shuffles the games.
  //
  // example 2 (Replay Run):
  // 1. The component rerenders, and isReplay is now true
  // 2. This change triggers the effect to re-run.
  // 3. At this moment, gamesToReplay might still be undefined (loading).
  // 4. The effect runs, sees isReplay is true, but gamesToReplay isn't an array yet,
  //    so it returns early.
  // 5. When gamesToReplay finally arrives, this dependency triggers the effect to re-run.
  // 6. isReplay is true, gamesToReplay is now an array,
  //    it then sets activeGames to start the replay (prunin).

  const handleNextGame = (score = 0) => {
    const isLastGame = currentGameIndex === activeGames.length - 1; // boolean to see if the final game was played
    // 1) if its the first run (!isReplay) then we branch between whether user fails atleast one game, or gets flawless victory
    if (!isReplay) {
      // First run (before any games need to be replayed): track scores and create a list of failed lessons (to replay)

      const updatedScores = [...scores, score];
      setScores(updatedScores);

      // populate the gamesToReplay array and trigger logic to replay failed games
      if (isLastGame) {
        // if there are no more games to be played
        const runItBack = []; // list of games failed (to replay)

        // loop over the list of games in the entire lesson
        // check whether a game was passed or failed based on threshold
        activeGames.forEach((game, index) => {
          const passed = updatedScores[index] >= SCORE_THRESHOLD; // check whether each lesson passed or not
          const replayable = !NON_REPLAYABLE_GAME_TYPES.has(game.gameKey); // check whether a game can be replayed (can't fail a tilematching game)

          // only queue replay if user failed (and) the game is replayable
          if (!passed && replayable) {
            runItBack.push(game);
          }
        });
        // only navigate to the transition screen if we have atleast one game to replay
        if (runItBack.length > 0) {
          // go to transition screen, pass games needing replay and original scores
          navigation.navigate("ReplayTransition", {
            gamesToReplay: runItBack,
            lessonData,
            lessonTitle,
            originalScores: updatedScores,
          });
        } else {
          // flawless victory, just calculate the total sum of scores, then go to end of game screen!
          const totalScore = updatedScores.reduce((a, b) => a + b, 0);
          navigation.navigate("EndOfGame", { totalScore });
        }
      } else {
        setCurrentGameIndex((i) => i + 1); // keep incrementing the next game to play
      }
    } else {
      // Second (replay) run: we only care about finishing and returning to EndOfGame
      if (isLastGame) {
        const totalScore = originalScores.reduce((a, b) => a + b, 0);
        navigation.navigate("EndOfGame", { totalScore });
      } else {
        setCurrentGameIndex((i) => i + 1); // increment the next game to replay
      }
    }
  };

  /*
   * activeGames state array:
   *
   * [
   *  {
   *    gameKey: "FlashcardLearning",
   *    data: {
   *    items: [ {id: "subax", prompt: "Morning", ...} ]
   *    },
   *    id: "FlashcardLearning_0_abc12"
   *  },
   *  {
   *    gameKey: "FlashcardLearning",
   *    data: {
   *    items: [ {id: "Waryaa", prompt: "Hey", ...} ]
   *    },
   *    id: "FlashcardLearning_0_abc12"
   *  },
   * ]
   */

  const renderGame = (game) => {
    if (!game) return null;

    switch (game.gameKey) {
      case "SentenceBuilder":
        return (
          <SentenceBuilder
            items={game.data.items}
            onNextGame={handleNextGame}
          />
        );
      case "TileMatchingGame":
        return (
          <TileMatchingGame data={game.data} onNextGame={handleNextGame} />
        );
      case "TwoPeopleInteraction":
        return (
          <TwoPeopleInteraction
            scenarioData={game.data}
            onComplete={handleNextGame}
          />
        );
      case "FlashcardLearning":
        return (
          <FlashcardLearning
            items={game.data.items}
            onNextGame={handleNextGame}
          />
        );
      default:
        return <Text>Unknown game type</Text>;
    }
  };
  const currentGame = activeGames[currentGameIndex];
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {activeGames.length > 0 && currentGame ? (
        renderGame(currentGame)
      ) : (
        <Text style={styles.emptyText}>No Data</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFFCF8",
    flex: 1,
  },
  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#ff4444ff",
    fontSize: 16,
  },
});

export default LessonGames;