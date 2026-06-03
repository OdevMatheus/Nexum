package com.matheushenrique.nexum.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.matheushenrique.nexum.messaging.events.SubscriptionStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void publishStatusChanged(SubscriptionStatusChangedEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(
                    "subscription.status.changed",
                    event.subscriptionId().toString(),
                    payload
            );
        } catch (Exception e) {
            log.error("Failed to publish subscription.status.changed for id={}: {}",
                    event.subscriptionId(), e.getMessage());
        }
    }
}