from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "Welcome to the Bloom API",
        "status": "Running",
        "endpoints": {
            "login": "/api/users/login/",
            "register": "/api/users/register/",
            "admin": "/admin/"
        }
    })
