package com.uniwa.operationsprepare.repository;

import com.uniwa.operationsprepare.entity.Item;
import jp.co.future.uroborosql.SqlAgent;
import jp.co.future.uroborosql.config.SqlConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ItemRepository {

    @Autowired
    private SqlConfig uroboroSQL;

    private Item mapRow(ResultSet rs) throws SQLException {
        Item item = new Item();
        item.setId((UUID) rs.getObject("id"));
        item.setName(rs.getString("name"));
        item.setDescription(rs.getString("description"));
        item.setUnit(rs.getString("unit"));
        // ASエイリアスを使用している場合はエイリアス名で取得
        try {
            String patternType = rs.getString("patternType");
            if (patternType == null) {
                patternType = rs.getString("pattern_type");
            }
            item.setPatternType(patternType);
        } catch (SQLException e) {
            // エイリアスがない場合はスキップ
        }
        try {
            Timestamp createdAt = rs.getTimestamp("createdAt");
            if (createdAt == null) {
                createdAt = rs.getTimestamp("created_at");
            }
            if (createdAt != null) {
                item.setCreatedAt(createdAt.toLocalDateTime());
            }
        } catch (SQLException e) {
            // エイリアスがない場合はスキップ
        }
        try {
            Timestamp updatedAt = rs.getTimestamp("updatedAt");
            if (updatedAt == null) {
                updatedAt = rs.getTimestamp("updated_at");
            }
            if (updatedAt != null) {
                item.setUpdatedAt(updatedAt.toLocalDateTime());
            }
        } catch (SQLException e) {
            // エイリアスがない場合はスキップ
        }
        return item;
    }

    public List<Item> findAll() {
        try (SqlAgent agent = uroboroSQL.agent()) {
            List<Item> items = new ArrayList<>();
            try (ResultSet rs = agent.query("item/select_all").resultSet()) {
                while (rs.next()) {
                    items.add(mapRow(rs));
                }
            }
            return items;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public Optional<Item> findById(UUID id) {
        try (SqlAgent agent = uroboroSQL.agent()) {
            List<Item> items = new ArrayList<>();
            try (ResultSet rs = agent.query("item/select_by_id")
                    .param("id", id)
                    .resultSet()) {
                while (rs.next()) {
                    items.add(mapRow(rs));
                }
            }
            return items.isEmpty() ? Optional.empty() : Optional.of(items.get(0));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public List<Item> findByPlaceId(UUID placeId) {
        try (SqlAgent agent = uroboroSQL.agent()) {
            List<Item> items = new ArrayList<>();
            try (ResultSet rs = agent.query("item/select_by_place_id")
                    .param("placeId", placeId)
                    .resultSet()) {
                while (rs.next()) {
                    items.add(mapRow(rs));
                }
            }
            return items;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public List<Item> findByDestinationId(UUID destinationId) {
        try (SqlAgent agent = uroboroSQL.agent()) {
            List<Item> items = new ArrayList<>();
            try (ResultSet rs = agent.query("item/select_by_destination_id")
                    .param("destinationId", destinationId)
                    .resultSet()) {
                while (rs.next()) {
                    items.add(mapRow(rs));
                }
            }
            return items;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public List<Item> findBySourceId(UUID sourceId) {
        try (SqlAgent agent = uroboroSQL.agent()) {
            List<Item> items = new ArrayList<>();
            try (ResultSet rs = agent.query("item/select_by_source_id")
                    .param("sourceId", sourceId)
                    .resultSet()) {
                while (rs.next()) {
                    items.add(mapRow(rs));
                }
            }
            return items;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}


