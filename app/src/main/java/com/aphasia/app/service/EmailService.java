package com.aphasia.app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class EmailService {

    private final RestClient restClient;
    private final String fromAddress;
    private final boolean enabled;

    public EmailService(@Value("${app.email.resend-api-key:}") String apiKey,
                        @Value("${app.email.from-address:onboarding@resend.dev}") String fromAddress) {
        this.enabled = !apiKey.isBlank();
        this.fromAddress = fromAddress;
        this.restClient = enabled
                ? RestClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build()
                : null;
    }

    public void sendMagicLinkEmail(String toEmail, String link) {
        if (!enabled) {
            System.out.println("no RESEND_API_KEY");
            return;
        }

        restClient.post()
                .uri("/emails")
                .body(Map.of(
                        "from", fromAddress,
                        "to", toEmail,
                        "subject", "Link de autentificare",
                        "html", "<p>Apasă pe linkul de mai jos pentru autentificare:</p>"
                                + "<p><a href=\"" + link + "\">" + link + "</a></p>"
                                + "<p>Linkul expiră în 15 minute.</p>"
                ))
                .retrieve()
                .toBodilessEntity();
    }
}
