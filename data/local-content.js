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
    ],
    "contest": {
      "id": "contest-2026",
      "title": "Spelling Bee Contest · 30 palabras",
      "file": "data/contest-2026.json"
    }
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
  "data/contest-2026.json": {
    "id": "contest-2026",
    "title": "Spelling Bee Contest · 30 palabras",
    "event": {
      "name": "Spelling Bee Contest",
      "date": "2026-11-23",
      "timeZone": "America/Hermosillo",
      "time": "8:00 a. m.–12:00 p. m.",
      "venue": "CEB Conference Hall",
      "grades": "1.º a 6.º de primaria",
      "rules": [
        "El concurso consta de 30 palabras y la dificultad aumenta en cada ronda.",
        "Cada participante debe deletrear la palabra en voz alta y escribirla.",
        "Un error de deletreo implica la eliminación en el concurso."
      ],
      "nextEvent": "Los ganadores representarán al colegio en el Interscholastic Spelling Bee, organizado por Colegio Americano del Pacífico (CAP), en Hermosillo, los días 5 y 6 de marzo de 2027.",
      "registration": "Inscríbete con tu maestro o maestra. La Coordinación de Inglés entrega la lista de estudio después de la inscripción.",
      "contact": "Miss Diana · diana.alvarez@cebhermosillo.edu.mx"
    },
    "words": [
      {
        "word": "apple",
        "spanish": "manzana",
        "sentence": "I eat an apple.",
        "image": "assets/words/contest-apple.webp"
      },
      {
        "word": "april",
        "spanish": "abril",
        "sentence": "April is the fourth month of the year.",
        "image": "assets/words/contest-april.webp",
        "display": "April"
      },
      {
        "word": "arm",
        "spanish": "brazo",
        "sentence": "I raise my arm.",
        "image": "assets/words/contest-arm.webp"
      },
      {
        "word": "august",
        "spanish": "agosto",
        "sentence": "August is the eighth month of the year.",
        "image": "assets/words/contest-august.webp",
        "display": "August"
      },
      {
        "word": "baby",
        "spanish": "bebé",
        "sentence": "The baby is happy.",
        "image": "assets/words/contest-baby.webp"
      },
      {
        "word": "ball",
        "spanish": "pelota",
        "sentence": "I play with a ball.",
        "image": "assets/words/contest-ball.webp"
      },
      {
        "word": "bedroom",
        "spanish": "recámara",
        "sentence": "My bedroom has a bed.",
        "image": "assets/words/contest-bedroom.webp"
      },
      {
        "word": "belt",
        "spanish": "cinturón",
        "sentence": "I wear a belt.",
        "image": "assets/words/contest-belt.webp"
      },
      {
        "word": "black",
        "spanish": "negro",
        "sentence": "My shoes are black.",
        "image": "assets/words/contest-black.webp"
      },
      {
        "word": "boat",
        "spanish": "barco",
        "sentence": "The boat is on the water.",
        "image": "assets/words/contest-boat.webp"
      },
      {
        "word": "book",
        "spanish": "libro",
        "sentence": "I read a book.",
        "image": "assets/words/contest-book.webp"
      },
      {
        "word": "box",
        "spanish": "caja",
        "sentence": "The toy is in the box.",
        "image": "assets/words/contest-box.webp"
      },
      {
        "word": "brown",
        "spanish": "café",
        "sentence": "The bear is brown.",
        "image": "assets/words/contest-brown.webp"
      },
      {
        "word": "butter",
        "spanish": "mantequilla",
        "sentence": "I put butter on my bread.",
        "image": "assets/words/contest-butter.webp"
      },
      {
        "word": "cake",
        "spanish": "pastel",
        "sentence": "We share a cake.",
        "image": "assets/words/contest-cake.webp"
      },
      {
        "word": "canyon",
        "spanish": "cañón",
        "sentence": "The river flows through the canyon.",
        "image": "assets/words/contest-canyon.webp"
      },
      {
        "word": "car",
        "spanish": "automóvil",
        "sentence": "The car is red.",
        "image": "assets/words/contest-car.webp"
      },
      {
        "word": "card",
        "spanish": "tarjeta",
        "sentence": "I make a card for my friend.",
        "image": "assets/words/contest-card.webp"
      },
      {
        "word": "chair",
        "spanish": "silla",
        "sentence": "I sit on a chair.",
        "image": "assets/words/contest-chair.webp"
      },
      {
        "word": "circle",
        "spanish": "círculo",
        "sentence": "I draw a circle.",
        "image": "assets/words/contest-circle.webp"
      },
      {
        "word": "clap",
        "spanish": "aplaudir",
        "sentence": "We clap our hands.",
        "image": "assets/words/contest-clap.webp"
      },
      {
        "word": "cloudy",
        "spanish": "nublado",
        "sentence": "The sky is cloudy today.",
        "image": "assets/words/contest-cloudy.webp"
      },
      {
        "word": "cold",
        "spanish": "frío",
        "sentence": "I wear a coat when it is cold.",
        "image": "assets/words/contest-cold.webp"
      },
      {
        "word": "corn",
        "spanish": "maíz",
        "sentence": "The corn is yellow.",
        "image": "assets/words/contest-corn.webp"
      },
      {
        "word": "crayon",
        "spanish": "crayón",
        "sentence": "I color with a crayon.",
        "image": "assets/words/contest-crayon.webp"
      },
      {
        "word": "cut",
        "spanish": "cortar",
        "sentence": "I cut the paper with scissors.",
        "image": "assets/words/contest-cut.webp"
      },
      {
        "word": "desk",
        "spanish": "pupitre",
        "sentence": "My book is on the desk.",
        "image": "assets/words/contest-desk.webp"
      },
      {
        "word": "dog",
        "spanish": "perro",
        "sentence": "The dog plays in the park.",
        "image": "assets/words/contest-dog.webp"
      },
      {
        "word": "down",
        "spanish": "abajo",
        "sentence": "The arrow points down.",
        "image": "assets/words/contest-down.webp"
      },
      {
        "word": "dress",
        "spanish": "vestido",
        "sentence": "She wears a pink dress.",
        "image": "assets/words/contest-dress.webp"
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
