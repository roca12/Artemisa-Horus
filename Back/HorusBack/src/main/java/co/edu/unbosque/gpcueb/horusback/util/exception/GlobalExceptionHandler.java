package co.edu.unbosque.gpcueb.horusback.util.exception;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import jakarta.validation.ConstraintViolationException;

import java.time.format.DateTimeParseException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Manejador global de excepciones del sistema.
 * Captura diferentes tipos de errores y retorna respuestas HTTP
 * adecuadas con mensajes claros.
 * @author BlackDanrt
 * @version 1.0
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
	
	/**
	 * Maneja errores de validación de restricciones.
	 * @param e Excepción de validación.
	 * @return Mensaje de error y estado 400.
	 */
	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<String> handleRestricciones(ConstraintViolationException e) {
	    String mensaje = e.getConstraintViolations()
	            .iterator().next()
	            .getMessage();
	    return new ResponseEntity<>(mensaje, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Maneja parámetros faltantes en la solicitud.
	 * @param e Excepción de parámetro faltante.
	 * @return Mensaje de error y estado 400.
	 */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<String> HandleParametroFaltante(MissingServletRequestParameterException e) {
        return new ResponseEntity<>("El parámetro '" + e.getParameterName() + "' es obligatorio",
                HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja errores de tipo en parámetros.
     * @param e Excepción de tipo inválido.
     * @return Mensaje de error y estado 400.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> handleTipoInvalido(MethodArgumentTypeMismatchException e) {
        String mensaje = "El parámetro '" + e.getName() + "' tiene un valor inválido: '" + e.getValue() + "'";
        return new ResponseEntity<>(mensaje, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja argumentos ilegales.
     * @param e Excepción de argumento inválido.
     * @return Mensaje de error y estado 400.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleArgumentoIlegal(IllegalArgumentException e) {
        return new ResponseEntity<>("Valor inválido: " + e.getMessage(),
                HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidacion(MethodArgumentNotValidException e) {
        String mensaje = e.getBindingResult()
                .getFieldErrors()
                .get(0)
                .getDefaultMessage(); 
        return new ResponseEntity<>(mensaje, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja cualquier excepción no controlada.
     * @param e Excepción general.
     * @return Mensaje de error y estado 500.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneral(Exception e) {
        return new ResponseEntity<>("Error interno del servidor ",
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
}
