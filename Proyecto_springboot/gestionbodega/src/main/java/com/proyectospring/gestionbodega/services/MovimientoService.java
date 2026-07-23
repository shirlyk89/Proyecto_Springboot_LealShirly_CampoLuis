package com.proyectospring.gestionbodega.services;

import java.util.List;

import com.proyectospring.gestionbodega.entities.Movimiento;


public interface MovimientoService {

    Movimiento registrarMovimiento(Movimiento movimiento);

    List<Movimiento> listarTodos();

    
} 
