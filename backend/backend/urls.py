"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import os
from django.contrib import admin
from django.http import FileResponse
from django.urls import path, re_path, include
from django.shortcuts import render

urls = [
    "asset-manifest.json",
    "favicon.ico",
    "index.html",
    "logo192.png",
    "logo512.png",
    "manifest.json",
    "robots.txt",
]


def render_react(request):
    if request.path[1:] in urls:
        file = open(os.path.join("build", request.path[1:]), 'rb')
        response = FileResponse(file)
        return response
    return render(request, "index.html")


urlpatterns = [
    path("app/", include('app.urls')),
    path("admin/", admin.site.urls),
    re_path(r"^$", render_react),
    re_path(r"^(?:.*)/?$", render_react),
]
