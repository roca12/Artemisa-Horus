package co.edu.unbosque.gpcueb.horusback.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "logro")
public class Logro {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@NotBlank(message = "El nombre del logro no puede estar vacío")
	@Column(nullable = false, unique = true, length = 100)
	private String nombre; 

	@Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
	@Column(length = 500)
	private String descripcion;

	@OneToMany(mappedBy = "logro", fetch = FetchType.LAZY)
	private List<EtapaLogro> etapas = new ArrayList<>();

	public Logro() {
	}

	public Logro(String nombre, String descripcion) {
		this.nombre = nombre;
		this.descripcion = descripcion;
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

	public String getDescripcion() {
		return descripcion;
	}

	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	public List<EtapaLogro> getEtapas() {
		return etapas;
	}

	public void setEtapas(List<EtapaLogro> etapas) {
		this.etapas = etapas;
	}

	@Override
	public String toString() {
		return "Logro [id=" + id + ", nombre=" + nombre + ", descripcion=" + descripcion + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(descripcion, id, nombre);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Logro other = (Logro) obj;
		return Objects.equals(descripcion, other.descripcion) && Objects.equals(id, other.id)
				&& Objects.equals(nombre, other.nombre);
	}

}