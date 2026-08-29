package com.aphasia.app.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class ReconstructRateLimit extends OncePerRequestFilter {

    private final int maxRequests;
    private final long windowSeconds;

    private final ConcurrentHashMap<String, Deque<Instant>> requestLog = new ConcurrentHashMap<>();

    public ReconstructRateLimit(
            @Value("${app.rate-limit.reconstruct.max-requests:10}") int maxRequests,
            @Value("${app.rate-limit.reconstruct.window-seconds:600}") long windowSeconds
    ) {
        this.maxRequests = maxRequests;
        this.windowSeconds = windowSeconds;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        boolean isTargetEndpoint = "POST".equalsIgnoreCase(request.getMethod())
                && "/api/reconstruct".equals(request.getRequestURI());

        if (!isTargetEndpoint) {
            chain.doFilter(request, response);
            return;
        }

        String clientKey = resolveClientIp(request);
        Instant now = Instant.now();
        Deque<Instant> timestamps = requestLog.computeIfAbsent(clientKey, k -> new ConcurrentLinkedDeque<>());

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(now.minusSeconds(windowSeconds))) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxRequests) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"message\":\"Prea multe cereri. Reveniți peste câteva minute.\"}"
                );
                return;
            }

            timestamps.addLast(now);
        }

        chain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @Scheduled(fixedRate = 3600000)
    public void cleanup() {
        Instant cutoff = Instant.now().minusSeconds(windowSeconds);
        requestLog.values().removeIf(deque -> {
            synchronized (deque) {
                deque.removeIf(t -> t.isBefore(cutoff));
                return deque.isEmpty();
            }
        });
    }
}
