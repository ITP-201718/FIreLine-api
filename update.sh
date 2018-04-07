#!/bin/bash

cd node
git fetch --all
git reset --hard origin/master
npm install
cd ..
./build.sh
