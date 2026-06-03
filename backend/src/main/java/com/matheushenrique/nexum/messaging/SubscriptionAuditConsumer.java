package com.matheushenrique.nexum.messaging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SubscriptionAuditConsumer {

    @KafkaListener(topics = "subscription.status.changed", groupId = "nexum-audit")
    public void consume(String payload) {
        log.info("[AUDIT] subscription.status.changed: {}", payload);
    }
}