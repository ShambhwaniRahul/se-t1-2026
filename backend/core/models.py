from django.db import models

class TimeStampedModel(models.Model):
    """
    Abstract base class providing self-updating created_at and updated_at fields.
    Inherited by domain models to ensure consistent database audit trails.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True