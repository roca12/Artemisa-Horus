package co.edu.unbosque.gpcueb.horusback.service;

import co.edu.unbosque.gpcueb.horusback.dto.AppConfigDTO;
import java.util.List;

public interface AppConfigService {
    List<AppConfigDTO> getAllConfigs();
    AppConfigDTO getConfig(String key);
    AppConfigDTO saveConfig(AppConfigDTO configDTO);
}
