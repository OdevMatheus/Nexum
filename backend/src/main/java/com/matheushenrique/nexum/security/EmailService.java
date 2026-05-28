package com.matheushenrique.nexum.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    //Variavel para o desenvolvimento.
    @Value("${resend.override-to-email:}")
    private String overrideToEmail;

    @Value("${resend.api-key}")
    private String apiKey;

    @Value("${resend.from-email}")
    private String fromEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public void sendVerificationEmail(String toEmail, String name, String token) {
        String verificationLink = baseUrl + "/verify-email?token=" + token;

        String recipient = overrideToEmail.isBlank() ? toEmail : overrideToEmail;

        String html = buildVerificationEmailHtml(name, verificationLink);

        String body = """
            {
                "from": "%s",
                "to": ["%s"],
                "subject": "Confirme seu e-mail — Nexum",
                "html": "%s"
            }
            """.formatted(fromEmail, recipient, escapeJson(html));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString()
            );
            if (response.statusCode() != 200) {
                System.err.println("Resend error: " + response.body());
            }
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    private String buildVerificationEmailHtml(String name, String link) {
        return """
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #0f172a;">Olá, %s!</h2>
              <p>Clique no botão abaixo para confirmar seu e-mail.</p>
              <a href="%s"
                 style="display:inline-block;padding:12px 24px;background:#1e40af;
                        color:#fff;text-decoration:none;border-radius:6px;">
                Confirmar e-mail
              </a>
              <p style="color:#64748b;font-size:12px;margin-top:24px;">
                Link válido por 24 horas. Se não foi você, ignore este e-mail.
              </p>
            </div>
            """.formatted(name, link);
    }

    private String escapeJson(String input) {
        return input
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}