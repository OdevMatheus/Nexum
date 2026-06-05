package com.matheushenrique.nexum.controllers;

import com.matheushenrique.nexum.config.ApiGlobalErrors;
import com.matheushenrique.nexum.dtos.request.CreateClientRequest;
import com.matheushenrique.nexum.dtos.request.UpdateClientRequest;
import com.matheushenrique.nexum.dtos.response.ClientResponse;
import com.matheushenrique.nexum.dtos.response.MessageResponse;
import com.matheushenrique.nexum.dtos.response.PageResponse;
import com.matheushenrique.nexum.services.impl.ClientServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/clients")
@RequiredArgsConstructor
@ApiGlobalErrors
@SecurityRequirement(name = "bearer-key")
@Tag(name = "3. Clientes", description = "Gerenciamento da base de clientes e contatos")
public class ClientController {

    private final ClientServiceImpl clientService;

    @GetMapping
    @Operation(summary = "Listar Clientes", description = "Retorna uma lista paginada de todos os clientes. É possível filtrar resultados usando o parâmetro 'search'.")
    public ResponseEntity<PageResponse<ClientResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(clientService.findAll(page, size, search));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Cliente", description = "Retorna os detalhes completos de um cliente específico a partir do seu ID.")
    public ResponseEntity<ClientResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(clientService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Criar Cliente", description = "Cadastra um novo cliente vinculado à conta do usuário autenticado.")
    public ResponseEntity<ClientResponse> create(@Valid @RequestBody CreateClientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar Cliente", description = "Edita as informações cadastrais de um cliente existente.")
    public ResponseEntity<ClientResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateClientRequest request
    ) {
        return ResponseEntity.ok(clientService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir Cliente", description = "Inativa (arquiva) um cliente no sistema. A deleção é lógica e não apaga os dados do banco.")
    public ResponseEntity<MessageResponse> deactivate(@PathVariable UUID id) {
        return ResponseEntity.ok(clientService.deactivate(id));
    }
}