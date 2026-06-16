package co.edu.unbosque.gpcueb.horusback.controller;

import co.edu.unbosque.gpcueb.horusback.dto.AppConfigDTO;
import co.edu.unbosque.gpcueb.horusback.service.AppConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/configs")
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

    @Autowired
    private AppConfigService service;

    @GetMapping
    public List<AppConfigDTO> getAll() {
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
