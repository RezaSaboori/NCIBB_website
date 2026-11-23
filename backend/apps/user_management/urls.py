from django.urls import path

from . import accounts, groups

urlpatterns = [
    path("users/", accounts.UsersView.as_view()),
    path("users/<int:pk>/", accounts.UserDetailView.as_view()),
    path("users/<int:pk>/access/", accounts.UserAccessView.as_view()),
    path("users/<int:pk>/projects/", accounts.UserProjectsView.as_view()),
    path("users/<int:pk>/conversations/", accounts.UserConversationsView.as_view()),
    path("users/<int:pk>/conversations/<int:thread_id>/", accounts.UserConversationMessagesView.as_view()),
    path("users/<int:pk>/credits/", accounts.UserCreditHistoryView.as_view()),
    path("users/<int:pk>/audit/", accounts.UserAuditView.as_view()),
    path("roles/", accounts.RoleListView.as_view()),
    path("roles/<int:pk>/", accounts.RoleDetailView.as_view()),
    path("role-capabilities/", accounts.PermissionCatalogView.as_view()),
    path("groups/", groups.GroupsView.as_view()),
    path("research-groups/", groups.ResearchGroupsView.as_view()),
    path("groups/<int:pk>/", groups.GroupDetailView.as_view()),
    path("groups/<int:pk>/members/", groups.GroupMembersView.as_view()),
    path("groups/<int:pk>/members/<int:user_id>/", groups.GroupMembershipView.as_view()),
    path("groups/<int:pk>/spending/<int:membership_id>/", groups.GroupSpendingView.as_view()),
    path("groups/<int:pk>/wallet/", groups.GroupWalletView.as_view()),
    path("groups/<int:pk>/mentors/", groups.GroupMentorsView.as_view()),
    path("groups/<int:pk>/mentors/<int:link_id>/", groups.GroupMentorsView.as_view()),
]
