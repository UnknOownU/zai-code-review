# Z.ai Code Review - GitHub Action Amelioree

## Objectif

Recrer une GitHub Action de revue de code IA utilisant l'API Z.ai, nettement superieure au projet original (`tarmojussila/zai-code-review`). L'objectif est d'offrir une experience comparable a GitHub Copilot Code Review avec des commentaires inline ligne par ligne, des suggestions de code applicables en un clic, un resume automatique de la PR, et une analyse fichier par fichier.

## Analyse du projet original

### Ce qui existe (v0.3.0 - 130 lignes de JS)
- Recupere les fichiers modifies d'une PR via `pulls.listFiles`
- Concatene tous les diffs en un seul prompt texte
- Appelle l'API Z.ai (`https://api.z.ai/api/coding/paas/v4/chat/completions`) en un seul appel
- Poste **un seul commentaire global** sur la PR via `issues.createComment`
- Pas de commentaires inline, pas de suggestions de code, pas de resume

### Ce qui manque et qu'on va construire
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

## Documentation API GitHub critique

### Endpoint : Creer une review avec commentaires inline

```
POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews
```

**Corps de la requete :**
```json
{
  "commit_id": "sha du dernier commit",
  "body": "Resume de la review",
  "event": "APPROVE | REQUEST_CHANGES | COMMENT",
  "comments": [
    {
      "path": "src/file.ts",
      "position": 6,
      "body": "Texte du commentaire"
    }
  ]
}
```

**Points critiques :**
- `position` n'est PAS le numero de ligne du fichier. C'est l'index dans le diff (ligne 1 apres le `@@` hunk header = position 1, etc.)
- `path` = chemin relatif du fichier
- `event` = `APPROVE`, `REQUEST_CHANGES`, ou `COMMENT`
- `comments` = tableau de commentaires inline, tous postes en une seule review
- On peut aussi utiliser `line` au lieu de `position` (plus moderne), mais il faut alors fournir `side: "RIGHT"` et `commit_id`

### Endpoint : Creer un commentaire isole (alternative)

```
POST /repos/{owner}/{repo}/pulls/{pull_number}/comments
```

**Corps :**
```json
{
  "body": "Texte",
  "commit_id": "sha",
  "path": "src/file.ts",
  "line": 42,
  "side": "RIGHT"
}
```

**Pour les multi-line :**
```json
{
  "body": "Texte",
  "commit_id": "sha",
  "path": "src/file.ts",
  "start_line": 40,
  "start_side": "RIGHT",
  "line": 42,
  "side": "RIGHT"
}
```

### Endpoint : Lister les fichiers modifies

```
GET /repos/{owner}/{repo}/pulls/{pull_number}/files
```

Retourne un tableau avec pour chaque fichier :
- `filename` : chemin relatif
- `status` : added, modified, removed, renamed
- `patch` : le diff unifie (format `@@ ... @@`)
- `additions`, `deletions`, `changes` : compteurs

### Calcul du `position` dans le diff

Le `position` est un index qui commence a 1 apres chaque `@@ ... @@` hunk header dans le patch. Il compte TOUTES les lignes (ajoutees, supprimees, et contexte). Il continue d'incrementer a travers les hunks suivants du meme fichier. Ce n'est PAS le numero de ligne dans le fichier source.

