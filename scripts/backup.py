#!/usr/bin/env python3
"""
Ежедневный backup SQLite-базы kalashyulya.

- Делает атомарный бэкап через sqlite3.Connection.backup() (Online Backup API).
- Это безопасно даже при активной записи в БД (WAL mode).
- Сохраняет в /var/www/kalashyulya/backups/daily/data-YYYY-MM-DD.db
- Дополнительно: 1 раз в неделю копия в backups/weekly/
- Ротация: 7 daily + 4 weekly, старые удаляются.
- Также проверяет что backup валиден (open + integrity_check).
"""
import os
import shutil
import sqlite3
import sys
from datetime import datetime, timedelta
from pathlib import Path

DB_PATH = Path("/var/www/kalashyulya/data/data.db")
BACKUP_DIR = Path("/var/www/kalashyulya/backups")
DAILY_DIR = BACKUP_DIR / "daily"
WEEKLY_DIR = BACKUP_DIR / "weekly"
DAILY_KEEP = 7
WEEKLY_KEEP = 4
LOG_PREFIX = "[kalashyulya-backup]"


def log(msg: str) -> None:
    print(f"{LOG_PREFIX} {datetime.now().isoformat(timespec='seconds')} {msg}", flush=True)


def rotate(dir_path: Path, keep: int) -> None:
    """Оставляет только `keep` самых свежих файлов в директории."""
    if not dir_path.exists():
        return
    files = sorted(dir_path.iterdir(), key=lambda p: p.name, reverse=True)
    for old in files[keep:]:
        try:
            old.unlink()
            log(f"  rotated: {old.name}")
        except OSError as e:
            log(f"  WARN: cannot delete {old}: {e}")


def is_sunday() -> bool:
    return datetime.now().weekday() == 6  # Monday=0, Sunday=6


def verify_backup(backup_path: Path) -> bool:
    """Открывает backup и запускает integrity_check."""
    try:
        conn = sqlite3.connect(f"file:{backup_path}?mode=ro", uri=True)
        try:
            result = conn.execute("PRAGMA integrity_check").fetchone()
            ok = result and result[0] == "ok"
            if not ok:
                log(f"  integrity_check FAILED: {result}")
            return ok
        finally:
            conn.close()
    except sqlite3.Error as e:
        log(f"  cannot verify: {e}")
        return False


def main() -> int:
    if not DB_PATH.exists():
        log(f"FATAL: source DB not found: {DB_PATH}")
        return 1

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    DAILY_DIR.mkdir(parents=True, exist_ok=True)
    WEEKLY_DIR.mkdir(parents=True, exist_ok=True)

    today = datetime.now().strftime("%Y-%m-%d")
    daily_path = DAILY_DIR / f"data-{today}.db"
    log(f"backup: {DB_PATH} → {daily_path}")

    # 1) Сначала checkpoint чтобы WAL сбросился в основной файл
    try:
        conn = sqlite3.connect(DB_PATH)
        try:
            conn.execute("PRAGMA wal_checkpoint(TRUNCATE)")
        finally:
            conn.close()
    except sqlite3.Error as e:
        log(f"WARN: wal_checkpoint failed: {e}")

    # 2) Online Backup API (атомарно, без блокировки)
    try:
        src = sqlite3.connect(DB_PATH)
        dst = sqlite3.connect(daily_path)
        try:
            with dst:
                src.backup(dst)
        finally:
            src.close()
            dst.close()
    except sqlite3.Error as e:
        log(f"FATAL: backup failed: {e}")
        return 1

    # 3) Проверка
    if not verify_backup(daily_path):
        log("FATAL: backup verification failed, removing")
        daily_path.unlink(missing_ok=True)
        return 1

    size = daily_path.stat().st_size
    log(f"  ok: {size:,} bytes")

    # 4) Weekly копия (только по воскресеньям)
    if is_sunday():
        weekly_path = WEEKLY_DIR / f"data-{today}.db"
        shutil.copy2(daily_path, weekly_path)
        log(f"  weekly copy: {weekly_path.name}")

    # 5) Ротация
    rotate(DAILY_DIR, DAILY_KEEP)
    rotate(WEEKLY_DIR, WEEKLY_KEEP)

    log("done")
    return 0


if __name__ == "__main__":
    sys.exit(main())