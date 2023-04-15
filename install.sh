#!/bin/bash

cd src
zip -r ../bclm.zip ./*
cd ..
gnome-extensions install --force bclm.zip
gnome-extensions enable bclm@muo.jp
rm bclm.zip
