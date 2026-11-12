from django.db.models import Count
from django.shortcuts import redirect, render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from .models import Choice, Exam, Question
from .serializers import ChoiceSerializer, ExamSerializer, QuestionSerializer


def home_view(request):
    return render(request, 'quiz/home.html')

def redoc_view(request):
    return redirect('/api/docs/')

class ExamViewSet(viewsets.ModelViewSet):
    queryset = (
        Exam.objects.annotate(question_total=Count('questions'))
        .prefetch_related('questions__choices')
        .order_by('-created_at', '-id')
    )
    serializer_class = ExamSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().order_by('id')
    serializer_class = QuestionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['exam']
    search_fields = ['text']

class ChoiceViewSet(viewsets.ModelViewSet):
    queryset = Choice.objects.all().order_by('id')
    serializer_class = ChoiceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['question', 'question__exam']
