package com.aphasia.app.repository;

import com.aphasia.app.model.entities.MagicLinkToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MagicLinkTokenRepository extends JpaRepository<MagicLinkToken, java.util.UUID> {
    Optional<MagicLinkToken> findByToken(String token);
}