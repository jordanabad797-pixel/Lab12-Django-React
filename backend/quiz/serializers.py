from rest_framework import serializers
from .models import Exam, Question, Choice

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, required=False)
    exam = serializers.PrimaryKeyRelatedField(queryset=Exam.objects.all())

    class Meta:
        model = Question
        fields = ['id', 'exam', 'text', 'choices']

    def validate_choices(self, choices):
        # Validate that if choices are provided, exactly one is correct
        if choices is not None:
            correct_count = sum(1 for c in choices if c.get('is_correct', False))
            if correct_count != 1:
                raise serializers.ValidationError("A question must have exactly one correct choice.")
        return choices

    def validate(self, data):
        choices = data.get('choices', [])
        # If choices are present during creation/update, ensure exactly one correct choice
        if choices:
            correct_count = sum(1 for c in choices if c.get('is_correct', False))
            if correct_count != 1:
                raise serializers.ValidationError({"choices": "A question must have exactly one correct choice."})
        return data

    def create(self, validated_data):
        choices_data = validated_data.pop('choices', [])
        question = Question.objects.create(**validated_data)
        for choice_data in choices_data:
            Choice.objects.create(question=question, **choice_data)
        return question

    def update(self, instance, validated_data):
        choices_data = validated_data.pop('choices', None)
        instance.text = validated_data.get('text', instance.text)
        instance.exam = validated_data.get('exam', instance.exam)
        instance.save()

        if choices_data is not None:
            instance.choices.all().delete()
            for choice_data in choices_data:
                Choice.objects.create(question=instance, **choice_data)
        return instance

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = ['id', 'title', 'description', 'created_at', 'question_count', 'questions']
        read_only_fields = ['created_at']
        extra_kwargs = {
            'title': {
                'error_messages': {
                    'required': 'El título es obligatorio.',
                    'blank': 'El título es obligatorio.',
                },
            },
        }

    def get_question_count(self, exam):
        # Uses the annotated value when the viewset provides it (one query),
        # and falls back to counting for single instances.
        annotated = getattr(exam, 'question_total', None)
        return annotated if annotated is not None else exam.questions.count()

    def validate_title(self, value):
        title = value.strip()
        if len(title) < 5:
            raise serializers.ValidationError('El título debe tener al menos 5 caracteres.')
        duplicates = Exam.objects.filter(title__iexact=title)
        if self.instance is not None:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError('Ya existe un examen con ese título.')
        return title
