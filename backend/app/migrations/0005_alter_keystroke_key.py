# Generated by Django 4.2.2 on 2023-07-03 02:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app", "0004_alter_keystroke_key"),
    ]

    operations = [
        migrations.AlterField(
            model_name="keystroke",
            name="key",
            field=models.IntegerField(),
        ),
    ]
