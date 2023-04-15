#!/bin/bash

git clone https://github.com/floe/smc_util.git
cd smc_util
gcc -O2 -o SmcDumpKey SmcDumpKey.c -Wall
sudo sh -c 'cp ./SmcDumpKey /usr/local/bin/ && chown root /usr/local/bin/SmcDumpKey && chmod u+s /usr/local/bin/SmcDumpKey'
cd ..
rm -rf smc_util
echo 'SmcDumpKey command installed at /usr/local/bin/'
