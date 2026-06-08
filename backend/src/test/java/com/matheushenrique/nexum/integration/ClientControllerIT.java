package com.matheushenrique.nexum.integration;

import com.matheushenrique.nexum.config.IntegrationTestBase;
import com.matheushenrique.nexum.dtos.request.CreateClientRequest;
import com.matheushenrique.nexum.dtos.request.UpdateClientRequest;
import com.matheushenrique.nexum.entities.Client;
import com.matheushenrique.nexum.entities.User;
import com.matheushenrique.nexum.repositories.ClientRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("ClientController IT")
class ClientControllerIT extends IntegrationTestBase {

    @Autowired private ClientRepository clientRepository;

    private Client createClient(String name, String email) {
        User owner = new User();
        owner.setId(authenticatedUserId);

        return clientRepository.save(Client.builder()
                .name(name)
                .email(email)
                .phone("41999998888")
                .document("123.456.789-00")
                .active(true)
                .owner(owner)
                .build());
    }

    // GET /v1/clients

    @Nested
    @DisplayName("GET /v1/clients")
    class FindAll {

        @Test
        @DisplayName("should return paginated list of clients")
        void shouldReturnPaginatedClients() throws Exception {
            createClient("João Silva", "joao@nexum.dev");
            createClient("Maria Santos", "maria@nexum.dev");

            mockMvc.perform(get("/v1/clients")
                            .header("Authorization", bearer())
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(2)))
                    .andExpect(jsonPath("$.totalElements").value(2));
        }

