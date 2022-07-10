@echo off

if "%1" == "update" (
  docker-compose rm -fsv app
  docker-compose up -d --build app
) else (
  docker-compose up -d --build
)
