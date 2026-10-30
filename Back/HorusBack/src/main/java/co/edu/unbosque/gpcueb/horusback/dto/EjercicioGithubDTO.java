package co.edu.unbosque.gpcueb.horusback.dto;

import java.util.Objects;

public class EjercicioGithubDTO {

	private String name;
	private String path;
	private String sha;
	private String url;
	private String html_url;
	private String git_url;
	private String download_url;
	private String type;
	private LinkGithubDTO links;

	public EjercicioGithubDTO() {
		// TODO Auto-generated constructor stub
	}

	public EjercicioGithubDTO(String name, String path, String sha, String url, String html_url, String git_url,
			String download_url, String type, LinkGithubDTO links) {
		super();
		this.name = name;
		this.path = path;
		this.sha = sha;
		this.url = url;
		this.html_url = html_url;
		this.git_url = git_url;
		this.download_url = download_url;
		this.type = type;
		this.links = links;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getSha() {
		return sha;
	}

	public void setSha(String sha) {
		this.sha = sha;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getHtml_url() {
		return html_url;
	}

	public void setHtml_url(String html_url) {
		this.html_url = html_url;
	}

	public String getGit_url() {
		return git_url;
	}

	public void setGit_url(String git_url) {
		this.git_url = git_url;
	}

	public String getDownload_url() {
		return download_url;
	}

	public void setDownload_url(String download_url) {
		this.download_url = download_url;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public LinkGithubDTO getLinks() {
		return links;
	}

	public void setLinks(LinkGithubDTO links) {
		this.links = links;
	}

	@Override
	public String toString() {
		return "EjercicioGithubDTO [name=" + name + ", path=" + path + ", sha=" + sha + ", url=" + url + ", html_url="
				+ html_url + ", git_url=" + git_url + ", download_url=" + download_url + ", type=" + type + ", links="
				+ links + "]";
	}

	@Override
	public int hashCode() {
		return Objects.hash(download_url, git_url, html_url, links, name, path, sha, type, url);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		EjercicioGithubDTO other = (EjercicioGithubDTO) obj;
		return Objects.equals(download_url, other.download_url) && Objects.equals(git_url, other.git_url)
				&& Objects.equals(html_url, other.html_url) && Objects.equals(links, other.links)
				&& Objects.equals(name, other.name) && Objects.equals(path, other.path)
				&& Objects.equals(sha, other.sha) && Objects.equals(type, other.type) && Objects.equals(url, other.url);
	}

}
