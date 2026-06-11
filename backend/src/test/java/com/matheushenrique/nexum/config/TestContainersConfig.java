package com.matheushenrique.nexum.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;
import org.testcontainers.utility.DockerImageName;

@TestConfiguration(proxyBeanMethods = false)
public class TestContainersConfig {

    @Bean
    @ServiceConnection
    public PostgreSQLContainer<?> postgresContainer() {
        return new PostgreSQLContainer<>(DockerImageName.parse("postgres:16"))
                .withDatabaseName("nexum_test")
                .withUsername("nexum_user")
                .withPassword("nexum_pass");
    }

    @Bean
    public KafkaContainer kafkaContainer() {
        KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.6.0"));
        kafka.start();
        System.setProperty("spring.kafka.bootstrap-servers", kafka.getBootstrapServers());
        return kafka;
    }
}