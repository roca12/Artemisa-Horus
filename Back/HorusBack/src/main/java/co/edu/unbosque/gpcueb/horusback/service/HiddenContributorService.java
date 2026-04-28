package co.edu.unbosque.gpcueb.horusback.service;

import co.edu.unbosque.gpcueb.horusback.dto.HiddenContributorDTO;
import java.util.List;

public interface HiddenContributorService {
    List<HiddenContributorDTO> getAllHidden();
    HiddenContributorDTO saveHidden(HiddenContributorDTO hiddenDTO);
    void deleteHidden(String nickname);
}
