package co.edu.unbosque.gpcueb.horusback.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import co.edu.unbosque.gpcueb.horusback.entity.Tarea;
import co.edu.unbosque.gpcueb.horusback.util.enums.EstadoTarea;


public interface TareaRepository extends JpaRepository<Tarea, Long>  {
	
	List<Tarea> findByEquipoId(long equipoId);

    List<Tarea> findByEstado(EstadoTarea estado);

    List<Tarea> findByEquipoIdAndEstado(long equipoId, EstadoTarea estado);
}
