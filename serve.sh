#!/bin/bash

screen -dmS FireLine sh
#screen -S FireLine -X stuff "serve -s node/build
#"
screen -S FireLine -X stuff "serve -s node/build
"
rm -rf public/*
cp -r node/build/* public/
