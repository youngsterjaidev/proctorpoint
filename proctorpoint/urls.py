from django.urls import path

from . import views

urlpatterns = [
    path("api/quizes", views.get_all_quiz, name="index"),
]