        @Test
        @DisplayName("should filter clients by search term")
        void shouldFilterBySearch() throws Exception {
            createClient("João Silva", "joao@nexum.dev");
            createClient("Maria Santos", "maria@nexum.dev");

            mockMvc.perform(get("/v1/clients")
                            .header("Authorization", bearer())
                            .param("search", "joão"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].name").value("João Silva"));
        }

        @Test
        @DisplayName("should return empty list when no clients exist")
        void shouldReturnEmptyList() throws Exception {
            mockMvc.perform(get("/v1/clients")
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            mockMvc.perform(get("/v1/clients"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should not return clients from other owners")
        void shouldNotReturnClientsFromOtherOwners() throws Exception {
            User otherOwner = userRepository.save(User.builder()
                    .name("Other Owner")
                    .email("other@nexum.dev")
                    .passwordHash(passwordEncoder.encode("senha1234"))
                    .emailVerified(true)
                    .build());

            clientRepository.save(Client.builder()
                    .name("Cliente Alheio")
                    .email("alheio@nexum.dev")
                    .active(true)
                    .owner(otherOwner)
                    .build());

            mockMvc.perform(get("/v1/clients")
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    // GET /v1/clients/:id

    @Nested
    @DisplayName("GET /v1/clients/:id")
    class FindById {

        @Test
        @DisplayName("should return client by id")
        void shouldReturnClientById() throws Exception {
            Client client = createClient("João Silva", "joao@nexum.dev");

            mockMvc.perform(get("/v1/clients/{id}", client.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(client.getId().toString()))
                    .andExpect(jsonPath("$.name").value("João Silva"))
                    .andExpect(jsonPath("$.email").value("joao@nexum.dev"));
        }

        @Test
        @DisplayName("should return 404 for unknown client")
        void shouldReturn404ForUnknownClient() throws Exception {
            mockMvc.perform(get("/v1/clients/{id}", UUID.randomUUID())
                            .header("Authorization", bearer()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 404 for client from another owner")
        void shouldReturn404ForOtherOwnerClient() throws Exception {
            User otherOwner = userRepository.save(User.builder()
                    .name("Other Owner")
                    .email("other@nexum.dev")
                    .passwordHash(passwordEncoder.encode("senha1234"))
                    .emailVerified(true)
                    .build());

            Client otherClient = clientRepository.save(Client.builder()
                    .name("Cliente Alheio")
                    .email("alheio@nexum.dev")
                    .active(true)
                    .owner(otherOwner)
                    .build());

            mockMvc.perform(get("/v1/clients/{id}", otherClient.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            mockMvc.perform(get("/v1/clients/{id}", UUID.randomUUID()))
                    .andExpect(status().isUnauthorized());
        }
    }

    // POST /v1/clients

    @Nested
    @DisplayName("POST /v1/clients")
    class Create {

        @Test
        @DisplayName("should create client and return 201")
        void shouldCreateClient() throws Exception {
            var request = new CreateClientRequest(
                    "João Silva", "joao@nexum.dev", "41999998888", "123.456.789-00"
            );

            mockMvc.perform(post("/v1/clients")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.name").value("João Silva"))
                    .andExpect(jsonPath("$.email").value("joao@nexum.dev"))
                    .andExpect(jsonPath("$.id").isNotEmpty());
        }

        @Test
        @DisplayName("should return 409 if email is already in use")
        void shouldReturn409IfEmailDuplicated() throws Exception {
            createClient("João Silva", "joao@nexum.dev");

            var request = new CreateClientRequest(
                    "Outro João", "joao@nexum.dev", null, null
            );

            mockMvc.perform(post("/v1/clients")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("should return 400 for invalid request body")
        void shouldReturn400ForInvalidBody() throws Exception {
            var request = new CreateClientRequest("", "", null, null);

            mockMvc.perform(post("/v1/clients")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            var request = new CreateClientRequest(
                    "João Silva", "joao@nexum.dev", null, null
            );

            mockMvc.perform(post("/v1/clients")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isUnauthorized());
        }
    }

    // PUT /v1/clients/:id

    @Nested
    @DisplayName("PUT /v1/clients/:id")
    class Update {

        @Test
        @DisplayName("should update client successfully")
        void shouldUpdateClient() throws Exception {
            Client client = createClient("João Silva", "joao@nexum.dev");

            var request = new UpdateClientRequest(
                    "João Atualizado", "joao.novo@nexum.dev", "41988887777", "123.456.789-00"
            );

            mockMvc.perform(put("/v1/clients/{id}", client.getId())
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("João Atualizado"))
                    .andExpect(jsonPath("$.email").value("joao.novo@nexum.dev"));
        }

        @Test
        @DisplayName("should return 404 for unknown client")
        void shouldReturn404ForUnknownClient() throws Exception {
            var request = new UpdateClientRequest(
                    "Nome Valido", "x@nexum.dev", null, null
            );

            mockMvc.perform(put("/v1/clients/{id}", UUID.randomUUID())
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 409 if new email is taken by another client")
        void shouldReturn409IfEmailTaken() throws Exception {
            Client client1 = createClient("João Silva", "joao@nexum.dev");
            createClient("Maria Santos", "maria@nexum.dev");

            var request = new UpdateClientRequest(
                    "João Silva", "maria@nexum.dev", null, null
            );

            mockMvc.perform(put("/v1/clients/{id}", client1.getId())
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isConflict());
        }
    }

    // DELETE /v1/clients/:id

    @Nested
    @DisplayName("DELETE /v1/clients/:id")
    class Deactivate {

        @Test
        @DisplayName("should deactivate client successfully")
        void shouldDeactivateClient() throws Exception {
            Client client = createClient("João Silva", "joao@nexum.dev");

            mockMvc.perform(delete("/v1/clients/{id}", client.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value(containsString("deactivated")));
        }

        @Test
        @DisplayName("should return 404 after deactivation")
        void shouldReturn404AfterDeactivation() throws Exception {
            Client client = createClient("João Silva", "joao@nexum.dev");

            mockMvc.perform(delete("/v1/clients/{id}", client.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/v1/clients/{id}", client.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 404 for unknown client")
        void shouldReturn404ForUnknownClient() throws Exception {
            mockMvc.perform(delete("/v1/clients/{id}", UUID.randomUUID())
                            .header("Authorization", bearer()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            mockMvc.perform(delete("/v1/clients/{id}", UUID.randomUUID()))
                    .andExpect(status().isUnauthorized());
        }
    }
}