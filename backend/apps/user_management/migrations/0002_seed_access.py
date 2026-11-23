from django.db import migrations


def seed_access(apps, schema_editor):
    Role = apps.get_model("user_management", "Role")
    Assignment = apps.get_model("user_management", "PlatformRoleAssignment")
    User = apps.get_model("authentication", "User")
    Profile = apps.get_model("authentication", "UserProfile")
    builtins = (
        ("platform", "user", "کاربر", []),
        ("platform", "admin", "مدیر سامانه", ["platform.admin"]),
        ("platform", "support", "پشتیبان", ["messaging.support_queue"]),
        ("platform", "professor", "استاد", ["profile.research_groups"]),
        ("platform", "student", "دانشجو", ["profile.research_groups"]),
        ("group", "group-admin", "مدیر گروه", ["group.manage_wallet"]),
        ("group", "professor", "استاد", ["group.mentor"]),
        ("group", "student", "دانشجو", ["group.student"]),
    )
    roles = {}
    for scope, code, label, permissions in builtins:
        roles[scope, code], _ = Role.objects.get_or_create(
            scope=scope, code=code,
            defaults={"label": label, "capabilities": permissions, "builtin": True},
        )

    for legacy, label in (("manager", "مدیر پیشین"), ("guest", "مهمان پیشین")):
        if User.objects.filter(role=legacy).exists():
            roles["platform", legacy], _ = Role.objects.get_or_create(
                scope="platform", code=legacy, defaults={"label": label},
            )

    for user in User.objects.iterator(chunk_size=500):
        Profile.objects.get_or_create(
            user_id=user.pk, defaults={"first_name": user.first_name, "last_name": user.last_name},
        )
        if user.is_active and user.is_superuser:
            role = roles["platform", "admin"]
        elif user.role in ("manager", "guest"):
            role = roles["platform", user.role]
        else:
            continue
        Assignment.objects.get_or_create(user_id=user.pk, role_id=role.pk)


class Migration(migrations.Migration):
    dependencies = [
        ("user_management", "0001_initial"),
        ("authentication", "0005_remove_userprofile_bio"),
    ]

    operations = [migrations.RunPython(seed_access, migrations.RunPython.noop)]
