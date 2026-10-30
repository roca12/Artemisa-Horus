package co.edu.unbosque.gpcueb.horusback.entity;

import java.time.LocalDateTime;
import java.util.Objects;

import co.edu.unbosque.gpcueb.horusback.util.enums.EstadoInvitacion;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "invitacion")
public class Invitacion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "usuario_remitente", nullable = false)
	private Usuario usuarioRemitente;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "usuario_destino", nullable = false)
	private Usuario usuarioDestino;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "equipo_id", nullable = false)
	private Equipo equipo;

	@Enumerated(EnumType.STRING)
	private EstadoInvitacion estado = EstadoInvitacion.PENDIENTE;

	@Column(name = "fecha_invitacion")
	private LocalDateTime fechaInvitacion = LocalDateTime.now();

	@Version
	private long version;

	public Invitacion() {
		// TODO Auto-generated constructor stub
	}

	public Invitacion(Usuario usuarioRemitente, Usuario usuarioDestino, Equipo equipo) {
		super();
		this.usuarioRemitente = usuarioRemitente;
		this.usuarioDestino = usuarioDestino;
		this.equipo = equipo;
	}

	public long getId() {
		return id;
	}

	public Usuario getUsuarioRemitente() {
		return usuarioRemitente;
	}

	public void setUsuarioRemitente(Usuario usuarioRemitente) {
		this.usuarioRemitente = usuarioRemitente;
	}

	public Usuario getUsuarioDestino() {
		return usuarioDestino;
	}

	public void setUsuarioDestino(Usuario usuarioDestino) {
		this.usuarioDestino = usuarioDestino;
	}

	public Equipo getEquipo() {
		return equipo;
	}

	public void setEquipo(Equipo equipo) {
		this.equipo = equipo;
	}

	public EstadoInvitacion getEstado() {
		return estado;
	}

	public void setEstado(EstadoInvitacion estado) {
		this.estado = estado;
	}

	public LocalDateTime getFechaInvitacion() {
		return fechaInvitacion;
	}

	public void setFechaInvitacion(LocalDateTime fechaInvitacion) {
		this.fechaInvitacion = fechaInvitacion;
	}

	public long getVersion() {
		return version;
	}

	public void setVersion(long version) {
		this.version = version;
	}

	@Override
	public String toString() {
		return "Invitacion [id=" + id + ", estado=" + estado + ", fechaInvitacion=" + fechaInvitacion + ", version="
				+ version + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(estado, fechaInvitacion, Long.valueOf(id), Long.valueOf(version));
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Invitacion other = (Invitacion) obj;
		return estado == other.estado && Objects.equals(fechaInvitacion, other.fechaInvitacion) && id == other.id
				&& version == other.version;
	}

}
