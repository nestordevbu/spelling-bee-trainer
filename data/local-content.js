// Copia de los JSON para abrir el HTML directamente con file://.
const LOCAL_CONTENT = {
  "data/manifest.json": {
    "schemaVersion": 1,
    "defaultWeek": "week-03",
    "weeks": [
      {
        "id": "week-01",
        "title": "Semana 1 · Oct 26–30",
        "file": "data/week-01.json"
      },
      {
        "id": "week-02",
        "title": "Semana 2 · Nov 2–6",
        "file": "data/week-02.json"
      },
      {
        "id": "week-03",
        "title": "Semana 3 · Nov 9–13",
        "file": "data/week-03.json"
      }
    ]
  },
  "data/week-01.json": {
    "id": "week-01",
    "title": "Semana 1 · Oct 26–30",
    "words": [
      {
        "word": "ask",
        "spanish": "preguntar",
        "sentence": "I ask my teacher.",
        "image": "assets/words/ask.webp"
      },
      {
        "word": "desk",
        "spanish": "pupitre",
        "sentence": "My book is on the desk.",
        "image": "assets/words/desk.webp"
      },
      {
        "word": "fast",
        "spanish": "rápido",
        "sentence": "The rabbit is fast.",
        "image": "assets/words/fast.webp"
      },
      {
        "word": "dust",
        "spanish": "polvo",
        "sentence": "I see dust on the table.",
        "image": "assets/words/dust.webp"
      },
      {
        "word": "camp",
        "spanish": "campamento",
        "sentence": "We camp near the lake.",
        "image": "assets/words/camp.webp"
      },
      {
        "word": "jump",
        "spanish": "saltar",
        "sentence": "I can jump high.",
        "image": "assets/words/jump.webp"
      },
      {
        "word": "help",
        "spanish": "ayudar",
        "sentence": "I help my friend.",
        "image": "assets/words/help.webp"
      },
      {
        "word": "wasp",
        "spanish": "avispa",
        "sentence": "A wasp can fly.",
        "image": "assets/words/wasp.webp"
      },
      {
        "word": "milk",
        "spanish": "leche",
        "sentence": "I drink milk.",
        "image": "assets/words/milk.webp"
      },
      {
        "word": "melt",
        "spanish": "derretir",
        "sentence": "The ice will melt.",
        "image": "assets/words/melt.webp"
      }
    ]
  },
  "data/week-02.json": {
    "id": "week-02",
    "title": "Semana 2 · Nov 2–6",
    "words": [
      {
        "word": "bank",
        "spanish": "banco",
        "sentence": "I put money in the bank.",
        "image": "assets/words/week-02-bank.webp"
      },
      {
        "word": "hand",
        "spanish": "mano",
        "sentence": "I raise my hand.",
        "image": "assets/words/week-02-hand.webp"
      },
      {
        "word": "hint",
        "spanish": "pista",
        "sentence": "Can you give me a hint?",
        "image": "assets/words/week-02-hint.webp"
      },
      {
        "word": "king",
        "spanish": "rey",
        "sentence": "The king wears a crown.",
        "image": "assets/words/week-02-king.webp"
      },
      {
        "word": "land",
        "spanish": "tierra",
        "sentence": "The land is green.",
        "image": "assets/words/week-02-land.webp"
      },
      {
        "word": "sand",
        "spanish": "arena",
        "sentence": "I play in the sand.",
        "image": "assets/words/week-02-sand.webp"
      },
      {
        "word": "sing",
        "spanish": "cantar",
        "sentence": "I like to sing.",
        "image": "assets/words/week-02-sing.webp"
      },
      {
        "word": "tent",
        "spanish": "tienda de campaña",
        "sentence": "We sleep in a tent.",
        "image": "assets/words/week-02-tent.webp"
      },
      {
        "word": "thank",
        "spanish": "agradecer",
        "sentence": "I thank my friend.",
        "image": "assets/words/week-02-thank.webp"
      },
      {
        "word": "wing",
        "spanish": "ala",
        "sentence": "The bird has a wing.",
        "image": "assets/words/week-02-wing.webp"
      }
    ]
  },
  "data/week-03.json": {
    "id": "week-03",
    "title": "Semana 3 · Nov 9–13",
    "words": [
      {
        "word": "bench",
        "spanish": "banca",
        "sentence": "We sit on the bench.",
        "image": "assets/words/week-03-bench.webp"
      },
      {
        "word": "catch",
        "spanish": "atrapar",
        "sentence": "Can you catch the ball?",
        "image": "assets/words/week-03-catch.webp"
      },
      {
        "word": "chat",
        "spanish": "charlar",
        "sentence": "I chat with my friend.",
        "image": "assets/words/week-03-chat.webp"
      },
      {
        "word": "graph",
        "spanish": "gráfica",
        "sentence": "We made a graph in class.",
        "image": "assets/words/week-03-graph.webp"
      },
      {
        "word": "kitchen",
        "spanish": "cocina",
        "sentence": "We cook in the kitchen.",
        "image": "assets/words/week-03-kitchen.webp"
      },
      {
        "word": "phonics",
        "spanish": "fonética",
        "sentence": "We learn letter sounds in phonics.",
        "image": "assets/words/week-03-phonics.webp"
      },
      {
        "word": "photo",
        "spanish": "foto",
        "sentence": "I took a photo of my dog.",
        "image": "assets/words/week-03-photo.webp"
      },
      {
        "word": "switch",
        "spanish": "interruptor",
        "sentence": "Flip the switch to turn on the light.",
        "image": "assets/words/week-03-switch.webp"
      },
      {
        "word": "when",
        "spanish": "cuándo",
        "sentence": "When is your birthday?",
        "image": "assets/words/week-03-when.webp"
      },
      {
        "word": "whiskers",
        "spanish": "bigotes",
        "sentence": "The cat has long whiskers.",
        "image": "assets/words/week-03-whiskers.webp"
      }
    ]
  },
  "data/phonics.json": {
    "locale": "en-US",
    "letters": [
      {
        "id": "a",
        "label": "A a",
        "ipa": "æ",
        "examples": [
          "apple",
          "ant"
        ]
      },
      {
        "id": "b",
        "label": "B b",
        "ipa": "b",
        "examples": [
          "ball",
          "bed"
        ]
      },
      {
        "id": "c",
        "label": "C c",
        "ipa": "k",
        "examples": [
          "cat",
          "cup"
        ],
        "note": "Como en cat. También puede sonar /s/ en city."
      },
      {
        "id": "d",
        "label": "D d",
        "ipa": "d",
        "examples": [
          "dog",
          "desk"
        ]
      },
      {
        "id": "e",
        "label": "E e",
        "ipa": "ɛ",
        "examples": [
          "egg",
          "elf"
        ]
      },
      {
        "id": "f",
        "label": "F f",
        "ipa": "f",
        "examples": [
          "fish",
          "fan"
        ]
      },
      {
        "id": "g",
        "label": "G g",
        "ipa": "ɡ",
        "examples": [
          "goat",
          "gum"
        ],
        "note": "Como en goat. También puede sonar /dʒ/ en gem."
      },
      {
        "id": "h",
        "label": "H h",
        "ipa": "h",
        "examples": [
          "hat",
          "hand"
        ]
      },
      {
        "id": "i",
        "label": "I i",
        "ipa": "ɪ",
        "examples": [
          "igloo",
          "ink"
        ]
      },
      {
        "id": "j",
        "label": "J j",
        "ipa": "dʒ",
        "examples": [
          "jam",
          "jump"
        ]
      },
      {
        "id": "k",
        "label": "K k",
        "ipa": "k",
        "examples": [
          "kite",
          "king"
        ]
      },
      {
        "id": "l",
        "label": "L l",
        "ipa": "l",
        "examples": [
          "leaf",
          "lamp"
        ]
      },
      {
        "id": "m",
        "label": "M m",
        "ipa": "m",
        "examples": [
          "moon",
          "milk"
        ]
      },
      {
        "id": "n",
        "label": "N n",
        "ipa": "n",
        "examples": [
          "nest",
          "nose"
        ]
      },
      {
        "id": "o",
        "label": "O o",
        "ipa": "ɑ",
        "examples": [
          "octopus",
          "otter"
        ]
      },
      {
        "id": "p",
        "label": "P p",
        "ipa": "p",
        "examples": [
          "pig",
          "pen"
        ]
      },
      {
        "id": "q",
        "label": "Q q",
        "ipa": "kw",
        "examples": [
          "queen",
          "quick"
        ],
        "note": "En estas palabras, q va con u. Se oyen /k/ y /w/."
      },
      {
        "id": "r",
        "label": "R r",
        "ipa": "ɹ",
        "examples": [
          "rabbit",
          "red"
        ]
      },
      {
        "id": "s",
        "label": "S s",
        "ipa": "s",
        "examples": [
          "sun",
          "sand"
        ]
      },
      {
        "id": "t",
        "label": "T t",
        "ipa": "t",
        "examples": [
          "top",
          "tent"
        ]
      },
      {
        "id": "u",
        "label": "U u",
        "ipa": "ʌ",
        "examples": [
          "umbrella",
          "up"
        ]
      },
      {
        "id": "v",
        "label": "V v",
        "ipa": "v",
        "examples": [
          "van",
          "vet"
        ]
      },
      {
        "id": "w",
        "label": "W w",
        "ipa": "w",
        "examples": [
          "web",
          "wing"
        ]
      },
      {
        "id": "x",
        "label": "X x",
        "ipa": "ks",
        "examples": [
          "box",
          "fox"
        ],
        "note": "Escucha /k/ y /s/ al final de box y fox."
      },
      {
        "id": "y",
        "label": "Y y",
        "ipa": "j",
        "examples": [
          "yes",
          "yarn"
        ]
      },
      {
        "id": "z",
        "label": "Z z",
        "ipa": "z",
        "examples": [
          "zip",
          "zoo"
        ]
      }
    ],
    "patterns": [
      {
        "id": "sh",
        "label": "sh",
        "ipa": "ʃ",
        "examples": [
          "ship",
          "wish"
        ]
      },
      {
        "id": "ch",
        "label": "ch",
        "ipa": "tʃ",
        "examples": [
          "chat",
          "chair"
        ]
      },
      {
        "id": "th-thin",
        "label": "th",
        "ipa": "θ",
        "examples": [
          "thumb",
          "think"
        ],
        "note": "Sin vibración de la voz"
      },
      {
        "id": "th-this",
        "label": "th",
        "ipa": "ð",
        "examples": [
          "this",
          "that"
        ],
        "note": "Con vibración de la voz"
      },
      {
        "id": "ph",
        "label": "ph",
        "ipa": "f",
        "examples": [
          "photo",
          "phonics"
        ]
      },
      {
        "id": "wh",
        "label": "wh",
        "ipa": "w",
        "examples": [
          "when",
          "whiskers"
        ]
      },
      {
        "id": "ck",
        "label": "ck",
        "ipa": "k",
        "examples": [
          "duck",
          "back"
        ]
      },
      {
        "id": "ng",
        "label": "ng",
        "ipa": "ŋ",
        "examples": [
          "sing",
          "wing"
        ]
      },
      {
        "id": "ee",
        "label": "ee",
        "ipa": "i",
        "examples": [
          "see",
          "green"
        ]
      },
      {
        "id": "oo-moon",
        "label": "oo",
        "ipa": "u",
        "examples": [
          "moon",
          "food"
        ]
      },
      {
        "id": "oo-book",
        "label": "oo",
        "ipa": "ʊ",
        "examples": [
          "book",
          "look"
        ]
      },
      {
        "id": "ai",
        "label": "ai",
        "ipa": "eɪ",
        "examples": [
          "rain",
          "train"
        ]
      },
      {
        "id": "oa",
        "label": "oa",
        "ipa": "oʊ",
        "examples": [
          "boat",
          "coat"
        ]
      },
      {
        "id": "tch",
        "label": "tch",
        "ipa": "tʃ",
        "examples": [
          "catch",
          "switch"
        ]
      }
    ]
  }
};
