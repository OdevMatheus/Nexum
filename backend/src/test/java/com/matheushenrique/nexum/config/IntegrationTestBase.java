package com.matheushenrique.nexum.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.matheushenrique.nexum.dtos.request.LoginRequest;
import com.matheushenrique.nexum.dtos.response.AuthResponse;
import com.matheushenrique.nexum.entities.User;
import com.matheushenrique.nexum.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(
        scripts = "/sql/reset.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD
)
public abstract class IntegrationTestBase {

    @Autowired protected MockMvc mockMvc;
    @Autowired protected UserRepository userRepository;
    @Autowired protected PasswordEncoder passwordEncoder;
    protected final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    protected String accessToken;
    protected UUID authenticatedUserId;

    @BeforeEach
    void authenticate() throws Exception {

        User user = User.builder()
                .name("Test User")
                .email("test@nexum.dev")
                .passwordHash(passwordEncoder.encode("senha1234"))
                .emailVerified(true)
                .emailVerificationToken(null)
                .emailTokenExpiresAt(null)
                .refreshToken(null)
                .refreshTokenExpiresAt(null)
                .build();

        user = userRepository.save(user);
        authenticatedUserId = user.getId();

        var loginRequest = new LoginRequest("test@nexum.dev", "senha1234");

        MvcResult result = mockMvc.perform(post("/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                AuthResponse.class
        );

        accessToken = authResponse.accessToken();
    }

    protected String bearer() {
        return "Bearer " + accessToken;
    }

    protected String json(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }
}