package co.edu.unbosque.gpcueb.horusback.controller;

import co.edu.unbosque.gpcueb.horusback.dto.HiddenContributorDTO;
import co.edu.unbosque.gpcueb.horusback.service.HiddenContributorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hidden")
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
public class HiddenContributorController {

    @Autowired
    private HiddenContributorService service;

    @GetMapping
    public List<HiddenContributorDTO> getAll() {
        return service.getAllHidden();
    }

    @PostMapping
    public HiddenContributorDTO save(@RequestBody HiddenContributorDTO hiddenDTO) {
        return service.saveHidden(hiddenDTO);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.deleteHidden(id);
    }
}
