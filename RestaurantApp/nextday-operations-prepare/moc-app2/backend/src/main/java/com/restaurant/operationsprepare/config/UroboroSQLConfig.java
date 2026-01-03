package com.restaurant.operationsprepare.config;

import jp.co.future.uroborosql.config.SqlConfig;
import jp.co.future.uroborosql.UroboroSQL;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class UroboroSQLConfig {

    @Bean
    public SqlConfig sqlConfig(DataSource dataSource) {
        // UroboroSQLはデフォルトでclasspath:sqlからSQLファイルを読み込む
        return UroboroSQL.builder(dataSource)
                .build();
    }
}

