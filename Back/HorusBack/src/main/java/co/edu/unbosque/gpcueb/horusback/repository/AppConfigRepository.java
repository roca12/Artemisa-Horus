package co.edu.unbosque.gpcueb.horusback.repository;

import co.edu.unbosque.gpcueb.horusback.model.AppConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppConfigRepository extends JpaRepository<AppConfig, String> {
}