**Algorithme de parsing du patch :**
1. Splitter le patch par lignes
2. Pour chaque ligne, si elle commence par `@@`, c'est un hunk header (ne pas incrementer position)
3. Sinon, incrementer position (lignes `+`, `-`, et ` ` comptent toutes)
4. Les lignes `+\` ont la position correspondante dans le diff cote RIGHT
5. Les lignes `-\` ont la position correspondante dans le diff cote LEFT

## Documentation API Z.ai

### Endpoint de chat
```
POST https://api.z.ai/api/coding/paas/v4/chat/completions
```

**Headers :**
```
Content-Type: application/json
Authorization: Bearer <ZAI_API_KEY>
```

**Corps :**
```json
{
  "model": "glm-4.7",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ]
}
```

**Reponse :**
```json
{
  "choices": [
    {
      "message": {
        "content": "..."
      }
    }
  ]
}
```

**Modeles disponibles** : `glm-4.7` (defaut original), `glm-5.1` (utilise dans Forge)

## Plan d'implementation

### Phase 1 : Fondations (Setup + Structure)

- [x] **1.1** Creer `package.json` avec les dependances : `@actions/core`, `@actions/github`, `@vercel/ncc` (dev), `typescript` (dev). Scripts : `"build": "ncc build src/index.ts -o dist --license licenses.txt"`
- [x] **1.2** Creer `tsconfig.json` avec target ES2022, module commonjs, strict mode, outDir `./dist`, rootDir `./src`
- [x] **1.3** Creer `.gitignore` avec : `node_modules/`, `*.js` (sauf dist), patterns standards Node
- [x] **1.4** Creer `action.yml` avec la metadata complete :

```yaml
name: "Z.ai Code Review"
description: "AI-powered code review using Z.ai models with inline comments"
inputs:
  ZAI_API_KEY:
    description: "Z.ai API key"
    required: true
  ZAI_MODEL:
    description: "Z.ai AI model to use"
    required: false
    default: "glm-4.7"
  ZAI_SYSTEM_PROMPT:
    description: "Custom system prompt for the AI reviewer"
    required: false
    default: "You are an expert code reviewer..."
  ZAI_REVIEWER_NAME:
    description: "Name shown in review comments"
    required: false
    default: "Z.ai Code Review"
  GITHUB_TOKEN:
    description: "GitHub token for API access"
    required: false
    default: "${{ github.token }}"
  max_files:
    description: "Maximum number of files to review per PR"
    required: false
    default: "20"
  exclude_patterns:
    description: "Comma-separated glob patterns to exclude (e.g. '*.lock,*.min.js')"
    required: false
    default: "package-lock.json,yarn.lock,pnpm-lock.yaml,*.min.js,*.min.css"
  language:
    description: "Language for review comments (en or fr)"
    required: false
    default: "en"
  auto_approve:
    description: "Auto-approve PR if no issues found"
    required: false
    default: "false"
runs:
  using: "node20"
  main: "dist/index.js"
branding:
  icon: "check-circle"
  color: "gray-dark"
```

- [x] **1.5** Creer `src/config.ts` - Parser les inputs via `@actions/core.getInput()`, valider les valeurs, exporter un objet `Config` type. Inclure la fonction `parseExcludePatterns()` qui split la string par virgules et retourne un tableau de glob patterns.
- [x] **1.6** Creer `src/review/types.ts` avec les interfaces TypeScript :

```typescript
// Severite d'un commentaire
type Severity = 'critical' | 'warning' | 'info';

// Categorie de feedback
type Category = 'bug' | 'security' | 'improvement' | 'nit' | 'performance';

// Statut de la review
type ReviewStatus = 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';

// Un commentaire de review inline
interface ReviewComment {
  path: string;           // chemin relatif du fichier
  position: number;       // position dans le diff (pas numero de ligne!)
  body: string;           // texte du commentaire en markdown
  line?: number;          // numero de ligne optionnel
  severity: Severity;
  category: Category;
  suggestion?: string;    // code suggere pour le bloc ```suggestion```
}

// Resultat de la review d'un fichier
interface FileReview {
  filename: string;
  comments: ReviewComment[];
  error?: string;         // si l'analyse a echoue pour ce fichier
}

// Resume global de la PR
interface ReviewSummary {
  totalFiles: number;
  reviewedFiles: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  status: ReviewStatus;
  keyFindings: string[];
}

// Fichier modifie depuis l'API GitHub
interface ChangedFile {
  filename: string;
  status: string;         // added, modified, removed, renamed
  patch: string | null;   // diff unifie
  additions: number;
  deletions: number;
  changes: number;
}

// Hunk parse du diff
interface DiffHunk {
  header: string;         // ex: "@@ -10,5 +10,7 @@"
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
}

// Ligne parsee du diff
interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  lineNumber?: number;    // numero de ligne dans le fichier (cote nouveau pour add/context)
  position: number;       // position dans le diff pour l'API GitHub
}

