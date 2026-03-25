#!/bin/bash
# MySQL 数据备份脚本，建议加入 crontab: 0 2 * * * /path/to/backup.sh

BACKUP_DIR="/data/backups/woca"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="woca"
DB_USER="${DB_USER:-woca}"
DB_PASS="${DB_PASS:-woca123456}"
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

# 导出数据库
docker exec woca-mysql mysqldump \
  -u"$DB_USER" -p"$DB_PASS" \
  --single-transaction --quick --lock-tables=false \
  "$DB_NAME" | gzip > "$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

echo "[$(date)] 备份完成: ${DB_NAME}_${DATE}.sql.gz"

# 删除超过 KEEP_DAYS 天的旧备份
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$KEEP_DAYS -delete
echo "[$(date)] 清理 ${KEEP_DAYS} 天前的旧备份完成"
