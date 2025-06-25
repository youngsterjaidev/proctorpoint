tempQuiz = {
    "title": "Python Quiz",
    "timeLimit": 300,
    "question": [
        {
            "questionText": "What function is used to print output to the console?",
            "options": ["console.log()", "print()", "echo()", "output()"],
            "correctAnswerIndex": 1
        }
    ]
}


def index(request):
    return HttpResponse("Hi Dev!")


# Create that send the quiz data to client
def get_all_quiz(request):
    return JsonResponse(tempQuiz)
