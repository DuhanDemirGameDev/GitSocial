package com.example.gitsocial.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1. Şifreleme algoritmamızı Spring'e tanıtıyoruz
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 2. HTTP Güvenlik Kurallarımız
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // REST API yaptığımız ve stateless (durumsuz) JWT kullanacağımız için CSRF korumasına ihtiyacımız yok.
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        // /api/auth/ ile başlayan tüm isteklere (login, register) herkes erişebilsin
                        .requestMatchers("/auth/**").permitAll()

                        // Bunun dışındaki tüm uç noktalar için kullanıcının giriş yapmış olması zorunlu olsun
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
