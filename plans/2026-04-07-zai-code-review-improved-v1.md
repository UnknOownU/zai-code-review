# Z.ai Code Review - GitHub Action Amelioree

## Objectif

Recrer une GitHub Action de revue de code IA utilisant l'API Z.ai, mais **nettement superieure** au projet original (`tarmojussila/zai-code-review`). L'objectif est d'offrir une experience comparable a GitHub Copilot Code Review avec des commentaires inline ligne par ligne, des suggestions de code applicables en un clic, un resume automatique de la PR, et une analyse fichier par fichier.

## Analyse du projet original

### Ce qui existe (v0.3.0 - 130 lignes de JS)
- Recupere les fichiers modifies d'une PR
- Concatene tous les diffs en un seul prompt
- Appelle l'API Z.ai (`/api/coding/paas/v4/chat/completions`) en un seul appel
- Poste **un seul commentaire global** sur la PR
- Pas de commentaires inline, pas de suggestions de code, pas de resume

### Ce qui manque (et qu'on va construire)
| Feature | Priorite | Complexite |
|---|---|---|
| Commentaires inline ligne par ligne | Haute | Moyenne |
| Analyse fichier par fichier | Haute | Facile |
| Suggestions de code (click-to-apply) | Haute | Moyenne |
| Resume automatique de la PR | Haute | Facile |
| Categories de feedback (bug/security/improvement) | Moyenne | Facile |
| Severity levels (critical/warning/info) | Moyenne | Facile |
| Filtrage par chemin/fichier | Moyenne | Facile |
| Gestion des gros diffs (chunking) | Moyenne | Moyenne |
| Configuration avancee | Basse | Facile |
| Multi-tour (reponse aux reviews) | Basse | Difficile |

## Architecture cible

```
code-reviewer/
├── src/
│   ├── index.ts              # Point d'entree de l'action
│   ├── github/
│   │   ├── client.ts         # Client GitHub API (octokit)
│   │   ├── diff.ts           # Recuperation et parsing des diffs
│   │   └── comments.ts       # Postage de commentaires inline + review
│   ├── ai/
│   │   ├── client.ts         # Client API Z.ai
│   │   ├── prompts.ts        # System prompts et templates
│   │   ├── parser.ts         # Parsing des reponses IA (JSON structure)
│   │   └── chunker.ts        # Chunking intelligent des gros diffs
│   ├── review/
│   │   ├── reviewer.ts       # Logique principale de review
│   │   ├── summarizer.ts     # Generation du resume de PR
│   │   └── types.ts          # Types et interfaces
│   └── config.ts             # Configuration et inputs de l'action
├── dist/
│   └── index.js              # Build compile (commit dans le repo)
├── action.yml                # Metadata de la GitHub Action
├── package.json
├── tsconfig.json
└── .gitignore
```

## Plan d'implementation

### Phase 1 : Fondations (Setup + Structure)

- [x] **1.1** Initialiser le projet avec `package.json` (TypeScript, @actions/core, @actions/github, @vercel/ncc)
- [x] **1.2** Creer `tsconfig.json` avec configuration TypeScript pour Node 20
- [x] **1.3** Creer `.gitignore` (node_modules, dist temp, etc.)
- [x] **1.4** Creer `action.yml` avec tous les inputs definis (ZAI_API_KEY, ZAI_MODEL, ZAI_SYSTEM_PROMPT, ZAI_REVIEWER_NAME, GITHUB_TOKEN, max_files, exclude_patterns, language)
- [x] **1.5** Creer `src/config.ts` pour parser et valider les inputs de l'action
- [x] **1.6** Creer `src/review/types.ts` avec les interfaces TypeScript (ReviewComment, FileReview, ReviewSummary, Severity, Category)

### Phase 2 : Couche GitHub (Recuperation des diffs + Commentaires)

