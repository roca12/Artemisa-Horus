package co.edu.unbosque.gpcueb.horusback.util.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.google.gson.Gson;

import co.edu.unbosque.gpcueb.horusback.dto.EjercicioGithubDTO;
import co.edu.unbosque.gpcueb.horusback.dto.UsuarioCodeforcesApiDTO;
import co.edu.unbosque.gpcueb.horusback.dto.UsuarioCodeforcesDTO;

@Service
public class ExternalHTPPRequestHandler {

	/** Logger para registrar mensajes durante la carga de datos. */
	private static final Logger log = LoggerFactory.getLogger(ExternalHTPPRequestHandler.class);

	private static final String CODEFORCES_USER_INFO_URL = "https://codeforces.com/api/user.info?handles=";

	private static final String GITHUB_REPO_BASE_URL = "https://api.github.com/repos/roca12/GPC-UEB-Repo/contents/Resueltos_por_competidor/";

	private static final String GITHUB_REPO_BASE_URL_END = "?ref=main";
	
	private static final String GITHUB_USER_URL = "https://api.github/users/";

	/**
	 * Constructor por defecto del servicio.
	 */
	public ExternalHTPPRequestHandler() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * Cliente HTTP estático e inmutable configurado para trabajar con el protocolo
	 * HTTP/2 y tiempos de espera de conexión.
	 */
	private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder().version(HttpClient.Version.HTTP_2)
			.connectTimeout(Duration.ofSeconds(10)).build();

	public int getListaEjercicios(String nombre, String apellido) {
		List<EjercicioGithubDTO> listaEjercicios = new ArrayList<>();

		HttpRequest solicitud = HttpRequest.newBuilder().GET()
				.uri(URI.create(GITHUB_REPO_BASE_URL + nombre + "_" + apellido + GITHUB_REPO_BASE_URL_END))
				.setHeader("User-Agent", "Java 11 HttpClient Bot")
				// .setHeader("Authorization", "Bearer " + githubToken) 
				.build();

		try {
			HttpResponse<String> respuesta = HTTP_CLIENT.send(solicitud, HttpResponse.BodyHandlers.ofString());

			log.info("Actualizando Cantidad Ejercicios de: " + nombre + "_" + apellido + "-" + respuesta.statusCode());

			if (respuesta.statusCode() != 200 || respuesta.body() == null || respuesta.body().isBlank()) {
				log.warn("Sin datos de Github (HTTP {})", respuesta.statusCode());
			} else {
				Gson gson = new Gson();
				EjercicioGithubDTO[] resultado = gson.fromJson(respuesta.body(), EjercicioGithubDTO[].class);

				if (resultado != null) {
					Arrays.stream(resultado).filter(item -> "file".equals(item.getType()))
							.forEach(listaEjercicios::add);
				} else {
					log.warn("Github devolvió una respuesta vacía o con formato inesperado");
				}
			}

		} catch (IOException | InterruptedException e) {
			log.error("Error al consultar la API de Github: {}", e.getMessage());
		}

		return listaEjercicios.size();
	}

	public List<UsuarioCodeforcesDTO> getListaRating(List<String> listaHandles) {
		List<UsuarioCodeforcesDTO> listaCodeforces = new ArrayList<>();

		if (listaHandles == null || listaHandles.isEmpty()) {
			return listaCodeforces;
		}

		String handles = String.join(";", listaHandles);
		HttpRequest solicitud = HttpRequest.newBuilder().GET().uri(URI.create(CODEFORCES_USER_INFO_URL + handles))
				.setHeader("User-Agent", "Java 11 HttpClient Bot").build();

		try {
			HttpResponse<String> respuesta = HTTP_CLIENT.send(solicitud, HttpResponse.BodyHandlers.ofString());

			log.info("Actualizando Rating Codeforces - " + respuesta.statusCode());

			if (respuesta.statusCode() != 200 || respuesta.body() == null || respuesta.body().isBlank()) {
				log.warn("Sin datos de Codeforces (HTTP {})", respuesta.statusCode());
			} else {
				Gson gson = new Gson();
				UsuarioCodeforcesApiDTO resultado = gson.fromJson(respuesta.body(), UsuarioCodeforcesApiDTO.class);

				if (resultado != null && "OK".equals(resultado.getStatus()) && resultado.getResult() != null) {
					listaCodeforces.addAll(resultado.getResult());
				} else {
					log.warn("Codeforces API devolvió error: {}",
							resultado != null ? resultado.getStatus() : "respuesta nula");
				}
			}

		} catch (IOException | InterruptedException e) {
			log.error("Error al consultar la API de Codeforces: {}", e.getMessage());
			e.printStackTrace();
		}

		return listaCodeforces;
	}
	
	public boolean existeHandleCodeforces(String handle) {
	    if (handle == null || handle.isBlank()) {
	        return false;
	    }

	    HttpRequest solicitud = HttpRequest.newBuilder().GET()
	            .uri(URI.create(CODEFORCES_USER_INFO_URL + handle))
	            .setHeader("User-Agent", "Java 11 HttpClient Bot").build();

	    try {
	        HttpResponse<String> respuesta = HTTP_CLIENT.send(solicitud, HttpResponse.BodyHandlers.ofString());

	        log.info("Verificando handle Codeforces: " + handle + "-" + respuesta.statusCode());

	        if (respuesta.statusCode() != 200 || respuesta.body() == null || respuesta.body().isBlank()) {
	            log.warn("Sin datos de Codeforces al verificar handle (HTTP {})", respuesta.statusCode());
	            return false;
	        }

	        Gson gson = new Gson();
	        UsuarioCodeforcesApiDTO resultado = gson.fromJson(respuesta.body(), UsuarioCodeforcesApiDTO.class);

	        return resultado != null && "OK".equals(resultado.getStatus());

	    } catch (IOException | InterruptedException e) {
	        log.error("Error al consultar la API de Codeforces: {}", e.getMessage());
	        return false;
	    }
	}

	public boolean existeUsuarioGithub(String usuario) {
	    if (usuario == null || usuario.isBlank()) {
	        return false;
	    }

	    HttpRequest solicitud = HttpRequest.newBuilder().GET()
	            .uri(URI.create(GITHUB_USER_URL + usuario))
	            .setHeader("User-Agent", "Java 11 HttpClient Bot")
	            .build();

	    try {
	        HttpResponse<String> respuesta = HTTP_CLIENT.send(solicitud, HttpResponse.BodyHandlers.ofString());

	        log.info("Verificando usuario Github: " + usuario + "-" + respuesta.statusCode());

	        return respuesta.statusCode() == 200;

	    } catch (IOException | InterruptedException e) {
	        log.error("Error al consultar la API de Github: {}", e.getMessage());
	        return false;
	    }
	}
}
