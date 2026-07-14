# Montforthaus Feldkirch – Website

Eine moderne, responsive Website für das **Montforthaus Feldkirch**, das
Kongress- und Kulturzentrum im Herzen der Vorarlberger Montfortstadt.

## Inhalt

Die Single-Page-Website (Deutsch) umfasst folgende Bereiche:

- **Hero** – einladende Startsektion mit Handlungsaufrufen
- **Das Haus** – Architektur und Geschichte des Montforthauses
- **Räume & Säle** – Übersicht der Veranstaltungsräume mit Kapazitäten
- **Programm** – kommende Konzerte, Kongresse und Kulturveranstaltungen
- **Gastronomie** – Bankett, Empfänge und Restaurant
- **Kontakt** – Anfrageformular, Kontaktdaten und Standort

## Technik

- **Frontend:** React 19, React Router, Tailwind CSS, shadcn/ui, Framer Motion,
  lucide-react, sonner (Toasts)
- **Backend:** FastAPI (vorbereitet, optional)
- Eigenständiges Design (Warm-Ivory-Palette, Montfort-Bordeaux & Messing) –
  Visuals sind als SVG/Gradients umgesetzt und benötigen keine externen Assets.

## Entwicklung

```bash
cd frontend
yarn install
yarn start      # Entwicklungsserver auf http://localhost:3000
yarn build      # Produktions-Build im Ordner build/
```

## Struktur (Frontend)

```
frontend/src/
├── App.js                     # Routing & Toaster
├── index.css                  # Theme, Fonts, Utility-Klassen
├── pages/Home.jsx             # Gesamte Website (alle Sektionen)
├── components/site/ui.jsx     # Reveal, Container, Eyebrow, Logo
├── components/ui/*            # shadcn/ui Komponenten
└── lib/site-data.js           # Inhalte (Räume, Programm, Stats)
```

> Hinweis: Inhalte wie Adresse, Telefonnummer und Programm sind
> Platzhalter/Beispieldaten und können in `frontend/src/lib/site-data.js`
> bzw. `frontend/src/pages/Home.jsx` angepasst werden.
