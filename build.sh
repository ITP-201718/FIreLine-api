#!/bin/bash

./stop.sh
cd node
npm run build
cd ..
./serve.sh

