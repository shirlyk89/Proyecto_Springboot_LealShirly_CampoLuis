package com.proyectospring.gestionbodega.controllers;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyectospring.gestionbodega.entities.Movimiento;
import com.proyectospring.gestionbodega.security.dtos.MovimientoDto;
import com.proyectospring.gestionbodega.services.MovimientoService;;
@RestController
@RequestMapping("/api/movimientos")
@CrossOrigin(origins = "*") 
public class MovimientoController {

    private final MovimientoService movimientoService;

   
    public MovimientoController(MovimientoService movimientoService) {
        this.movimientoService = movimientoService;
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLEADO')")
    @PostMapping
    public ResponseEntity<?> registrar(@RequestBody MovimientoDto dto) {
        try {
           
            Movimiento nuevoMovimiento = movimientoService.registrarMovimiento(dto);
           
            return new ResponseEntity<>(nuevoMovimiento, HttpStatus.CREATED);
        } catch (RuntimeException e) {
           
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'EMPLEADO')")
    @GetMapping
    public ResponseEntity<List<Movimiento>> listarTodos() {
        List<Movimiento> movimientos = movimientoService.listarTodos();
        return ResponseEntity.ok(movimientos); 
    }
}