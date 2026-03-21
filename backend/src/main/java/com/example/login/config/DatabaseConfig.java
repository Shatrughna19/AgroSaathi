package com.example.login.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

/**
 * JDBC / Database connection configuration.
 * Spring Boot auto-configures DataSource from application.properties.
 * This class verifies the MySQL connection on startup.
 */
@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    public CommandLineRunner checkDatabaseConnection(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                String url = dataSource.getConnection().getMetaData().getURL();
                log.info("JDBC connection established: {}", url);
                jdbcTemplate.queryForObject("SELECT 1", Integer.class);
                log.info("MySQL database connection verified successfully.");
            } catch (Exception e) {
                log.error("Failed to connect to MySQL. Check application.properties (url, username, password).", e);
                throw e;
            }
        };
    }
}