// Reponse structuree de l'IA
interface AIReviewResponse {
  comments: Array<{
    line?: number;
    severity: Severity;
    category: Category;
    message: string;
    suggestion?: string;
  }>;
}
```

### Phase 2 : Couche GitHub (Recuperation des diffs + Commentaires)

- [x] **2.1** Creer `src/github/client.ts` - Initialiser Octokit avec le token GitHub. Exporter une fonction `createGitHubClient(token: string)` qui retourne une instance Octokit authentifiee.

- [x] **2.2** Creer `src/github/diff.ts` - Fonction `getChangedFiles(octokit, owner, repo, pullNumber)` qui recupere les fichiers modifies avec pagination (100 par page, boucler jusqu'a ce que `data.length < 100`). Retourne un tableau de `ChangedFile[]`.

- [x] **2.3** Ajouter dans `src/github/diff.ts` la fonction `parsePatch(patch: string): DiffHunk[]` qui parse le diff unifie :
  1. Split par lignes
  2. Detecter les hunk headers avec la regex `/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/`
  3. Pour chaque ligne du hunk, determiner le type (`+` = add, `-` = remove, ` ` = context)
  4. Calculer le `position` en incrementant un compteur (commence a 1 pour la premiere ligne apres le hunk header)
  5. Calculer le `lineNumber` (numero de ligne dans le fichier) en incrementant le compteur cote nouveau uniquement pour les lignes add et context

- [x] **2.4** Ajouter dans `src/github/diff.ts` la fonction `findPositionForLine(hunks: DiffHunk[], targetLine: number): number | null` qui, etant donne un numero de ligne dans le fichier, retrouve la `position` correspondante dans le diff. Itere sur les hunks et les lignes, cherche la ligne avec `lineNumber === targetLine` et `type === 'add'` ou `type === 'context'`, retourne sa `position`.

- [x] **2.5** Creer `src/github/comments.ts` - Fonction `postReview(octokit, owner, repo, pullNumber, commitId, summary: ReviewSummary, comments: ReviewComment[])` qui :
  1. Construit le body de la review avec le resume formate en markdown
  2. Construit le tableau `comments` au format GitHub `{ path, position, body }`
  3. Appelle `octokit.rest.pulls.createReview({ owner, repo, pull_number, commit_id, body, event, comments })`
  4. Le `event` est determine par le `summary.status` (APPROVE, REQUEST_CHANGES, ou COMMENT)

- [x] **2.6** Ajouter dans `src/github/comments.ts` la fonction `cleanupOldReviews(octokit, owner, repo, pullNumber, marker: string)` qui :
  1. Liste les reviews existantes via `octokit.rest.pulls.listReviews()`
  2. Pour chaque review dont le body contient le marker, la dismiss via `octokit.rest.pulls.dismissReview()` avec un message "Updating review..."
  3. Alternative : supprimer les commentaires isoles qui contiennent le marker via `octokit.rest.pulls.deleteReviewComment()`

- [x] **2.7** Ajouter dans `src/github/comments.ts` la fonction `postSummaryComment(octokit, owner, repo, pullNumber, summary: ReviewSummary, reviewerName: string)` qui poste le resume global en commentaire de la PR via `issues.createComment` (pas un commentaire de review, mais un commentaire d'issue pour la visibilite). Inclure le marker `<!-- zai-code-review -->` pour pouvoir le mettre a jour.

### Phase 3 : Couche IA (Appels API Z.ai + Parsing)

- [x] **3.1** Creer `src/ai/client.ts` - Fonction `callZaiApi(apiKey: string, model: string, systemPrompt: string, userPrompt: string): Promise<string>` qui :
  1. Utilise le module `https` natif de Node (pas de dependance supplementaire, comme l'original)
  2. POST sur `https://api.z.ai/api/coding/paas/v4/chat/completions`
  3. Headers : `Content-Type: application/json`, `Authorization: Bearer <key>`
  4. Body : `{ model, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }] }`
  5. Timeout : 120 secondes
  6. Retry : 3 tentatives avec backoff exponentiel (1s, 2s, 4s) sur les erreurs 429, 500, 502, 503
  7. Retourne `choices[0].message.content`

- [x] **3.2** Creer `src/ai/prompts.ts` - System prompt pour la review fichier par fichier. Le prompt doit demander a l'IA de repondre en **JSON strict** avec cette structure :

