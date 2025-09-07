
### **Titre du Projet : Piano Hero**

#### **1. Vue d'ensemble du projet**

L'objectif est de développer "Piano Hero", un jeu de rythme pour navigateur web inspiré de *Guitar Hero*. Le joueur doit appuyer sur des touches de son clavier au bon moment, en synchronisation avec des notes qui défilent à l'écran, pour jouer une mélodie sur un piano virtuel. Le jeu met l'accent sur la précision, le combo et le score. Il sera développé en **TypeScript** et compilé en un unique fichier **JavaScript (vanilla)**, sans dépendre d'un framework front-end majeur.

---

### **2. Architecture et Technologies**

#### **2.1. Technologies principales**
* **Langage :** TypeScript (compilé en JavaScript ES6+)
* **Moteur de rendu :** HTML5 (DOM) ou Canvas 2D. Le rendu via des éléments DOM est préférable pour une manipulation plus simple avec CSS.
* **Styling :** CSS3. Les animations (feedback visuel, illumination des touches) doivent être prioritairement réalisées en CSS pour de meilleures performances.
* **Audio :** Web Audio API pour la génération de sons de piano en temps réel.
* **Bundler/Compilateur :** Webpack ou le compilateur TypeScript (TSC) pour transpiler et bundler tout le code source TypeScript en un seul fichier `bundle.js`. La configuration doit impérativement générer un fichier source map (`.js.map`) pour faciliter le débogage dans le navigateur.

#### **2.2. Structure des fichiers**
Le projet doit suivre une structure modulaire claire pour séparer les responsabilités.

```
/piano-hero
|
|-- /dist                   // Fichiers compilés pour la production
|   |-- bundle.js
|   |-- bundle.js.map
|   |-- index.html
|   |-- style.css
|
|-- /src                    // Code source TypeScript
|   |-- /modules            // Modules principaux du jeu
|   |   |-- GameEngine.ts   // Cœur de la logique du jeu
|   |   |-- Renderer.ts     // Gestion de l'affichage et du DOM
|   |   |-- InputHandler.ts // Gestion des entrées clavier
|   |   |-- AudioEngine.ts  // Gestion du son via Web Audio API
|   |   |-- UI.ts           // Gestion des éléments d'interface (score, etc.)
|   |   |-- SongLoader.ts   // Chargement des partitions JSON
|   |   |-- Note.ts         // Classe ou interface pour représenter une note
|   |   |-- Stats.ts        // Calcul et affichage des statistiques
|   |
|   |-- main.ts             // Point d'entrée de l'application
|
|-- /songs                  // Fichiers de partitions
|   |-- songs.json          // Liste des chansons disponibles
|   |-- happy-birthday.json // Exemple de partition
|
|-- package.json
|-- tsconfig.json
|-- webpack.config.js       // (si Webpack est utilisé)

```
---

### **3. Spécifications des Modules (Code)**

#### **3.1. `GameEngine.ts` (Le cœur du jeu)**
Ce module est le chef d'orchestre. Il ne doit **pas** interagir directement avec le DOM.
* **Responsabilités :**
    * Gérer l'état du jeu : `isPlaying`, `score`, `combo`, `comboMultiplier`, `currentTime`.
    * Contenir la boucle de jeu principale pour la logique (`update`), qui s'exécute à intervalle fixe (ex: `setInterval(update, 1000/60)`). Cette boucle est indépendante du rendu.
    * Charger la partition (via `SongLoader`) et gérer la file d'attente des notes à venir.
    * Calculer la position théorique des notes à chaque `tick` logique en fonction de `currentTime`.
    * Traiter les entrées du joueur reçues de `InputHandler`.
    * Valider la précision d'une note jouée, calculer le score, mettre à jour le combo et les statistiques.
    * Gérer la logique des notes longues (début du maintien, fin du maintien).
    * Détecter les notes manquées (celles qui dépassent la ligne de jeu sans être jouées).

#### **3.2. `Renderer.ts` (Le moteur de rendu)**
Ce module gère tout ce qui est visuel.
* **Responsabilités :**
    * Contenir la boucle de rendu principale (`render`), qui s'exécute avec `requestAnimationFrame()`.
    * Créer, déplacer et supprimer les éléments DOM représentant les notes qui tombent. La position de chaque note est lue depuis l'état maintenu par `GameEngine`.
    * Afficher les animations de feedback ("Perfect", "Good", "Poor") lorsqu'une note est jouée.
    * Mettre à jour visuellement les éléments d'interface (score, combo) en lisant les données de `UI.ts` ou `GameEngine.ts`.
    * Faire "briller" la touche du piano virtuel correspondante lorsqu'une touche est enfoncée.

