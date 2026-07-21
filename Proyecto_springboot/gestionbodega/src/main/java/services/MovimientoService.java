package services;

import java.util.List;
import entities.Movimiento;


public interface MovimientoService {

    Movimiento registrarMovimiento(Movimiento movimiento);

    List<Movimiento> listarTodos();

    
} 
