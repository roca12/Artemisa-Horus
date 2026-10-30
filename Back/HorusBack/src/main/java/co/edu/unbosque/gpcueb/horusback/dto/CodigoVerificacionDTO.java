package co.edu.unbosque.gpcueb.horusback.dto;

import java.util.Objects;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CodigoVerificacionDTO {

	@NotBlank
	@NotNull
	@Size(min = 6, max = 6, message = "El código debe tener 6 caracteres")
	private String codigo;
	
	@Min(value = 0, message = "El id del usuario no puede ser negativo")
	private long idUsuario;

	public CodigoVerificacionDTO() {
		// TODO Auto-generated constructor stub
	}

	public CodigoVerificacionDTO(
			@NotBlank @NotNull @Size(min = 6, max = 6, message = "El código debe tener 6 caracteres") String codigo,
			long idUsuario) {
		super();
		this.codigo = codigo;
		this.idUsuario = idUsuario;
	}

	public String getCodigo() {
		return codigo;
	}

	public void setCodigo(String codigo) {
		this.codigo = codigo;
	}

	public long getIdUsuario() {
		return idUsuario;
	}

	public void setIdUsuario(long idUsuario) {
		this.idUsuario = idUsuario;
	}

	@Override
	public String toString() {
		return "CodigoVerificacionDTO [codigo=" + codigo + ", idUsuario=" + idUsuario + ", getCodigo()=" + getCodigo()
				+ ", getIdUsuario()=" + getIdUsuario() + ", getClass()=" + getClass() + ", hashCode()=" + hashCode()
				+ ", toString()=" + super.toString() + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(codigo, Long.valueOf(idUsuario));
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		CodigoVerificacionDTO other = (CodigoVerificacionDTO) obj;
		return Objects.equals(codigo, other.codigo) && idUsuario == other.idUsuario;
	}

}
