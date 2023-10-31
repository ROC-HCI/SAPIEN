@echo off

for /L %%i in (1,1,3) do (
     start "" run_local.bat --configFile=config%%i.json
)