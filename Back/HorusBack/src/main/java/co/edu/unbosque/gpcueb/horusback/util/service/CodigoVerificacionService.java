package co.edu.unbosque.gpcueb.horusback.util.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import co.edu.unbosque.gpcueb.horusback.dto.CodigoVerificacionDTO;
import co.edu.unbosque.gpcueb.horusback.entity.CodigoVerificacion;
import co.edu.unbosque.gpcueb.horusback.entity.Usuario;
import co.edu.unbosque.gpcueb.horusback.repository.CodigoVerificacionRepository;
import co.edu.unbosque.gpcueb.horusback.repository.UsuarioRepository;



public class CodigoVerificacionService {

	@Autowired
	private CodigoVerificacionRepository codigoVerificacionRepository;

	@Autowired
	private UsuarioRepository usuarioRepository;

	private static final String CARACTERES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	private static final SecureRandom random = new SecureRandom();

	public CodigoVerificacionService() {
		// TODO Auto-generated constructor stub
	}

	public int validarCodigo(CodigoVerificacionDTO codigoVerificacionDTO) {
		Optional<Usuario> usuarioOpt = usuarioRepository.findById(codigoVerificacionDTO.getIdUsuario());
		if (usuarioOpt.isEmpty())
			return 1;

		Optional<CodigoVerificacion> entityOpt = codigoVerificacionRepository
				.findFirstByUsuario_IdOrderByIdDesc(codigoVerificacionDTO.getIdUsuario());
		if (entityOpt.isEmpty())
			return 2;

		CodigoVerificacion entity = entityOpt.get();

		if (entity.getFechaExpiracion().isBefore(LocalDateTime.now()))
			return 3;
		if (entity.isUsado())
			return 4;
		if (!entity.getCodigo().equals(codigoVerificacionDTO.getCodigo()))
			return 5;

		entity.setUsado(true);

		Usuario usuario = usuarioOpt.get();
		usuario.setVerificado(true);

		codigoVerificacionRepository.save(entity);
		usuarioRepository.save(usuario);

		return 0;
	}

	public int crearCodigo(long idUsuario) {
		Optional<Usuario> usuarioOpt = usuarioRepository.findById(idUsuario);
		if (usuarioOpt.isEmpty())
			return 1;

		CodigoVerificacion entity = new CodigoVerificacion(generarCodigo(), usuarioOpt.get());
		codigoVerificacionRepository.save(entity);
		return 0;
	}

	private String generarCodigo() {
		StringBuilder sb = new StringBuilder(6);
		for (int i = 0; i < 6; i++) {
			int index = random.nextInt(CARACTERES.length());
			sb.append(CARACTERES.charAt(index));
		}
		return sb.toString();
	}

	public Optional<CodigoVerificacion> getByIdUsuario(long idUsuario) {
		return codigoVerificacionRepository.findFirstByUsuario_IdOrderByIdDesc(idUsuario);
	}

	public List<CodigoVerificacion> getAllByIdUsuario(long idUsuario) {
		return codigoVerificacionRepository.findByUsuario_IdOrderByIdDesc(idUsuario);
	}

	public int delete(long id) {
		if (!codigoVerificacionRepository.existsById(id))
			return 1;
		codigoVerificacionRepository.deleteById(id);
		return 0;
	}

}
