package co.edu.unbosque.gpcueb.horusback.entity;

import java.time.LocalDateTime;
import java.util.Objects;

import co.edu.unbosque.gpcueb.horusback.util.enums.CategoriaTarea;
import co.edu.unbosque.gpcueb.horusback.util.enums.EstadoTarea;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tarea")
public class Tarea {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "El nombre de la tarea no puede estar vacío")
	@Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
	@Column(nullable = false, length = 100)
	private String nombre;

	@Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
	@Column(length = 500)
	private String descripcion;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private EstadoTarea estado;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private CategoriaTarea categoria;

	@Pattern(regexp = "^(https?://)?([\\w-]+\\.)+[\\w-]+(/.*)?$", message = "El link no tiene un formato válido")
	@Column(length = 255)
	private String link;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "equipo_id", nullable = false)
	private Equipo equipo;

	// Respuesta del equipo
	@Pattern(regexp = "^(https?://)?([\\w-]+\\.)+[\\w-]+(/.*)?$", message = "El link de respuesta no tiene un formato válido")
	@Column(name = "link_respuesta", length = 255)
	private String linkRespuesta;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "usuario_respuesta_id")
	private Usuario usuarioRespuesta;

	@Column(name = "fecha_respuesta")
	private LocalDateTime fechaRespuesta;

	@Column(name = "comentario_coach", length = 500)
	private String comentarioCoach;

	public Tarea() {
	}

	public Tarea(String nombre, String descripcion, EstadoTarea estado, CategoriaTarea categoria, String link,
			Equipo equipo) {
		this.nombre = nombre;
		this.descripcion = descripcion;
		this.estado = estado;
		this.categoria = categoria;
		this.link = link;
		this.equipo = equipo;
	}

	public Long getId() {
		return id;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public EstadoTarea getEstado() {
		return estado;
	}

	public void setEstado(EstadoTarea estado) {
		this.estado = estado;
	}

	public CategoriaTarea getCategoria() {
		return categoria;
	}

	public void setCategoria(CategoriaTarea categoria) {
		this.categoria = categoria;
	}

	public String getLink() {
		return link;
	}

	public void setLink(String link) {
		this.link = link;
	}

	public Equipo getEquipo() {
		return equipo;
	}

	public void setEquipo(Equipo equipo) {
		this.equipo = equipo;
	}

	public String getLinkRespuesta() {
		return linkRespuesta;
	}

	public void setLinkRespuesta(String linkRespuesta) {
		this.linkRespuesta = linkRespuesta;
	}

	public Usuario getUsuarioRespuesta() {
		return usuarioRespuesta;
	}

	public void setUsuarioRespuesta(Usuario usuarioRespuesta) {
		this.usuarioRespuesta = usuarioRespuesta;
	}

	public LocalDateTime getFechaRespuesta() {
		return fechaRespuesta;
	}

	public void setFechaRespuesta(LocalDateTime fechaRespuesta) {
		this.fechaRespuesta = fechaRespuesta;
	}

	public String getComentarioCoach() {
		return comentarioCoach;
	}

	public void setComentarioCoach(String comentarioCoach) {
		this.comentarioCoach = comentarioCoach;
	}

	@Override
	public String toString() {
		return "Tarea [id=" + id + ", nombre=" + nombre + ", descripcion=" + descripcion + ", estado=" + estado
				+ ", categoria=" + categoria + ", link=" + link + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(categoria, descripcion, estado, id, link, nombre);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Tarea other = (Tarea) obj;
		return categoria == other.categoria && Objects.equals(descripcion, other.descripcion) && estado == other.estado
				&& Objects.equals(id, other.id) && Objects.equals(link, other.link)
				&& Objects.equals(nombre, other.nombre);
	}

}