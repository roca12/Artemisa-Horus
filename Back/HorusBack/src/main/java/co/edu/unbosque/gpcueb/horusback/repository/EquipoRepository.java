package co.edu.unbosque.gpcueb.horusback.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import co.edu.unbosque.gpcueb.horusback.entity.Equipo;


public interface EquipoRepository extends JpaRepository<Equipo, Long> {
	
    Optional<Equipo> findByNombre(String nombre);

    boolean existsByNombre(String nombre);

    List<Equipo> findByActivoTrue();
}	
