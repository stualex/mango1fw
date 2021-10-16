#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

echo "# mango1fw" >> README.md
git init
git add README.md
git commit -m "deploy"
git branch -M main
git remote add origin https://github.com/stualex/mango1fw.git
git push -u origin main

cd -