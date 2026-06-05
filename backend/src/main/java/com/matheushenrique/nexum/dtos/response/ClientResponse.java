package com.matheushenrique.nexum.dtos.response;

import com.matheushenrique.nexum.entities.Client;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

public record ClientResponse(
        @Schema(description = "Identificador único do cliente", example = "a1b2c3d4-e5f6-7890-1234-56789abcdef0")
        UUID id,
        @Schema(description = "Nome completo ou razão social do cliente", example = "Acme Soluções LTDA")
        String name,
        @Schema(description = "E-mail de contato do cliente", example = "contato@acme.com.br")
        String email,
        @Schema(description = "Telefone para contato", example = "(11) 99999-9999")
        String phone,
        @Schema(description = "Documento de identificação (CPF/CNPJ)", example = "12.345.678/0001-90")
        String document,
        @Schema(description = "Status atual do cliente no sistema", example = "true")
        boolean active,
        @Schema(description = "Data e hora de criação do registro (ISO-8601)", example = "2026-06-05T10:00:00Z")
        Instant createdAt,
        @Schema(description = "Data e hora da última atualização do registro (ISO-8601)", example = "2026-06-05T10:00:00Z")
        Instant updatedAt
){
    public static ClientResponse from(Client client) {
        return new ClientResponse(
                client.getId(),
                client.getName(),
                client.getEmail(),
                client.getPhone(),
                client.getDocument(),
                client.isActive(),
                client.getCreatedAt(),
                client.getUpdatedAt()
        );
    }
}