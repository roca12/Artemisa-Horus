package co.edu.unbosque.gpcueb.horusback.dto;

import java.util.List;
import java.util.Objects;

public class UsuarioCodeforcesApiDTO {

	private String status;
	private List<UsuarioCodeforcesDTO> result;

	public UsuarioCodeforcesApiDTO() {
		// TODO Auto-generated constructor stub
	}

	public UsuarioCodeforcesApiDTO(String status, List<UsuarioCodeforcesDTO> result) {
		super();
		this.status = status;
		this.result = result;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public List<UsuarioCodeforcesDTO> getResult() {
		return result;
	}

	public void setResult(List<UsuarioCodeforcesDTO> result) {
		this.result = result;
	}

	@Override
	public String toString() {
		return "UsuarioCodeforcesApiDTO [status=" + status + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(status);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		UsuarioCodeforcesApiDTO other = (UsuarioCodeforcesApiDTO) obj;
		return Objects.equals(status, other.status);
	}

}
