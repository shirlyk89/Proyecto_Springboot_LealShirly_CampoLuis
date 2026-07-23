package com.proyectospring.gestionbodega.services;

import java.util.List;

import com.proyectospring.gestionbodega.entities.Movimiento;
import com.proyectospring.gestionbodega.security.dtos.MovimientoDto;


public interface MovimientoService {

    Movimiento registrarMovimiento(MovimientoDto dto);

    List<Movimiento> listarTodos();

    
} 
