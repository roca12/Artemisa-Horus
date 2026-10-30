package co.edu.unbosque.gpcueb.horusback.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import co.edu.unbosque.gpcueb.horusback.entity.CodigoVerificacion;


public interface CodigoVerificacionRepository extends JpaRepository<CodigoVerificacion, Long> {
	
	Optional<CodigoVerificacion> findByUsuarioIdAndUsadoFalse(long usuarioId);

    Optional<CodigoVerificacion> findByCodigoAndUsuarioId(String codigo, long usuarioId);
    
    Optional<CodigoVerificacion> findFirstByUsuario_IdOrderByIdDesc(long idUsuario);
    
    List<CodigoVerificacion> findByUsuario_IdOrderByIdDesc(long idUsuario);
}
