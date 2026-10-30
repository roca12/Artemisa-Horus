package co.edu.unbosque.gpcueb.horusback.entity;

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
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "etapa_logro", uniqueConstraints = @UniqueConstraint(columnNames = { "logro_id", "numero_etapa" }))
public class EtapaLogro {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@Min(value = 1, message = "El número de etapa debe ser mayor a 0")
	@Column(name = "numero_etapa", nullable = false)
	private int numeroEtapa;

	@Pattern(regexp = "^(https?://)?([\\w-]+\\.)+[\\w-]+(/.*)?$", message = "La URL de la foto no tiene un formato válido")
	@Column(name = "foto_url", length = 500)
	private String fotoUrl;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "logro_id", nullable = false)
	private Logro logro;

	public EtapaLogro() {
	}

	public EtapaLogro(int numeroEtapa, String fotoUrl, Logro logro) {
		this.numeroEtapa = numeroEtapa;
		this.fotoUrl = fotoUrl;
		this.logro = logro;
	}

	public Long getId() {
		return id;
	}

	public int getNumeroEtapa() {
		return numeroEtapa;
	}

	public void setNumeroEtapa(int numeroEtapa) {
		this.numeroEtapa = numeroEtapa;
	}

	public String getFotoUrl() {
		return fotoUrl;
	}

	public void setFotoUrl(String fotoUrl) {
		this.fotoUrl = fotoUrl;
	}

	public Logro getLogro() {
		return logro;
	}

	public void setLogro(Logro logro) {
		this.logro = logro;
	}

	@Override
	public String toString() {
		return "EtapaLogro [id=" + id + ", numeroEtapa=" + numeroEtapa + ", fotoUrl=" + fotoUrl + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(fotoUrl, id, Integer.valueOf(numeroEtapa));
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		EtapaLogro other = (EtapaLogro) obj;
		return Objects.equals(fotoUrl, other.fotoUrl) && Objects.equals(id, other.id)
				&& numeroEtapa == other.numeroEtapa;
	}

}