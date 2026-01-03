package com.restaurant.operationsprepare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reservation")
@Data
@EqualsAndHashCode(callSuper = false)
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "business_date", nullable = false)
    @JsonProperty("businessDate")
    private LocalDate businessDate;

    @Column(name = "product_name", nullable = false, columnDefinition = "TEXT")
    @JsonProperty("productName")
    private String productName; // 商品名

    @Column(name = "reservation_count", nullable = false)
    @JsonProperty("reservationCount")
    private Integer reservationCount; // 予約数

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;
}
