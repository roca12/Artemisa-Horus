package co.edu.unbosque.gpcueb.horusback.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "equipo")
public class Equipo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@NotBlank(message = "El nombre del equipo no puede estar vacío")
	@Size(min = 2, max = 30, message = "El nombre del equipo debe tener entre 2 y 30 caracteres")
	@Column(nullable = false, unique = true, length = 30)
	private String nombre;

	@Column(name = "fecha_creacion")
	private LocalDate fechaCreacion = LocalDate.now();

	@Column(nullable = false)
	private boolean activo = true;

	@OneToMany(mappedBy = "equipo")
	private List<Usuario> miembros = new ArrayList<>();

	@OneToMany(mappedBy = "equipo")
	private List<Tarea> tareas = new ArrayList<>();

	@OneToOne
	@JoinColumn(name = "capitan_equipo")
	private Usuario capitanEquipo;

	@Column(nullable = false)
	private boolean eliminado = false;

	public Equipo() {
		// TODO Auto-generated constructor stub
	}

	public Equipo(String nombre, Usuario capitanEquipo) {
		super();
		this.nombre = nombre;
		this.capitanEquipo = capitanEquipo;
	}

	public long getId() {
		return id;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public LocalDate getFechaCreacion() {
		return fechaCreacion;
	}

	public void setFechaCreacion(LocalDate fechaCreacion) {
		this.fechaCreacion = fechaCreacion;
	}

	public boolean isActivo() {
		return activo;
	}

	public void setActivo(boolean activo) {
		this.activo = activo;
	}

	public List<Usuario> getMiembros() {
		return miembros;
	}

	public void setMiembros(List<Usuario> miembros) {
		this.miembros = miembros;
	}

	public List<Tarea> getTareas() {
		return tareas;
	}

	public void setTareas(List<Tarea> tareas) {
		this.tareas = tareas;
	}

	public Usuario getCapitanEquipo() {
		return capitanEquipo;
	}

	public void setCapitanEquipo(Usuario capitanEquipo) {

	}

	public boolean isEliminado() {
		return eliminado;
	}

	public void setEliminado(boolean eliminado) {
		this.eliminado = eliminado;
	}

	@Override
	public String toString() {
		return "Equipo [id=" + id + ", nombre=" + nombre + ", fechaCreacion=" + fechaCreacion + ", activo=" + activo
				+ "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(Boolean.valueOf(activo), fechaCreacion, Long.valueOf(id), nombre);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Equipo other = (Equipo) obj;
		return activo == other.activo && Objects.equals(fechaCreacion, other.fechaCreacion) && id == other.id
				&& Objects.equals(nombre, other.nombre);
	}

}
