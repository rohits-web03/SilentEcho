#!/bin/sh
./server &   # start server in background
./worker     # run worker in foreground (keeps container alive)
