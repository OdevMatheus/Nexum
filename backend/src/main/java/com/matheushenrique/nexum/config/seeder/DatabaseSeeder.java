package com.matheushenrique.nexum.config.seeder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matheushenrique.nexum.entities.*;
import com.matheushenrique.nexum.entities.Enum.NotificationType;
import com.matheushenrique.nexum.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionCycleRepository cycleRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.seeder.enabled:false}")
    private boolean seederEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seederEnabled) {
            log.info("Database seeder is disabled. Skipping data generation.");
            return;
        }

        log.warn("==========================================================");
        log.warn("DATABASE SEEDER ENABLED: WIPING AND REPOPULATING TEST DATA");
        log.warn("==========================================================");

        wipeDatabase();
        seedData();
        
        log.info("Test data generation completed successfully!");
    }

    private void wipeDatabase() {
        notificationRepository.deleteAllInBatch();
        cycleRepository.deleteAllInBatch();
        subscriptionRepository.deleteAllInBatch();
        planRepository.deleteAllInBatch();
        clientRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        log.info("Database wiped clean.");
    }
    
    private String json(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private void seedData() {
        // 1. Create Test User
        User testUser = User.builder()
                .name("Administrador de Testes")
                .email("teste@teste")
                .passwordHash(passwordEncoder.encode("teste123"))
                .emailVerified(true)
                .build();
        userRepository.save(testUser);
        log.info("User 'teste@teste' created.");

        // 2. Create Plans (Various Recurrences and Trial Scenarios)
        Plan planBasic = planRepository.save(Plan.builder()
                .owner(testUser).name("Basic Mensal").description("Ideal para pequenos negócios")
                .amountCents(4990).recurrence(Plan.Recurrence.MONTHLY).trialDays(7)
                .active(true).features(json(List.of("1 Usuário", "Suporte Email", "Dashboard Básico")))
                .build());

        Plan planPro = planRepository.save(Plan.builder()
                .owner(testUser).name("Pro Semestral").description("O mais escolhido pelas empresas")
                .amountCents(24900).recurrence(Plan.Recurrence.SEMIANNUAL).trialDays(0)
                .active(true).features(json(List.of("5 Usuários", "Suporte Prioritário 24/7", "Relatórios Avançados", "API Access")))
                .build());

        Plan planEnterprise = planRepository.save(Plan.builder()
                .owner(testUser).name("Enterprise Anual").description("Solução definitiva")
                .amountCents(99900).recurrence(Plan.Recurrence.ANNUAL).trialDays(30)
                .active(true).features(json(List.of("Ilimitado", "Gerente de Contas", "White Label")))
                .build());

        Plan planArchived = planRepository.save(Plan.builder()
                .owner(testUser).name("Plano Antigo (Arquivado)")
                .amountCents(1990).recurrence(Plan.Recurrence.MONTHLY).trialDays(0)
                .active(false).build());

        // 3. Create Bulk Clients
        for (int i = 1; i <= 50; i++) {
            boolean active = i % 5 != 0; // Every 5th client is inactive
            clientRepository.save(Client.builder()
                    .owner(testUser)
                    .name("Cliente Nexum " + i)
                    .email("cliente" + i + "@empresa.com")
                    .phone(String.format("119%04d%04d", i, i))
                    .document(String.format("%03d.111.222-%02d", i, i))
                    .active(active)
                    .build());
        }
        
        List<Client> allClients = clientRepository.findAll();
        LocalDate today = LocalDate.now();

        // 4. Create Subscriptions & Cycles
        // Distribute subscriptions among the first 35 clients
        for (int i = 0; i < 35; i++) {
            Client c = allClients.get(i);
            Plan p = (i % 3 == 0) ? planPro : (i % 2 == 0) ? planEnterprise : planBasic;
            
            Subscription.Status status;
            LocalDate startDate;
            LocalDate nextDueDate;
            
            if (i < 5) { // TRIAL
                status = Subscription.Status.TRIAL;
                startDate = today.minusDays(2);
                nextDueDate = today.plusDays(p.getTrialDays() - 2);
            } else if (i < 25) { // ACTIVE
                status = Subscription.Status.ACTIVE;
                startDate = today.minusMonths(6 + (i % 6));
                nextDueDate = today.plusDays(i % 15 + 1);
            } else if (i < 30) { // OVERDUE
                status = Subscription.Status.OVERDUE;
                startDate = today.minusMonths(3);
                nextDueDate = today.minusDays(i % 10 + 1);
            } else { // SUSPENDED
                status = Subscription.Status.SUSPENDED;
                startDate = today.minusMonths(4);
                nextDueDate = today.minusDays(30);
            }

            Subscription sub = subscriptionRepository.save(Subscription.builder()
                    .owner(testUser).client(c).plan(p)
                    .status(status).startDate(startDate).nextDueDate(nextDueDate).build());

            // Generate Cycles based on status
            if (status == Subscription.Status.TRIAL) {
                cycleRepository.save(SubscriptionCycle.builder().subscription(sub).amountCents(p.getAmountCents()).dueDate(nextDueDate).status(SubscriptionCycle.CycleStatus.PENDING).build());
            } else {
                // Generate 12 months of historical paid cycles
                for (int month = 1; month <= 12; month++) {
                    LocalDate cycleDate = today.minusMonths(month);
                    if (cycleDate.isAfter(startDate) || cycleDate.isEqual(startDate)) {
                        cycleRepository.save(SubscriptionCycle.builder()
                                .subscription(sub).amountCents(p.getAmountCents())
                                .dueDate(cycleDate).status(SubscriptionCycle.CycleStatus.PAID)
                                .build());
                    }
                }
                
                // Add the pending/overdue cycle
                if (status == Subscription.Status.ACTIVE) {
                    cycleRepository.save(SubscriptionCycle.builder().subscription(sub).amountCents(p.getAmountCents()).dueDate(nextDueDate).status(SubscriptionCycle.CycleStatus.PENDING).build());
                } else if (status == Subscription.Status.OVERDUE || status == Subscription.Status.SUSPENDED) {
                    cycleRepository.save(SubscriptionCycle.builder().subscription(sub).amountCents(p.getAmountCents()).dueDate(nextDueDate).status(SubscriptionCycle.CycleStatus.OVERDUE).build());
                    
                    // Add corresponding notifications
                    NotificationType type = status == Subscription.Status.OVERDUE ? NotificationType.PAYMENT_OVERDUE : NotificationType.SUBSCRIPTION_SUSPENDED;
                    notificationRepository.save(Notification.builder()
                            .ownerId(testUser.getId()).subscriptionId(sub.getId()).type(type.name())
                            .message(String.format("Problema com a assinatura do cliente %s.", c.getName()))
                            .read(i % 2 == 0).build());
                }
            }
        }
        
        // Add one massively rich client for detail page testing
        Client richClient = allClients.get(45);
        Subscription s1 = subscriptionRepository.save(Subscription.builder().owner(testUser).client(richClient).plan(planPro).status(Subscription.Status.CANCELLED).startDate(today.minusYears(2)).nextDueDate(today.minusYears(1)).cancelledAt(Instant.now().minusSeconds(86400 * 365)).build());
        Subscription s2 = subscriptionRepository.save(Subscription.builder().owner(testUser).client(richClient).plan(planEnterprise).status(Subscription.Status.ACTIVE).startDate(today.minusMonths(2)).nextDueDate(today.plusDays(10)).build());
        
        cycleRepository.save(SubscriptionCycle.builder().subscription(s1).amountCents(24900).dueDate(today.minusYears(2)).status(SubscriptionCycle.CycleStatus.PAID).build());
        cycleRepository.save(SubscriptionCycle.builder().subscription(s2).amountCents(99900).dueDate(today.minusMonths(2)).status(SubscriptionCycle.CycleStatus.PAID).build());
        cycleRepository.save(SubscriptionCycle.builder().subscription(s2).amountCents(99900).dueDate(today.plusDays(10)).status(SubscriptionCycle.CycleStatus.PENDING).build());
        
        log.info("Massive test data generation completed.");
    }
}