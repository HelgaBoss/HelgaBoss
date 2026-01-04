# PRD: Jahresziele & Gewohnheiten Tracker

## Original Problem Statement
Eine App zum Tracken von Jahreszielen und Meilensteinen mit folgenden Features:
- Erstellen/Bearbeiten/Löschen von Zielen und Meilensteinen
- Fortschrittsanzeige (manuell + numerisch)
- Deadline-Erinnerungen / Kalenderansicht
- Kategorien für Ziele (Gesundheit, Karriere, Finanzen, etc.)
- Tägliche Gewohnheiten mit Erledigt-Klick
- Design: Minimalistisch, Dunkel
- Keine Authentifizierung - lokale Speicherung

## User Personas
- **Einzelperson**: Persönliche Zielverfolgung für das Jahr 2026
- Nutzt die App zum Tracken von Jahreszielen und täglichen Gewohnheiten
- Möchte visuellen Überblick über Fortschritt

## Core Requirements (Static)
1. Jahresziele mit Kategorien erstellen
2. Zwei Zieltypen: Meilensteine (Teilziele) und Numerisch (z.B. 50 Bücher)
3. Tägliche Gewohnheiten mit Check-Button
4. Streak-Tracking für Gewohnheiten
5. Kalenderansicht für Deadlines
6. Fortschrittsanzeige mit animiertem Progress Circle
7. Dark Mode minimalistisches Design

## What's Been Implemented (04.01.2026)

### Backend (FastAPI + MongoDB)
- ✅ CRUD APIs für Goals (/api/goals)
- ✅ CRUD APIs für Habits (/api/habits)
- ✅ Milestone Management (add, toggle, delete)
- ✅ Habit Completion mit Streak-Berechnung
- ✅ Goal Progress Update für numerische Ziele

### Frontend (React + Tailwind + Shadcn)
- ✅ Dashboard mit Bento Grid Layout
- ✅ Hero Card mit animiertem Progress Circle
- ✅ Goal Cards mit Fortschrittsbalken
- ✅ Habit Tracker mit Check-Animation
- ✅ Streak Badge mit Pulse-Animation
- ✅ Create Goal Dialog (alle Zieltypen)
- ✅ Create Habit Dialog
- ✅ Goal Detail Page mit Meilenstein-Management
- ✅ Edit Goal Dialog
- ✅ Kalenderansicht mit Gewohnheiten-Status
- ✅ Dark "Cyber-Zen" Theme
- ✅ Framer Motion Animationen
- ✅ Toast Notifications (Sonner)

### Design System
- Theme: Cyber-Zen Dark (#09090b Background)
- Primary: Electric Lime (#bef264)
- Fonts: Chivo (Headings), Plus Jakarta Sans (Body)
- Components: Shadcn/UI customized

## Prioritized Backlog

### P0 (Critical) - Done
- [x] Goal CRUD
- [x] Milestone Management
- [x] Habit Tracking
- [x] Progress Calculation

### P1 (High Priority)
- [ ] Deadline-Erinnerungen (Push Notifications)
- [ ] Yearly Review / Statistiken
- [ ] Export/Import Daten (JSON)
- [ ] PWA Support für Offline-Nutzung

### P2 (Nice to Have)
- [ ] Drag & Drop Reorder für Meilensteine
- [ ] Habit Heatmap Visualization
- [ ] Motivations-Quotes
- [ ] Multiple Jahre Support
- [ ] Tags für Ziele

## Next Tasks
1. Deadline-Erinnerungen implementieren
2. Statistik-Dashboard für Jahresrückblick
3. Data Export/Import Feature
4. PWA Configuration für Mobile-Nutzung
