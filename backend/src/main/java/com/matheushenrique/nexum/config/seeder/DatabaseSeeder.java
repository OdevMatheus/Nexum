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
import java.time.ZoneId;
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
                .name("Carlos - Academia FitLife")
                .email("teste@teste")
                .passwordHash(passwordEncoder.encode("teste123"))
                .emailVerified(true)
                .build();
        userRepository.save(testUser);
        log.info("User 'teste@teste' created.");

        // 2. Create Plans (Gym themed)
        Plan planBasic = planRepository.save(Plan.builder()
                .owner(testUser).name("Gym Mensal").description("Acesso livre à musculação")
                .amountCents(8990).recurrence(Plan.Recurrence.MONTHLY).trialDays(0)
                .active(true).features(json(List.of("Acesso Musculação", "Armário Individual", "Suporte do Instrutor")))
                .build());

        Plan planPro = planRepository.save(Plan.builder()
                .owner(testUser).name("Gym Trimestral").description("O plano queridinho da galera")
                .amountCents(23990).recurrence(Plan.Recurrence.QUARTERLY).trialDays(0)
                .active(true).features(json(List.of("Acesso Musculação", "Aulas Coletivas", "Crossfit", "Acesso 24h", "Avaliação Física Trimestral")))
                .build());

        Plan planEnterprise = planRepository.save(Plan.builder()
                .owner(testUser).name("Gym VIP Anual").description("Experiência premium completa")
                .amountCents(79990).recurrence(Plan.Recurrence.ANNUAL).trialDays(7)
                .active(true).features(json(List.of("Tudo do Pro", "Personal Trainer 1x/semana", "Acesso à Piscina", "Avaliação Nutricional", "Espaço Kids")))
                .build());

        Plan planArchived = planRepository.save(Plan.builder()
                .owner(testUser).name("Gym Plano Antigo")
                .amountCents(5990).recurrence(Plan.Recurrence.MONTHLY).trialDays(0)
                .active(false).build());

        // Real Gym Members names (50 total)
        List<String> realNames = List.of(
            "Ana Beatriz Silva", "Carlos Eduardo Santos", "Mariana Costa Oliveira", "Lucas Pereira Gomes",
            "Juliana Ramos Souza", "Rodrigo de Almeida", "Patrícia Fernandes", "Felipe Augusto Melo",
            "Camila Vitória Barbosa", "Bruno Castro Lima", "Amanda Letícia Rocha", "Gabriel Henrique Mendes",
            "Larissa Antunes Xavier", "Thiago Henrique Silva", "Isabela Cristina Carvalho", "Matheus de Souza Lima",
            "Fernanda Borges Cruz", "Vinícius Garcia Pinto", "Letícia Maria Rezende", "Daniel Rodrigues Costa",
            "Gustavo Oliveira Silva", "Sofia Albuquerque", "Leonardo Ramos Almeida", "Carolina de Souza",
            "Marcelo Vieira Lopes", "Renata Vasconcelos", "Diego Roberto Pinto", "Bárbara Cruz Duarte",
            "Arthur de Melo Santos", "Tatiane Moreira", "Samuel da Silva Gomes", "Aline Barbosa de Oliveira",
            "Victor Rodrigues Cruz", "Cláudia Regina de Souza", "Pedro Henrique Santos", "Vanessa Cristina Lima",
            "Danilo Mendes Ramos", "Jéssica de Paula Costa", "Henrique Augusto Ramos", "Letícia Fernanda Duarte",
            "Guilherme Silva Souza", "Paula Roberta Gomes", "Igor Vasconcelos Ramos", "Gisele Ramos Pinto",
            "Alexandre de Oliveira", "Karina Barbosa Santos", "Fábio Augusto Ramos", "Priscila Maria Rezende",
            "Douglas de Melo Pinto", "Luana Letícia Costa"
        );

        // 3. Create Bulk Clients with growth over 2.4 years (29 months)
        for (int i = 1; i <= 50; i++) {
            boolean active = i % 8 != 0; // Every 8th client is inactive
            String name = realNames.get(i - 1);
            
            // Distribute registration dates over 29 months (2.4 years)
            int monthsAgo = (50 - i) * 29 / 50;
            LocalDate regDate = LocalDate.now().minusMonths(monthsAgo).minusDays(i % 28);
            Instant createdAt = regDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
            
            Client client = clientRepository.saveAndFlush(Client.builder()
                    .owner(testUser)
                    .name(name)
                    .email(name.toLowerCase().replace(" ", "") + "@academia.com")
                    .phone(String.format("+55119%04d%04d", i, i))
                    .document(String.format("%03d.111.222-%02d", i, i))
                    .active(active)
                    .build());
            
            // Persist historical created_at date to show accurate growth chart
            clientRepository.updateCreatedAt(client.getId(), createdAt);
        }
        
        List<Client> allClients = clientRepository.findAll();
        LocalDate today = LocalDate.now();

        // 4. Create Subscriptions & Cycles
        // Distribute subscriptions among the first 45 clients
        for (int i = 0; i < 45; i++) {
            Client c = allClients.get(i);
            Plan p = (i % 3 == 0) ? planPro : (i % 5 == 0) ? planEnterprise : planBasic;
            
            Subscription.Status status;
            LocalDate startDate;
            LocalDate nextDueDate;
            
            // Align subscription startDate with client creation date
            int monthsAgo = (50 - (i + 1)) * 29 / 50;
            startDate = today.minusMonths(monthsAgo).minusDays(i % 20);
            
            if (i < 5) { // TRIAL (Only for planEnterprise because planBasic/planPro has trialDays=0)
                status = Subscription.Status.TRIAL;
                startDate = today.minusDays(2);
                nextDueDate = today.plusDays(p.getTrialDays() - 2);
            } else if (i < 35) { // ACTIVE
                status = Subscription.Status.ACTIVE;
                nextDueDate = today.plusDays(i % 15 + 1);
            } else if (i < 41) { // OVERDUE
                status = Subscription.Status.OVERDUE;
                nextDueDate = today.minusDays(i % 10 + 1);
            } else { // SUSPENDED
                status = Subscription.Status.SUSPENDED;
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
        
        cycleRepository.save(SubscriptionCycle.builder().subscription(s1).amountCents(23990).dueDate(today.minusYears(2)).status(SubscriptionCycle.CycleStatus.PAID).build());
        cycleRepository.save(SubscriptionCycle.builder().subscription(s2).amountCents(79990).dueDate(today.minusMonths(2)).status(SubscriptionCycle.CycleStatus.PAID).build());
        cycleRepository.save(SubscriptionCycle.builder().subscription(s2).amountCents(79990).dueDate(today.plusDays(10)).status(SubscriptionCycle.CycleStatus.PENDING).build());
        
        log.info("Massive test data generation completed.");
    }
}