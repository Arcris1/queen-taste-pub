#!/bin/sh
# Run on the VPS after a new tarball has been unpacked into ~/apps/queen-taste-menu/site.
set -eu
cd "$(dirname "$0")"
docker compose up -d
docker exec queen-taste-menu-web nginx -t
curl -fsS -o /dev/null -w "queen-taste-pub.digitalapps.tech -> %{http_code}\n" https://queen-taste-pub.digitalapps.tech/
