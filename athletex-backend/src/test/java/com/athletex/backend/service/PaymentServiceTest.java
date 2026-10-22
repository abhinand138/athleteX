package com.athletex.backend.service;

import com.athletex.backend.dto.AdminMarketplaceStatsResponse;
import com.athletex.backend.dto.CheckoutRequest;
import com.athletex.backend.dto.CoachEarningsResponse;
import com.athletex.backend.dto.PaymentReceiptResponse;
import com.athletex.backend.model.*;
import com.athletex.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CoachAthleteAssignmentRepository assignmentRepository;

    @Mock
    private CoachConnectionRequestRepository connectionRequestRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private AdminAuditLogRepository auditLogRepository;

    @InjectMocks
    private PaymentService paymentService;

    private User athlete;
    private User coach;

    @BeforeEach
    void setUp() {
        athlete = User.builder()
                .id("athlete-123")
                .fullName("Alex Rivera")
                .email("alex@athletex.com")
                .role(Role.ATHLETE)
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        coach = User.builder()
                .id("coach-456")
                .fullName("Coach Marcus Vance")
                .email("marcus@athletex.com")
                .role(Role.COACH)
                .accountStatus(AccountStatus.ACTIVE)
                .monthlyRate(4999.0)
                .consultationRate(1999.0)
                .currency("INR")
                .build();
    }

    @Test
    @DisplayName("Should process monthly checkout successfully and activate assignment")
    void testProcessCheckoutMonthlySuccess() {
        when(userRepository.findById("athlete-123")).thenReturn(Optional.of(athlete));
        when(userRepository.findById("coach-456")).thenReturn(Optional.of(coach));

        when(paymentTransactionRepository.save(any(PaymentTransaction.class)))
                .thenAnswer(invocation -> {
                    PaymentTransaction tx = invocation.getArgument(0);
                    tx.setId("tx-999");
                    return tx;
                });

        when(assignmentRepository.findByAthleteIdAndStatus("athlete-123", AssignmentStatus.ACTIVE))
                .thenReturn(Optional.empty());
        when(assignmentRepository.findByCoachIdAndAthleteId("coach-456", "athlete-123"))
                .thenReturn(Optional.empty());
        when(connectionRequestRepository.findByAthleteIdAndCoachId("athlete-123", "coach-456"))
                .thenReturn(Collections.emptyList());

        CheckoutRequest request = CheckoutRequest.builder()
                .coachId("coach-456")
                .paymentType(PaymentType.COACH_MONTHLY_SUBSCRIPTION)
                .paymentMethod("SANDBOX_CARD")
                .build();

        PaymentReceiptResponse response = paymentService.processCheckout("athlete-123", request);

        assertNotNull(response);
        assertEquals(4999.0, response.getAmount());
        assertEquals(499.9, response.getPlatformFee()); // 10%
        assertEquals(4499.1, response.getCoachEarning()); // 90%
        assertEquals("INR", response.getCurrency());
        assertEquals(PaymentStatus.COMPLETED, response.getStatus());
        assertTrue(response.isAssignmentActivated());

        // Verify assignment saved
        verify(assignmentRepository).save(any(CoachAthleteAssignment.class));

        // Verify notifications sent to both Coach and Athlete
        verify(notificationRepository, times(2)).save(any(Notification.class));

        // Verify audit log saved
        verify(auditLogRepository).save(any(AdminAuditLog.class));
    }

    @Test
    @DisplayName("Should process consultation session with consultation rate")
    void testProcessCheckoutConsultationSuccess() {
        when(userRepository.findById("athlete-123")).thenReturn(Optional.of(athlete));
        when(userRepository.findById("coach-456")).thenReturn(Optional.of(coach));

        when(paymentTransactionRepository.save(any(PaymentTransaction.class)))
                .thenAnswer(invocation -> {
                    PaymentTransaction tx = invocation.getArgument(0);
                    tx.setId("tx-1000");
                    return tx;
                });

        when(assignmentRepository.findByAthleteIdAndStatus("athlete-123", AssignmentStatus.ACTIVE))
                .thenReturn(Optional.empty());
        when(assignmentRepository.findByCoachIdAndAthleteId("coach-456", "athlete-123"))
                .thenReturn(Optional.empty());

        CheckoutRequest request = CheckoutRequest.builder()
                .coachId("coach-456")
                .paymentType(PaymentType.COACH_CONSULTATION_SESSION)
                .build();

        PaymentReceiptResponse response = paymentService.processCheckout("athlete-123", request);

        assertEquals(1999.0, response.getAmount());
        assertEquals(199.9, response.getPlatformFee());
        assertEquals(1799.1, response.getCoachEarning());
        assertEquals("INR", response.getCurrency());
    }

    @Test
    @DisplayName("Should reject checkout if coach is suspended")
    void testProcessCheckoutRejectsSuspendedCoach() {
        coach.setAccountStatus(AccountStatus.SUSPENDED);
        when(userRepository.findById("athlete-123")).thenReturn(Optional.of(athlete));
        when(userRepository.findById("coach-456")).thenReturn(Optional.of(coach));

        CheckoutRequest request = CheckoutRequest.builder()
                .coachId("coach-456")
                .paymentType(PaymentType.COACH_MONTHLY_SUBSCRIPTION)
                .build();

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                paymentService.processCheckout("athlete-123", request)
        );

        assertTrue(ex.getMessage().contains("currently unavailable"));
        verifyNoInteractions(paymentTransactionRepository);
    }

    @Test
    @DisplayName("Should compute coach earnings summary accurately")
    void testGetCoachEarnings() {
        when(userRepository.findById("coach-456")).thenReturn(Optional.of(coach));

        PaymentTransaction tx1 = PaymentTransaction.builder()
                .id("tx-1")
                .coachId("coach-456")
                .athleteId("athlete-1")
                .amount(4999.0)
                .platformFee(499.9)
                .coachEarning(4499.1)
                .paymentStatus(PaymentStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();

        PaymentTransaction tx2 = PaymentTransaction.builder()
                .id("tx-2")
                .coachId("coach-456")
                .athleteId("athlete-2")
                .amount(4999.0)
                .platformFee(499.9)
                .coachEarning(4499.1)
                .paymentStatus(PaymentStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();

        when(paymentTransactionRepository.findByCoachIdOrderByCreatedAtDesc("coach-456"))
                .thenReturn(List.of(tx1, tx2));
        when(assignmentRepository.countByCoachIdAndStatus("coach-456", AssignmentStatus.ACTIVE))
                .thenReturn(2L);

        CoachEarningsResponse response = paymentService.getCoachEarnings("coach-456");

        assertEquals(8998.2, response.getTotalEarnings());
        assertEquals(999.8, response.getPlatformFeePaidTotal());
        assertEquals(2L, response.getActivePaidAthletes());
        assertEquals(8998.2, response.getMonthlyRecurringRevenue()); // 2 * 4499.1
        assertEquals("INR", response.getCurrency());
    }

    @Test
    @DisplayName("Should compute global admin marketplace metrics")
    void testGetAdminMarketplaceStats() {
        PaymentTransaction tx = PaymentTransaction.builder()
                .id("tx-1")
                .amount(4999.0)
                .platformFee(499.9)
                .coachEarning(4499.1)
                .paymentStatus(PaymentStatus.COMPLETED)
                .paymentType(PaymentType.COACH_MONTHLY_SUBSCRIPTION)
                .createdAt(LocalDateTime.now())
                .build();

        when(paymentTransactionRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(tx));

        AdminMarketplaceStatsResponse stats = paymentService.getAdminMarketplaceStats();

        assertEquals(4999.0, stats.getGrossMerchandiseVolume());
        assertEquals(499.9, stats.getPlatformRevenue());
        assertEquals(4499.1, stats.getCoachPayoutsTotal());
        assertEquals(1L, stats.getTotalTransactions());
        assertEquals(1L, stats.getActiveSubscribersCount());
    }

    @Test
    @DisplayName("Should create Razorpay order successfully")
    void testCreateRazorpayOrderSuccess() {
        when(userRepository.findById("athlete-123")).thenReturn(Optional.of(athlete));
        when(userRepository.findById("coach-456")).thenReturn(Optional.of(coach));

        com.athletex.backend.dto.RazorpayOrderRequest req = com.athletex.backend.dto.RazorpayOrderRequest.builder()
                .coachId("coach-456")
                .paymentType(PaymentType.COACH_MONTHLY_SUBSCRIPTION)
                .currency("INR")
                .build();

        com.athletex.backend.dto.RazorpayOrderResponse order = paymentService.createRazorpayOrder("athlete-123", req);

        assertNotNull(order);
        assertNotNull(order.getOrderId());
        assertEquals("INR", order.getCurrency());
        assertEquals(4999.0, order.getDisplayAmount());
        assertEquals(499900L, order.getAmountInPaise());
        assertEquals("rzp_test_SonD1t5pBjHTet", order.getKeyId());
    }

    @Test
    @DisplayName("Should verify Razorpay payment and activate roster")
    void testVerifyRazorpayPaymentSuccess() {
        when(userRepository.findById("athlete-123")).thenReturn(Optional.of(athlete));
        when(userRepository.findById("coach-456")).thenReturn(Optional.of(coach));

        when(paymentTransactionRepository.save(any(PaymentTransaction.class)))
                .thenAnswer(invocation -> {
                    PaymentTransaction tx = invocation.getArgument(0);
                    tx.setId("tx-rzp-1");
                    return tx;
                });

        when(assignmentRepository.findByAthleteIdAndStatus("athlete-123", AssignmentStatus.ACTIVE))
                .thenReturn(Optional.empty());
        when(assignmentRepository.findByCoachIdAndAthleteId("coach-456", "athlete-123"))
                .thenReturn(Optional.empty());
        when(connectionRequestRepository.findByAthleteIdAndCoachId("athlete-123", "coach-456"))
                .thenReturn(Collections.emptyList());

        com.athletex.backend.dto.RazorpayVerifyRequest verifyReq = com.athletex.backend.dto.RazorpayVerifyRequest.builder()
                .coachId("coach-456")
                .paymentType(PaymentType.COACH_MONTHLY_SUBSCRIPTION)
                .currency("INR")
                .amount(4999.0)
                .razorpayOrderId("order_test_123")
                .razorpayPaymentId("pay_test_456")
                .razorpaySignature("sig_dummy")
                .build();

        PaymentReceiptResponse receipt = paymentService.verifyRazorpayPayment("athlete-123", verifyReq);

        assertNotNull(receipt);
        assertEquals(4999.0, receipt.getAmount());
        assertEquals(PaymentStatus.COMPLETED, receipt.getStatus());
        assertEquals("RAZORPAY_UPI_NETBANKING", receipt.getPaymentMethod());
        assertEquals("pay_test_456", receipt.getGatewayReferenceId());
        assertTrue(receipt.isAssignmentActivated());

        verify(assignmentRepository).save(any(CoachAthleteAssignment.class));
        verify(notificationRepository, times(2)).save(any(Notification.class));
    }
}
