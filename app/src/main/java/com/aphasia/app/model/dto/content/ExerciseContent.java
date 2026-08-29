package com.aphasia.app.model.dto.content;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "exercise_type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = MultipleChoiceContent.class, name = "multiple_choice"),
        @JsonSubTypes.Type(value = FillInBlankContent.class, name = "fill_in_blank"),
        @JsonSubTypes.Type(value = VerbConjugationContent.class, name = "verb_conjugation"),
})
public interface ExerciseContent {}
