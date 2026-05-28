package com.matheushenrique.nexum.services.impl;

import com.matheushenrique.nexum.dtos.request.CreateClientRequest;
import com.matheushenrique.nexum.dtos.request.UpdateClientRequest;
import com.matheushenrique.nexum.dtos.response.ClientResponse;
import com.matheushenrique.nexum.dtos.response.MessageResponse;
import com.matheushenrique.nexum.dtos.response.PageResponse;
import com.matheushenrique.nexum.entities.Client;
import com.matheushenrique.nexum.entities.User;
import com.matheushenrique.nexum.repositories.ClientRepository;
import com.matheushenrique.nexum.security.exceptions.ClientNotFoundException;
import com.matheushenrique.nexum.security.exceptions.EmailAlreadyInUseException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl {

    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public PageResponse<ClientResponse> findAll(int page, int size, String search) {
        UUID ownerId = getCurrentUserId();
        var pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        var result = clientRepository.findAllActiveWithSearch(
                search == null || search.isBlank() ? null : search,
                ownerId,
                pageable
        );
        return PageResponse.from(result.map(ClientResponse::from));
    }

    @Transactional(readOnly = true)
    public ClientResponse findById(UUID id) {
        UUID ownerId = getCurrentUserId();
        return clientRepository.findByIdAndActiveTrueAndOwnerId(id, ownerId)
                .map(ClientResponse::from)
                .orElseThrow(() -> new ClientNotFoundException("Client not found"));
    }

    @Transactional
    public ClientResponse create(CreateClientRequest request) {
        UUID ownerId = getCurrentUserId();
        if (clientRepository.existsByEmailAndActiveTrueAndOwnerId(request.email(), ownerId)) {
            throw new EmailAlreadyInUseException("Email already in use");
        }

        User owner = new User();
        owner.setId(ownerId);

        Client client = Client.builder()
                .name(request.name())
                .email(request.email())
                .phone(request.phone())
                .document(request.document())
                .owner(owner)
                .build();

        return ClientResponse.from(clientRepository.save(client));
    }

    @Transactional
    public ClientResponse update(UUID id, UpdateClientRequest request) {
        UUID ownerId = getCurrentUserId();
        Client client = clientRepository.findByIdAndActiveTrueAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ClientNotFoundException("Client not found"));

        if (clientRepository.existsByEmailAndActiveTrueAndIdNotAndOwnerId(request.email(), id, ownerId)) {
            throw new EmailAlreadyInUseException("Email already in use");
        }

        client.setName(request.name());
        client.setEmail(request.email());
        client.setPhone(request.phone());
        client.setDocument(request.document());

        return ClientResponse.from(clientRepository.save(client));
    }

    @Transactional
    public MessageResponse deactivate(UUID id) {
        UUID ownerId = getCurrentUserId();
        Client client = clientRepository.findByIdAndActiveTrueAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ClientNotFoundException("Client not found"));

        client.setActive(false);
        clientRepository.save(client);

        return new MessageResponse("Client deactivated successfully");
    }

    private UUID getCurrentUserId() {
        UserDetails principal = (UserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return UUID.fromString(principal.getUsername());
    }
}