from django.apps import AppConfig


class MyappConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "myapp"
    verbose_name = 'Xclera Matrix Marketing System'

    def ready(self):
        """
        Import signals or perform other initialization
        when the app is ready
        """
        # Import signals if you have any
        # import matrix.signals
        pass
