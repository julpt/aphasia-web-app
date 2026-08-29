package com.aphasia.app.model.dto.content;

import java.util.List;

public record MultipleChoicePublic(String prompt, List<String> options) {
}
