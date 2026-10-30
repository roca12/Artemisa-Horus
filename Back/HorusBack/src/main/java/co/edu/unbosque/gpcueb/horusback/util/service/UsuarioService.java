package co.edu.unbosque.gpcueb.horusback.util.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import co.edu.unbosque.gpcueb.horusback.dto.UsuarioDTO;
import co.edu.unbosque.gpcueb.horusback.entity.Usuario;
import co.edu.unbosque.gpcueb.horusback.repository.UsuarioRepository;
import co.edu.unbosque.gpcueb.horusback.util.AESUtil;


@Service
public class UsuarioService {

	@Autowired
	private UsuarioRepository usuarioRepository;

	@Autowired
	private ExternalHTPPRequestHandler externalRequest;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	/**
	 * Iv inyectado desde el archivo de propiedades del sistema usado para
	 * encriptación y desencriptación de datos
	 */
	@Value("${iv.secreta}")
	private String iv;

	/**
	 * Llave inyectada desde el archivo de propiedades del sistema usada para
	 * encriptación y desencriptación de datos
	 */
	@Value("${key.secreta}")
	private String key;

	public UsuarioService() {
		// TODO Auto-generated constructor stub
	}

	public int create(UsuarioDTO usuarioDTO) {
		if (existsByCorreo(usuarioDTO.getNombreUsuario())) return 1;
	    if (!usuarioDTO.getNombreUsuario().matches("^[a-zA-Z0-9]+$")) return 2;
	    if (!usuarioDTO.getContrasenia().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$")) return 3;
	    if (usuarioDTO.getContrasenia().length() < 8) return 4;
	    
	    Usuario entity = new Usuario();
	    entity.setNombreUsuario(usuarioDTO.getNombreUsuario());
	    entity.setNombre(usuarioDTO.getNombre());
	    entity.setApellido(usuarioDTO.getApellido());
	    entity.setCorreo(usuarioDTO.getCorreo());
	    if(!externalRequest.existeHandleCodeforces(usuarioDTO.getCodeforcesHandle())) return 5;
	    entity.setCodeforcesHandle(usuarioDTO.getCodeforcesHandle());
	    if(!externalRequest.existeUsuarioGithub(usuarioDTO.getUsuarioGithub())) return 6;
	    entity.setUsuarioGithub(usuarioDTO.getUsuarioGithub());
	    entity.setContrasenia(passwordEncoder.encode(usuarioDTO.getContrasenia()));
		entity.setRol(usuarioDTO.getRol());
		return 0;
	}

	public int update(UsuarioDTO usuarioDTO) {

		return 0;
	}

	public int delete(UsuarioDTO usuarioDTO) {

		return 0;
	}

	public List<UsuarioDTO> getAll() {
		List<Usuario> entityList = usuarioRepository.findByEnabledTrue();
		List<UsuarioDTO> dtoList = new ArrayList<>();
		entityList.forEach((entity) -> {
			UsuarioDTO dto = new UsuarioDTO();
			dto.setId(entity.getId());
			dto.setNombreUsuario(entity.getNombreUsuario());
			dto.setNombre(entity.getNombre());
			dto.setApellido(entity.getApellido());
			dto.setCorreo(AESUtil.decrypt(key, iv, entity.getCorreo()));
			dto.setContrasenia(null);
			dto.setListaAsociacion(entity.getListaAsociacion());
			dto.setRol(entity.getRol());
			dto.setActivo(entity.isActivo());
			dto.setCodeforcesHandle(entity.getCodeforcesHandle());
			dto.setCodeforcesElo(entity.getCodeforcesElo());
			dto.setCodeforcesEloMaximo(entity.getCodeforcesEloMaximo());
			dto.setUsuarioGithub(entity.getUsuarioGithub());
			dto.setIdDiscord(entity.getIdDiscord());
			dto.setEjerciciosResueltos(entity.getEjerciciosResueltos());
			dto.setEjerciciosPendientes(entity.getEjerciciosPendientes());
			dto.setPuntos(entity.getPuntos());
			if (entity.getEquipo() != null)
				dto.setIdEquipo(entity.getEquipo().getId());
			else
				dto.setIdEquipo(null);
			dtoList.add(dto);
		});
		return dtoList;
	}

	public List<UsuarioDTO> getAllEnabledOrDisabled() {
		List<Usuario> entityList = usuarioRepository.findAll();
		List<UsuarioDTO> dtoList = new ArrayList<>();
		entityList.forEach((entity) -> {
			UsuarioDTO dto = new UsuarioDTO();
			dto.setId(entity.getId());
			dto.setNombreUsuario(entity.getNombreUsuario());
			dto.setNombre(entity.getNombre());
			dto.setApellido(entity.getApellido());
			dto.setCorreo(AESUtil.decrypt(key, iv, entity.getCorreo()));
			dto.setContrasenia(null);
			dto.setListaAsociacion(entity.getListaAsociacion());
			dto.setRol(entity.getRol());
			dto.setActivo(entity.isActivo());
			dto.setCodeforcesHandle(entity.getCodeforcesHandle());
			dto.setCodeforcesElo(entity.getCodeforcesElo());
			dto.setCodeforcesEloMaximo(entity.getCodeforcesEloMaximo());
			dto.setUsuarioGithub(entity.getUsuarioGithub());
			dto.setIdDiscord(entity.getIdDiscord());
			dto.setEjerciciosResueltos(entity.getEjerciciosResueltos());
			dto.setEjerciciosPendientes(entity.getEjerciciosPendientes());
			dto.setPuntos(entity.getPuntos());
			dto.setEnabled(entity.isEnabled());
			if (entity.getEquipo() != null)
				dto.setIdEquipo(entity.getEquipo().getId());
			else
				dto.setIdEquipo(null);
			dtoList.add(dto);
		});
		return dtoList;
	}
	
	public boolean existsByCorreo(String correo) {
		return usuarioRepository.existsByCorreo(correo);
	}
	
	public boolean existsById(long idUsuario) {
		return usuarioRepository.existsById(idUsuario);
	} 
}
