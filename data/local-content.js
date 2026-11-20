// Copia de los JSON para abrir el HTML directamente con file://.
const LOCAL_CONTENT = {
  "data/manifest.json": {
    "schemaVersion": 1,
    "defaultWeek": "week-04",
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
      },
      {
        "id": "week-04",
        "title": "Semana 4 · Nov 16–20",
        "file": "data/week-04.json"
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
  "data/week-04.json": {
    "id": "week-04",
    "title": "Semana 4 · Nov 16–20",
    "words": [
      {
        "word": "bite",
        "spanish": "morder",
        "sentence": "I bite the apple.",
        "image": "assets/words/week-04-bite.webp"
      },
      {
        "word": "cave",
        "spanish": "cueva",
        "sentence": "The bear lives in a cave.",
        "image": "assets/words/week-04-cave.webp"
      },
      {
        "word": "five",
        "spanish": "cinco",
        "sentence": "I have five crayons.",
        "image": "assets/words/week-04-five.webp"
      },
      {
        "word": "game",
        "spanish": "juego",
        "sentence": "We play a game.",
        "image": "assets/words/week-04-game.webp"
      },
      {
        "word": "make",
        "spanish": "hacer",
        "sentence": "I make a paper boat.",
        "image": "assets/words/week-04-make.webp"
      },
      {
        "word": "pine",
        "spanish": "pino",
        "sentence": "The pine tree is tall.",
        "image": "assets/words/week-04-pine.webp"
      },
      {
        "word": "same",
        "spanish": "igual",
        "sentence": "Our hats are the same.",
        "image": "assets/words/week-04-same.webp"
      },
      {
        "word": "time",
        "spanish": "tiempo",
        "sentence": "It is time to read.",
        "image": "assets/words/week-04-time.webp"
      },
      {
        "word": "vine",
        "spanish": "enredadera",
        "sentence": "The vine grows on the wall.",
        "image": "assets/words/week-04-vine.webp"
      },
      {
        "word": "wave",
        "spanish": "ola",
        "sentence": "A big wave rolls toward the beach.",
        "image": "assets/words/week-04-wave.webp"
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
  },
  "data/guided-lesson.json": {
    "title": "Spelling By Contest · Matteo",
    "video": "assets/videos/guided-lesson/lesson.mp4",
    "duration": 308.3615873015873,
    "chapters": [
      {
        "title": "You can do it Matteo",
        "key": "intro",
        "section": "intro",
        "start": 0
      },
      {
        "title": "Letra A",
        "key": "a",
        "section": "alphabet",
        "start": 8.6
      },
      {
        "title": "Letra B",
        "key": "b",
        "section": "alphabet",
        "start": 9.609977324263038
      },
      {
        "title": "Letra C",
        "key": "c",
        "section": "alphabet",
        "start": 10.559954648526077
      },
      {
        "title": "Letra D",
        "key": "d",
        "section": "alphabet",
        "start": 11.659954648526078
      },
      {
        "title": "Letra E",
        "key": "e",
        "section": "alphabet",
        "start": 12.679954648526078
      },
      {
        "title": "Letra F",
        "key": "f",
        "section": "alphabet",
        "start": 13.719954648526077
      },
      {
        "title": "Letra G",
        "key": "g",
        "section": "alphabet",
        "start": 14.739954648526078
      },
      {
        "title": "Letra H",
        "key": "h",
        "section": "alphabet",
        "start": 15.769931972789117
      },
      {
        "title": "Letra I",
        "key": "i",
        "section": "alphabet",
        "start": 16.869931972789118
      },
      {
        "title": "Letra J",
        "key": "j",
        "section": "alphabet",
        "start": 17.929931972789117
      },
      {
        "title": "Letra K",
        "key": "k",
        "section": "alphabet",
        "start": 18.999909297052156
      },
      {
        "title": "Letra L",
        "key": "l",
        "section": "alphabet",
        "start": 20.009886621315196
      },
      {
        "title": "Letra M",
        "key": "m",
        "section": "alphabet",
        "start": 21.049886621315196
      },
      {
        "title": "Letra N",
        "key": "n",
        "section": "alphabet",
        "start": 22.059863945578236
      },
      {
        "title": "Letra O",
        "key": "o",
        "section": "alphabet",
        "start": 23.099863945578235
      },
      {
        "title": "Letra P",
        "key": "p",
        "section": "alphabet",
        "start": 24.119863945578235
      },
      {
        "title": "Letra Q",
        "key": "q",
        "section": "alphabet",
        "start": 25.169841269841275
      },
      {
        "title": "Letra R",
        "key": "r",
        "section": "alphabet",
        "start": 26.289841269841276
      },
      {
        "title": "Letra S",
        "key": "s",
        "section": "alphabet",
        "start": 27.419818594104314
      },
      {
        "title": "Letra T",
        "key": "t",
        "section": "alphabet",
        "start": 28.629795918367353
      },
      {
        "title": "Letra U",
        "key": "u",
        "section": "alphabet",
        "start": 29.859773242630393
      },
      {
        "title": "Letra V",
        "key": "v",
        "section": "alphabet",
        "start": 30.91977324263039
      },
      {
        "title": "Letra W",
        "key": "w",
        "section": "alphabet",
        "start": 31.99977324263039
      },
      {
        "title": "Letra X",
        "key": "x",
        "section": "alphabet",
        "start": 33.299773242630394
      },
      {
        "title": "Letra Y",
        "key": "y",
        "section": "alphabet",
        "start": 34.53977324263039
      },
      {
        "title": "Letra Z",
        "key": "z",
        "section": "alphabet",
        "start": 35.65977324263039
      },
      {
        "title": "apple",
        "key": "apple",
        "section": "words",
        "start": 36.76975056689342
      },
      {
        "title": "April",
        "key": "april",
        "section": "words",
        "start": 45.96857142857142
      },
      {
        "title": "arm",
        "key": "arm",
        "section": "words",
        "start": 55.4873469387755
      },
      {
        "title": "August",
        "key": "august",
        "section": "words",
        "start": 62.88616780045351
      },
      {
        "title": "baby",
        "key": "baby",
        "section": "words",
        "start": 73.93496598639454
      },
      {
        "title": "ball",
        "key": "ball",
        "section": "words",
        "start": 82.15374149659863
      },
      {
        "title": "bedroom",
        "key": "bedroom",
        "section": "words",
        "start": 90.3225850340136
      },
      {
        "title": "belt",
        "key": "belt",
        "section": "words",
        "start": 101.8315192743764
      },
      {
        "title": "black",
        "key": "black",
        "section": "words",
        "start": 110.19024943310656
      },
      {
        "title": "boat",
        "key": "boat",
        "section": "words",
        "start": 119.4790476190476
      },
      {
        "title": "book",
        "key": "book",
        "section": "words",
        "start": 127.81786848072561
      },
      {
        "title": "box",
        "key": "box",
        "section": "words",
        "start": 135.98671201814057
      },
      {
        "title": "brown",
        "key": "brown",
        "section": "words",
        "start": 143.81555555555553
      },
      {
        "title": "butter",
        "key": "butter",
        "section": "words",
        "start": 153.49442176870747
      },
      {
        "title": "cake",
        "key": "cake",
        "section": "words",
        "start": 164.01324263038546
      },
      {
        "title": "canyon",
        "key": "canyon",
        "section": "words",
        "start": 172.3521541950113
      },
      {
        "title": "car",
        "key": "car",
        "section": "words",
        "start": 183.19097505668933
      },
      {
        "title": "card",
        "key": "card",
        "section": "words",
        "start": 190.69986394557822
      },
      {
        "title": "chair",
        "key": "chair",
        "section": "words",
        "start": 199.0786394557823
      },
      {
        "title": "circle",
        "key": "circle",
        "section": "words",
        "start": 208.60757369614512
      },
      {
        "title": "clap",
        "key": "clap",
        "section": "words",
        "start": 219.2564172335601
      },
      {
        "title": "cloudy",
        "key": "cloudy",
        "section": "words",
        "start": 227.82526077097506
      },
      {
        "title": "cold",
        "key": "cold",
        "section": "words",
        "start": 238.28421768707483
      },
      {
        "title": "corn",
        "key": "corn",
        "section": "words",
        "start": 246.62303854875285
      },
      {
        "title": "crayon",
        "key": "crayon",
        "section": "words",
        "start": 255.15192743764175
      },
      {
        "title": "cut",
        "key": "cut",
        "section": "words",
        "start": 265.93079365079365
      },
      {
        "title": "desk",
        "key": "desk",
        "section": "words",
        "start": 273.59968253968253
      },
      {
        "title": "dog",
        "key": "dog",
        "section": "words",
        "start": 282.4185034013605
      },
      {
        "title": "down",
        "key": "down",
        "section": "words",
        "start": 289.7873469387755
      },
      {
        "title": "dress",
        "key": "dress",
        "section": "words",
        "start": 298.3962811791383
      }
    ],
    "locale": "en-US",
    "format": "contest-compilation",
    "alphabetDuration": 28.769750566893425,
    "introDuration": 8.0,
    "wordCount": 30,
    "sources": [
      "assets/videos/contest-2026/apple.mp4",
      "assets/videos/contest-2026/april.mp4",
      "assets/videos/contest-2026/arm.mp4",
      "assets/videos/contest-2026/august.mp4",
      "assets/videos/contest-2026/baby.mp4",
      "assets/videos/contest-2026/ball.mp4",
      "assets/videos/contest-2026/bedroom.mp4",
      "assets/videos/contest-2026/belt.mp4",
      "assets/videos/contest-2026/black.mp4",
      "assets/videos/contest-2026/boat.mp4",
      "assets/videos/contest-2026/book.mp4",
      "assets/videos/contest-2026/box.mp4",
      "assets/videos/contest-2026/brown.mp4",
      "assets/videos/contest-2026/butter.mp4",
      "assets/videos/contest-2026/cake.mp4",
      "assets/videos/contest-2026/canyon.mp4",
      "assets/videos/contest-2026/car.mp4",
      "assets/videos/contest-2026/card.mp4",
      "assets/videos/contest-2026/chair.mp4",
      "assets/videos/contest-2026/circle.mp4",
      "assets/videos/contest-2026/clap.mp4",
      "assets/videos/contest-2026/cloudy.mp4",
      "assets/videos/contest-2026/cold.mp4",
      "assets/videos/contest-2026/corn.mp4",
      "assets/videos/contest-2026/crayon.mp4",
      "assets/videos/contest-2026/cut.mp4",
      "assets/videos/contest-2026/desk.mp4",
      "assets/videos/contest-2026/dog.mp4",
      "assets/videos/contest-2026/down.mp4",
      "assets/videos/contest-2026/dress.mp4"
    ]
  }
};
