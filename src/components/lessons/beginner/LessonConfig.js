const LessonConfig = {
  Lesson1: {
    id: "Greetings_IskaWarran",
    title: "Greetings Vocab",
    description:
      "Learn the essential words that form the building blocks of Somali greetings!",
    section: "Greetings",
    key: "greetings",
    games: {
      FlashcardLearning: [
        {
          data: {
            items: [
              {
                id: "waryaa",
                prompt: "Hey! (Male form)",
                translation: "Waryaa",
                options: ["Waryaa", "Nabad", "Fiican", "Waa"],
              },
              {
                id: "subax",
                prompt: "Morning",
                translation: "Subax",
                options: ["Subax", "Waryaa", "Nabad", "Ma"],
              },
              {
                id: "baa",
                prompt: "Focus particle (adds emphasis to the word before it).",
                translation: "Baa",
                options: ["Baa", "Waa", "Ma", "Nabad"],
              },
              {
                id: "wanaagsan",
                prompt: "Good / well (used in greetings)",
                translation: "Wanaagsan",
                options: ["Wanaagsan", "Fiican", "Is", "La"],
              },
              {
                id: "ma",
                prompt:
                  "The word that turns a statement into a yes/no question",
                translation: "Ma",
                options: ["Ma", "Waa", "Baa", "La"],
              },
              {
                id: "nabad",
                prompt: "Peace",
                translation: "Nabad",
                options: ["Nabad", "Fiican", "Subax", "Waryaa"],
              },
            ],
          },
        },
        {
          data: {
            items: [
              {
                id: "waa",
                prompt: "It is",
                translation: "Waa",
                options: ["Waa", "Ma", "Baa", "Ka"],
              },
              {
                id: "fiican",
                prompt: "Fine / good (similar to 'wanaagsan')",
                translation: "Fiican",
                options: ["Fiican", "Wanaagsan", "Subax", "Warran"],
              },
              {
                id: "warran",
                prompt: "Give news / Tell about",
                translation: "Warran",
                options: ["Warran", "Subax", "Nabad", "Fiican"],
              },
            ],
          },
        },
      ],
    },
  },
  Lesson2: {
    id: "Greetings_IskaWarran",
    title: "Build Greetings",
    description:
      "Build common greetings and replies using your new vocabulary!",
    section: "Greetings",
    key: "greetings",
    games: {
      FlashcardLearning: [
        {
          data: {
            items: [
              {
                id: "good_morning",
                prompt: "Good morning.",
                translation: "Subax wanaagsan.",
                options: [
                  "Subax wanaagsan.",
                  "Waa nabad.",
                  "Iska warran?",
                  "Waryaa!",
                ],
              },
              {
                id: "how_are_you",
                prompt: "How are you?",
                translation: "Iska warran?",
                options: [
                  "Iska warran?",
                  "Ma nabad baa?",
                  "Waan fiicanahay.",
                  "Subax wanaagsan.",
                ],
              },
              {
                id: "are_things_well",
                prompt: "Are things well? / Is it peace?",
                translation: "Ma nabad baa?",
                options: ["Ma nabad baa?", "Waa nabad.", "Fiican", "Waryaa!"],
              },
            ],
          },
        },
        {
          data: {
            items: [
              {
                id: "are_things_well",
                prompt: "Are things well? / Is it peace?",
                translation: "Ma nabad baa?",
                options: ["Ma nabad baa?", "Waa nabad.", "Fiican", "Waryaa!"],
              },
              {
                id: "it_is_peace",
                prompt: "It is peace. / Things are well.",
                translation: "Waa nabad.",
                options: [
                  "Waa nabad.",
                  "Subax wanaagsan.",
                  "Ma nabad baa?",
                  "Fiican",
                ],
              },
              {
                id: "i_am_fine",
                prompt: "I am fine.",
                translation: "Waan fiicanahay.",
                options: [
                  "Waan fiicanahay.",
                  "Iska warran?",
                  "Waa nabad.",
                  "Ma nabad baa?",
                ],
              },
            ],
          },
        },
      ],
      TwoPeopleInteraction: [
        {
          data: {
            turns: [
              {
                speaker: "CPU",
                gender: "female", 
                isInteractive: false,
                words: [
                  { word: "Faadumay,", translation: "Oh Faadumo," },
                  { word: "subax", translation: "morning" },
                  { word: "wanaagsan.", translation: "good." },
                ],
                audio:
                  "/assets/audio/Greetings/Two_People_Interaction_Audio/1.mp3",
              },
              {
                speaker: "Player",
                gender: "female", 
                isInteractive: true,
                missingWord: "nabad",
                options: ["nabad", "fiicanahay", "tahay", "Adigu"],
                promptWords: [
                  { word: "Maryanay,", translation: "Oh Maryan," },
                  { word: "subax", translation: "morning" },
                  { word: "wanaagsan,", translation: "good," },
                  { word: "ma" }, 
                  { word: "____" },
                  { word: "baa?" },
                ],
                words: [
                  { word: "Maryanay,", translation: "Oh Maryan," },
                  { word: "subax", translation: "morning" },
                  { word: "wanaagsan,", translation: "good," },
                  { word: "ma" },
                  { word: "nabad", translation: "peace" },
                  { word: "baa?" },
                ],
                audio:
                  "/assets/audio/Greetings/Two_People_Interaction_Audio/2.mp3",
              },
              {
                speaker: "CPU",
                gender: "female", 
                isInteractive: false,
                words: [
                  { word: "Waa", translation: "It is" },
                  { word: "nabad.", translation: "peace." },
                  { word: "Adigu", translation: "And you" },
                  { word: "sidee", translation: "how" },
                  { word: "tahay?", translation: "are you?" },
                ],
                audio:
                  "/assets/audio/Greetings/Two_People_Interaction_Audio/3.mp3",
              },
              {
                speaker: "Player",
                gender: "female",
                isInteractive: true,
                missingWord: "fiicanahay.", 
                options: ["fiicanahay.", "wanaagsan", "subax", "mahadsanid"], 
                promptWords: [
                  { word: "Alxamdulillah,", translation: "Praise be to God," },
                  { word: "waan", translation: "I am" },
                  { word: "____." },
                ],
                words: [
                  { word: "Alxamdulillah,", translation: "Praise be to God," },
                  { word: "waan", translation: "I am" },
                  { word: "fiicanahay.", translation: "fine." },
                ],
                audio:
                  "assets/audio/Greetings/Two_People_Interaction_Audio/4.mp3",
              },
            ],
          },
        },
      ],
    },
  },
  Lesson3: {
    id: "Personal_Pronouns",
    title: "Personal Pronouns",
    description: "Learn the Somali subject pronouns.",
    section: "Grammar Basics",
    key: "grammarBasics",
    games: {
      FlashcardLearning: [
        {
          data: {
            items: [
              {
                id: "pronoun_1",
                prompt: "I",
                translation: "Waan",
                options: ["Waan", "Waad", "Wuu", "Way"],
              },
              {
                id: "pronoun_2",
                prompt: "You (singular)",
                translation: "Waad",
                options: ["Waad", "Waan", "Wuu", "Waynu"],
              },
              {
                id: "pronoun_3",
                prompt: "He / it (masc.)",
                translation: "Wuu",
                options: ["Wuu", "Waan", "Waannu", "Way"],
              },
              {
                id: "pronoun_4",
                prompt: "She / it (fem.)",
                translation: "Way",
                options: ["Way", "Wuu", "Waan", "Waad"],
              },
            ],
          },
        },
        {
          data: {
            items: [
              {
                id: "pronoun_5",
                prompt: "We (me + you + others)",
                translation: "Waynu",
                options: ["Waynu", "Waannu", "Waad", "Way"],
              },
              {
                id: "pronoun_6",
                prompt: "We (me + my group, but NOT you)",
                translation: "Waannu",
                options: ["Waannu", "Waynu", "Waan", "Waad"],
              },
            ],
          },
        },
        {
          data: {
            items: [
              {
                id: "pronoun_7",
                prompt: "You (plural)",
                translation: "Waad",
                options: ["Waad", "Waannu", "Waan", "Wuu"],
              },
              {
                id: "pronoun_8",
                prompt: "They",
                translation: "Way",
                options: ["Way", "Waynu", "Wuu", "Waan"],
              },
            ],
          },
        },
      ],
    },
  },
  Lesson5: {
    id: "Commands_MaBaa",
    title: "Commands & Questions",
    description:
      "Learn how to give simple commands and ask basic 'Is it...?' questions.",
    section: "Everyday Actions",
    key: "everydayActions",
    games: {
      FlashcardLearning: [
        {
          data: {
            items: [
              {
                id: "keen",
                prompt: "Bring it!",
                translation: "Keen!",
                options: ["Keen!", "Tag!", "Cun!", "Sug!"],
              },
              {
                id: "tag",
                prompt: "Go!",
                translation: "Tag!",
                options: ["Tag!", "Keen!", "Jooji!", "Waa!"],
              },
              {
                id: "cun",
                prompt: "Eat it!",
                translation: "Cun!",
                options: ["Cun!", "Sug!", "Ma", "Akhri!"],
              },
              {
                id: "sug",
                prompt: "Wait!",
                translation: "Sug!",
                options: ["Sug!", "Tag!", "Eeg!", "Cun!"],
              },
              {
                id: "dukaan",
                prompt: "Shop",
                translation: "Dukaan",
                options: ["Dukaan", "Laybreeri", "Guriga", "Koob"],
              },
              {
                id: "laybreeri",
                prompt: "Library",
                translation: "Laybreeri",
                options: ["Laybreeri", "Dukaan", "Koob", "Buug"],
              },
              {
                id: "guriga",
                prompt: "The house",
                translation: "Guriga",
                options: ["Guriga", "Dukaan", "Buug", "Caano"],
              },
              {
                id: "iyo",
                prompt: "And",
                translation: "Iyo",
                options: ["Iyo", "Ka", "Maya", "Haa"],
              },
              {
                id: "ka",
                prompt: "From",
                translation: "Ka",
                options: ["Ka", "Iyo", "Imminka", "Waan"],
              },
              {
                id: "imminka",
                prompt: "Now",
                translation: "Imminka",
                options: ["Imminka", "Ka", "Haa", "Maya"],
              },
              {
                id: "waan",
                prompt: "I (declarative marker)",
                translation: "Waan",
                options: ["Waan", "Waad", "Wuu", "Way"],
              },
              {
                id: "haa",
                prompt: "Yes",
                translation: "Haa",
                options: ["Haa", "Maya", "Waayahay", "Nabadeey"],
              },
              {
                id: "maya",
                prompt: "No",
                translation: "Maya",
                options: ["Maya", "Haa", "Waa", "Ma"],
              },
              {
                id: "waayahay",
                prompt: "Okay / alright",
                translation: "Waayahay",
                options: ["Waayahay", "Nabadeey", "Imminka", "Ka"],
              },
              {
                id: "buug",
                prompt: "Book",
                translation: "Buug",
                options: ["Buug", "Koob", "Shaah", "Sonkor"],
              },
              {
                id: "caleen",
                prompt: "Leaves (tea leaves)",
                translation: "Caleen",
                options: ["Caleen", "Shaah", "Caano", "Koob"],
              },
              {
                id: "shaah",
                prompt: "Tea",
                translation: "Shaah",
                options: ["Shaah", "Caano", "Sonkor", "Buug"],
              },
              {
                id: "caano",
                prompt: "Milk",
                translation: "Caano",
                options: ["Caano", "Shaah", "Sonkor", "Koob"],
              },
              {
                id: "sonkor",
                prompt: "Sugar",
                translation: "Sonkor",
                options: ["Sonkor", "Caano", "Shaah", "Koob"],
              },
              {
                id: "koob",
                prompt: "Cup",
                translation: "Koob",
                options: ["Koob", "Buug", "Dukaan", "Guriga"],
              },
              {
                id: "wax",
                prompt: "Thing",
                translation: "Wax",
                options: ["Wax", "Kale", "Iyo", "Ka"],
              },
              {
                id: "kale",
                prompt: "Other",
                translation: "Kale",
                options: ["Kale", "Wax", "Iyo", "Ka"],
              },
              {
                id: "tegay",
                prompt: "I went",
                translation: "Waan tegay.",
                options: ["Waan tegay.", "Waan keenay.", "Akhri!", "Samee!"],
              },
              {
                id: "keentay",
                prompt: "You brought (it)",
                translation: "Waad keentay.",
                options: ["Waad keentay.", "Waan tegay.", "Akhri!", "Samee!"],
              },
              {
                id: "samee",
                prompt: "Make (it)!",
                translation: "Samee!",
                options: ["Samee!", "Akhri!", "Tag!", "Keen!"],
              },
              {
                id: "akhri",
                prompt: "Read (it)!",
                translation: "Akhri!",
                options: ["Akhri!", "Samee!", "Tag!", "Sug!"],
              },
              {
                id: "nabad_gelyo",
                prompt: "Goodbye",
                translation: "Nabadeey",
                options: ["Nabadeey", "Waayahay", "Haa", "Maya"],
              },
            ],
          },
        },
      ],

    },
  },

  Lesson6: {
    id: "Shopping_Vocabulary",
    title: "Shopping",
    description: "Apply your skills at the market.",
    section: "Everyday Actions",
    key: "everydayActions",
    games: {
      FlashcardLearning: [
        {
          data: {
            items: [
              {
                id: "how_much_is_it",
                prompt: "How much is it?",
                translation: "Waa meeqa?",
                options: [
                  "Waa meeqa?",
                  "Ma meeqa baa?",
                  "Waa boqol.",
                  "Ma shaah baa?",
                ],
              },
              {
                id: "it_is_100",
                prompt: "It is 100.",
                translation: "Waa boqol.",
                options: ["Waa boqol.", "Ma boqol baa?", "Meeqa?", "Sug!"],
              },
              {
                id: "is_it_tea",
                prompt: "Is it tea?",
                translation: "Ma shaah baa?",
                options: [
                  "Ma shaah baa?",
                  "Waa shaah.",
                  "Keen!",
                  "Ma nabad baa?",
                ],
              },
              {
                id: "it_is_tea",
                prompt: "It is tea.",
                translation: "Waa shaah.",
                options: ["Waa shaah.", "Ma shaah baa?", "Meeqa?", "Cun!"],
              },
              {
                id: "is_it_bread",
                prompt: "Is it bread?",
                translation: "Ma rooti baa?",
                options: [
                  "Ma rooti baa?",
                  "Waa rooti.",
                  "Keen!",
                  "Ma sonkor baa?",
                ],
              },
              {
                id: "it_is_bread",
                prompt: "It is bread.",
                translation: "Waa rooti.",
                options: ["Waa rooti.", "Ma rooti baa?", "Waa meeqa?", "Tag!"],
              },
              {
                id: "is_it_banana",
                prompt: "Is it a banana?",
                translation: "Ma moos baa?",
                options: [
                  "Ma moos baa?",
                  "Waa moos.",
                  "Ma shaah baa?",
                  "Samee!",
                ],
              },
              {
                id: "it_is_banana",
                prompt: "It is a banana.",
                translation: "Waa moos.",
                options: ["Waa moos.", "Ma moos baa?", "Meeqa?", "Akhri!"],
              },
            ],
          },
        },
        {
          data: {
            items: [
              {
                id: "is_it_sugar",
                prompt: "Is it sugar?",
                translation: "Ma sonkor baa?",
                options: [
                  "Ma sonkor baa?",
                  "Waa sonkor.",
                  "Ma rooti baa?",
                  "Keen!",
                ],
              },
              {
                id: "it_is_sugar",
                prompt: "It is sugar.",
                translation: "Waa sonkor.",
                options: ["Waa sonkor.", "Ma sonkor baa?", "Meeqa?", "Sug!"],
              },
              {
                id: "is_it_perfume",
                prompt: "Is it perfume?",
                translation: "Ma barafuun baa?",
                options: [
                  "Ma barafuun baa?",
                  "Waa barafuun.",
                  "Ma moos baa?",
                  "Cun!",
                ],
              },
              {
                id: "it_is_perfume",
                prompt: "It is perfume.",
                translation: "Waa barafuun.",
                options: [
                  "Waa barafuun.",
                  "Ma barafuun baa?",
                  "Meeqa?",
                  "Tag!",
                ],
              },
              {
                id: "bring_the_bread",
                prompt: "Bring the bread!",
                translation: "Rooti keen!",
                options: [
                  "Rooti keen!",
                  "Rooti cun!",
                  "Rooti tag!",
                  "Rooti sug!",
                ],
              },
              {
                id: "bring_the_money",
                prompt: "Bring the money!",
                translation: "Lacag keen!",
                options: [
                  "Lacag keen!",
                  "Lacag cun!",
                  "Lacag tag!",
                  "Lacag sug!",
                ],
              },
              {
                id: "make_tea",
                prompt: "Make tea!",
                translation: "Shaah samee!",
                options: [
                  "Shaah samee!",
                  "Shaah akhri!",
                  "Shaah keen!",
                  "Shaah tag!",
                ],
              },
              {
                id: "read_the_book",
                prompt: "Read the book!",
                translation: "Buugga akhri!",
                options: [
                  "Buugga akhri!",
                  "Buugga samee!",
                  "Buugga keen!",
                  "Buugga tag!",
                ],
              },
            ],
          },
        },
        {
          data: {
            items: [
              {
                id: "did_you_go_to_shop",
                prompt: "Did you go to the shop?",
                translation: "Dukaanka ma tagtay?",
                options: [
                  "Dukaanka ma tagtay?",
                  "Ma dukaanka baa?",
                  "Waa dukaanka.",
                  "Meeqa?",
                ],
              },
              {
                id: "yes_i_went",
                prompt: "Yes, I went.",
                translation: "Haa, waan tegay.",
                options: [
                  "Haa, waan tegay.",
                  "Maya, waan tegay.",
                  "Haa, waan keenay.",
                  "Waa meeqa?",
                ],
              },
              {
                id: "did_you_bring_tea_leaves",
                prompt: "Did you bring tea leaves?",
                translation: "Caleen shaah ma keentay?",
                options: [
                  "Caleen shaah ma keentay?",
                  "Ma shaah baa?",
                  "Waa caleen.",
                  "Meeqa?",
                ],
              },
              {
                id: "i_brought_them",
                prompt: "Yes, I brought them.",
                translation: "Haa, waan ka keenay.",
                options: [
                  "Haa, waan ka keenay.",
                  "Maya, waan tegay.",
                  "Waa shaah.",
                  "Ma moos baa?",
                ],
              },
              {
                id: "okay_now_go_home",
                prompt: "Okay. Now go home.",
                translation: "Waayahay. Imminka guriga tag.",
                options: [
                  "Waayahay. Imminka guriga tag.",
                  "Haa, waan tegay.",
                  "Ma guriga baa?",
                  "Guriga keen!",
                ],
              },
              {
                id: "goodbye",
                prompt: "Goodbye.",
                translation: "Nabadeey.",
                options: ["Nabadeey.", "Waayahay.", "Haa.", "Maya."],
              },
            ],
          },
        },
      ],

      TwoPeopleInteraction: [
        {
          data: {
            turns: [
              {
                speaker: "CPU",
                gender: "female",
                isInteractive: false,
                words: [
                  { word: "Maryanay,", translation: "Oh Maryan," },
                  { word: "dukaanka", translation: "the shop" },
                  { word: "ma" },
                  { word: "tagtay?", translation: "did you go?" },
                ],
                audio: "/assets/audio/Lesson6/1.mp3",
              },
              {
                speaker: "Player",
                gender: "female",
                isInteractive: true,
                missingWord: "tegay.",
                options: ["tegay.", "keenay.", "tagtay?", "shaah"],
                promptWords: [
                  { word: "Haa,", translation: "Yes," },
                  { word: "waan", translation: "I" },
                  { word: "____." },
                ],
                words: [
                  { word: "Haa,", translation: "Yes," },
                  { word: "waan", translation: "I" },
                  { word: "tegay.", translation: "went." },
                ],
                audio: "/assets/audio/Lesson6/2.mp3",
              },
              {
                speaker: "CPU",
                gender: "female",
                isInteractive: false,
                words: [
                  { word: "Caleen", translation: "leaves" },
                  { word: "shaah", translation: "tea" },
                  { word: "ma" },
                  { word: "ka", translation: "from it" },
                  { word: "keentay?", translation: "did you bring?" },
                ],
                audio: "/assets/audio/Lesson6/3.mp3",
              },
              {
                speaker: "Player",
                gender: "female",
                isInteractive: true,
                missingWord: "keenay.",
                options: ["keenay.", "tegay.", "akhri", "samee"],
                promptWords: [
                  { word: "Haa,", translation: "Yes," },
                  { word: "caleen", translation: "leaves" },
                  { word: "shaah", translation: "tea" },
                  { word: "iyo", translation: "and" },
                  { word: "caano", translation: "milk" },
                  { word: "iyo", translation: "and" },
                  { word: "sonkorba", translation: "sugar" },
                  { word: "waan", translation: "I" },
                  { word: "ka", translation: "from it" },
                  { word: "____." },
                ],
                words: [
                  { word: "Haa,", translation: "Yes," },
                  { word: "caleen", translation: "leaves" },
                  { word: "shaah", translation: "tea" },
                  { word: "iyo", translation: "and" },
                  { word: "caano", translation: "milk" },
                  { word: "iyo", translation: "and" },
                  { word: "sonkorba", translation: "sugar" },
                  { word: "waan", translation: "I" },
                  { word: "ka", translation: "from it" },
                  { word: "keenay.", translation: "brought." },
                ],
                audio: "/assets/audio/Lesson6/4.mp3",
              },
              {
                speaker: "CPU",
                gender: "female",
                isInteractive: false,
                words: [
                  { word: "Wax", translation: "Thing" },
                  { word: "kale", translation: "else" },
                  { word: "ma" },
                  { word: "ka", translation: "from it" },
                  { word: "keentay?", translation: "did you bring?" },
                ],
                audio: "/assets/audio/Lesson6/5.mp3",
              },
              {
                speaker: "Player",
                gender: "female",
                isInteractive: true,
                missingWord: "keenay.",
                options: ["keenay.", "tag", "nabad", "yahay"],
                promptWords: [
                  { word: "Maya;", translation: "No;" },
                  { word: "laybreerigase", translation: "but the library" },
                  { word: "waan", translation: "I" },
                  { word: "tegay", translation: "went" },
                  { word: "buugna", translation: "and a book" },
                  { word: "waan", translation: "I" },
                  { word: "ka", translation: "from there" },
                  { word: "____." },
                ],
                words: [
                  { word: "Maya;", translation: "No;" },
                  { word: "laybreerigase", translation: "but the library" },
                  { word: "waan", translation: "I" },
                  { word: "tegay", translation: "went" },
                  { word: "buugna", translation: "and a book" },
                  { word: "waan", translation: "I" },
                  { word: "ka", translation: "from there" },
                  { word: "keenay.", translation: "brought." },
                ],
                audio: "/assets/audio/Lesson6/6.mp3",
              },
              {
                speaker: "CPU",
                gender: "female",
                isInteractive: false,
                words: [
                  { word: "Waa", translation: "It is" },
                  { word: "yahay.", translation: "okay." },
                  { word: "Imminka", translation: "Now" },
                  { word: "guriga", translation: "the house" },
                  { word: "tag,", translation: "go to," },
                  { word: "koob", translation: "cup" },
                  { word: "shaah", translation: "of tea" },
                  { word: "ah" },
                  { word: "samee", translation: "make" },
                  { word: "buuggiina", translation: "and the book" },
                  { word: "akhri.", translation: "read." },
                ],
                audio: "/assets/audio/Lesson6/7.mp3",
              },
              {
                speaker: "Player",
                gender: "female",
                isInteractive: true,
                missingWord: "Nabadeey.",
                options: ["Nabadeey.", "Wanaagsan", "Mahadsanid", "Haa"],
                promptWords: [
                  { word: "Waa", translation: "It is" },
                  { word: "yahay.", translation: "okay." },
                  { word: "____" },
                ],
                words: [
                  { word: "Waa", translation: "It is" },
                  { word: "yahay.", translation: "okay." },
                  { word: "Nabadeey.", translation: "Goodbye." },
                ],
                audio: "/assets/audio/Lesson6/8.mp3",
              },
              {
                speaker: "CPU",
                gender: "female",
                isInteractive: false,
                words: [{ word: "Nabadeey.", translation: "Goodbye." }],
                audio: "/assets/audio/Lesson6/9.mp3",
              },
            ],
          },
        },
      ],
    },
  },
};

export default LessonConfig;
