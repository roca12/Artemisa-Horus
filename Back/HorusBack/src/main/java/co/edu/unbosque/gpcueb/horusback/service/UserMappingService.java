package co.edu.unbosque.gpcueb.horusback.service;

import co.edu.unbosque.gpcueb.horusback.dto.UserMappingDTO;
import java.util.List;

public interface UserMappingService {
    List<UserMappingDTO> getAllMappings();
    UserMappingDTO saveMapping(UserMappingDTO mappingDTO);
    void deleteMapping(String nickname);
}
