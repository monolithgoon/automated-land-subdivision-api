@echo off
setlocal enabledelayedexpansion

for /f "tokens=*" %%a in (default.env) do (
    set %%a
    heroku config:set !line!
)

endlocal

