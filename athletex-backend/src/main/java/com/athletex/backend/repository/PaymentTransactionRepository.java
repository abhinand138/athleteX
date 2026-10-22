package com.athletex.backend.repository;

import com.athletex.backend.model.PaymentStatus;
import com.athletex.backend.model.PaymentTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction, String> {

    List<PaymentTransaction> findByAthleteIdOrderByCreatedAtDesc(String athleteId);

    List<PaymentTransaction> findByCoachIdOrderByCreatedAtDesc(String coachId);

    List<PaymentTransaction> findAllByOrderByCreatedAtDesc();

    List<PaymentTransaction> findByCoachIdAndPaymentStatus(String coachId, PaymentStatus status);

    long countByCoachIdAndPaymentStatus(String coachId, PaymentStatus status);
}
