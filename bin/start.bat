@echo off

setlocal

set prod=false
if "%1" == "--prod" set prod=true
if "%2" == "--prod" set prod=true
if %prod% == true set f=-f docker-compose.prod.yml

if "%1" == "update" (
  docker-compose %f% rm -fsv app
  docker-compose %f% up -d --build app
) else (
  docker-compose %f% up -d --build
)

endlocal