```
You are an expert code reviewer. Analyze the following diff and provide feedback.

You MUST respond with ONLY a valid JSON object, no markdown, no code fences.
The JSON structure must be:

{
  "comments": [
    {
      "line": <line_number_in_new_file>,
      "severity": "critical" | "warning" | "info",
      "category": "bug" | "security" | "improvement" | "nit" | "performance",
      "message": "Clear explanation of the issue",
      "suggestion": "Fixed code here (optional, only if you have a code fix)"
    }
  ]
}

Rules:
- Only report REAL issues. Skip trivial style comments.
- `line` must be a line number in the NEW version of the file (after changes).
- `severity`: critical = will cause bugs/crashes, warning = should be fixed, info = nice to know
- `category`: bug, security, improvement, nit, performance
- `suggestion`: provide ONLY the replacement code for the problematic line(s), not the entire file
- If no issues found, return {"comments": []}
- Respond in {language}.
```

- [x] **3.3** Ajouter dans `src/ai/prompts.ts` le prompt pour le resume global :

```
You are summarizing a code review. Based on the file-by-file review results below, generate a concise PR review summary.

Respond with ONLY valid JSON:
{
  "verdict": "approve" | "request_changes" | "comment",
  "key_findings": ["Finding 1", "Finding 2", ...],
  "summary_text": "2-3 sentence overall assessment"
}

Rules:
- verdict = "approve" if only info/nit issues, "request_changes" if any critical/warning, "comment" otherwise
- key_findings: max 5 most important findings
- Respond in {language}.
```

- [x] **3.4** Ajouter dans `src/ai/prompts.ts` la fonction `buildFilePrompt(filename: string, patch: string, language: string): string` qui construit le prompt utilisateur pour un fichier :

```
Review the changes in file: {filename}

```diff
{patch}
```

Provide your review as JSON.
```

- [x] **3.5** Creer `src/ai/parser.ts` - Fonction `parseAIResponse(rawContent: string): AIReviewResponse` qui :
  1. Tente d'extraire le JSON de la reponse (l'IA peut wrapper dans des code fences ```json ... ```)
  2. Utilise une regex pour trouver le premier bloc JSON valide : `/(\{[\s\S]*\})/`
  3. Parse le JSON et valide la structure (verifier que `comments` est un tableau)
  4. Fallback : si le parsing echoue, extraire le texte brut et creer un seul commentaire "global" avec le texte
  5. Valider chaque commentaire : `severity` et `category` doivent etre des valeurs valides, `line` doit etre un nombre positif
  6. Nettoyer les suggestions de code : enlever les code fences si l'IA les a mises dans le champ `suggestion`

- [x] **3.6** Creer `src/ai/chunker.ts` - Fonction `chunkPatch(patch: string, maxLines: number = 500): string[]` qui :
  1. Si le patch fait moins de `maxLines` lignes, le retourner tel quel
  2. Sinon, splitter par hunk headers (`@@`)
  3. Grouper les hunks en chunks qui ne depassent pas `maxLines`
  4. Chaque chunk doit commencer par le hunk header correspondant
  5. Retourner un tableau de strings (chunks de patch)

### Phase 4 : Logique de Review (Orchestration)