- [x] **2.1** Creer `src/github/client.ts` - Initialiser Octokit avec le token GitHub
- [x] **2.2** Creer `src/github/diff.ts` - Recuperer les fichiers modifies d'une PR avec pagination (comme l'original mais avec filtrage par chemin)
- [x] **2.3** Ajouter le parsing de diff dans `src/github/diff.ts` - Extraire les numeros de ligne (added/removed) pour pouvoir poster des commentaires inline
- [x] **2.4** Creer `src/github/comments.ts` - Fonction pour poster un commentaire inline sur une ligne specifique via `pulls.createReviewComment` avec `path`, `line`, `body`
- [x] **2.5** Ajouter dans `comments.ts` - Fonction pour poster un review complet via `pulls.createReview` avec statut (COMMENT, APPROVE, REQUEST_CHANGES)
- [x] **2.6** Ajouter dans `comments.ts` - Fonction pour mettre a jour un commentaire existant (gestion du marker pour eviter les doublons)
- [x] **2.7** Ajouter dans `comments.ts` - Fonction pour poster le resume global en haut de la PR via `issues.createComment`

### Phase 3 : Couche IA (Appels API Z.ai + Parsing)

- [x] **3.1** Creer `src/ai/client.ts` - Client HTTP pour l'API Z.ai (`/api/coding/paas/v4/chat/completions`) avec retry, timeout, gestion d'erreurs
- [x] **3.2** Creer `src/ai/prompts.ts` - System prompt structure demandant une reponse JSON avec categories (bug/security/improvement/nit), severity (critical/warning/info), ligne concernee, et suggestion de code
- [x] **3.3** Ajouter dans `prompts.ts` - Prompt template pour le resume de PR (liste des changements, points d'attention, verdict)
- [x] **3.4** Ajouter dans `prompts.ts` - Prompt par fichier avec contexte du diff et instructions pour le format de reponse
- [x] **3.5** Creer `src/ai/parser.ts` - Parser les reponses JSON de l'IA (gestion du markdown wrapping, fallback si l'IA ne respecte pas le format)
- [x] **3.6** Creer `src/ai/chunker.ts` - Logique de chunking : si un fichier a un diff > N tokens, le decouper intelligemment par blocs hunks

### Phase 4 : Logique de Review (Orchestration)

- [x] **4.1** Creer `src/review/reviewer.ts` - Orchestration principale : iterer sur chaque fichier, appeler l'IA, collecter les resultats
- [x] **4.2** Ajouter le support du traitement parallele avec `Promise.allSettled` pour analyser plusieurs fichiers en parallele (avec concurrence limitee)
- [x] **4.3** Ajouter la logique de filtrage : exclure les fichiers selon les patterns (lock files, generated files, etc.)
- [x] **4.4** Ajouter la logique de limitation : ne pas analyser plus de N fichiers par PR (configurable)
- [x] **4.5** Creer `src/review/summarizer.ts` - Generer un resume global a partir des resultats de tous les fichiers (appel IA supplementaire avec un prompt de synthese)
- [x] **4.6** Ajouter la logique de decision du statut de review : si critical bugs -> REQUEST_CHANGES, si improvements only -> COMMENT, si tout est clean -> APPROVE

### Phase 5 : Point d'entree + Integration

- [x] **5.1** Creer `src/index.ts` - Point d'entree principal : initialiser config, recuperer les diffs, lancer les reviews, poster les commentaires, poster le resume
- [x] **5.2** Ajouter la gestion d'erreurs globale avec try/catch et messages d'erreur clairs via `core.setFailed`
- [x] **5.3** Ajouter le logging detaille avec `core.info` et `core.debug` pour le debugging
- [x] **5.4** Ajouter le support du nettoyage : supprimer les anciens commentaires de review Z.ai avant d'en poster de nouveaux (via le marker)
- [x] **5.5** Ajouter la gestion des cas limites : PR sans diffs, PR avec fichiers binaires, fichiers trop gros, rate limiting API

### Phase 6 : Build + Tests + Documentation

- [x] **6.1** Configurer le build avec `@vercel/ncc` dans `package.json` (script build)
- [x] **6.2** Verifier que le build genere bien `dist/index.js` autonome
- [x] **6.3** Creer un workflow GitHub Actions de test dans `.github/workflows/test.yml` (lint + build check)
- [x] **6.4** Tester manuellement l'action sur une PR de test

## Inputs de l'action (action.yml)

