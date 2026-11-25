from django.db.models import Q, Value
from django.db.models.functions import Concat


def recipient_label(user):
    return (user.get_full_name() or user.username) if user else ""


def search_recipients(users, search):
    if not search:
        return users
    return users.alias(full_name=Concat("first_name", Value(" "), "last_name")).filter(
        Q(full_name__icontains=search) | Q(username__icontains=search)
    )


def matches_recipient(user, search):
    return search in recipient_label(user).casefold() or search in user.username.casefold()
