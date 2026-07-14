// Content for the Montforthaus Feldkirch website.
// A congress, culture and event centre in the heart of Feldkirch, Vorarlberg.

export const SPACES = [
  {
    name: "Montforthaussaal",
    capacity: "bis 1.187 Gäste",
    area: "612 m²",
    desc:
      "Der große Saal mit variabler Bestuhlung, exzellenter Akustik und Bühnentechnik auf Konzerthaus-Niveau – für Kongresse, Konzerte und Galaabende.",
    tags: ["Kongress", "Konzert", "Gala"],
  },
  {
    name: "Albert-Loacker-Saal",
    capacity: "bis 300 Gäste",
    area: "280 m²",
    desc:
      "Ein lichtdurchfluteter Saal für Tagungen, Seminare und Empfänge – teilbar und flexibel möblierbar.",
    tags: ["Tagung", "Seminar", "Empfang"],
  },
  {
    name: "Foyer & Panoramaebene",
    capacity: "bis 600 Gäste",
    area: "740 m²",
    desc:
      "Großzügige Foyerflächen über mehrere Ebenen mit Blick auf die Altstadt – ideal für Ausstellungen, Flying Dinner und Networking.",
    tags: ["Ausstellung", "Catering", "Networking"],
  },
  {
    name: "Studios 1–4",
    capacity: "10–120 Gäste",
    area: "40–160 m²",
    desc:
      "Modular kombinierbare Räume für Workshops, Break-out-Sessions und Besprechungen – vollständig medientechnisch ausgestattet.",
    tags: ["Workshop", "Meeting", "Hybrid"],
  },
];

export const EVENTS = [
  {
    date: "2026-09-19",
    day: "19",
    month: "Sep",
    title: "Feldkircher Kammerkonzert",
    kind: "Konzert",
    time: "19:30 Uhr · Montforthaussaal",
  },
  {
    date: "2026-10-04",
    day: "04",
    month: "Okt",
    title: "Vorarlberger Wirtschaftsforum",
    kind: "Kongress",
    time: "09:00 Uhr · Ganztägig",
  },
  {
    date: "2026-10-18",
    day: "18",
    month: "Okt",
    title: "Jazz am Montfort – Trio Nocturne",
    kind: "Konzert",
    time: "20:00 Uhr · Albert-Loacker-Saal",
  },
  {
    date: "2026-11-08",
    day: "08",
    month: "Nov",
    title: "Poetry & Prosa – Lange Nacht der Literatur",
    kind: "Lesung",
    time: "18:30 Uhr · Foyer",
  },
];

export const STATS = [
  { value: "2015", label: "Eröffnung" },
  { value: "6.400", label: "m² Veranstaltungsfläche" },
  { value: "300+", label: "Veranstaltungen pro Jahr" },
  { value: "1.187", label: "Plätze im großen Saal" },
];

export const NAV = [
  { label: "Das Haus", href: "#haus" },
  { label: "Räume", href: "#raeume" },
  { label: "Programm", href: "#programm" },
  { label: "Gastronomie", href: "#gastronomie" },
  { label: "Kontakt", href: "#kontakt" },
];
