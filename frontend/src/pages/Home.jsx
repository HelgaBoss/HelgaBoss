import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { toast } from "sonner";
import {
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  Ruler,
  Music,
  Building2,
  UtensilsCrossed,
  Wine,
  Check,
} from "lucide-react";
import { Reveal, Container, Eyebrow, Logo } from "@/components/site/ui";
import { SPACES, EVENTS, STATS, NAV } from "@/lib/site-data";

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border shadow-[0_1px_20px_-12px_rgba(0,0,0,0.4)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <Container className="flex h-16 items-center justify-between md:h-20">
        <a href="#top" className="flex items-center gap-3 group">
          <Logo
            className={`h-7 w-11 transition-colors ${
              scrolled ? "text-primary" : "text-ivory"
            }`}
            tone="currentColor"
          />
          <span
            className={`font-display text-lg font-semibold leading-tight transition-colors ${
              scrolled ? "text-foreground" : "text-ivory"
            }`}
          >
            Montforthaus
            <span className="block text-[0.6rem] font-sans font-medium uppercase tracking-[0.3em] opacity-70">
              Feldkirch
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`link-underline text-sm font-medium transition-colors ${
                scrolled ? "text-foreground/80 hover:text-primary" : "text-ivory/85 hover:text-ivory"
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#kontakt"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Anfragen <ArrowRight className="h-4 w-4" />
          </a>
        </nav>

        <button
          className={`md:hidden ${scrolled ? "text-foreground" : "text-ivory"}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menü"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {/* Mobile drawer */}
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden border-t border-border bg-background md:hidden"
      >
        <div className="flex flex-col gap-1 px-5 py-4">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-foreground/85 hover:bg-secondary"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#kontakt"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            Anfragen <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </motion.div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
function RoofBackdrop() {
  // Layered undulating roofline echoing the building's brass facade.
  return (
    <svg
      className="absolute inset-x-0 bottom-0 w-full"
      viewBox="0 0 1440 420"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {[0.14, 0.22, 0.34, 0.5].map((op, i) => (
        <path
          key={i}
          d={`M0 ${300 + i * 24} C 240 ${180 + i * 20}, 400 ${360 + i * 10}, 620 ${
            250 + i * 18
          } S 1040 ${150 + i * 22}, 1440 ${280 + i * 16} V420 H0 Z`}
          fill="hsl(34 48% 48%)"
          opacity={op}
        />
      ))}
    </svg>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);
  const fade = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-[hsl(24_24%_9%)] text-ivory"
    >
      {/* ambient light */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[36rem] w-[36rem] rounded-full bg-primary/25 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[30rem] w-[30rem] rounded-full bg-accent/20 blur-[130px]" />
      <div className="paper-grain absolute inset-0 opacity-60" />
      <motion.div style={{ y, opacity: fade }} className="absolute inset-0">
        <RoofBackdrop />
      </motion.div>

      <Container className="relative z-10 py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="eyebrow inline-flex items-center gap-2 text-accent">
            <span className="h-px w-6 bg-accent/70" />
            Kongress · Kultur · Begegnung
          </span>
          <h1 className="mt-6 text-balance font-display text-[2.6rem] leading-[1.04] sm:text-6xl md:text-7xl">
            Wo Feldkirch
            <span className="block text-accent">zusammenkommt.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ivory/75">
            Das Montforthaus ist das Kongress- und Kulturzentrum im Herzen der
            Vorarlberger Montfortstadt – ein Ort für große Kongresse, feine
            Konzerte und unvergessliche Feste, mitten in der Altstadt.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#kontakt"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              Veranstaltung planen <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#programm"
              className="inline-flex items-center gap-2 rounded-full border border-ivory/25 px-7 py-3.5 font-semibold text-ivory transition-colors hover:bg-ivory/10"
            >
              Programm entdecken
            </a>
          </div>
        </motion.div>
      </Container>

      <motion.a
        href="#haus"
        style={{ opacity: fade }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-ivory/60"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        scrollen
      </motion.a>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats strip                                                        */
/* ------------------------------------------------------------------ */
function Stats() {
  return (
    <section className="border-b border-border bg-secondary/40">
      <Container className="grid grid-cols-2 gap-y-8 py-12 md:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center">
            <div className="font-display text-4xl text-primary md:text-5xl">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  About / Das Haus                                                   */
/* ------------------------------------------------------------------ */
function About() {
  const features = [
    "Preisgekrönte Architektur von Hascher Jehle",
    "Zentrale Lage direkt am Leonhardsplatz",
    "Flexible Säle für 10 bis 1.187 Gäste",
    "Hauseigene Gastronomie & Barrierefreiheit",
  ];
  return (
    <section id="haus" className="relative py-24 md:py-32">
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Das Haus</Eyebrow>
          <h2 className="mt-5 text-balance font-display text-4xl leading-tight md:text-5xl">
            Eine Skulptur aus Beton, Glas und Messing.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Seit seiner Eröffnung 2015 prägt das Montforthaus die Silhouette der
            Feldkircher Altstadt. Die geschwungene Messingfassade und das
            fließende Foyer verbinden historisches Stadtbild und
            zeitgenössische Baukunst zu einem unverwechselbaren Ort der
            Begegnung.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-foreground/85">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[hsl(24_24%_11%)] to-[hsl(4_40%_22%)] shadow-2xl">
              <svg viewBox="0 0 400 500" className="h-full w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="hsl(38 55% 62%)" />
                    <stop offset="1" stopColor="hsl(30 45% 40%)" />
                  </linearGradient>
                </defs>
                {/* undulating brass facade panels */}
                {Array.from({ length: 9 }).map((_, r) => (
                  <path
                    key={r}
                    d={`M-20 ${90 + r * 42} C 90 ${60 + r * 42}, 150 ${
                      130 + r * 42
                    }, 220 ${95 + r * 42} S 360 ${55 + r * 42}, 420 ${100 + r * 42}`}
                    fill="none"
                    stroke="url(#brass)"
                    strokeWidth="3"
                    opacity={0.35 + r * 0.06}
                  />
                ))}
                {/* glazed entrance */}
                <rect x="140" y="330" width="120" height="150" rx="4" fill="hsl(40 33% 97% / 0.08)" stroke="url(#brass)" strokeWidth="2" />
                <line x1="200" y1="330" x2="200" y2="480" stroke="url(#brass)" strokeWidth="1.5" opacity="0.6" />
                <line x1="140" y1="405" x2="260" y2="405" stroke="url(#brass)" strokeWidth="1.5" opacity="0.6" />
              </svg>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-5 shadow-xl sm:block">
              <div className="font-display text-3xl text-primary">6.400 m²</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Fläche für Ideen
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Räume / Spaces                                                     */
/* ------------------------------------------------------------------ */
const SPACE_ICONS = [Music, Building2, Wine, Users];

function Spaces() {
  return (
    <section id="raeume" className="bg-secondary/40 py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Eyebrow className="justify-center">Räume & Säle</Eyebrow>
            <h2 className="mt-5 text-balance font-display text-4xl md:text-5xl">
              Der passende Rahmen für jeden Anlass.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Vom intimen Workshop bis zum Kongress mit über tausend Gästen –
              unsere Räume lassen sich flexibel kombinieren und individuell
              inszenieren.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {SPACES.map((sp, i) => {
            const Icon = SPACE_ICONS[i % SPACE_ICONS.length];
            return (
              <Reveal key={sp.name} delay={(i % 2) * 0.1}>
                <article className="group flex h-full flex-col rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl">{sp.name}</h3>
                  <p className="mt-3 flex-1 text-muted-foreground">{sp.desc}</p>
                  <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <span className="inline-flex items-center gap-2 font-medium text-foreground/80">
                      <Users className="h-4 w-4 text-accent" /> {sp.capacity}
                    </span>
                    <span className="inline-flex items-center gap-2 font-medium text-foreground/80">
                      <Ruler className="h-4 w-4 text-accent" /> {sp.area}
                    </span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {sp.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Programm / Events                                                  */
/* ------------------------------------------------------------------ */
function Program() {
  return (
    <section id="programm" className="py-24 md:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <Eyebrow>Programm</Eyebrow>
            <h2 className="mt-5 max-w-xl text-balance font-display text-4xl md:text-5xl">
              Was als Nächstes bei uns passiert.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <a
              href="#kontakt"
              className="link-underline inline-flex items-center gap-2 font-semibold text-primary"
            >
              Gesamtes Programm anfordern <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>

        <div className="mt-12 divide-y divide-border border-y border-border">
          {EVENTS.map((ev, i) => (
            <Reveal key={ev.title} delay={i * 0.06}>
              <a
                href="#kontakt"
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-6 transition-colors hover:bg-secondary/40 md:gap-8 md:px-4"
              >
                <div className="flex w-16 flex-col items-center rounded-xl bg-primary/5 py-3 text-primary">
                  <span className="font-display text-2xl leading-none">{ev.day}</span>
                  <span className="text-xs uppercase tracking-widest">{ev.month}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                    {ev.kind}
                  </span>
                  <h3 className="mt-1 font-display text-xl md:text-2xl">{ev.title}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {ev.time}
                  </p>
                </div>
                <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full border border-border text-muted-foreground transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Gastronomie                                                        */
/* ------------------------------------------------------------------ */
function Gastronomy() {
  return (
    <section id="gastronomie" className="relative overflow-hidden bg-[hsl(24_24%_9%)] py-24 text-ivory md:py-32">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-accent/20 blur-[130px]" />
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow inline-flex items-center gap-2 text-accent">
            <span className="h-px w-6 bg-accent/70" /> Gastronomie
          </span>
          <h2 className="mt-5 text-balance font-display text-4xl leading-tight md:text-5xl">
            Kulinarik mit Weitblick.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ivory/75">
            Ob Business-Lunch, festliches Bankett oder Flying Buffet für tausend
            Gäste – unser Küchenteam setzt auf regionale Produkte aus dem Ländle,
            saisonal interpretiert und mit Liebe zum Detail serviert.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: UtensilsCrossed, t: "Bankett", d: "bis 1.000 Gedecke" },
              { icon: Wine, t: "Empfänge", d: "Flying Dinner & Bar" },
              { icon: Clock, t: "Restaurant", d: "Di–Sa geöffnet" },
            ].map((c) => (
              <div key={c.t} className="rounded-xl border border-ivory/15 bg-ivory/5 p-5">
                <c.icon className="h-6 w-6 text-accent" />
                <div className="mt-3 font-display text-lg">{c.t}</div>
                <div className="text-sm text-ivory/60">{c.d}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="rounded-2xl border border-ivory/15 bg-gradient-to-br from-ivory/10 to-transparent p-10">
            <div className="font-display text-2xl text-accent">„</div>
            <p className="mt-2 font-display text-2xl leading-relaxed">
              Gastfreundschaft ist für uns kein Service, sondern eine Haltung –
              spürbar vom ersten Espresso bis zum letzten Gang.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-accent/30" />
              <div>
                <div className="font-semibold">Küchenleitung</div>
                <div className="text-sm text-ivory/60">Montforthaus Gastronomie</div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Kontakt                                                            */
/* ------------------------------------------------------------------ */
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", type: "Kongress", message: "" });
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }
    setSent(true);
    toast.success("Vielen Dank! Wir melden uns in Kürze bei Ihnen.");
    setForm({ name: "", email: "", type: "Kongress", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <section id="kontakt" className="py-24 md:py-32">
      <Container className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <Eyebrow>Kontakt & Anfrage</Eyebrow>
          <h2 className="mt-5 text-balance font-display text-4xl md:text-5xl">
            Planen wir Ihre Veranstaltung.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Erzählen Sie uns von Ihrem Vorhaben – unser Team meldet sich mit einem
            unverbindlichen Angebot und einem Raumvorschlag.
          </p>

          <div className="mt-10 space-y-5">
            {[
              { icon: MapPin, t: "Montforthaus Feldkirch", d: "Montfortplatz 1, 6800 Feldkirch, Österreich" },
              { icon: Phone, t: "Telefon", d: "+43 5522 90008-0" },
              { icon: Mail, t: "E-Mail", d: "office@montforthaus.at" },
              { icon: Clock, t: "Ticketservice", d: "Mo–Fr 09:00–17:00 Uhr" },
            ].map((c) => (
              <div key={c.t} className="flex items-start gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-semibold text-foreground">{c.t}</div>
                  <div className="text-muted-foreground">{c.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* stylized map */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-border">
            <svg viewBox="0 0 600 220" className="h-40 w-full bg-secondary/60" aria-hidden="true">
              {Array.from({ length: 7 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 32} x2="600" y2={i * 32} stroke="hsl(var(--border))" strokeWidth="1" />
              ))}
              {Array.from({ length: 14 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 46} y1="0" x2={i * 46} y2="220" stroke="hsl(var(--border))" strokeWidth="1" />
              ))}
              <path d="M0 150 Q 200 120 320 160 T 600 140" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" opacity="0.5" />
              <circle cx="300" cy="110" r="9" fill="hsl(var(--primary))" />
              <circle cx="300" cy="110" r="18" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.4" />
            </svg>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-border bg-card p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.5)] md:p-10"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name *">
                <input
                  value={form.name}
                  onChange={update("name")}
                  className="ipt"
                  placeholder="Ihr Name"
                />
              </Field>
              <Field label="E-Mail *">
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  className="ipt"
                  placeholder="name@beispiel.at"
                />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Art der Veranstaltung">
                <select value={form.type} onChange={update("type")} className="ipt">
                  {["Kongress", "Tagung / Seminar", "Konzert / Kultur", "Feier / Gala", "Sonstiges"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Ihre Nachricht *">
                <textarea
                  value={form.message}
                  onChange={update("message")}
                  rows={4}
                  className="ipt resize-none"
                  placeholder="Anlass, gewünschtes Datum, Gästezahl …"
                />
              </Field>
            </div>
            <button
              type="submit"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-70"
              disabled={sent}
            >
              {sent ? (
                <>
                  <Check className="h-5 w-5" /> Gesendet
                </>
              ) : (
                <>
                  Anfrage senden <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Mit dem Absenden stimmen Sie unserer Datenschutzerklärung zu.
            </p>
          </form>
        </Reveal>
      </Container>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground/80">{label}</span>
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="border-t border-border bg-[hsl(24_24%_9%)] py-16 text-ivory">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Logo className="h-7 w-11 text-accent" />
              <span className="font-display text-lg font-semibold">Montforthaus Feldkirch</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/60">
              Kongress- und Kulturzentrum im Herzen der Montfortstadt. Ein Haus
              für Begegnung, Kultur und große Momente.
            </p>
          </div>
          <div>
            <div className="eyebrow text-ivory/50">Navigation</div>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-ivory/70 transition-colors hover:text-accent">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow text-ivory/50">Kontakt</div>
            <ul className="mt-4 space-y-2 text-sm text-ivory/70">
              <li>Montfortplatz 1</li>
              <li>6800 Feldkirch, Österreich</li>
              <li>+43 5522 90008-0</li>
              <li>office@montforthaus.at</li>
            </ul>
          </div>
        </div>
        <div className="hairline my-10 opacity-30" />
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-ivory/50 sm:flex-row">
          <span>© {new Date().getFullYear()} Montforthaus Feldkirch. Alle Rechte vorbehalten.</span>
          <div className="flex gap-6">
            <a href="#top" className="hover:text-accent">Impressum</a>
            <a href="#top" className="hover:text-accent">Datenschutz</a>
            <a href="#top" className="hover:text-accent">Nach oben ↑</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  return (
    <main className="overflow-x-hidden bg-background">
      <Nav />
      <Hero />
      <Stats />
      <About />
      <Spaces />
      <Program />
      <Gastronomy />
      <Contact />
      <Footer />
    </main>
  );
}
