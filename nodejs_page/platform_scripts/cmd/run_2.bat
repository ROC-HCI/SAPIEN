@echo off

for /L %%i in (1,1,2) do (
     start "" run_local.bat --configFile=config%%i.json
)