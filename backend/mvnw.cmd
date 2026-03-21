@echo off
setlocal

set "MAVEN_PROJECTBASEDIR=%~dp0"
set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_LAUNCHER=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties"

REM Check if Maven is available
where mvn >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    mvn %*
    exit /b %ERRORLEVEL%
)

REM Check for Maven in wrapper dist
set "USERPROFILE_DRIVE=%USERPROFILE:~0,2%"
set "USERPROFILE_PATH=%USERPROFILE:\=/%"
set "MVNW_VERBOSE=false"
set "MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6"

if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    "%MAVEN_HOME%\bin\mvn.cmd" %*
    exit /b %ERRORLEVEL%
)

REM Download Maven using PowerShell if not found
echo Downloading Maven...
set "MVNW_DIR=%USERPROFILE%\.m2\wrapper\dists"
set "MVNW_ZIP=%MVNW_DIR%\apache-maven-3.9.6-bin.zip"
if not exist "%MVNW_DIR%" mkdir "%MVNW_DIR%"

powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip' -OutFile '%MVNW_ZIP%' -UseBasicParsing; Expand-Archive -Path '%MVNW_ZIP%' -DestinationPath '%MVNW_DIR%' -Force"

REM Zip extracts to apache-maven-3.9.6 subfolder
set "MAVEN_HOME=%MVNW_DIR%\apache-maven-3.9.6"
if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo Failed to download Maven. Install from https://maven.apache.org or add to PATH.
    exit /b 1
)

"%MAVEN_HOME%\bin\mvn.cmd" %*
exit /b %ERRORLEVEL%
