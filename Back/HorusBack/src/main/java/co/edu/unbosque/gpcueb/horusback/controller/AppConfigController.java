package co.edu.unbosque.gpcueb.horusback.controller;

import co.edu.unbosque.gpcueb.horusback.dto.AppConfigDTO;
import co.edu.unbosque.gpcueb.horusback.service.AppConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/config", "/api/configs", "/config", "/configs", "/api/v1/config"})
@CrossOrigin(
        origins = {
                "https://horus.gpcueb.org",
                "http://horus.gpcueb.org",
                "http://localhost:4200",
                "http://localhost:8080"
        },
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS},
        allowCredentials = "true",
        maxAge = 3600
)
public class AppConfigController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AppConfigController.class);

    @Autowired
    private AppConfigService service;

    @GetMapping
    public List<AppConfigDTO> getAll() {
        logger.info("Solicitud GET recibida para obtener todas las configuraciones");
        return service.getAllConfigs();
    }

    @GetMapping("/{key}")
    public AppConfigDTO get(@PathVariable String key) {
        return service.getConfig(key);
    }

    @PostMapping
    public AppConfigDTO save(@RequestBody AppConfigDTO configDTO) {
        return service.saveConfig(configDTO);
    }
}
