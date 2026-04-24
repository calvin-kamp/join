# Contributing Guide

> Dieses Dokument beschreibt die verbindlichen Konventionen für unser gemeinsames Projekt.  
> Bitte vor dem ersten Commit vollständig lesen.

---

## Inhaltsverzeichnis

- [Branching & Git-Workflow](#branching--git-workflow)
- [Angular – Komponenten anlegen](#angular--komponenten-anlegen)
- [BEM – CSS-Namenskonvention](#bem--css-namenskonvention)
- [SCSS-Projektstruktur](#scss-projektstruktur)
- [CSS-Variablen vs. SCSS-Variablen](#css-variablen-vs-scss-variablen)

---

## Branching & Git-Workflow

### Branch-Hierarchie

```
main
 └── development
      ├── feature/user-authentication
      ├── bugfix/broken-nav-link
      ├── refactor/card-component
      └── chore/update-dependencies
```

| Branch | Zweck |
|---|---|
| `main` | Produktionsstand – **nicht direkt anfassen!** |
| `development` | Integrationsbranch – Basis für alle neuen Branches |
| `feature/…` | Neue Funktionalität |
| `bugfix/…` | Fehlerbehebung |
| `refactor/…` | Code-Umstrukturierung ohne Funktionsänderung |
| `chore/…` | Wartungsaufgaben (Dependencies, Config, etc.) |
| `hotfix/…` | Kritischer Fix direkt auf `main` (nur im Ausnahmefall) |

### Branch-Typen im Detail

- **`feature/`** – Immer dann, wenn eine neue, sichtbare Funktionalität entwickelt wird (z. B. eine neue Seite, ein neues Formular, eine neue UI-Komponente).
- **`bugfix/`** – Wenn ein bestehendes Feature falsch funktioniert oder sich anders verhält als erwartet.
- **`refactor/`** – Wenn bestehender Code verbessert, aufgeräumt oder umstrukturiert wird, **ohne** das Verhalten zu ändern. Kein neues Feature, kein Fix.
- **`chore/`** – Alles, was nichts mit dem eigentlichen Produktcode zu tun hat: Abhängigkeiten aktualisieren, Linter-Konfiguration, CI/CD-Anpassungen.
- **`hotfix/`** – Nur für kritische Produktionsfehler, die nicht bis zum nächsten Release warten können. Wird direkt von `main` abgezweigt.

### Neuen Branch erstellen

Immer zuerst auf den aktuellen Stand von `development` bringen, **dann** den neuen Branch erstellen:

```bash
# 1. Zu development wechseln
git checkout development

# 2. Neuesten Stand holen
git pull origin development

# 3. Neuen Branch erstellen und direkt wechseln
git checkout -b feature/mein-feature-name
```

### Pull Request erstellen

1. Branch auf GitHub pushen
2. Pull Request von `feature/…` → **`development`** öffnen (nie direkt auf `main`!)
3. Mindestens einen Reviewer aus dem Team hinzufügen
4. PR-Beschreibung: Was wurde geändert und warum?

---

## Angular – Komponenten anlegen

### Wann eine neue Komponente erstellen?

Eine neue Komponente wird angelegt, sobald ein UI-Pattern **3× oder häufiger** verwendet wird. Wiederholung im Template ist das klare Signal zur Extraktion.

### CLI-Befehl

```bash
# Standard-Komponente
ng g c path/dateiname --type component

# Feature-Komponente (mit eigenem Prefix für den Feature-Kontext)
ng g c path/dateiname --type component --prefix feature-name
```

Das Flag `--type component` sorgt dafür, dass die Dateien als `dateiname.component.ts`, `dateiname.component.html` und `dateiname.component.scss` angelegt werden – und nicht mit dem Angular-Standard-Suffix.

Das Flag `--prefix` bei Feature-Komponenten ersetzt den globalen App-Prefix (z. B. `app-`) durch einen featurespezifischen Prefix (z. B. `shop-product-card`), damit der Ursprung der Komponente im Selector direkt erkennbar ist.

---

## BEM – CSS-Namenskonvention

BEM steht für **Block – Element – Modifier** und sorgt für eine konsistente, lesbare CSS-Struktur ohne Spezifitätskonflikte.

| Konzept | Syntax | Bedeutung |
|---|---|---|
| Block | `.card` | Eigenständige Komponente |
| Element | `.card__title` | Teil eines Blocks (mit `__`) |
| Modifier | `.card--small` | Variante eines Blocks oder Elements (mit `--`) |

### SCSS-Beispiel

```scss
.card {

    // Modifier: Variante des Blocks
    &--small {
        padding: $spacing-sm;
    }

    // Element: Teil des Blocks
    &__title {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
    }

    // Element mit Modifier und Breakpoint
    &__text {
        color: var(--color-text);

        &--highlighted {
            color: var(--color-accent);

            @include breakpoint(md) {
                font-size: $font-size-md;
            }
        }
    }
}
```

> **Keine tief verschachtelte Hierarchie!**  
> Statt `.card__body__paragraph` → `.card__paragraph`. BEM-Klassen sind immer flach, die visuelle Hierarchie entsteht durch die HTML-Struktur.

---

## SCSS-Projektstruktur

```
styles/
├── abstracts/       # Kein kompiliertes CSS – nur Hilfsmittel
├── base/            # Globale Grundstile
├── components/      # Komponentenspezifische Stile
├── layout/          # Seitenstruktur
└── vendors/         # Externe Bibliotheken
```

### `abstracts/`

Enthält ausschließlich SCSS-Hilfsmittel, die **kein CSS ausgeben**. Alles hier ist nur zum Importieren gedacht.

| Datei | Inhalt |
|---|---|
| `_tokens.scss` | Design-Tokens als SCSS-Variablen (`$font-size-base`, `$spacing-md`, …) |
| `_mixins.scss` | Wiederverwendbare Mixin-Definitionen (z. B. `@mixin breakpoint($bp)`) |
| `_functions.scss` | SCSS-Funktionen (z. B. `rem()`-Converter) |
| `_animations.scss` | `@keyframes`-Definitionen |
| `_index.scss` | Barrel-Export – importiert alle anderen Dateien dieses Ordners |

### `base/`

Globale Grundstile, die einmal für die gesamte App gelten.

| Datei | Inhalt |
|---|---|
| `_reset.scss` | CSS-Reset / Normalize (Box-Sizing, Margins, Paddings zurücksetzen) |
| `_globals.scss` | Globale CSS-Variablen (`--color-body-background`, `--color-text`, …) |
| `_fonts.scss` | `@font-face`-Definitionen und Font-Imports |
| `_accessibility.scss` | Screenreader-Utilities, Fokus-Stile (`focus-visible`) |
| `_utilities.scss` | Globale Utility-Klassen (z. B. `.visually-hidden`) |
| `_index.scss` | Barrel-Export |

### `components/`

Jede Datei entspricht einer UI-Komponente. Der Stil bleibt eng am Block-Selektor.

Beispiele: `_button.scss`, `_card.scss`, `_dialog.scss`, `_form-control.scss`, `_icon.scss`, `_toastr.scss`

### `layout/`

Stile für übergeordnete Seitenbereiche, die mehrere Komponenten einschließen.

Beispiele: `_header.scss`, `_footer.scss`, `_grid.scss`, `_navigation-dialog.scss`

### `vendors/`

Überschreibungen oder Erweiterungen für externe Bibliotheken (z. B. `_ngx-toastr.scss`). Eigener Code gehört **nicht** hierher.

### Abstracts in einer Komponente importieren

```scss
@use "abstracts" as *;

// Ab hier stehen alle Variablen, Mixins und Funktionen ohne Namespace zur Verfügung
.button {
    padding: $spacing-sm $spacing-md;

    @include breakpoint(md) {
        padding: $spacing-md $spacing-lg;
    }
}
```

---

## CSS-Variablen vs. SCSS-Variablen

Im Projekt werden beide Variablentypen bewusst eingesetzt:

```scss
body {
    background: var(--color-body-background);  // CSS-Variable
    color: var(--color-text);                  // CSS-Variable

    font-size: $font-size;                     // SCSS-Variable
    font-family: $font-family;                 // SCSS-Variable
    font-weight: $font-weight-regular;         // SCSS-Variable
    line-height: $line-height-body;            // SCSS-Variable
    letter-spacing: $font-letter-spacing;      // SCSS-Variable
}
```

### Warum zwei Systeme?

| | CSS-Variablen (`var(--…)`) | SCSS-Variablen (`$…`) |
|---|---|---|
| **Existiert zur Laufzeit** | ✅ Ja | ❌ Nein (wird beim Build aufgelöst) |
| **Überschreibbar im Browser** | ✅ Ja (z. B. Dark Mode via `:root`) | ❌ Nein |
| **Verwendbar in JS** | ✅ Ja | ❌ Nein |
| **Typisch für** | Farben, Theming | Abstände, Typografie, Breakpoints |

**Faustregel:**  
→ Alles, was sich zur **Laufzeit ändern kann** (Farben, Theme-Werte) → **CSS-Variable**  
→ Alles, was beim **Build fix ist** (Abstände, Schriftgrößen, Breakpoints) → **SCSS-Variable**

Farben werden bewusst als CSS-Variablen definiert, damit ein Dark Mode oder ein Theme-Wechsel ausschließlich über `:root`-Überschreibungen funktioniert – ohne eine einzige SCSS-Datei anzufassen.