| Input | Requis | Defaut | Description |
|---|---|---|---|
| `ZAI_API_KEY` | Oui | — | Cle API Z.ai |
| `ZAI_MODEL` | Non | `glm-4.7` | Modele Z.ai a utiliser |
| `ZAI_SYSTEM_PROMPT` | Non | (prompt expert reviewer) | Prompt systeme personnalise |
| `ZAI_REVIEWER_NAME` | Non | `Z.ai Code Review` | Nom affiche dans les commentaires |
| `GITHUB_TOKEN` | Non | `${{ github.token }}` | Token GitHub |
| `max_files` | Non | `20` | Nombre max de fichiers a analyser |
| `exclude_patterns` | Non | `package-lock.json,...` | Patterns de fichiers a exclure |
| `language` | Non | `en` | Langue des commentaires (en/fr) |
| `auto_approve` | Non | `false` | Approuver automatiquement si pas de problemes |

## Format des commentaires inline

Chaque commentaire inline sera structure ainsi :

```markdown
## [BUG] [Critical] Titre du probleme

Description du probleme detecte.

```suggestion
// Code suggere en remplacement
const result = await fetchData(id);
```

---
*Z.ai Code Review*
```

## Format du resume global

```markdown
## Z.ai Code Review - Summary

| Category | Count |
|---|---|
| Critical Bugs | 2 |
| Security Issues | 1 |
| Warnings | 3 |
| Suggestions | 5 |

### Key Findings
- **[Critical]** `src/auth/login.js:42` - Password comparison uses `=` instead of `===`
- **[Security]** `src/api/handler.js:15` - SQL injection vulnerability in query builder

### Verdict: **Changes Requested**

---
*Powered by Z.ai - [Configure](link)*
<!-- zai-code-review-marker -->
```

## Criteres de verification

- [ ] L'action se declenche correctement sur `pull_request` (opened, synchronize)
- [ ] Les commentaires sont postes **inline** sur les lignes specifiques du diff
- [ ] Les suggestions de code sont applicables en un clic via le bouton "Commit suggestion"
- [ ] Un resume global est poste en commentaire de la PR
- [ ] Les fichiers exclus par les patterns ne sont pas analyses
- [ ] L'action ne plante pas sur les PR sans diffs ou avec des fichiers binaires
- [ ] Les anciens commentaires sont mis a jour (pas de doublons) sur les pushs suivants
- [ ] Le statut de la review (APPROVE/REQUEST_CHANGES/COMMENT) est correct
- [ ] Le build `dist/index.js` est autonome et fonctionne sans `npm install`
- [ ] La configuration est entierement configurable via les inputs de l'action

## Risques et mitigations

1. **Rate limiting API Z.ai**
   Mitigation: Implementer un throttling avec delai entre les appels, et un retry avec backoff exponentiel (deja present dans l'original, a ameliorer)

2. **Reponse IA non structuree (pas du JSON)**
   Mitigation: Parser robuste avec fallback - si le JSON echoue, extraire les informations du texte brut et poster comme commentaire global

3. **Gros diffs qui depassent le contexte du modele**
   Mitigation: Chunker intelligemment par hunk, avec une taille max configurable. Prioriser les fichiers avec le plus de lignes supprimees/ajoutees

4. **Depassement du quota de commentaires GitHub (limites API)**
   Mitigation: Limiter le nombre de commentaires par PR (max 50 inline), regrouper les feedbacks mineurs dans le resume

5. **Token GitHub insuffisant pour poster des commentaires**
   Mitigation: Verifier les permissions au demarrage et afficher un message d'erreur clair si `pull-requests: write` n'est pas accorde

## Approches alternatives

1. **Utiliser les GitHub Checks API au lieu des commentaires** : Permet d'afficher les annotations directement dans l'onglet "Checks" de la PR, mais moins visible que les commentaires inline. Pourrait etre une option complementaire.

2. **Utiliser le format de review GitHub natif** : Au lieu de commentaires isoles, creer une "review" complete avec tous les commentaires groupes. C'est l'approche retenue car plus proche de GitHub Copilot.

3. **Streaming des reponses IA** : Utiliser le streaming de l'API Z.ai pour afficher les commentaires au fur et a mesure. Complexite elevee pour un gain marginal dans le contexte d'une GitHub Action.

4. **Utiliser un fichier de configuration dans le repo** (`.zai-review.yml`) : Permettrait aux utilisateurs de configurer des regles par projet. A considerer pour une v2.
