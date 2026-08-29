package com.aphasia.app.service;

import com.aphasia.app.mapper.ReconstructionMapper;
import com.aphasia.app.model.dto.ReconstructionRequest;
import com.aphasia.app.model.dto.ReconstructionResponse;
import com.aphasia.app.model.entities.Reconstruction;
import com.aphasia.app.model.entities.User;
import com.aphasia.app.repository.ReconstructionRepository;
import com.aphasia.app.security.AppUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReconstructionService {

    private static final String SYSTEM_PROMPT =
            "Ești un asistent care reconstruiește propoziții afazice degradate în limba română. " +
                    "Reconstruiește propoziția corectă din punct de vedere gramatical, păstrând sensul original " +
                    "cât mai fidel posibil. Răspunde DOAR cu propoziția reconstruită, fără explicații suplimentare.";

    private static final Set<String> ANONYMOUS_ALLOWED_MODELS = Set.of("gpt-oss-120b-groq");

    private final ReconstructionRepository repository;
    private final ReconstructionMapper mapper;
    private final Map<String, ChatClient> chatClients;
    private final FavoritePhraseService favoritePhraseService;

    public ReconstructionResponse reconstruct(ReconstructionRequest request, AppUserDetails currentUser) {
        boolean isAuthenticated = currentUser != null;

        if (!isAuthenticated && !ANONYMOUS_ALLOWED_MODELS.contains(request.modelKey())) {
            throw new AccessDeniedException("Modelul '" + request.modelKey() + "' necesită autentificare.");
        }

        ChatClient client = chatClients.get(request.modelKey());
        if (client == null) {
            throw new IllegalArgumentException("Model necunoscut sau indisponibil: " + request.modelKey());
        }

        String output = client.prompt()
                .system(SYSTEM_PROMPT)
                .user(request.inputText())
                .call()
                .content();

        if (!isAuthenticated) {
            return new ReconstructionResponse(null, request.inputText(), output, request.modelKey(), java.time.Instant.now(), false);
        }

        Reconstruction entity = new Reconstruction(request.inputText(), output, request.modelKey());
        entity.setUser(currentUser.getUser());

        if (request.parentReconstructionId() != null) {
            Reconstruction parent = repository.findById(request.parentReconstructionId())
                    .orElseThrow(() -> new IllegalArgumentException("Nu există reconstrucția părinte."));
            entity.setParent(parent);
        }

        Reconstruction saved = repository.save(entity);
        return mapper.toResponse(saved);
    }

    public List<ReconstructionResponse> getUserReconstructions(User user) {
        Set<UUID> favoritedIds = favoritePhraseService.getFavoritedReconstructionIds(user);

        return repository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(r -> mapper.toResponse(r, favoritedIds.contains(r.getId())))
                .toList();
    }

    public void deleteReconstruction(UUID id, User user) {
        Reconstruction r = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nu există acest id."));

        if (r.getUser() == null || !r.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Acces interzis la această reconstrucție.");
        }

        repository.delete(r);
    }
}
