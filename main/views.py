from django.shortcuts import render
from django.http import JsonResponse
# Create your views here.
import json

def mainpage(request, *argv, **kwargs):
    return render(request, "home.html")


def generating_file(request, *argv, **kwargs):
    if request.method == "POST":
        sheet = request.POST.get("sheet")
        sheet = json.loads(sheet)
        
        data = sheet.get("data")
        valueField = sheet.get("valueField")
        labelField = sheet.get("labelField")
        aspect = sheet.get("aspect")
        with_index = sheet.get("with_index")
        export_name = sheet.get("export_name")


        print(data)
        print(aspect)
    context = {
        "success": True,
    }


    return JsonResponse(context)
