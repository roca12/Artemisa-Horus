package co.edu.unbosque.gpcueb.horusback.controller;

import co.edu.unbosque.gpcueb.horusback.dto.UserMappingDTO;
import co.edu.unbosque.gpcueb.horusback.service.UserMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mappings")
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
public class UserMappingController {

    @Autowired
    private UserMappingService service;

    @GetMapping
    public List<UserMappingDTO> getAll() {
        return service.getAllMappings();
    }

    @PostMapping
    public UserMappingDTO save(@RequestBody UserMappingDTO mappingDTO) {
        return service.saveMapping(mappingDTO);
    }

    @DeleteMapping("/{nickname}")
    public void delete(@PathVariable String nickname) {
        service.deleteMapping(nickname);
    }
}
