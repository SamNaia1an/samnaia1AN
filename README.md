# Sam + Naia — V1 avec bouton privé SH

Cette version fonctionne avec **deux accès différents** :

- **Naia** ouvre le lien normal : elle ne voit jamais le bouton `SH`, elle doit faire la vérification photo, puis elle voit les vrais comptes à rebours.
- **Sam** ouvre son lien secret : un tout petit bouton `SH` apparaît en bas à droite. En appuyant dessus, la vérification photo est sautée et toutes les surprises sont disponibles immédiatement, sans compte à rebours.

Les vraies heures restent :

- 27 novembre 2026 à **07:35** (Paris)
- 27 novembre 2026 à **15:00** (Paris)

## 1. Mettre le dossier sur GitHub

1. Décompresse le ZIP.
2. Ouvre ton dépôt GitHub `sam-naia-surprise`.
3. Remplace les anciens fichiers par le contenu de ce dossier.
4. À la racine du dépôt, tu dois voir directement : `app`, `components`, `data`, `public`, `package.json`, etc.
5. Clique sur `Commit changes`.

Si GitHub est déjà relié à Vercel, un nouveau déploiement démarrera automatiquement.

## 2. Créer ta clé privée SH sur Vercel

Dans Vercel :

1. Ouvre ton projet.
2. Va dans `Settings` → `Environment Variables`.
3. Ajoute une variable :

```text
Name: SAM_OWNER_KEY
Value: choisis-une-cle-longue-que-toi-seul-connais
```

Exemple de format :

```text
Sam-27Nov-2026-mon-acces-prive-8472
```

Ne mets pas ta vraie clé dans GitHub.

Après avoir ajouté la variable, fais un nouveau `Redeploy` si Vercel ne le fait pas automatiquement.

## 3. Les deux liens

Supposons que ton site soit :

```text
https://sam-naia-surprise.vercel.app
```

### Lien de Naia

Tu lui envoies uniquement :

```text
https://sam-naia-surprise.vercel.app
```

Elle :

- ne voit pas `SH` ;
- fait la photo d'identification ;
- recommence la vérification à chaque nouvelle ouverture/rechargement ;
- voit le compte à rebours avant 07:35 et 15:00 ;
- ne peut ouvrir les cartes qu'au bon moment.

### Ton lien privé Sam

Si ta clé est :

```text
Sam-27Nov-2026-mon-acces-prive-8472
```

ouvre :

```text
https://sam-naia-surprise.vercel.app/?sh=Sam-27Nov-2026-mon-acces-prive-8472
```

Le serveur vérifie la clé. Si elle est correcte, un **tout petit bouton `SH`** apparaît en bas à droite.

Appuie sur `SH` :

- le site te reconnaît comme Sam ;
- tu sautes la photo ;
- tu peux revoir la lettre ;
- les deux surprises sont immédiatement disponibles ;
- aucun compte à rebours n'apparaît pour toi.

**Ne donne jamais ton lien `?sh=...` à Naia.**

## 4. Première surprise

Elle contient maintenant :

- Sam avec un bouquet de roses ;
- des pétales de rose qui tombent ;
- le texte `Sam t'attend en bas…` ;
- puis `Descends. ♡` ;
- bouton `J'arrive ♡`.

## 5. Deuxième surprise

Le livre affiche `Sam et Naia` sur la couverture.

## 6. Modifier la lettre

Ouvre :

```text
data/content.ts
```

et remplace `letterText` par ton vrai texte.

## 7. Images

Les images sont dans :

```text
public/assets/
```

- `sam.png`
- `naia.png`
- `book-cover.png`

## 8. Important

Le bouton `SH` n'est pas simplement caché en CSS : il n'apparaît qu'après validation de ta clé secrète par le serveur Vercel.
