package com.restaurant.operationsprepare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "place")
@Data
@EqualsAndHashCode(callSuper = false)
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "type", nullable = false)
    private String type; // 補充元先区分

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "display_order")
    @JsonProperty("displayOrder")
    private Integer displayOrder;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    // 関連エンティティ（循環参照を防ぐため一時的にコメントアウト）
    // @OneToMany(mappedBy = "sourceLocation", cascade = CascadeType.ALL, fetch =
    // FetchType.LAZY)
    // @JsonManagedReference
    // private List<ItemReplenishment> sourceReplenishments;

    // @OneToMany(mappedBy = "destinationLocation", cascade = CascadeType.ALL, fetch
    // = FetchType.LAZY)
    // @JsonManagedReference
    // private List<ItemReplenishment> destinationReplenishments;

    // @OneToMany(mappedBy = "location", cascade = CascadeType.ALL, fetch =
    // FetchType.LAZY)
    // @JsonManagedReference
    // private List<ItemPreparation> itemPreparations;
}
