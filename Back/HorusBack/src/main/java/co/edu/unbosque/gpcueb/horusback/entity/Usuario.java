package co.edu.unbosque.gpcueb.horusback.entity;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import co.edu.unbosque.gpcueb.horusback.util.enums.Rol;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import co.edu.unbosque.gpcueb.horusback.util.enums.Asociacion;
import co.edu.unbosque.gpcueb.horusback.util.enums.Rango;

@Entity
@Table(name = "usuario")
public class Usuario implements UserDetails {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	// Datos Personales
	@NotBlank(message = "El nombre de usuario no puede estar vacío")
	@Column(unique = true, nullable = false)
	private String nombreUsuario;

	@NotBlank(message = "El nombre no puede estar vacío")
	@Column(nullable = false)
	private String nombre;

	@NotBlank(message = "El apellido no puede estar vacío")
	@Column(nullable = false)
	private String apellido;

	@Column(name = "correo", unique = true, nullable = false)
	@NotBlank(message = "El correo es obligatorio")
	private String correo;

	@NotBlank(message = "La contraseña no puede ser nula o estar vacia")
	@Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
	private String contrasenia;

	@Pattern(regexp = "^(https?://)?([\\w-]+\\.)+[\\w-]+(/.*)?$", message = "La URL de la foto de perfil no tiene un formato válido")
	@Column(name = "foto_perfil_url", length = 500)
	private String fotoPerfilUrl;

	// Datos del Usuario
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Rol rol;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Rango rango;

	@Column(nullable = false)
	private boolean activo;

	@Column(nullable = false)
	private boolean verificado;

	@ElementCollection
	@CollectionTable(name = "usuario_asociacion", joinColumns = @JoinColumn(name = "usuario_id"))
	@Enumerated(EnumType.STRING)
	@Column(name = "lista_asociacion")
	private List<Asociacion> listaAsociacion = new ArrayList<>();

	@Min(value = 0, message = "Los puntos deben ser mayores o iguales a 0")
	private int puntos = 0;

	@NotBlank(message = "El nombre de usuario de Codeforces no puede estar vacío")
	@Column(nullable = false)
	private String codeforcesHandle;

	@Min(value = 0, message = "El elo no puede ser negativo")
	@Column(name = "elo_codeforces")
	private int codeforcesElo;

	@Min(value = 0, message = "El elo no puede ser negativo")
	@Column(name = "elo_maximo_codeforces")
	private int codeforcesEloMaximo;

	@NotBlank(message = "El nombre de usuario de Codeforces no puede estar vacío")
	@Column(nullable = false)
	private String usuarioGithub;

	@NotBlank(message = "El nombre de usuario de Codeforces no puede estar vacío")
	@Column(nullable = false)
	private String idDiscord;

	// Equipo
	@ManyToOne
	@JoinColumn(name = "equipo_id")
	private Equipo equipo;

	@Min(value = 0, message = "Los ejercicios resueltos no pueden ser negativos")
	@Column(name = "ejercicios_resueltos")
	private int ejerciciosResueltos = 0;

	@Min(value = 0, message = "Los ejercicios resueltos no pueden ser negativos")
	@Column(name = "ejercicios_pendientes")
	private int ejerciciosPendientes = 3;

	// Security
	/** Indica si la cuenta del usuario no ha expirado. */
	private boolean accountNonExpired;

	/** Indica si la cuenta del usuario no se encuentra en estado de bloqueo. */
	private boolean accountNonLocked;

	/**
	 * Indica si los tokens o credenciales de clave siguen vigentes en el tiempo.
	 */
	private boolean credentialsNonExpired;

	/**
	 * Estado lógico que define si el usuario se encuentra habilitado para operar.
	 */
	private boolean enabled;

	/**
	 * Constructor por defecto de Usuario. Configura el estado inicial por defecto
	 * con las propiedades de seguridad habilitadas y rol SIN_AUTENTICAR.
	 */
	public Usuario() {
		this.accountNonExpired = true;
		this.accountNonLocked = true;
		this.credentialsNonExpired = true;
		this.enabled = true;
		this.activo = true;
		this.verificado = false;
		this.rol = Rol.MIEMBRO;
	}

