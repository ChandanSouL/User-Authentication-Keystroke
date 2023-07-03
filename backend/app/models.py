from django.db import models
from django.conf import settings
from django.db.models import ForeignKey, IntegerField, FloatField, DateTimeField


class Test(models.Model):
    userId = ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="userId")
    time = DateTimeField(auto_now_add=True)


class KeyStroke(models.Model):
    testId = ForeignKey(Test, on_delete=models.CASCADE, related_name="testId")
    key = IntegerField()
    dwellTime = FloatField()
    flightTime = FloatField()
    interKeyLatency = FloatField()
