package co.edu.unbosque.gpcueb.horusback.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                        "https://horus.gpcueb.org",
                        "http://horus.gpcueb.org",
                        "http://localhost:4200",
                        "http://localhost:8080",
                        // Netlify previews for the horusgpc site (e.g., https://deploy-preview-5--horusgpc.netlify.app)
                        "https://*--horusgpc.netlify.app"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
