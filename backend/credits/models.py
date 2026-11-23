from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class UserCredit(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='credits')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    monthly_balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    held_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    held_permanent = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    period = models.CharField(max_length=7, blank=True)
    total_earned = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal('0.00'))
    total_spent = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_credits'
        verbose_name = 'User Credit'
        verbose_name_plural = 'User Credits'
        constraints = [
            models.CheckConstraint(condition=models.Q(balance__gte=0), name="permanent_balance_nonnegative"),
            models.CheckConstraint(condition=models.Q(monthly_balance__gte=0), name="monthly_balance_nonnegative"),
            models.CheckConstraint(
                condition=models.Q(held_monthly__gte=0, held_permanent__gte=0), name="wallet_holds_nonnegative",
            ),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.balance} credits"
    

class CreditTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('earned', 'Credit Earned'),
        ('spent', 'Credit Spent'),
        ('bonus', 'Bonus Credit'),
        ('refund', 'Refund'),
        ('adjustment', 'Manual adjustment'),
        ('grant', 'Allowance'),
        ('expiry', 'Monthly expiry'),
        ('reserve', 'Job reservation'),
        ('settle', 'Job settlement'),
    ]
    
    user = models.ForeignKey(
        User, null=True, on_delete=models.PROTECT, related_name="credit_transactions",
    )
    group = models.ForeignKey(
        "user_management.UserGroup", null=True, on_delete=models.PROTECT, related_name="credit_transactions",
    )
    actor = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name="+")
    bucket = models.CharField(max_length=10, default="permanent")
    balance_after = models.DecimalField(max_digits=11, decimal_places=2, null=True)
    idempotency_key = models.CharField(max_length=200, unique=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.TextField()
    reference_id = models.CharField(max_length=100, blank=True)  # For external references
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'credit_transactions'
        verbose_name = 'Credit Transaction'
        verbose_name_plural = 'Credit Transactions'
        ordering = ["-created_at", "-pk"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["group", "-created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(user__isnull=False, group__isnull=True)
                    | models.Q(user__isnull=True, group__isnull=False)
                ),
                name="credit_transaction_has_one_wallet",
            ),
        ]

    def __str__(self):
        return f"{self.transaction_type} - {self.amount}"


class CreditPackage(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    credits = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'credit_packages'
        verbose_name = 'Credit Package'
        verbose_name_plural = 'Credit Packages'
        ordering = ['price']
    
    def __str__(self):
        return f"{self.name} - {self.credits} credits for ${self.price}"


class GroupWallet(models.Model):
    group = models.OneToOneField(
        "user_management.UserGroup", on_delete=models.PROTECT, related_name="wallet",
    )
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    held_shared = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(balance__gte=0), name="group_balance_nonnegative"),
            models.CheckConstraint(condition=models.Q(held_shared__gte=0), name="group_holds_nonnegative"),
        ]


class CreditGrant(models.Model):
    wallet = models.ForeignKey(UserCredit, on_delete=models.PROTECT)
    source = models.CharField(max_length=100)
    period = models.CharField(max_length=7, blank=True)
    awarded = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["wallet", "source", "period"], name="unique_credit_grant"),
        ]


class JobReservation(models.Model):
    class State(models.TextChoices):
        HELD = "held", "Held"
        SETTLED = "settled", "Settled"
        RELEASED = "released", "Released"

    job_id = models.CharField(max_length=120, unique=True)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    group = models.ForeignKey("user_management.UserGroup", null=True, on_delete=models.PROTECT)
    monthly = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    permanent = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    shared = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    period = models.CharField(max_length=7, blank=True)
    state = models.CharField(max_length=10, choices=State.choices, default=State.HELD)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    finish_reason = models.CharField(max_length=500, blank=True)

    @property
    def price(self):
        return self.monthly + self.permanent + self.shared
