#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path


def ensure_supported_django():
    try:
        import django
    except ModuleNotFoundError as error:
        if error.name != "django":
            raise
    else:
        if django.VERSION[:2] == (5, 2):
            return

    manage_path = Path(__file__).resolve()
    project_venv = manage_path.parent / ".venv"
    interpreter = project_venv / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    if (
        os.environ.get("NCIBB_ENV") != "production"
        and Path(sys.prefix).resolve() != project_venv.resolve()
        and interpreter.is_file()
    ):
        os.execv(str(interpreter), [str(interpreter), str(manage_path), *sys.argv[1:]])

    raise SystemExit(
        "NCIBB requires Django 5.2. From backend/, install the project dependencies with "
        "'.venv/bin/python -m pip install -r requirements.txt'. "
        "If needed, first create the environment with 'python3 -m venv .venv'."
    )


def main():
    """Run administrative tasks."""
    ensure_supported_django()
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ncibb.settings')
    from django.core.management import execute_from_command_line

    if sys.argv[1:2] == ["runserver"]:
        from django.core.management.commands.runserver import Command

        Command.default_port = "8317"

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
