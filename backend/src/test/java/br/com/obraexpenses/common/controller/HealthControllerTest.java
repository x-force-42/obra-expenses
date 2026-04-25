package br.com.obraexpenses.common.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.obraexpenses.common.config.CorsConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class HealthControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        CorsConfig corsConfig = new CorsConfig("https://*.amplifyapp.com,http://localhost:5173");
        mockMvc = MockMvcBuilders.standaloneSetup(new HealthController())
                .addFilters(corsConfig.corsFilter())
                .build();
    }

    @Test
    void returnsHealthStatus() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void appliesCorsFromConfiguredPatterns() throws Exception {
        mockMvc.perform(options("/health")
                        .header("Origin", "https://demo.amplifyapp.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin",
                        "https://demo.amplifyapp.com"));
    }
}
