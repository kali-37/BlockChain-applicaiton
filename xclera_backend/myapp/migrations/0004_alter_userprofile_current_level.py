# Generated by Django 4.2.7 on 2025-03-15 04:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("myapp", "0003_refreshtoken"),
    ]

    operations = [
        migrations.AlterField(
            model_name="userprofile",
            name="current_level",
            field=models.PositiveSmallIntegerField(default=0),
        ),
    ]
