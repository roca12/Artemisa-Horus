package co.edu.unbosque.gpcueb.horusback.repository;

import co.edu.unbosque.gpcueb.horusback.model.UserMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserMappingRepository extends JpaRepository<UserMapping, String> {
}
