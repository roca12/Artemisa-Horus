package co.edu.unbosque.gpcueb.horusback.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import co.edu.unbosque.gpcueb.horusback.entity.Usuario;



/**
 * Interfaz de Repositorio encargada de proveer los métodos de consulta y validación de seguridad
 * en la base de datos para la entidad de cuentas de {@link Usuario}.
 * @author BlackDanrt
 * @version 1.0
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

	/**
	 * Verifica la existencia previa en el sistema de una cuenta mediante su identificador textual.
	 * * @param nombreUsuario Nombre de usuario a comprobar
	 * @return {@code true} si el nombre de usuario ya está registrado, de lo contrario {@code false}
	 */
	public boolean existsByNombreUsuario(String nombreUsuario);
	
	/**
	 * Busca una cuenta de usuario en el sistema utilizando su identificador único de cuenta.
	 * * @param nombreUsuario Nombre de cuenta del usuario buscado
	 * @return Un contenedor {@link Optional} que incluye al {@link Usuario} si se encuentra en los registros
	 */
	public Optional<Usuario> findByNombreUsuario(String nombreUsuario);
	
    Optional<Usuario> findByCorreo(String correo);

    Optional<Usuario> findByCodeforcesHandle(String codeforcesHandle);

    Optional<Usuario> findByIdDiscord(String idDiscord);

    boolean existsByCorreo(String correo);

    List<Usuario> findByActivoTrue();

    List<Usuario> findByEquipoId(long equipoId);
    
    List<Usuario> findByEnabledTrue();
}