- [x] **4.1** Creer `src/review/reviewer.ts` - Fonction principale `reviewFiles(files: ChangedFile[], config: Config, aiClient): Promise<FileReview[]>` qui :
  1. Filtre les fichiers selon `exclude_patterns` (utiliser `minimatch` ou un simple `endsWith`/`includes`)
  2. Limite a `max_files` fichiers
  3. Ignore les fichiers sans `patch` (binaire, removed)
  4. Pour chaque fichier, appelle `reviewFile(filename, patch, config, aiClient)`
  5. Utilise `Promise.allSettled` pour le traitement parallele avec une concurrence de 3 (pour ne pas surcharger l'API Z.ai)
  6. Collecte les resultats, catch les erreurs par fichier

- [x] **4.2** Ajouter dans `src/review/reviewer.ts` la fonction `reviewFile(filename: string, patch: string, config: Config, aiClient): Promise<FileReview>` qui :
  1. Si le patch est trop gros, le chunker via `chunkPatch()`
  2. Pour chaque chunk, construire le prompt via `buildFilePrompt()`
  3. Appeler l'API Z.ai via `callZaiApi()`
  4. Parser la reponse via `parseAIResponse()`
  5. Convertir les numeros de ligne en `position` dans le diff via `findPositionForLine()`
  6. Ne garder que les commentaires dont la position est valide (la ligne existe dans le diff)
  7. Retourner un `FileReview` avec les commentaires valides

- [x] **4.3** Ajouter la fonction `formatCommentBody(comment: ReviewComment, reviewerName: string): string` qui formate un commentaire inline :

```markdown
## [{category}] [{severity}]

{message}

{si suggestion existe}
```suggestion
{suggestion}
```
{fin si}

---
*{reviewerName}*
```

- [x] **4.4** Creer `src/review/summarizer.ts` - Fonction `generateSummary(fileReviews: FileReview[], config: Config, aiClient): Promise<ReviewSummary>` qui :
  1. Compte les commentaires par severite
  2. Determine le statut : si au moins 1 critical -> REQUEST_CHANGES, si au moins 1 warning -> COMMENT, sinon -> APPROVE
  3. Collecte les key findings (top 5 commentaires les plus graves)
  4. Optionnel : appelle l'IA une derniere fois pour generer un resume texte plus naturel

- [x] **4.5** Ajouter dans `src/review/summarizer.ts` la fonction `formatSummaryBody(summary: ReviewSummary, reviewerName: string): string` qui genere le markdown du resume :

```markdown
## {reviewerName} - Summary

| Category | Count |
|---|---|
| Critical | {x} |
| Warning | {x} |
| Info | {x} |

### Key Findings
{pour chaque finding}
- **[{severity}]** `{path}:{line}` - {message}
{fin pour}

### Verdict: **{APPROVE / REQUEST_CHANGES / COMMENT}**

<!-- zai-code-review -->
```

### Phase 5 : Point d'entree + Integration

- [x] **5.1** Creer `src/index.ts` - Point d'entree principal qui orchestre tout :
  1. Parser la config via `getConfig()`
  2. Verifier qu'on est dans un contexte `pull_request`
  3. Extraire `owner`, `repo`, `pullNumber` du contexte GitHub
  4. Creer le client GitHub
  5. Recuperer les fichiers modifies via `getChangedFiles()`
  6. Si aucun fichier avec patch, log et retourner
  7. Nettoyer les anciennes reviews via `cleanupOldReviews()`
  8. Lancer les reviews fichier par fichier via `reviewFiles()`
  9. Generer le resume via `generateSummary()`
  10. Poster la review avec commentaires inline via `postReview()`
  11. Poster le resume en commentaire via `postSummaryComment()`

- [x] **5.2** Ajouter la gestion d'erreurs globale dans `index.ts` :
  1. Wrapper tout dans un `try/catch`
  2. En cas d'erreur, poster un commentaire d'erreur sur la PR : "Z.ai Code Review encountered an error: {message}"
  3. Appeler `core.setFailed()` avec le message d'erreur
  4. Logger les details avec `core.error()`

- [x] **5.3** Ajouter le logging detaille avec `core.info()` et `core.debug()` :
  - `core.info("Fetching changed files...")`
  - `core.info("Found {n} files with patches")`
  - `core.info("Reviewing file {i}/{total}: {filename}")`
  - `core.info("Posted {n} inline comments")`
  - `core.debug("AI response for {filename}: {rawResponse}")`
  - `core.info("Review complete. Status: {status}")`

- [x] **5.4** Ajouter la gestion des cas limites :
  1. PR sans fichiers modifies -> log "No changes found" et terminer normalement
  2. Fichiers sans patch (binaire, images) -> ignorer silencieusement
  3. Fichier supprime (status=removed) -> ne pas reviewer
  4. Fichier renomme (status=renamed) -> reviewer si patch present
  5. Tous les fichiers exclus -> log "All files excluded" et terminer
  6. Reponse IA vide -> log warning et passer au fichier suivant
  7. Timeout API -> retry puis skip le fichier
  8. Plus de 50 commentaires -> limiter aux 50 plus importants (tri par severity)

### Phase 6 : Build + Tests

- [x] **6.1** Ajouter le script de build dans `package.json` : `"build": "ncc build src/index.ts -o dist --license licenses.txt"`
- [x] **6.2** Verifier que `ncc` genere bien un fichier `dist/index.js` autonome qui inclut toutes les dependances
- [x] **6.3** Tester manuellement avec un workflow GitHub Actions sur une PR de test
- [x] **6.4** Creer `.github/workflows/code-review.yml` pour l'action elle-meme (workflow d'exemple) :

