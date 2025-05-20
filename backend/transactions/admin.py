from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin interface for Transaction model."""
    
    list_display = ('user', 'amount', 'transaction_type', 'status', 'reference', 'created_at')
    list_filter = ('status', 'transaction_type', 'created_at')
    search_fields = ('user__email', 'reference', 'payment_reference')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('user', 'amount', 'transaction_type', 'status', 'reference', 'payment_reference')
        }),
        ('Payment Information', {
            'fields': ('payment_method', 'description')
        }),
        ('Metadata', {
            'fields': ('metadata', 'created_at', 'updated_at')
        }),
    )
