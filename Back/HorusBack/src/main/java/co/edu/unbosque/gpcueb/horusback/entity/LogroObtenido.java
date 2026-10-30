package co.edu.unbosque.gpcueb.horusback.entity;

import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "logro_obtenido")
public class LogroObtenido {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "etapa_logro_id", nullable = false)
	private EtapaLogro etapaLogro;

	@Column(name = "fecha_obtencion")
	private LocalDateTime fechaObtencion = LocalDateTime.now();

	public LogroObtenido() {
		// TODO Auto-generated constructor stub
	}

	public LogroObtenido(Usuario usuario, EtapaLogro etapaLogro) {
		super();
		this.usuario = usuario;
		this.etapaLogro = etapaLogro;
	}

	public long getId() {
		return id;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public EtapaLogro getEtapaLogro() {
		return etapaLogro;
	}

	public void setEtapaLogro(EtapaLogro etapaLogro) {
		this.etapaLogro = etapaLogro;
	}

	public LocalDateTime getFechaObtencion() {
		return fechaObtencion;
	}

	public void setFechaObtencion(LocalDateTime fechaObtencion) {
		this.fechaObtencion = fechaObtencion;
	}

	public LogroObtenido(long id, EtapaLogro etapaLogro, LocalDateTime fechaObtencion) {
		super();
		this.id = id;
		this.etapaLogro = etapaLogro;
		this.fechaObtencion = fechaObtencion;
	}

	@Override
	public int hashCode() {
		return Objects.hash(etapaLogro, fechaObtencion, Long.valueOf(id));
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		LogroObtenido other = (LogroObtenido) obj;
		return Objects.equals(etapaLogro, other.etapaLogro) && Objects.equals(fechaObtencion, other.fechaObtencion)
				&& id == other.id;
	}

}