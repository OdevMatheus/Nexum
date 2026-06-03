package com.matheushenrique.nexum.unit;

import com.matheushenrique.nexum.dtos.request.CreateClientRequest;
import com.matheushenrique.nexum.dtos.request.UpdateClientRequest;
import com.matheushenrique.nexum.entities.Client;
import com.matheushenrique.nexum.entities.User;
import com.matheushenrique.nexum.repositories.ClientRepository;
import com.matheushenrique.nexum.security.exceptions.ClientNotFoundException;
import com.matheushenrique.nexum.security.exceptions.EmailAlreadyInUseException;
import com.matheushenrique.nexum.services.impl.ClientServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ClientServiceImpl")
class ClientServiceImplTest {

    @Mock private ClientRepository clientRepository;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;
    @Mock private UserDetails userDetails;

    @InjectMocks
    private ClientServiceImpl clientService;

    private final UUID ownerId = UUID.randomUUID();
    private final UUID clientId = UUID.randomUUID();
    private User owner;
    private Client client;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(ownerId)
                .name("Owner")
                .email("owner@example.com")
                .passwordHash("hash")
                .build();

        client = Client.builder()
                .id(clientId)
                .name("João Silva")
                .email("joao@example.com")
                .phone("41999998888")
                .document("123.456.789-00")
                .active(true)
                .owner(owner)
                .build();

        when(userDetails.getUsername()).thenReturn(ownerId.toString());
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    // findAll

    @Nested
    @DisplayName("findAll")
    class FindAll {

        @Test
        @DisplayName("should return paginated list of clients")
        void shouldReturnPaginatedClients() {
            var page = new PageImpl<>(List.of(client));
            when(clientRepository.findAllActiveWithSearch(isNull(), eq(ownerId), any(Pageable.class)))
                    .thenReturn(page);

            var response = clientService.findAll(0, 10, null);

            assertThat(response.content()).hasSize(1);
            assertThat(response.content().get(0).email()).isEqualTo("joao@example.com");
        }

        @Test
        @DisplayName("should pass null search when blank string is provided")
        void shouldPassNullForBlankSearch() {
            var page = new PageImpl<>(List.of(client));
            when(clientRepository.findAllActiveWithSearch(isNull(), eq(ownerId), any(Pageable.class)))
                    .thenReturn(page);

            var response = clientService.findAll(0, 10, "   ");

            assertThat(response.content()).hasSize(1);
            verify(clientRepository).findAllActiveWithSearch(isNull(), eq(ownerId), any(Pageable.class));
        }

        @Test
        @DisplayName("should pass search term when provided")
        void shouldPassSearchTerm() {
            var page = new PageImpl<>(List.of(client));
            when(clientRepository.findAllActiveWithSearch(eq("joão"), eq(ownerId), any(Pageable.class)))
                    .thenReturn(page);

            clientService.findAll(0, 10, "joão");

            verify(clientRepository).findAllActiveWithSearch(eq("joão"), eq(ownerId), any(Pageable.class));
        }
    }

    // findById

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("should return client when found")
        void shouldReturnClientWhenFound() {
            when(clientRepository.findByIdAndActiveTrueAndOwnerId(clientId, ownerId))
                    .thenReturn(Optional.of(client));

            var response = clientService.findById(clientId);

            assertThat(response.id()).isEqualTo(clientId);
            assertThat(response.name()).isEqualTo("João Silva");
        }

        @Test
        @DisplayName("should throw ClientNotFoundException when not found")
        void shouldThrowWhenNotFound() {
            when(clientRepository.findByIdAndActiveTrueAndOwnerId(clientId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> clientService.findById(clientId))
                    .isInstanceOf(ClientNotFoundException.class);
        }
    }

