#!/usr/bin/env python3
"""
Revert changes made by navigation generation scripts.

Restores .bak files created by the generation scripts.
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path


def find_backup_files(directory: Path) -> list[Path]:
    """Find all .bak files in the directory tree."""
    return list(directory.rglob("*.bak"))


def restore_backup(backup_path: Path, dry_run: bool = False) -> bool:
    """Restore a backup file to its original location."""
    # Remove .bak extension
    original_path = backup_path.with_suffix("")

    if dry_run:
        print(f"  🔍 Would restore: {backup_path} -> {original_path}")
        return True

    try:
        shutil.copy2(backup_path, original_path)
        backup_path.unlink()  # Remove backup after restoration
        print(f"  ✅ Restored: {original_path}")
        return True
    except Exception as e:
        print(f"  ❌ Failed to restore {backup_path}: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Revert changes by restoring .bak files"
    )
    parser.add_argument(
        "--apply", action="store_true", help="Apply changes (default: dry-run)"
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path.cwd(),
        help="Repository root directory",
    )
    parser.add_argument(
        "--keep-backups",
        action="store_true",
        help="Keep backup files after restoration",
    )

    args = parser.parse_args()

    repo_root = args.repo_root.resolve()

    print(f"🔍 Searching for backup files in {repo_root}...")
    backup_files = find_backup_files(repo_root)

    if not backup_files:
        print("✅ No backup files found")
        return

    print(f"📁 Found {len(backup_files)} backup files:")
    for backup in sorted(backup_files):
        print(f"  - {backup.relative_to(repo_root)}")

    if not args.apply:
        print("\n💡 Run with --apply to restore these files")
        return

    print("\n🔄 Restoring backups...")
    restored = 0
    failed = 0

    for backup in sorted(backup_files):
        if restore_backup(backup, dry_run=False):
            restored += 1
        else:
            failed += 1

    print("\n📊 Summary:")
    print(f"  Restored: {restored}")
    print(f"  Failed: {failed}")

    if failed == 0:
        print("\n🎉 All backups restored successfully!")
    else:
        print("\n⚠️  Some restorations failed. Check error messages above.")


if __name__ == "__main__":
    main()
