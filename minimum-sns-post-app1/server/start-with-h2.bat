@echo off
cd /d "%~dp0"
echo Starting application with H2 database...
mvn spring-boot:run -Dspring-boot.run.profiles=test
pause
