package co.edu.unbosque.gpcueb.horusback.dto;

import java.util.ArrayList;
import java.util.List;

import co.edu.unbosque.gpcueb.horusback.util.enums.Asociacion;
import co.edu.unbosque.gpcueb.horusback.util.enums.Rango;
import co.edu.unbosque.gpcueb.horusback.util.enums.Rol;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UsuarioDTO {

	private Long id;

	@NotBlank(message = "El nombre de usuario no puede estar vacío")
	private String nombreUsuario;

	@NotBlank(message = "El nombre no puede estar vacío")
	private String nombre;

	@NotBlank(message = "El apellido no puede estar vacío")
	private String apellido;

	@NotBlank(message = "El correo es obligatorio")
	private String correo;

	private String contrasenia;

	@Pattern(regexp = "^(https?://)?([\\w-]+\\.)+[\\w-]+(/.*)?$", message = "La URL de la foto de perfil no tiene un formato válido")
	private String fotoPerfilUrl;

	private Rol rol;
	private Rango rango;
	private boolean activo;
	private boolean verificado;

	private List<Asociacion> listaAsociacion = new ArrayList<>();

	@Min(value = 0, message = "Los puntos deben ser mayores o iguales a 0")
	private int puntos = 0;

	@NotBlank(message = "El nombre de usuario de Codeforces no puede estar vacío")
	private String codeforcesHandle;

	private int codeforcesElo;
	private int codeforcesEloMaximo;

	@NotBlank(message = "El nombre de usuario de Codeforces no puede estar vacío")
	private String usuarioGithub;

	@NotBlank(message = "El nombre de usuario de Codeforces no puede estar vacío")
	private String idDiscord;

	private Long idEquipo;

	@Min(value = 0, message = "Los ejercicios resueltos no pueden ser negativos")
	private int ejerciciosResueltos;

	@Min(value = 0, message = "Los ejercicios resueltos no pueden ser negativos")
	private int ejerciciosPendientes;

	private boolean enabled;

	public UsuarioDTO() {
	}

	public UsuarioDTO(Long id, @NotBlank(message = "El nombre de usuario no puede estar vacío") String nombreUsuario,
			@NotBlank(message = "El nombre no puede estar vacío") String nombre,
			@NotBlank(message = "El apellido no puede estar vacío") String apellido,
			@NotBlank(message = "El correo es obligatorio") String correo, String contrasenia,
			@Pattern(regexp = "^(https?://)?([\\w-]+\\.)+[\\w-]+(/.*)?$", message = "La URL de la foto de perfil no tiene un formato válido") String fotoPerfilUrl,
			Rol rol, Rango rango, boolean activo, boolean verificado, List<Asociacion> listaAsociacion,
			@Min(value = 0, message = "Los puntos deben ser mayores o iguales a 0") int puntos,
			@NotBlank(message = "El nombre de usuario de Codeforces no puede estar vacío") String codeforcesHandle,
			int codeforcesElo, int codeforcesEloMaximo,
			@NotBlank(message = "El nombre de usuario de Codeforces no puede estar vacío") String usuarioGithub,
			@NotBlank(message = "El nombre de usuario de Codeforces no puede estar vacío") String idDiscord,
			Long idEquipo, boolean enabled) {
		super();
		this.id = id;
		this.nombreUsuario = nombreUsuario;
		this.nombre = nombre;
		this.apellido = apellido;
		this.correo = correo;
		this.contrasenia = contrasenia;
		this.fotoPerfilUrl = fotoPerfilUrl;
		this.rol = rol;
		this.rango = rango;
		this.activo = activo;
		this.verificado = verificado;
		this.listaAsociacion = listaAsociacion;
		this.puntos = puntos;
		this.codeforcesHandle = codeforcesHandle;
		this.codeforcesElo = codeforcesElo;
		this.codeforcesEloMaximo = codeforcesEloMaximo;
		this.usuarioGithub = usuarioGithub;
		this.idDiscord = idDiscord;
		this.idEquipo = idEquipo;
		this.enabled = enabled;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNombreUsuario() {
		return nombreUsuario;
	}

	public void setNombreUsuario(String nombreUsuario) {
		this.nombreUsuario = nombreUsuario;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getApellido() {
		return apellido;
	}

	public void setApellido(String apellido) {
		this.apellido = apellido;
	}

	public String getCorreo() {
		return correo;
	}

	public void setCorreo(String correo) {
		this.correo = correo;
	}

	public String getContrasenia() {
		return contrasenia;
	}

	public void setContrasenia(String contrasenia) {
		this.contrasenia = contrasenia;
	}

	public String getFotoPerfilUrl() {
		return fotoPerfilUrl;
	}

	public void setFotoPerfilUrl(String fotoPerfilUrl) {
		this.fotoPerfilUrl = fotoPerfilUrl;
	}

	public Rol getRol() {
		return rol;
	}

	public void setRol(Rol rol) {
		this.rol = rol;
	}

	public Rango getRango() {
		return rango;
	}

	public void setRango(Rango rango) {
		this.rango = rango;
	}

	public boolean isActivo() {
		return activo;
	}

	public void setActivo(boolean activo) {
		this.activo = activo;
	}

	public boolean isVerificado() {
		return verificado;
	}

	public void setVerificado(boolean verificado) {
		this.verificado = verificado;
	}

	public List<Asociacion> getListaAsociacion() {
		return listaAsociacion;
	}

	public void setListaAsociacion(List<Asociacion> listaAsociacion) {
		this.listaAsociacion = listaAsociacion;
	}

	public int getPuntos() {
		return puntos;
	}

	public void setPuntos(int puntos) {
		this.puntos = puntos;
	}

	public String getCodeforcesHandle() {
		return codeforcesHandle;
	}

	public void setCodeforcesHandle(String codeforcesHandle) {
		this.codeforcesHandle = codeforcesHandle;
	}

	public int getCodeforcesElo() {
		return codeforcesElo;
	}

	public void setCodeforcesElo(int codeforcesElo) {
		this.codeforcesElo = codeforcesElo;
	}

	public int getCodeforcesEloMaximo() {
		return codeforcesEloMaximo;
	}

	public void setCodeforcesEloMaximo(int codeforcesEloMaximo) {
		this.codeforcesEloMaximo = codeforcesEloMaximo;
	}

	public String getUsuarioGithub() {
		return usuarioGithub;
	}

	public void setUsuarioGithub(String usuarioGithub) {
		this.usuarioGithub = usuarioGithub;
	}

	public String getIdDiscord() {
		return idDiscord;
	}

	public void setIdDiscord(String idDiscord) {
		this.idDiscord = idDiscord;
	}

	public Long getIdEquipo() {
		return idEquipo;
	}

	public void setIdEquipo(Long idEquipo) {
		this.idEquipo = idEquipo;
	}

	public int getEjerciciosResueltos() {
		return ejerciciosResueltos;
	}

	public void setEjerciciosResueltos(int ejerciciosResueltos) {
		this.ejerciciosResueltos = ejerciciosResueltos;
	}

	public int getEjerciciosPendientes() {
		return ejerciciosPendientes;
	}

	public void setEjerciciosPendientes(int ejerciciosPendientes) {
		this.ejerciciosPendientes = ejerciciosPendientes;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	@Override
	public String toString() {
		return "UsuarioDTO [nombreUsuario=" + nombreUsuario + ", nombre=" + nombre + ", apellido=" + apellido
				+ ", correo=" + correo + ", rol=" + rol + ", rango=" + rango + ", activo=" + activo + ", verificado="
				+ verificado + ", codeforcesEloMaximo=" + codeforcesEloMaximo + ", usuarioGithub=" + usuarioGithub
				+ ", idDiscord=" + idDiscord + ", idEquipo=" + idEquipo + ", ejerciciosResueltos=" + ejerciciosResueltos
				+ ", ejerciciosPendientes=" + ejerciciosPendientes + "]";
	}

}