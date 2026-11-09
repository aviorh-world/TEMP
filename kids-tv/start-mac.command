#!/bin/bash
# Double-click on Mac (or run in a Linux terminal). Serves the site on http://localhost:8765
cd "$(dirname "$0")"
PORT=8765
( sleep 1; open "http://localhost:$PORT/" 2>/dev/null || xdg-open "http://localhost:$PORT/" ) &
echo "הטלוויזיה שלי פועלת: http://localhost:$PORT/  (Ctrl+C כדי לעצור)"
python3 -m http.server $PORT --bind 127.0.0.1