#### **3.3. `InputHandler.ts` (Gestion des entrées)**
* **Responsabilités :**
    * Écouter les événements `keydown` et `keyup` sur l'objet `window`.
    * Utiliser les `keyMappings` fournis pour traduire la touche du clavier en note de musique (ex: 'a' -> 'C4').
    * Notifier `GameEngine` lorsqu'une note est jouée (`onNotePressed(note)`) ou relâchée (`onNoteReleased(note)`).
    * Prévenir le comportement par défaut des touches pour éviter des actions non désirées dans le navigateur.

#### **3.4. `AudioEngine.ts` (Moteur audio)**
* **Responsabilités :**
    * Initialiser le `AudioContext` de la Web Audio API.
    * Créer une méthode `playNote(note, duration)` qui génère un son (via `OscillatorNode`) à la fréquence correspondante (en utilisant `noteFrequencies`).
    * Permettre de jouer des sons de différentes durées pour les notes longues.

#### **3.5. `SongLoader.ts` (Chargement des chansons)**
* **Responsabilités :**
    * Charger et parser le fichier principal `songs/songs.json`.
    * Fournir une fonction pour charger une partition spécifique par son chemin de fichier (ex: `loadSong('songs/happy-birthday.json')`).
    * Implémenter une fonction pour gérer l'upload d'un fichier JSON par l'utilisateur via un `<input type="file">` et l'API `FileReader`.

#### **3.6. `UI.ts` (Interface utilisateur)**
* **Responsabilités :**
    * Contrôler les éléments non liés au gameplay principal : menu de sélection de chanson, écran de fin de partie, affichage des statistiques.
    * Générer dynamiquement la liste des chansons à partir des données de `SongLoader`.
    * Afficher le graphique de score en fin de partie. Une bibliothèque légère comme **Chart.js** peut être utilisée, ou un simple dessin sur un `<canvas>`.

---

### **4. Logique de Gameplay Détaillée**

#### **4.1. Le déroulement d'une partie**
1.  **Préparation :** Le jeu démarre. Le `currentTime` du `GameEngine` est initialisé à `-5.0` secondes.
2.  **Décompte :** Le temps progresse de -5 à 0. Pendant ce temps, les premières notes de la chanson sont déjà en train de "tomber" depuis le haut de l'écran, pour que la première note arrive sur la ligne de jeu exactement à `currentTime = 0`.
3.  **Jeu :** Le joueur joue les notes. `GameEngine` met à jour le score, le combo, et les statistiques.
4.  **Fin :** Une fois la dernière note passée, la partie se termine.
5.  **Statistiques :** L'écran de fin s'affiche avec le résumé de la performance.

#### **4.2. Calcul du score et du combo**
* **Points de base par note :**
    * Perfect : 100 points
    * Good : 50 points
    * Poor : 25 points
* **Combo Multiplier :**
    * 0-3 notes réussies : **x1**
    * 4-7 notes réussies : **x2**
    * 8-11 notes réussies : **x4**
    * 12-15 notes réussies : **x6**
    * 16+ notes réussies : **x8** (maximum)
* Le combo est **réinitialisé à 0** si une note est manquée.
* **Score final pour une note =** `Points de base * Combo Multiplier`.
* **Notes longues :** En plus des points de base à l'impact, elles rapportent des points supplémentaires (ex: 5 points par `tick`) tant que la touche est maintenue. Relâcher la touche en avance arrête simplement le gain de points supplémentaires mais ne brise pas le combo.

#### **4.3. Fenêtres de précision (Timing)**
La ligne de jeu est la référence "temps zéro". Si une note est censée être jouée à `t_note` :
* **Perfect :** L'appui a lieu entre `t_note - 16.7ms` et `t_note + 16.7ms`.
* **Good :** L'appui a lieu entre (`t_note - 40ms` et `t_note - 16.7ms`) OU (`t_note + 16.7ms` et `t_note + 40ms`).
* **Poor :** L'appui a lieu entre (`t_note - 80ms` et `t_note - 40ms`) OU (`t_note + 40ms` et `t_note + 80ms`).
* **Miss :** Si la note dépasse `t_note + 80ms` sans avoir été jouée.

#### **4.4. Gestion des accords (plusieurs notes simultanées)**
Le `GameEngine` doit, à chaque appui de touche, parcourir **toutes** les notes actives (celles proches de la ligne de jeu) pour trouver une correspondance. Il ne doit pas s'arrêter après avoir trouvé la première. Ceci permet de valider correctement les accords où plusieurs notes ont le même `time`.

---

### **5. Configuration du projet**

#### **5.1. `tsconfig.json`**
Un fichier de configuration de base pour TypeScript.
```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ES6",
    "strict": true,
    "outDir": "./dist",
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"]
}
```

#### **5.2. webpack.config.js (Exemple)**
```JavaScript

const path = require('path');

module.exports = {
  entry: './src/main.ts',
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```
