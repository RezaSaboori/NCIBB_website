#!/usr/bin/env python3
"""Build saved frontend sources and publish a successful build to Nginx's web root."""

import fcntl
import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"
STATE = FRONTEND / ".publish"
DIST = FRONTEND / "dist"
SOURCE_DIRS = ("src", "data", "public", "scripts")
BUILD_FILES = (
    ".gitignore", ".npmrc", "index.html", "package.json", "package-lock.json",
    "tailwind.config.js", "tsconfig.json", "tsconfig.node.json", "vite.config.ts",
)


def inputs():
    files = [FRONTEND / name for name in BUILD_FILES]
    files.extend(FRONTEND.glob(".env*"))
    for directory in SOURCE_DIRS:
        files.extend((FRONTEND / directory).rglob("*"))
    return sorted(path for path in files if path.is_file())


def revision():
    digest = hashlib.sha256()
    for path in inputs():
        info = path.stat()
        digest.update(repr((
            str(path.relative_to(FRONTEND)), info.st_size, info.st_ino,
            info.st_mtime_ns, info.st_ctime_ns,
        )).encode())
    return digest.hexdigest()


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_atomic(path, content, mode=0o644):
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=f".{path.name}.", delete=False) as temp:
        prepared = Path(temp.name)
        try:
            temp.write(content)
            temp.flush()
            os.fchmod(temp.fileno(), mode)
            os.fsync(temp.fileno())
            os.replace(prepared, path)
        finally:
            prepared.unlink(missing_ok=True)


def reusable_modules(workspace):
    modules = FRONTEND / "node_modules"
    installed_lock = modules / ".package-lock.json"
    if not all((modules / ".bin" / name).is_file() for name in ("tsc", "vite")) or not installed_lock.is_file():
        return None
    expected = json.loads((workspace / "package-lock.json").read_text())["packages"]
    installed = json.loads(installed_lock.read_text())["packages"]
    package = json.loads((workspace / "package.json").read_text())
    for key in ("dependencies", "devDependencies", "optionalDependencies"):
        if package.get(key, {}) != expected[""].get(key, {}):
            return None
        if any(f"node_modules/{name}" not in installed for name in package.get(key, {})):
            return None
    for name, entry in installed.items():
        locked = expected.get(name, {})
        if any(entry.get(key) != locked.get(key) for key in ("version", "resolved", "integrity")):
            return None
    return modules


def build_modules(workspace, log):
    shared = reusable_modules(workspace)
    if shared:
        return shared

    version = subprocess.check_output(["node", "--version"])
    digest = hashlib.sha256(version)
    for name in ("package.json", "package-lock.json", ".npmrc"):
        path = workspace / name
        if path.is_file():
            digest.update(path.read_bytes())
    cache = STATE / f"deps-{digest.hexdigest()[:20]}"
    if not (cache / "node_modules").is_dir():
        with tempfile.TemporaryDirectory(prefix="deps-", dir=STATE) as directory:
            intake = Path(directory)
            for name in ("package.json", "package-lock.json", ".npmrc"):
                path = workspace / name
                if path.is_file():
                    shutil.copy2(path, intake / name)
            subprocess.run(["npm", "ci", "--no-audit", "--no-fund"], cwd=intake, stdout=log,
                           stderr=subprocess.STDOUT, check=True)
            intake.rename(cache)
    return cache / "node_modules"


def publish(expected_revision, log):
    with tempfile.TemporaryDirectory(prefix="build-", dir=STATE) as directory:
        workspace = Path(directory)
        for source in inputs():
            target = workspace / source.relative_to(FRONTEND)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)

        (workspace / "node_modules").symlink_to(build_modules(workspace, log), target_is_directory=True)
        subprocess.run(["npm", "run", "build"], cwd=workspace, stdout=log, stderr=subprocess.STDOUT, check=True)

        staged = workspace / "dist"
        html = (staged / "index.html").read_bytes()
        assets = re.findall(rb'(?:src|href)="/(assets/[^"]+)"', html)
        if not assets or not all((staged / path.decode()).is_file() for path in assets):
            raise RuntimeError("Built index.html does not reference a complete set of assets")
        if revision() != expected_revision:
            print("Source files changed during the build. The next run will pick up the new revision.",
                  file=log, flush=True)
            return

        DIST.mkdir(exist_ok=True)
        # Copy assets first. Older hashed assets remain available to tabs using the previous index.
        subprocess.run(["rsync", "-rlt", "--checksum", "--delay-updates", "--chmod=D755,F644",
                        "--exclude=/index.html", f"{staged}/", f"{DIST}/"],
                       stdout=log, stderr=subprocess.STDOUT, check=True)
        write_atomic(DIST / "index.html", html)
        write_atomic(STATE / "release.json", json.dumps({
            "revision": expected_revision,
            "index": hashlib.sha256(html).hexdigest(),
            "published_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        }).encode())
        print("Published frontend to", DIST, file=log, flush=True)


def main():
    STATE.mkdir(mode=0o700, exist_ok=True)
    with (STATE / "publish.lock").open("a") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return

        current = revision()
        marker = STATE / "release.json"
        index = DIST / "index.html"
        if marker.is_file() and index.is_file():
            release = json.loads(marker.read_text())
            if release["revision"] == current and release["index"] == sha256(index):
                return

        with (STATE / "last-build.log").open("w") as log:
            print("Build started at", datetime.now().astimezone().isoformat(timespec="seconds"), file=log, flush=True)
            try:
                publish(current, log)
            except (OSError, subprocess.CalledProcessError, RuntimeError, ValueError) as error:
                print(f"Build or publish failed: {error}", file=log, flush=True)
                raise SystemExit(1) from None


if __name__ == "__main__":
    main()
