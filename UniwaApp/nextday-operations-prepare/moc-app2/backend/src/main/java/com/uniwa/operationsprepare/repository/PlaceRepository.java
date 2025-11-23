package com.uniwa.operationsprepare.repository;

import com.uniwa.operationsprepare.entity.Place;
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
import java.util.UUID;

@Repository
public class PlaceRepository {

    @Autowired
    private SqlConfig uroboroSQL;

    private Place mapRow(ResultSet rs) throws SQLException {
        Place place = new Place();
        place.setId((UUID) rs.getObject("id"));
        place.setType(rs.getString("type"));
        place.setName(rs.getString("name"));
        // ASエイリアスを使用している場合はエイリアス名で取得
        try {
            Object displayOrder = rs.getObject("displayOrder");
            if (displayOrder == null) {
                displayOrder = rs.getObject("display_order");
            }
            if (displayOrder != null) {
                place.setDisplayOrder((Integer) displayOrder);
            }
        } catch (SQLException e) {
            // エイリアスがない場合はスキップ
        }
        try {
            Timestamp createdAt = rs.getTimestamp("createdAt");
            if (createdAt == null) {
                createdAt = rs.getTimestamp("created_at");
            }
            if (createdAt != null) {
                place.setCreatedAt(createdAt.toLocalDateTime());
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
                place.setUpdatedAt(updatedAt.toLocalDateTime());
            }
        } catch (SQLException e) {
            // エイリアスがない場合はスキップ
        }
        return place;
    }

    public List<Place> findAll() {
        try (SqlAgent agent = uroboroSQL.agent()) {
            List<Place> places = new ArrayList<>();
            try (ResultSet rs = agent.query("place/select_all").resultSet()) {
                while (rs.next()) {
                    places.add(mapRow(rs));
                }
            }
            return places;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public List<Place> findByType(String type) {
        try (SqlAgent agent = uroboroSQL.agent()) {
            List<Place> places = new ArrayList<>();
            try (ResultSet rs = agent.query("place/select_by_type")
                    .param("type", type)
                    .resultSet()) {
                while (rs.next()) {
                    places.add(mapRow(rs));
                }
            }
            return places;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}


