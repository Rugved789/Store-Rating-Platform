@echo off
echo Running database migration...
prisma db push --url="%DATABASE_URL%"
if %ERRORLEVEL% NEQ 0 (
    echo Migration failed!
    exit /b 1
)
echo Database migration completed successfully!