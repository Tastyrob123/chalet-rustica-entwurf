#!/usr/bin/env bash
# Chalet Rustica: alle Server der Werkzeuge und der Werkbank starten (Ports 9521–9529, 09.11.2026) und warten, bis jeder antwortet.
# Läuft ein Port schon, bleibt er. Logs: _werkzeuge/_server/<port>.log. Beenden nur per PID (lsof -t -iTCP:<port> -sTCP:LISTEN), nie pkill.
H="$(cd "$(dirname "$0")/.." && pwd)"; L="$H/_werkzeuge/_server"; mkdir -p "$L"
LISTE="9521|_werkzeuge/maison|python3 server.py 9521|/_werkzeuge/maison/
9522|.|python3 _werkzeuge/bureau/serve.py 9522|/_werkzeuge/bureau/
9523|.|python3 _werkzeuge/carte/serve.py 9523|/_werkzeuge/carte/
9524|.|python3 _werkzeuge/reception/server.py 9524|/_werkzeuge/reception/
9525|_werkzeuge/livre|python3 server.py 9525|/_werkzeuge/livre/
9526|.|python3 _werkzeuge/registre/server.py 9526|/_werkzeuge/registre/
9527|_werkzeuge/imprimerie|python3 serve.py 9527|/_werkzeuge/imprimerie/
9528|.|python3 website/_werkbank/serve.py 9528|/werkbank/index.html
9529|.|python3 _werkzeuge/web_serve.py 9529|/index.html"
NUR="$1"
echo "$LISTE" | while IFS='|' read -r port wo befehl pruef; do
  [ -n "$NUR" ] && [ "$NUR" != "$port" ] && continue
  lsof -t -iTCP:$port -sTCP:LISTEN >/dev/null 2>&1 && continue
  ( cd "$H/$wo" && nohup $befehl > "$L/$port.log" 2>&1 & )
done
sleep 2
echo "$LISTE" | while IFS='|' read -r port wo befehl pruef; do
  [ -n "$NUR" ] && [ "$NUR" != "$port" ] && continue
  c=000; for i in $(seq 1 30); do c=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port$pruef"); [ "$c" = 200 ] && break; sleep 1; done
  echo "$port $c $pruef"
done