```yaml
name: AI Code Review with Z.ai
on:
  pull_request:
    types: [opened, synchronize]
permissions:
  pull-requests: write
  contents: read
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Code Review
        uses: ./
        with:
          ZAI_API_KEY: ${{ secrets.ZAI_API_KEY }}
```

## Criteres de verification

- [x] L'action se declenche sur `pull_request` (opened, synchronize)
- [x] Les commentaires sont postes **inline** sur les lignes specifiques du diff via `pulls.createReview`
- [x] Les suggestions de code sont applicables en 1 clic via le bloc ```suggestion```
- [x] Un resume global est poste en commentaire de la PR avec le marker `<!-- zai-code-review -->`
- [x] Les fichiers exclus par les patterns ne sont pas analyses
- [x] L'action ne plante pas sur les PR sans diffs, fichiers binaires, ou patches vides
- [x] Les anciennes reviews sont nettoyees avant d'en poster de nouvelles
- [x] Le statut de la review (APPROVE/REQUEST_CHANGES/COMMENT) est correct selon la severite des findings
- [x] Le build `dist/index.js` est autonome et fonctionne sans `npm install`
- [x] Le retry avec backoff fonctionne sur les erreurs 429/5xx de l'API Z.ai
- [x] Le parsing du diff calcule correctement les positions pour les commentaires inline

## Risques et mitigations

1. **Calcul incorrect du `position` dans le diff**
   Mitigation: Le `position` n'est PAS le numero de ligne du fichier. C'est un index dans le diff unifie. Implementer un parser de patch rigoureux avec des tests unitaires. Alternative : utiliser `line` + `side: "RIGHT"` au lieu de `position` (API plus moderne et plus simple).

2. **Reponse IA non structuree (pas du JSON valide)**
   Mitigation: Parser robuste avec regex de extraction JSON. Fallback vers un commentaire global en texte brut si le JSON echoue. Le prompt insiste sur "ONLY valid JSON".

3. **Rate limiting API Z.ai**
   Mitigation: Throttling avec concurrence limitee a 3 appels paralleles. Retry avec backoff exponentiel (1s, 2s, 4s) sur 429. Timeout de 120s par appel.

4. **Gros diffs qui depassent le contexte du modele**
   Mitigation: Chunking par hunks avec une limite de 500 lignes par chunk. Prioriser les fichiers avec le plus de changements.

5. **Limites de commentaires GitHub (max ~50 par review)**
   Mitigation: Si plus de 50 commentaires, trier par severite et ne garder que les 50 plus importants. Regrouper les feedbacks mineurs dans le resume.

6. **Token GitHub sans permission `pull-requests: write`**
   Mitigation: Verifier les permissions au demarrage. Attraper l'erreur 403 et afficher un message clair demandant d'ajouter `permissions: pull-requests: write` dans le workflow.

## Approches alternatives

1. **Utiliser `line` + `side` au lieu de `position`** : L'API GitHub supporte `line` (numero de ligne dans le fichier) au lieu de `position` (index dans le diff). C'est beaucoup plus simple car l'IA peut directement indiquer le numero de ligne. Inconvenient : necessite aussi `commit_id` et `side: "RIGHT"`. **C'est l'approche recommandee** car elle evite le parsing complexe du diff pour calculer les positions.

2. **Utiliser les GitHub Checks API** : Permet d'afficher les annotations dans l'onglet "Checks". Moins visible que les commentaires inline. Option complementaire pour une v2.

3. **Fichier de configuration dans le repo** (`.zai-review.yml`) : Permettrait aux utilisateurs de configurer des regles par projet (fichiers a exclure, regles custom, etc.). A considerer pour une v2.

4. **Streaming des reponses IA** : Utiliser le streaming de l'API Z.ai pour afficher les commentaires progressivement. Complexite elevee pour un gain marginal dans le contexte d'une GitHub Action.
