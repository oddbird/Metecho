# Generated by Django 2.2.6 on 2019-10-14 20:16

from django.db import migrations, models


def delete_repos(apps, schema_editor):
    GitHubRepository = apps.get_model("api", "GitHubRepository")
    GitHubRepository.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [("api", "0026_use_stringfield_everywhere")]

    operations = [
        migrations.RunPython(delete_repos, migrations.RunPython.noop),
        migrations.AddField(
            model_name="githubrepository",
            name="repo_id",
            field=models.IntegerField(unique=True),
        ),
    ]