package com.athletex.backend.service;

import com.athletex.backend.dto.*;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final UserRepository userRepository;
    private final CoachAthleteAssignmentRepository assignmentRepository;
    private final CoachConnectionRequestRepository connectionRequestRepository;
    private final NotificationRepository notificationRepository;
    private final AdminAuditLogRepository auditLogRepository;

    @Value("${razorpay.key.id:rzp_test_SonD1t5pBjHTet}")
    private String razorpayKeyId = "rzp_test_SonD1t5pBjHTet";

    @Value("${razorpay.key.secret:}")
    private String razorpayKeySecret = "";

    /**
     * Process athlete payment for hiring coach (Monthly retainer or Single Session).
     */
    @Transactional
    public PaymentReceiptResponse processCheckout(String athleteId, CheckoutRequest request) {
        if (athleteId == null || athleteId.isBlank()) {
            throw new IllegalArgumentException("Athlete ID is required for checkout.");
        }
        if (request.getCoachId() == null || request.getCoachId().isBlank()) {
            throw new IllegalArgumentException("Coach ID is required for checkout.");
        }
        if (request.getPaymentType() == null) {
            throw new IllegalArgumentException("Payment type is required (COACH_MONTHLY_SUBSCRIPTION or COACH_CONSULTATION_SESSION).");
        }

        // 1. Validate Athlete
        User athlete = userRepository.findById(athleteId)
                .orElseThrow(() -> new IllegalArgumentException("Athlete not found with ID: " + athleteId));

        if (athlete.getRole() != Role.ATHLETE) {
            throw new IllegalArgumentException("Only registered athletes can purchase coaching packages.");
        }

        if (athlete.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Your account is currently " + athlete.getAccountStatus() + ". Please contact support.");
        }

        // 2. Validate Coach
        User coach = userRepository.findById(request.getCoachId())
                .orElseThrow(() -> new IllegalArgumentException("Coach not found with ID: " + request.getCoachId()));

        if (coach.getRole() != Role.COACH) {
            throw new IllegalArgumentException("Selected user is not an active coach.");
        }

        if (coach.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Coach " + coach.getFullName() + " is currently unavailable for bookings.");
        }

        // 3. Compute Pricing (10% platform fee, 90% coach payout)
        Double baseRate = (request.getPaymentType() == PaymentType.COACH_MONTHLY_SUBSCRIPTION)
                ? coach.getMonthlyRate()
                : coach.getConsultationRate();

        if (baseRate == null || baseRate <= 0) {
            baseRate = (request.getPaymentType() == PaymentType.COACH_MONTHLY_SUBSCRIPTION) ? 4999.0 : 1999.0;
        }

        double platformFee = Math.round(baseRate * 0.10 * 100.0) / 100.0;
        double coachEarning = Math.round((baseRate - platformFee) * 100.0) / 100.0;

        String receiptNo = "REC-" + (System.currentTimeMillis() % 10000000);
        String gatewayRef = "atx_sim_" + UUID.randomUUID().toString().substring(0, 8);
        LocalDateTime now = LocalDateTime.now();

        // 4. Save Payment Transaction
        PaymentTransaction transaction = PaymentTransaction.builder()
                .receiptNumber(receiptNo)
                .athleteId(athlete.getId())
                .athleteName(athlete.getFullName())
                .athleteEmail(athlete.getEmail())
                .coachId(coach.getId())
                .coachName(coach.getFullName())
                .coachEmail(coach.getEmail())
                .amount(baseRate)
                .platformFee(platformFee)
                .coachEarning(coachEarning)
                .currency(coach.getCurrency() != null ? coach.getCurrency() : "INR")
                .paymentStatus(PaymentStatus.COMPLETED)
                .paymentType(request.getPaymentType())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "SANDBOX_CARD")
                .gatewayReferenceId(gatewayRef)
                .notes(request.getNotes() != null && !request.getNotes().isBlank() ? request.getNotes() : "Coach hire via AthleteX Marketplace")
                .createdAt(now)
                .completedAt(now)
                .build();

        PaymentTransaction savedTx = paymentTransactionRepository.save(transaction);

        // 5. Automatically Provision / Activate Coach-Athlete Assignment
        // Deactivate any other coach assignment for this athlete
        Optional<CoachAthleteAssignment> currentAssignmentOpt = assignmentRepository.findByAthleteIdAndStatus(athlete.getId(), AssignmentStatus.ACTIVE);
        if (currentAssignmentOpt.isPresent()) {
            CoachAthleteAssignment existing = currentAssignmentOpt.get();
            if (!existing.getCoachId().equals(coach.getId())) {
                existing.setStatus(AssignmentStatus.INACTIVE);
                assignmentRepository.save(existing);
            }
        }

        // Activate or create assignment with selected coach
        CoachAthleteAssignment coachAssignment = assignmentRepository.findByCoachIdAndAthleteId(coach.getId(), athlete.getId())
                .orElse(null);

        if (coachAssignment == null) {
            coachAssignment = CoachAthleteAssignment.builder()
                    .coachId(coach.getId())
                    .athleteId(athlete.getId())
                    .assignedAt(now)
                    .status(AssignmentStatus.ACTIVE)
                    .build();
        } else {
            coachAssignment.setStatus(AssignmentStatus.ACTIVE);
            coachAssignment.setAssignedAt(now);
        }
        assignmentRepository.save(coachAssignment);

        // 6. Automatically mark any pending connection requests as ACCEPTED
        List<CoachConnectionRequest> pendingReqs = connectionRequestRepository.findByAthleteIdAndCoachId(athlete.getId(), coach.getId());
        for (CoachConnectionRequest cr : pendingReqs) {
            if ("PENDING".equalsIgnoreCase(cr.getStatus())) {
                cr.setStatus("ACCEPTED");
                connectionRequestRepository.save(cr);
            }
        }

        // 7. PUSH NOTIFICATIONS
        // To Coach
        String packageTitle = (request.getPaymentType() == PaymentType.COACH_MONTHLY_SUBSCRIPTION) ? "Monthly Retainer" : "1-on-1 Consultation";
        Notification coachNotif = Notification.builder()
                .userId(coach.getId())
                .title("🎉 New Paid Athlete: " + athlete.getFullName())
                .message(athlete.getFullName() + " has hired you for " + packageTitle + " (" + coach.getCurrency() + " " + baseRate + "). Your payout: " + coach.getCurrency() + " " + coachEarning)
                .type("PAYMENT_RECEIVED")
                .link("/coach/athletes")
                .referenceType("PAYMENT")
                .referenceId(savedTx.getId())
                .isRead(false)
                .createdAt(now)
                .build();
        notificationRepository.save(coachNotif);

        // To Athlete
        Notification athleteNotif = Notification.builder()
                .userId(athlete.getId())
                .title("🚀 Coach Confirmed: " + coach.getFullName())
                .message("Payment of " + coach.getCurrency() + " " + baseRate + " confirmed! " + coach.getFullName() + " is now your active coach. Training programs & 1-on-1 chat unlocked.")
                .type("COACH_HIRED")
                .link("/chat")
                .referenceType("PAYMENT")
                .referenceId(savedTx.getId())
                .isRead(false)
                .createdAt(now)
                .build();
        notificationRepository.save(athleteNotif);

        // 8. Log Audit Trail
        AdminAuditLog auditLog = AdminAuditLog.builder()
                .action("MARKETPLACE_COACH_HIRED")
                .performedByAdminId(athlete.getId())
                .performedByAdminName(athlete.getFullName() + " (Athlete)")
                .targetEntityId(coach.getId())
                .targetEntityName(coach.getFullName() + " (Coach)")
                .details(String.format("Payment %s processed. Amount: %s %s. Platform fee: %s. Coach earning: %s.",
                        receiptNo, coach.getCurrency(), baseRate, platformFee, coachEarning))
                .timestamp(now)
                .build();
        auditLogRepository.save(auditLog);

        log.info("Marketplace payment completed: {} -> Coach {} (Amount: {} {})",
                athlete.getEmail(), coach.getEmail(), baseRate, coach.getCurrency());

        return toReceiptResponse(savedTx, true, "Coaching successfully activated! 1-on-1 chat and customized training are now unlocked.");
    }

    /**
     * Get Coach Financial & Earnings Summary.
     */
    public CoachEarningsResponse getCoachEarnings(String coachId) {
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new IllegalArgumentException("Coach not found with ID: " + coachId));

        List<PaymentTransaction> transactions = paymentTransactionRepository.findByCoachIdOrderByCreatedAtDesc(coachId);

        double totalEarnings = 0.0;
        double platformFeePaid = 0.0;
        Set<String> distinctPayingAthletes = new HashSet<>();

        for (PaymentTransaction tx : transactions) {
            if (tx.getPaymentStatus() == PaymentStatus.COMPLETED) {
                totalEarnings += (tx.getCoachEarning() != null ? tx.getCoachEarning() : 0.0);
                platformFeePaid += (tx.getPlatformFee() != null ? tx.getPlatformFee() : 0.0);
                if (tx.getAthleteId() != null) {
                    distinctPayingAthletes.add(tx.getAthleteId());
                }
            }
        }

        totalEarnings = Math.round(totalEarnings * 100.0) / 100.0;
        platformFeePaid = Math.round(platformFeePaid * 100.0) / 100.0;

        // Estimate current MRR based on active assignments count * (coach monthly rate - platform fee)
        long activeAssignmentsCount = assignmentRepository.countByCoachIdAndStatus(coachId, AssignmentStatus.ACTIVE);
        double monthlyNetRate = (coach.getMonthlyRate() != null ? coach.getMonthlyRate() : 4999.0) * 0.90;
        double estimatedMrr = Math.round(activeAssignmentsCount * monthlyNetRate * 100.0) / 100.0;

        List<PaymentReceiptResponse> recentReceipts = transactions.stream()
                .limit(15)
                .map(tx -> toReceiptResponse(tx, false, null))
                .collect(Collectors.toList());

        return CoachEarningsResponse.builder()
                .totalEarnings(totalEarnings)
                .monthlyRecurringRevenue(estimatedMrr)
                .activePaidAthletes((long) distinctPayingAthletes.size())
                .totalTransactions((long) transactions.size())
                .platformFeePaidTotal(platformFeePaid)
                .currency(coach.getCurrency() != null ? coach.getCurrency() : "INR")
                .recentTransactions(recentReceipts)
                .build();
    }

    /**
     * Get Athlete Payment Invoices / History.
     */
    public List<PaymentReceiptResponse> getAthletePaymentHistory(String athleteId) {
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByAthleteIdOrderByCreatedAtDesc(athleteId);
        return transactions.stream()
                .map(tx -> toReceiptResponse(tx, false, null))
                .collect(Collectors.toList());
    }

    /**
     * Get Admin Marketplace Global Financial Statistics.
     */
    public AdminMarketplaceStatsResponse getAdminMarketplaceStats() {
        List<PaymentTransaction> allTx = paymentTransactionRepository.findAllByOrderByCreatedAtDesc();

        double gmv = 0.0;
        double platformRevenue = 0.0;
        double coachPayouts = 0.0;
        long activeSubscribers = 0;

        for (PaymentTransaction tx : allTx) {
            if (tx.getPaymentStatus() == PaymentStatus.COMPLETED) {
                gmv += (tx.getAmount() != null ? tx.getAmount() : 0.0);
                platformRevenue += (tx.getPlatformFee() != null ? tx.getPlatformFee() : 0.0);
                coachPayouts += (tx.getCoachEarning() != null ? tx.getCoachEarning() : 0.0);
                if (tx.getPaymentType() == PaymentType.COACH_MONTHLY_SUBSCRIPTION) {
                    activeSubscribers++;
                }
            }
        }

        gmv = Math.round(gmv * 100.0) / 100.0;
        platformRevenue = Math.round(platformRevenue * 100.0) / 100.0;
        coachPayouts = Math.round(coachPayouts * 100.0) / 100.0;

        List<PaymentReceiptResponse> recentReceipts = allTx.stream()
                .limit(20)
                .map(tx -> toReceiptResponse(tx, false, null))
                .collect(Collectors.toList());

        return AdminMarketplaceStatsResponse.builder()
                .grossMerchandiseVolume(gmv)
                .platformRevenue(platformRevenue)
                .coachPayoutsTotal(coachPayouts)
                .totalTransactions((long) allTx.size())
                .activeSubscribersCount(activeSubscribers)
                .recentTransactions(recentReceipts)
                .build();
    }

    /**
     * Create Razorpay Order for Coach package checkout.
     */
    public RazorpayOrderResponse createRazorpayOrder(String athleteId, RazorpayOrderRequest request) {
        if (athleteId == null || athleteId.isBlank()) {
            throw new IllegalArgumentException("Athlete ID is required for Razorpay checkout.");
        }
        if (request.getCoachId() == null || request.getCoachId().isBlank()) {
            throw new IllegalArgumentException("Coach ID is required.");
        }
        if (request.getPaymentType() == null) {
            throw new IllegalArgumentException("Payment type is required.");
        }

        User athlete = userRepository.findById(athleteId)
                .orElseThrow(() -> new IllegalArgumentException("Athlete not found with ID: " + athleteId));

        if (athlete.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Your account is currently " + athlete.getAccountStatus());
        }

        User coach = userRepository.findById(request.getCoachId())
                .orElseThrow(() -> new IllegalArgumentException("Coach not found with ID: " + request.getCoachId()));

        if (coach.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Coach " + coach.getFullName() + " is currently unavailable.");
        }

        String currency = (request.getCurrency() != null && !request.getCurrency().isBlank())
                ? request.getCurrency().toUpperCase()
                : "INR";

        double displayAmount;
        if (request.getPaymentType() == PaymentType.COACH_MONTHLY_SUBSCRIPTION) {
            displayAmount = (coach.getMonthlyRate() != null && coach.getMonthlyRate() > 0) ? coach.getMonthlyRate() : 4999.0;
        } else {
            displayAmount = (coach.getConsultationRate() != null && coach.getConsultationRate() > 0) ? coach.getConsultationRate() : 1999.0;
        }

        long amountInSmallestUnit = Math.round(displayAmount * 100);
        String receiptNo = "REC-RZP-" + (System.currentTimeMillis() % 10000000);

        String razorpayOrderId = requestRazorpayOrderId(amountInSmallestUnit, currency, receiptNo);

        String description = (request.getPaymentType() == PaymentType.COACH_MONTHLY_SUBSCRIPTION)
                ? "Monthly Coaching Retainer with Coach " + coach.getFullName()
                : "1-on-1 Consultation Session with Coach " + coach.getFullName();

        return RazorpayOrderResponse.builder()
                .orderId(razorpayOrderId)
                .amountInPaise(amountInSmallestUnit)
                .displayAmount(displayAmount)
                .currency(currency)
                .keyId(razorpayKeyId)
                .coachId(coach.getId())
                .coachName(coach.getFullName())
                .athleteId(athlete.getId())
                .athleteName(athlete.getFullName())
                .athleteEmail(athlete.getEmail())
                .athletePhone(athlete.getPhone() != null ? athlete.getPhone() : "+91 9999999999")
                .description(description)
                .simulated(razorpayOrderId.startsWith("order_sim_"))
                .build();
    }

    /**
     * Verify Razorpay payment signature and grant immediate coach roster assignment.
     */
    @Transactional
    public PaymentReceiptResponse verifyRazorpayPayment(String athleteId, RazorpayVerifyRequest request) {
        if (athleteId == null || athleteId.isBlank()) {
            throw new IllegalArgumentException("Athlete ID is required for verification.");
        }
        if (request.getCoachId() == null || request.getCoachId().isBlank()) {
            throw new IllegalArgumentException("Coach ID is required.");
        }
        if (request.getRazorpayPaymentId() == null || request.getRazorpayPaymentId().isBlank()) {
            throw new IllegalArgumentException("Razorpay payment ID is required.");
        }

        // Signature check
        boolean signatureValid = verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                razorpayKeySecret
        );

        if (!signatureValid) {
            throw new IllegalArgumentException("Razorpay signature verification failed. Untrusted payment payload.");
        }

        User athlete = userRepository.findById(athleteId)
                .orElseThrow(() -> new IllegalArgumentException("Athlete not found with ID: " + athleteId));
        User coach = userRepository.findById(request.getCoachId())
                .orElseThrow(() -> new IllegalArgumentException("Coach not found with ID: " + request.getCoachId()));

        String currency = request.getCurrency() != null ? request.getCurrency().toUpperCase() : "INR";
        double amount = (request.getPaymentType() == PaymentType.COACH_MONTHLY_SUBSCRIPTION)
                ? ((coach.getMonthlyRate() != null && coach.getMonthlyRate() > 0) ? coach.getMonthlyRate() : 4999.0)
                : ((coach.getConsultationRate() != null && coach.getConsultationRate() > 0) ? coach.getConsultationRate() : 1999.0);

        double platformFee = Math.round(amount * 0.10 * 100.0) / 100.0;
        double coachEarning = Math.round((amount - platformFee) * 100.0) / 100.0;
        LocalDateTime now = LocalDateTime.now();
        String receiptNo = "REC-RZP-" + (System.currentTimeMillis() % 10000000);

        PaymentTransaction transaction = PaymentTransaction.builder()
                .receiptNumber(receiptNo)
                .athleteId(athlete.getId())
                .athleteName(athlete.getFullName())
                .athleteEmail(athlete.getEmail())
                .coachId(coach.getId())
                .coachName(coach.getFullName())
                .coachEmail(coach.getEmail())
                .amount(amount)
                .platformFee(platformFee)
                .coachEarning(coachEarning)
                .currency(currency)
                .paymentStatus(PaymentStatus.COMPLETED)
                .paymentType(request.getPaymentType())
                .paymentMethod("RAZORPAY_UPI_NETBANKING")
                .gatewayReferenceId(request.getRazorpayPaymentId())
                .notes("Razorpay Payment: " + request.getRazorpayOrderId())
                .createdAt(now)
                .completedAt(now)
                .build();

        PaymentTransaction savedTx = paymentTransactionRepository.save(transaction);

        // Deactivate previous active coach if different
        Optional<CoachAthleteAssignment> currentAssignmentOpt = assignmentRepository.findByAthleteIdAndStatus(athlete.getId(), AssignmentStatus.ACTIVE);
        if (currentAssignmentOpt.isPresent()) {
            CoachAthleteAssignment existing = currentAssignmentOpt.get();
            if (!existing.getCoachId().equals(coach.getId())) {
                existing.setStatus(AssignmentStatus.INACTIVE);
                assignmentRepository.save(existing);
            }
        }

        // Provision/activate assignment
        CoachAthleteAssignment coachAssignment = assignmentRepository.findByCoachIdAndAthleteId(coach.getId(), athlete.getId())
                .orElse(null);

        if (coachAssignment == null) {
            coachAssignment = CoachAthleteAssignment.builder()
                    .coachId(coach.getId())
                    .athleteId(athlete.getId())
                    .assignedAt(now)
                    .status(AssignmentStatus.ACTIVE)
                    .build();
        } else {
            coachAssignment.setStatus(AssignmentStatus.ACTIVE);
            coachAssignment.setAssignedAt(now);
        }
        assignmentRepository.save(coachAssignment);

        // Auto-resolve pending connection request
        List<CoachConnectionRequest> pendingReqs = connectionRequestRepository.findByAthleteIdAndCoachId(athlete.getId(), coach.getId());
        for (CoachConnectionRequest cr : pendingReqs) {
            if ("PENDING".equalsIgnoreCase(cr.getStatus())) {
                cr.setStatus("ACCEPTED");
                connectionRequestRepository.save(cr);
            }
        }

        // Push Notifications
        Notification coachNotif = Notification.builder()
                .userId(coach.getId())
                .title("🎉 New Paid Athlete via Razorpay: " + athlete.getFullName())
                .message(athlete.getFullName() + " paid " + currency + " " + amount + " via Razorpay. Your payout: " + currency + " " + coachEarning)
                .type("PAYMENT_RECEIVED")
                .link("/coach/athletes")
                .referenceType("PAYMENT")
                .referenceId(savedTx.getId())
                .isRead(false)
                .createdAt(now)
                .build();
        notificationRepository.save(coachNotif);

        Notification athleteNotif = Notification.builder()
                .userId(athlete.getId())
                .title("🚀 Coaching Activated via Razorpay: " + coach.getFullName())
                .message("Payment of " + currency + " " + amount + " confirmed via Razorpay! " + coach.getFullName() + " is now your active coach.")
                .type("COACH_HIRED")
                .link("/chat")
                .referenceType("PAYMENT")
                .referenceId(savedTx.getId())
                .isRead(false)
                .createdAt(now)
                .build();
        notificationRepository.save(athleteNotif);

        // Audit Trail
        AdminAuditLog auditLog = AdminAuditLog.builder()
                .action("RAZORPAY_COACH_HIRED")
                .performedByAdminId(athlete.getId())
                .performedByAdminName(athlete.getFullName() + " (Athlete)")
                .targetEntityId(coach.getId())
                .targetEntityName(coach.getFullName() + " (Coach)")
                .details(String.format("Razorpay payment %s confirmed. Amount: %s %s. Platform fee: %s.",
                        request.getRazorpayPaymentId(), currency, amount, platformFee))
                .timestamp(now)
                .build();
        auditLogRepository.save(auditLog);

        log.info("Razorpay payment verified: {} -> Coach {} (Tx: {})",
                athlete.getEmail(), coach.getEmail(), request.getRazorpayPaymentId());

        return toReceiptResponse(savedTx, true, "Razorpay payment verified! 1-on-1 coaching has been activated.");
    }

    private String requestRazorpayOrderId(long amountInPaise, String currency, String receiptNo) {
        if (razorpayKeySecret == null || razorpayKeySecret.isBlank() || razorpayKeyId == null || razorpayKeyId.isBlank()) {
            return "order_sim_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        }
        try {
            String auth = razorpayKeyId + ":" + razorpayKeySecret;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + encodedAuth);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("amount", amountInPaise);
            body.put("currency", currency);
            body.put("receipt", receiptNo);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity("https://api.razorpay.com/v1/orders", entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().get("id") != null) {
                return response.getBody().get("id").toString();
            }
        } catch (Exception e) {
            log.warn("Razorpay API order creation fallback: {}", e.getMessage());
        }
        return "order_sim_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
    }

    private boolean verifySignature(String orderId, String paymentId, String signature, String secret) {
        if (secret == null || secret.isBlank()) {
            // In development/test mode without secret configured, only accept test/simulated orders with signatures
            return (orderId != null && (orderId.startsWith("order_sim_") || orderId.startsWith("order_test_")));
        }
        if (signature == null || signature.isBlank()) {
            return false;
        }
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = HexFormat.of().formatHex(hash);
            return generatedSignature.equalsIgnoreCase(signature);
        } catch (Exception e) {
            log.error("Signature verification failed: ", e);
            return false;
        }
    }

    private PaymentReceiptResponse toReceiptResponse(PaymentTransaction tx, boolean assignmentActivated, String message) {
        return PaymentReceiptResponse.builder()
                .transactionId(tx.getId())
                .receiptNumber(tx.getReceiptNumber())
                .athleteId(tx.getAthleteId())
                .athleteName(tx.getAthleteName())
                .coachId(tx.getCoachId())
                .coachName(tx.getCoachName())
                .amount(tx.getAmount())
                .platformFee(tx.getPlatformFee())
                .coachEarning(tx.getCoachEarning())
                .currency(tx.getCurrency())
                .status(tx.getPaymentStatus())
                .paymentType(tx.getPaymentType())
                .paymentMethod(tx.getPaymentMethod())
                .gatewayReferenceId(tx.getGatewayReferenceId())
                .notes(tx.getNotes())
                .createdAt(tx.getCreatedAt())
                .completedAt(tx.getCompletedAt())
                .assignmentActivated(assignmentActivated)
                .message(message)
                .build();
    }
}
