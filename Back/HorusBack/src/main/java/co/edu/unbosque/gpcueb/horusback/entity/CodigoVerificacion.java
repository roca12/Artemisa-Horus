package co.edu.unbosque.gpcueb.horusback.entity;

import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "codigo_verificacion")
public class CodigoVerificacion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@NotBlank(message = "El código de verificación no puede estar vacío")
	@Column(nullable = false, length = 6)
	private String codigo;

	@Column(nullable = false)
	private LocalDateTime fechaExpiracion = LocalDateTime.now().plusMinutes(10);

	@Column(nullable = false)
	private boolean usado = false;

	@OneToOne
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	public CodigoVerificacion() {
		// TODO Auto-generated constructor stub
	}

	public CodigoVerificacion(@NotBlank(message = "El código de verificación no puede estar vacío") String codigo,
			Usuario usuario) {
		super();
		this.codigo = codigo;
		this.usuario = usuario;
	}

	public long getId() {
		return id;
	}

	public String getCodigo() {
		return codigo;
	}

	public void setCodigo(String codigo) {
		this.codigo = codigo;
	}

	public LocalDateTime getFechaExpiracion() {
		return fechaExpiracion;
	}

	public void setFechaExpiracion(LocalDateTime fechaExpiracion) {
		this.fechaExpiracion = fechaExpiracion;
	}

	public boolean isUsado() {
		return usado;
	}

	public void setUsado(boolean usado) {
		this.usado = usado;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	@Override
	public String toString() {
		return "CodigoVerificacion [id=" + id + ", codigo=" + codigo + ", fechaExpiracion=" + fechaExpiracion
				+ ", usado=" + usado + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(codigo, fechaExpiracion, Long.valueOf(id), Boolean.valueOf(usado));
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		CodigoVerificacion other = (CodigoVerificacion) obj;
		return Objects.equals(codigo, other.codigo) && Objects.equals(fechaExpiracion, other.fechaExpiracion)
				&& id == other.id && usado == other.usado;
	}

}