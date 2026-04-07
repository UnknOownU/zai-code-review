# Z.ai Code Review

[![GitHub Actions Status](https://img.shields.io/github/actions/workflow/status/UnknOownU/zai-code-review/review.yml?branch=master)](https://github.com/UnknOownU/zai-code-review/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **[English version](README.md)**

Z.ai Code Review est une GitHub Action qui utilise l'API Z.ai pour fournir des revues de code automatisees et intelligentes. Elle analyse les diffs de pull requests pour identifier les bugs, les failles de securite et les erreurs logiques, en fournissant des retours via des commentaires inline et des resumes de PR complets.

## Fonctionnalites principales

- **Commentaires inline automatises** : Retours precis sur des lignes de code specifiques avec titres, descriptions et niveaux de severite.
- **Suggestions de code intelligentes** : Ameliorations de code applicables en un clic directement dans l'interface GitHub.
- **Resumes de PR** : Synthese de toutes les trouvailles par fichier en un apercu global avec liste des changements fonctionnels et evaluation des risques.
- **Gestion des gros diffs** : Decoupe automatique des diffs volumineux en morceaux gerables par l'IA tout en preservant la precision des numeros de ligne.
- **Client API fiable** : Logique de retry avec backoff exponentiel et timeouts configurables pour gerer les limites de taux et les erreurs transitoires.
- **Reduction du bruit** : Nettoyage des anciens commentaires de revue a chaque nouveau push pour garder la conversation de PR propre.
- **Traitement concurrent** : Revue simultanee de plusieurs fichiers pour un traitement rapide des grosses pull requests.
- **Logique personnalisable** : Support de prompts systeme personnalises pour adapter le comportement du reviewer aux standards de l'equipe.

## Demarrage rapide

Ajouter le fichier workflow suivant dans le depot a `.github/workflows/zai-review.yml` :

```yaml
name: Z.ai Code Review

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Z.ai Code Review
        uses: UnknOownU/zai-code-review@master
        with:
          ZAI_API_KEY: ${{ secrets.ZAI_API_KEY }}
```

## Configuration

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `ZAI_API_KEY` | string | **Requis** | Cle API Z.ai pour l'authentification. |
| `ZAI_MODEL` | string | `glm-4.7` | Modele Z.ai a utiliser pour l'analyse. |
| `ZAI_SYSTEM_PROMPT` | string | `""` | Remplacement optionnel des instructions systeme de l'IA. |
| `ZAI_REVIEWER_NAME` | string | `Z.ai Code Review` | Nom affiche dans les commentaires de revue. |
| `GITHUB_TOKEN` | string | `${{ github.token }}` | Token GitHub pour l'acces API. Necessite `pull-requests: write`. |
| `max_files` | number | `20` | Nombre maximum de fichiers a analyser par PR. |
| `exclude_patterns` | string | (voir ci-dessous) | Patterns glob separes par des virgules a exclure. |
| `language` | string | `en` | Langue des commentaires (`en` ou `fr`). |
| `auto_approve` | boolean | `false` | Approuver automatiquement la PR si aucun probleme n'est trouve. |
| `max_comments` | number | `50` | Nombre maximum de commentaires inline par revue. |
| `ai_base_url` | string | `https://api.z.ai` | URL de base de l'API Z.ai. |

## Fonctionnement

1. **Declenchement** : L'action s'active quand une pull request est ouverte ou mise a jour.
2. **Collecte du contexte** : Recuperation du diff de la PR et identification des fichiers modifies, en filtrant les binaires et les chemins exclus.
3. **Analyse IA** : Les fichiers sont traites en parallele. Les gros fichiers sont decoupes en morceaux. L'IA analyse le code avec une approche "Bug-First", en se concentrant sur la logique, la securite et la performance.
4. **Validation** : Les trouvailles sont mappees des positions relatives au diff vers les numeros de ligne absolus du fichier.
5. **Rapport** :
   - Suppression des commentaires obsoletes des executions precedentes.
   - Publication de nouveaux commentaires inline avec marqueurs de severite.
   - Generation d'un commentaire resume contenant le verdict de la revue et les trouvailles cles.

## Prompts personnalises

Remplacer le comportement par defaut en fournissant un `ZAI_SYSTEM_PROMPT`. Le prompt par defaut impose un format de sortie JSON et se concentre sur :
- Les erreurs logiques et les erreurs de decalage.
- Les failles de securite comme l'injection SQL ou l'exposition de secrets.
- Les goulots de performance comme les requetes N+1.

En cas de prompt personnalise, s'assurer qu'il demande a l'IA de retourner un objet JSON valide correspondant au schema interne.

## Langues supportees

L'action supporte `en` (anglais) et `fr` (francais) pour tous les retours generes :

```yaml
with:
  language: fr
```

## Exclusion de fichiers

Exclure des fichiers ou repertoires specifiques avec le parametre `exclude_patterns`. Supporte les valeurs separees par des virgules et les patterns de type glob :

- `*.min.js` (par extension)
- `tests/*` (par repertoire)
- `generated.ts` (correspondance exacte)

**Exclusions par defaut** : `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `*.min.js`, `*.min.css`, `*.bundle.js`, `*.map`.

## Developpement

Prerequis : Node.js 20+ et pnpm.

```bash
pnpm install       # Installer les dependances
pnpm run check     # Verification de types + build
pnpm run build     # Build uniquement
```

Le projet utilise `@vercel/ncc` pour bundler le code source TypeScript en un seul fichier de distribution requis par GitHub Actions.

## Licence

Ce projet est sous licence MIT.
