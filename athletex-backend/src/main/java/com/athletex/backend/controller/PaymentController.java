package com.athletex.backend.controller;

import com.athletex.backend.dto.AdminMarketplaceStatsResponse;
import com.athletex.backend.dto.CheckoutRequest;
import com.athletex.backend.dto.CoachEarningsResponse;
import com.athletex.backend.dto.PaymentReceiptResponse;
import com.athletex.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * POST /api/payments/checkout
     * Athlete purchases coaching package (Monthly retainer or Single Session).
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> processCheckout(
            @Valid @RequestBody CheckoutRequest request,
            Authentication authentication) {
        try {
            String actingAthleteId = (authentication != null && authentication.getName() != null)
                    ? authentication.getName()
                    : request.getAthleteId();

            if (actingAthleteId == null || actingAthleteId.isBlank()) {
                actingAthleteId = request.getAthleteId();
            }

            PaymentReceiptResponse receipt = paymentService.processCheckout(actingAthleteId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(receipt);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            log.error("Payment checkout failed: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Payment processing encountered an unexpected error: " + e.getMessage());
        }
    }

    /**
     * GET /api/payments/history
     * Athlete invoice history.
     */
    @GetMapping("/history")
    public ResponseEntity<?> getAthleteHistory(
            @RequestParam(required = false) String athleteId,
            Authentication authentication) {
        try {
            String targetAthleteId = (athleteId != null && !athleteId.isBlank())
                    ? athleteId
                    : (authentication != null ? authentication.getName() : null);

            if (targetAthleteId == null) {
                return ResponseEntity.badRequest().body("Athlete ID is required to fetch payment history.");
            }

            List<PaymentReceiptResponse> history = paymentService.getAthletePaymentHistory(targetAthleteId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * GET /api/payments/coach/earnings
     * Coach revenue, MRR, and transaction metrics.
     */
    @GetMapping("/coach/earnings")
    public ResponseEntity<?> getCoachEarnings(
            @RequestParam(required = false) String coachId,
            Authentication authentication) {
        try {
            String targetCoachId = (coachId != null && !coachId.isBlank())
                    ? coachId
                    : (authentication != null ? authentication.getName() : null);

            if (targetCoachId == null) {
                return ResponseEntity.badRequest().body("Coach ID is required to fetch earnings.");
            }

            CoachEarningsResponse earnings = paymentService.getCoachEarnings(targetCoachId);
            return ResponseEntity.ok(earnings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * GET /api/payments/admin/stats
     * Admin global marketplace financial overview.
     */
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getAdminMarketplaceStats() {
        try {
            AdminMarketplaceStatsResponse stats = paymentService.getAdminMarketplaceStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * POST /api/payments/razorpay/create-order
     * Prepares Razorpay Order for client checkout modal.
     */
    @PostMapping("/razorpay/create-order")
    public ResponseEntity<?> createRazorpayOrder(
            @Valid @RequestBody com.athletex.backend.dto.RazorpayOrderRequest request,
            Authentication authentication) {
        try {
            String actingAthleteId = (authentication != null && authentication.getName() != null)
                    ? authentication.getName()
                    : request.getAthleteId();

            if (actingAthleteId == null || actingAthleteId.isBlank()) {
                actingAthleteId = request.getAthleteId();
            }

            com.athletex.backend.dto.RazorpayOrderResponse order = paymentService.createRazorpayOrder(actingAthleteId, request);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            log.error("Failed to create Razorpay order: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not initialize Razorpay order: " + e.getMessage());
        }
    }

    /**
     * POST /api/payments/razorpay/verify
     * Verifies payment signature and provisions coach roster assignment.
     */
    @PostMapping("/razorpay/verify")
    public ResponseEntity<?> verifyRazorpayPayment(
            @Valid @RequestBody com.athletex.backend.dto.RazorpayVerifyRequest request,
            Authentication authentication) {
        try {
            String actingAthleteId = (authentication != null && authentication.getName() != null)
                    ? authentication.getName()
                    : request.getAthleteId();

            if (actingAthleteId == null || actingAthleteId.isBlank()) {
                actingAthleteId = request.getAthleteId();
            }

            PaymentReceiptResponse receipt = paymentService.verifyRazorpayPayment(actingAthleteId, request);
            return ResponseEntity.ok(receipt);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Failed to verify Razorpay payment: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Razorpay payment verification failed: " + e.getMessage());
        }
    }
}
