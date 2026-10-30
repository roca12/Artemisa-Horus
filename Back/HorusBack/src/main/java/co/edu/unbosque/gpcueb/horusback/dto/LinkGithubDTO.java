package co.edu.unbosque.gpcueb.horusback.dto;

import java.util.Objects;

public class LinkGithubDTO {

	private String self;
	private String git;
	private String html;

	public LinkGithubDTO() {
		// TODO Auto-generated constructor stub
	}

	public LinkGithubDTO(String self, String git, String html) {
		super();
		this.self = self;
		this.git = git;
		this.html = html;
	}

	public String getSelf() {
		return self;
	}

	public void setSelf(String self) {
		this.self = self;
	}

	public String getGit() {
		return git;
	}

	public void setGit(String git) {
		this.git = git;
	}

	public String getHtml() {
		return html;
	}

	public void setHtml(String html) {
		this.html = html;
	}

	@Override
	public String toString() {
		return "LinkGithubDTO [self=" + self + ", git=" + git + ", html=" + html + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(git, html, self);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		LinkGithubDTO other = (LinkGithubDTO) obj;
		return Objects.equals(git, other.git) && Objects.equals(html, other.html) && Objects.equals(self, other.self);
	}

}
