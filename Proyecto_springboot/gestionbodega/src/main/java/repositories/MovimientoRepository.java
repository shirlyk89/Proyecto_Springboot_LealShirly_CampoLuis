package repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import entities.Movimiento;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {


    List<Movimiento> findByFechaHoraBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    List<Movimiento> findByProductoId(Long productoId);
}