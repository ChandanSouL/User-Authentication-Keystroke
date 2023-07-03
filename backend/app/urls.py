from django.urls import path
from . import views


urlpatterns = [
    path('signup', views.signup, name="signup"),
    path('signin', views.signin, name="signin"),
    path('signout', views.signout, name="signout"),
    path('isAuth', views.isAuth, name="isAuth"),
    path('trainTest', views.trainTest, name="trainTest"),
    path('trainTestUpload', views.trainTestUpload, name="trainTestUpload"),
    path('trainTestResult', views.trainTestResult, name="trainTestResult"),
    path('testResult', views.testResult, name="testResult"),
    path('testResultUpload', views.testResultUpload, name="testResultUpload"),
]