    // create

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("should create client successfully")
        void shouldCreateClient() {
            var request = new CreateClientRequest("João Silva", "joao@example.com", "41999998888", "123.456.789-00");

            when(clientRepository.existsByEmailAndActiveTrueAndOwnerId("joao@example.com", ownerId))
                    .thenReturn(false);
            when(clientRepository.save(any(Client.class))).thenAnswer(i -> {
                Client c = i.getArgument(0);
                c.setId(clientId);
                return c;
            });

            var response = clientService.create(request);

            assertThat(response.name()).isEqualTo("João Silva");
            assertThat(response.email()).isEqualTo("joao@example.com");
            verify(clientRepository).save(any(Client.class));
        }

        @Test
        @DisplayName("should throw EmailAlreadyInUseException if email is already taken")
        void shouldThrowIfEmailDuplicated() {
            var request = new CreateClientRequest("Outro", "joao@example.com", null, null);

            when(clientRepository.existsByEmailAndActiveTrueAndOwnerId("joao@example.com", ownerId))
                    .thenReturn(true);

            assertThatThrownBy(() -> clientService.create(request))
                    .isInstanceOf(EmailAlreadyInUseException.class);

            verify(clientRepository, never()).save(any());
        }
    }

    // update

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        @DisplayName("should update client successfully")
        void shouldUpdateClient() {
            var request = new UpdateClientRequest("João Atualizado", "novo@example.com", "41988887777", "123.456.789-00");

            when(clientRepository.findByIdAndActiveTrueAndOwnerId(clientId, ownerId))
                    .thenReturn(Optional.of(client));
            when(clientRepository.existsByEmailAndActiveTrueAndIdNotAndOwnerId("novo@example.com", clientId, ownerId))
                    .thenReturn(false);
            when(clientRepository.save(any(Client.class))).thenAnswer(i -> i.getArgument(0));

            var response = clientService.update(clientId, request);

            assertThat(response.name()).isEqualTo("João Atualizado");
            assertThat(response.email()).isEqualTo("novo@example.com");
        }

        @Test
        @DisplayName("should throw ClientNotFoundException when client does not exist")
        void shouldThrowWhenClientNotFound() {
            var request = new UpdateClientRequest("X", "x@example.com", null, null);

            when(clientRepository.findByIdAndActiveTrueAndOwnerId(clientId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> clientService.update(clientId, request))
                    .isInstanceOf(ClientNotFoundException.class);
        }

        @Test
        @DisplayName("should throw EmailAlreadyInUseException if new email is taken by another client")
        void shouldThrowIfEmailTakenByOther() {
            var request = new UpdateClientRequest("João", "outro@example.com", null, null);

            when(clientRepository.findByIdAndActiveTrueAndOwnerId(clientId, ownerId))
                    .thenReturn(Optional.of(client));
            when(clientRepository.existsByEmailAndActiveTrueAndIdNotAndOwnerId("outro@example.com", clientId, ownerId))
                    .thenReturn(true);

            assertThatThrownBy(() -> clientService.update(clientId, request))
                    .isInstanceOf(EmailAlreadyInUseException.class);

            verify(clientRepository, never()).save(any());
        }
    }

    // deactivate

    @Nested
    @DisplayName("deactivate")
    class Deactivate {

        @Test
        @DisplayName("should deactivate client successfully")
        void shouldDeactivateClient() {
            when(clientRepository.findByIdAndActiveTrueAndOwnerId(clientId, ownerId))
                    .thenReturn(Optional.of(client));
            when(clientRepository.save(any(Client.class))).thenAnswer(i -> i.getArgument(0));

            var response = clientService.deactivate(clientId);

            assertThat(response.message()).contains("deactivated");
            assertThat(client.isActive()).isFalse();
        }

        @Test
        @DisplayName("should throw ClientNotFoundException when client does not exist")
        void shouldThrowWhenNotFound() {
            when(clientRepository.findByIdAndActiveTrueAndOwnerId(clientId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> clientService.deactivate(clientId))
                    .isInstanceOf(ClientNotFoundException.class);

            verify(clientRepository, never()).save(any());
        }
    }
}