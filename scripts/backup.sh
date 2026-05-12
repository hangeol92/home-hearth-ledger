#!/bin/bash
# Five Jars DB 백업 스크립트
# 사용법: ./scripts/backup.sh [비밀번호]
# 예시:   ./scripts/backup.sh mypassword

export PATH="/opt/homebrew/opt/libpq/bin:$PATH"

PASSWORD=${1:?"사용법: $0 [DB비밀번호]"}
DATE=$(date +%Y%m%d_%H%M)
FILE="backup_${DATE}.sql"
DB_URL="postgresql://postgres:${PASSWORD}@db.nyostyrllqldfihqnotf.supabase.co:5432/postgres"

echo "백업 시작: $FILE"
pg_dump "$DB_URL" -f "$FILE"

if [ $? -eq 0 ]; then
  SIZE=$(du -sh "$FILE" | cut -f1)
  echo "완료: $FILE ($SIZE)"
else
  echo "백업 실패"
  exit 1
fi
