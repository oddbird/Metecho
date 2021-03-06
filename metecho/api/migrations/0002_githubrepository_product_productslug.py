# Generated by Django 2.2.2 on 2019-07-04 03:43

import django.db.models.deletion
import hashid_field.field
import sfdo_template_helpers.fields.markdown
import sfdo_template_helpers.slugs
from django.conf import settings
from django.db import migrations, models

ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"


class Migration(migrations.Migration):

    dependencies = [("api", "0001_initial")]

    operations = [
        migrations.CreateModel(
            name="Product",
            fields=[
                (
                    "id",
                    hashid_field.field.HashidAutoField(
                        alphabet=ALPHABET,
                        min_length=7,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("edited_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=50, unique=True)),
                ("repo_url", models.URLField(unique=True)),
                (
                    "description",
                    sfdo_template_helpers.fields.markdown.MarkdownField(
                        blank=True, property_suffix="_markdown"
                    ),
                ),
                ("is_managed", models.BooleanField(default=False)),
            ],
            options={"abstract": False},
            bases=(sfdo_template_helpers.slugs.SlugMixin, models.Model),
        ),
        migrations.CreateModel(
            name="ProductSlug",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("slug", models.SlugField(unique=True)),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text=(
                            "If multiple slugs are active, we will default to the most "
                            "recent."
                        ),
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "parent",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="slugs",
                        to="api.Product",
                    ),
                ),
            ],
            options={"ordering": ("-created_at",), "abstract": False},
        ),
        migrations.CreateModel(
            name="GitHubRepository",
            fields=[
                (
                    "id",
                    hashid_field.field.HashidAutoField(
                        alphabet=ALPHABET,
                        min_length=7,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("url", models.URLField()),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="repositories",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"abstract": False, "verbose_name_plural": "GitHub repositories"},
        ),
    ]
