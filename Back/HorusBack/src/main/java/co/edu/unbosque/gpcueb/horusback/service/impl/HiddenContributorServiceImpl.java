package co.edu.unbosque.gpcueb.horusback.service.impl;

import co.edu.unbosque.gpcueb.horusback.dto.HiddenContributorDTO;
import co.edu.unbosque.gpcueb.horusback.model.HiddenContributor;
import co.edu.unbosque.gpcueb.horusback.repository.HiddenContributorRepository;
import co.edu.unbosque.gpcueb.horusback.service.HiddenContributorService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HiddenContributorServiceImpl implements HiddenContributorService {

    @Autowired
    private HiddenContributorRepository repository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<HiddenContributorDTO> getAllHidden() {
        return repository.findAll().stream()
                .map(entity -> modelMapper.map(entity, HiddenContributorDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public HiddenContributorDTO saveHidden(HiddenContributorDTO hiddenDTO) {
        HiddenContributor entity = modelMapper.map(hiddenDTO, HiddenContributor.class);
        HiddenContributor saved = repository.save(entity);
        return modelMapper.map(saved, HiddenContributorDTO.class);
    }

    @Override
    public void deleteHidden(String id) {
        repository.deleteById(id);
    }
}
