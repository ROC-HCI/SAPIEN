@echo off

for /L %%i in (1,1,2) do (
     start "" ".\platform_scripts\cmd\run_local.bat" --configFile=config%%i.json
)