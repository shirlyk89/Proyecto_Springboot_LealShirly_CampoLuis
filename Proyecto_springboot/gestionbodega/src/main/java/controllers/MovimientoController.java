package controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import entities.Movimiento;
import services.MovimientoService;

@RestController
@RequestMapping("/api/movimientos")
@CrossOrigin(origins = "*") 
public class MovimientoController {

    private final MovimientoService movimientoService;

   
    public MovimientoController(MovimientoService movimientoService) {
        this.movimientoService = movimientoService;
    }


    @PostMapping
    public ResponseEntity<?> registrar(@RequestBody Movimiento movimiento) {
        try {
           
            Movimiento nuevoMovimiento = movimientoService.registrarMovimiento(movimiento);
           
            return new ResponseEntity<>(nuevoMovimiento, HttpStatus.CREATED);
        } catch (RuntimeException e) {
           
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    
    @GetMapping
    public ResponseEntity<List<Movimiento>> listarTodos() {
        List<Movimiento> movimientos = movimientoService.listarTodos();
        return ResponseEntity.ok(movimientos); 
    }
}