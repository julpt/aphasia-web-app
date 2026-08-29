package com.aphasia.app.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;


@Configuration
public class AiModelConfig {
    private final int MAX_TOKENS = 500;

    @Bean
    public Map<String, ChatClient> chatClients(
            @Value("${app.ai.openai-api-key:}") String openaiKey,
            @Value("${app.ai.groq-api-key:}") String groqKey,
            @Value("${app.ai.together-api-key:}") String togetherKey,
            @Value("${app.ai.gemini-api-key:}") String geminiKey
    ) {
        Map<String, ChatClient> clients = new HashMap<>();

        if (!groqKey.isBlank()) {
            var oss120bGroq = OpenAiChatModel.builder()
                    .options(OpenAiChatOptions.builder()
                            .apiKey(groqKey)
                            .baseUrl("https://api.groq.com/openai/v1")
                            .model("openai/gpt-oss-120b")
                            .maxTokens(MAX_TOKENS)
                            .build())
                    .build();
            clients.put("gpt-oss-120b-groq", ChatClient.create(oss120bGroq));
        }

        if (!openaiKey.isBlank()) {
            var gpt56Luna = OpenAiChatModel.builder()
                    .options(OpenAiChatOptions.builder()
                            .apiKey(openaiKey)
                            .model("gpt-5.6-luna")
                            .build())
                    .build();
            clients.put("gpt-5.6-luna", ChatClient.create(gpt56Luna));
        }

        if (!geminiKey.isBlank()) {
            var gemini35Flash = OpenAiChatModel.builder()
                    .options(OpenAiChatOptions.builder()
                            .apiKey(geminiKey)
                            .baseUrl("https://generativelanguage.googleapis.com/v1beta/openai/")
                            .model("gemini-3.5-flash-lite")
                            .maxTokens(MAX_TOKENS)
                            .build())
                    .build();
            clients.put("gemini-3.5-flash-lite", ChatClient.create(gemini35Flash));
        }

        if (!togetherKey.isBlank()) {
            var gemma431bTogether = OpenAiChatModel.builder()
                    .options(OpenAiChatOptions.builder()
                            .apiKey(togetherKey)
                            .baseUrl("https://api.together.xyz/v1")
                            .model("google/gemma-4-31B-it")
                            .maxTokens(2 * MAX_TOKENS)
                            .build())
                    .build();
            clients.put("gemma4-31b-together", ChatClient.create(gemma431bTogether));

            var deepseek4FlashTogether = OpenAiChatModel.builder()
                    .options(OpenAiChatOptions.builder()
                            .apiKey(togetherKey)
                            .baseUrl("https://api.together.xyz/v1")
                            .model("deepseek-ai/DeepSeek-V4-Flash-0731")
                            .maxTokens(2 * MAX_TOKENS)
                            .extraBody(Map.of(
                                    "reasoning", Map.of("enabled", false)
                            ))
                            .build())
                    .build();
            clients.put("deepseek-v4-flash-together", ChatClient.create(deepseek4FlashTogether));
        }

        return clients;
    }
}