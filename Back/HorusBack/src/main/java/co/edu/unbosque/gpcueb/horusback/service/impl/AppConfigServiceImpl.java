package co.edu.unbosque.gpcueb.horusback.service.impl;

import co.edu.unbosque.gpcueb.horusback.dto.AppConfigDTO;
import co.edu.unbosque.gpcueb.horusback.model.AppConfig;
import co.edu.unbosque.gpcueb.horusback.repository.AppConfigRepository;
import co.edu.unbosque.gpcueb.horusback.service.AppConfigService;
import jakarta.annotation.PostConstruct;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppConfigServiceImpl implements AppConfigService {

    @Autowired
    private AppConfigRepository repository;

    @Autowired
    private ModelMapper modelMapper;

    @PostConstruct
    public void init() {
        if (!repository.existsById("WEEK_START_DATE")) {
            AppConfig defaultConfig = new AppConfig("WEEK_START_DATE", "2026-06-01");
            repository.save(defaultConfig);
        }
    }

    @Override
    public List<AppConfigDTO> getAllConfigs() {
        return repository.findAll().stream()
                .map(config -> modelMapper.map(config, AppConfigDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public AppConfigDTO getConfig(String key) {
        return repository.findById(key)
                .map(config -> modelMapper.map(config, AppConfigDTO.class))
                .orElse(null);
    }

    @Override
    public AppConfigDTO saveConfig(AppConfigDTO configDTO) {
        AppConfig config = modelMapper.map(configDTO, AppConfig.class);
        AppConfig saved = repository.save(config);
        return modelMapper.map(saved, AppConfigDTO.class);
    }
}
