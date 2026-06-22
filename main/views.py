from django.shortcuts import render, redirect
from django.contrib import messages


def index(request):
    return render(request, 'main/index.html')


def contact(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')
        # TODO: hook up email sending here
        messages.success(request, f"Thanks {name}! Your message has been received.")
        return redirect('/#contact')
    return redirect('index')
