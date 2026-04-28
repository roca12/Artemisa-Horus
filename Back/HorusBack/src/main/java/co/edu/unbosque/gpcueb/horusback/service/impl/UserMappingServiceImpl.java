package co.edu.unbosque.gpcueb.horusback.service.impl;

import co.edu.unbosque.gpcueb.horusback.dto.UserMappingDTO;
import co.edu.unbosque.gpcueb.horusback.model.UserMapping;
import co.edu.unbosque.gpcueb.horusback.repository.UserMappingRepository;
import co.edu.unbosque.gpcueb.horusback.service.UserMappingService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserMappingServiceImpl implements UserMappingService {

    @Autowired
    private UserMappingRepository repository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<UserMappingDTO> getAllMappings() {
        return repository.findAll().stream()
                .map(entity -> modelMapper.map(entity, UserMappingDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public UserMappingDTO saveMapping(UserMappingDTO mappingDTO) {
        UserMapping entity = modelMapper.map(mappingDTO, UserMapping.class);
        UserMapping saved = repository.save(entity);
        return modelMapper.map(saved, UserMappingDTO.class);
    }

    @Override
    public void deleteMapping(String nickname) {
        repository.deleteById(nickname);
    }
}
