@echo off
REM Script de déploiement automatique sur GitHub Pages
REM 1. Build le projet
npx tsc
npx webpack
REM 2. Copie les fichiers de chansons dans dist/songs
if not exist dist\songs mkdir dist\songs
copy songs\*.json dist\songs\
REM 3. Commit et push sur la branche gh-pages
REM On suppose que dist est un dossier suivi par git (ou utilisez subtree)
cd dist

git init
REM Ajoute le remote si besoin (remplacez l'URL si nécessaire)
git remote add origin ..\..
REM Ajoute tous les fichiers
 git add .
git commit -m "Déploiement automatique sur GitHub Pages"
git branch -M gh-pages
git push -f origin gh-pages
cd ..
echo "Déploiement terminé !"
