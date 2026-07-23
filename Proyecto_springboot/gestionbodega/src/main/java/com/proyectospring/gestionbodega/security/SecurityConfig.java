package com.proyectospring.gestionbodega.security;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 1. Las rutas de login y registro son públicas (no piden token)
                .requestMatchers("/api/auth/**", "/error").permitAll() 
                
                // 2. Solo lectura (GET) para Empleados y Administradores
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/bodegas/**", "/api/productos/**").hasAnyRole("ADMIN", "EMPLEADO")
                
                // 3. Creación, edición y eliminación exclusiva para Administradores
                .requestMatchers("/api/bodegas/**", "/api/productos/**").hasRole("ADMIN")
                
                // 4. Cualquier otra ruta que exista o se cree a futuro pedirá token obligatorio
                // 1. Rutas públicas (Login y Documentación Swagger)
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // 2. Rutas con permisos de lectura (Empleados y Admins)
                .requestMatchers(HttpMethod.GET, "/bodegas/**", "/productos/**").hasAnyRole("ADMIN", "EMPLEADO")

                // 3. Rutas exclusivas para el Administrador (Gestión, Auditoría y Reportes)
                .requestMatchers("/bodegas/**", "/productos/**", "/movimientos/**").hasRole("ADMIN")
                .requestMatchers("/auditoria/**", "/reportes/**").hasRole("ADMIN")

                // 4. Cualquier otra ruta no especificada requiere estar autenticado
                .anyRequest().authenticated()
            );

        // Agregamos el filtro personalizado de JWT antes del filtro estándar de Spring
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}