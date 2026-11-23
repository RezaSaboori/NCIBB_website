from django.db import migrations


def backfill_wallets(apps, schema_editor):
    User = apps.get_model("authentication", "User")
    Wallet = apps.get_model("credits", "UserCredit")
    Group = apps.get_model("user_management", "UserGroup")
    GroupWallet = apps.get_model("credits", "GroupWallet")
    for user_id in User.objects.values_list("pk", flat=True).iterator(chunk_size=500):
        Wallet.objects.get_or_create(user_id=user_id)
    for group_id in Group.objects.values_list("pk", flat=True).iterator(chunk_size=500):
        GroupWallet.objects.get_or_create(group_id=group_id)


class Migration(migrations.Migration):
    dependencies = [
        ("credits", "0002_creditgrant_groupwallet_jobreservation_and_more"),
        ("user_management", "0002_seed_access"),
    ]

    operations = [migrations.RunPython(backfill_wallets, migrations.RunPython.noop)]
