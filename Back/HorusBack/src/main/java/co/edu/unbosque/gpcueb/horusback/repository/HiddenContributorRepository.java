package co.edu.unbosque.gpcueb.horusback.repository;

import co.edu.unbosque.gpcueb.horusback.model.HiddenContributor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HiddenContributorRepository extends JpaRepository<HiddenContributor, String> {
}