	public Usuario(String nombreUsuario, String nombre, String apellido, String correo, String contrasenia,
			String codeforcesHandle, String usuarioGithub, String idDiscord) {
		this();
		this.nombreUsuario = nombreUsuario;
		this.nombre = nombre;
		this.apellido = apellido;
		this.correo = correo;
		this.contrasenia = contrasenia;
		this.codeforcesHandle = codeforcesHandle;
		this.usuarioGithub = usuarioGithub;
		this.idDiscord = idDiscord;
	}

	/**
	 * Obtiene las autoridades (roles) asignadas al usuario para la integración con
	 * Spring Security. Implementación mandatoria de {@link UserDetails}. * @return
	 * Colección de autoridades del usuario adaptadas bajo el formato "ROLE_"
	 */
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
	}

	@Override
	public @Nullable String getPassword() {
		return contrasenia;
	}

	@Override
	public String getUsername() {
		return nombreUsuario;
	}

	public String getNombreUsuario() {
		return nombreUsuario;
	}

	public long getId() {
		return id;
	}

	public String getFotoPerfilUrl() {
		return fotoPerfilUrl;
	}

	public void setFotoPerfilUrl(String fotoPerfilUrl) {
		this.fotoPerfilUrl = fotoPerfilUrl;
	}

	public String getIdDiscord() {
		return idDiscord;
	}

	public void setIdDiscord(String idDiscord) {
		this.idDiscord = idDiscord;
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

	public Equipo getEquipo() {
		return equipo;
	}

	public void setEquipo(Equipo equipo) {
		this.equipo = equipo;
	}

	public boolean isAccountNonExpired() {
		return accountNonExpired;
	}

	public void setAccountNonExpired(boolean accountNonExpired) {
		this.accountNonExpired = accountNonExpired;
	}

	public boolean isAccountNonLocked() {
		return accountNonLocked;
	}

	public void setAccountNonLocked(boolean accountNonLocked) {
		this.accountNonLocked = accountNonLocked;
	}

	public boolean isCredentialsNonExpired() {
		return credentialsNonExpired;
	}

	public void setCredentialsNonExpired(boolean credentialsNonExpired) {
		this.credentialsNonExpired = credentialsNonExpired;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
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

	@Override
	public String toString() {
		return "Usuario [id=" + id + ", nombreUsuario=" + nombreUsuario + ", nombre=" + nombre + ", apellido="
				+ apellido + ", correo=" + correo + ", rol=" + rol + ", rango=" + rango + ", activo=" + activo
				+ ", verificado=" + verificado + ", puntos=" + puntos + ", codeforcesHandle=" + codeforcesHandle
				+ ", codeforcesElo=" + codeforcesElo + ", usuarioGithub=" + usuarioGithub + ", accountNonExpired="
				+ accountNonExpired + ", accountNonLocked=" + accountNonLocked + ", credentialsNonExpired="
				+ credentialsNonExpired + ", enabled=" + enabled + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(Boolean.valueOf(accountNonExpired), Boolean.valueOf(accountNonLocked),
				Boolean.valueOf(activo), apellido, Integer.valueOf(codeforcesElo), codeforcesHandle, correo,
				Boolean.valueOf(credentialsNonExpired), Boolean.valueOf(enabled), Long.valueOf(id), nombre,
				nombreUsuario, Integer.valueOf(puntos), rango, rol, usuarioGithub, Boolean.valueOf(verificado));
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Usuario other = (Usuario) obj;
		return accountNonExpired == other.accountNonExpired && accountNonLocked == other.accountNonLocked
				&& activo == other.activo && Objects.equals(apellido, other.apellido)
				&& codeforcesElo == other.codeforcesElo && Objects.equals(codeforcesHandle, other.codeforcesHandle)
				&& Objects.equals(correo, other.correo) && credentialsNonExpired == other.credentialsNonExpired
				&& enabled == other.enabled && id == other.id && Objects.equals(nombre, other.nombre)
				&& Objects.equals(nombreUsuario, other.nombreUsuario) && puntos == other.puntos && rango == other.rango
				&& rol == other.rol && Objects.equals(usuarioGithub, other.usuarioGithub)
				&& verificado == other.verificado;
	}

}
