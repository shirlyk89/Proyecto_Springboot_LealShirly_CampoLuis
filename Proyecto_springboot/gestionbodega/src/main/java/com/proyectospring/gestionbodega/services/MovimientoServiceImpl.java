package com.proyectospring.gestionbodega.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.proyectospring.gestionbodega.entities.Movimiento;
import com.proyectospring.gestionbodega.entities.Producto;
import com.proyectospring.gestionbodega.repositories.MovimientoRepository;
import com.proyectospring.gestionbodega.repositories.ProductoRepository;

import jakarta.transaction.Transactional;

@Service

public class MovimientoServiceImpl implements MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final ProductoRepository productoRepository;

    // Inyección de dependencias por constructor (práctica recomendada)
    public MovimientoServiceImpl(MovimientoRepository movimientoRepository, ProductoRepository productoRepository) {
        this.movimientoRepository = movimientoRepository;
        this.productoRepository = productoRepository;
    }

  
    @Override
    @Transactional
    public Movimiento registrarMovimiento(Movimiento movimiento) {
        
        Producto producto = productoRepository.findById(movimiento.getProducto().getId())
                .orElseThrow(() -> new RuntimeException("El producto no existe"));

        switch (movimiento.getTipo()) {

            case ENTRADA:
                int nuevoStockEntrada = producto.getStock() + movimiento.getCantidad();
                producto.setStock(nuevoStockEntrada);
                break;

            case SALIDA:
                if (producto.getStock() < movimiento.getCantidad()) {
                    throw new RuntimeException("Stock insuficiente para realizar la salida");
                }
                int nuevoStockSalida = producto.getStock() - movimiento.getCantidad();
                producto.setStock(nuevoStockSalida);
                break;

            case TRANSFERENCIA:
                if (producto.getStock() < movimiento.getCantidad()) {
                    throw new RuntimeException("Stock insuficiente para realizar la transferencia");
                }
                break;
        }

        productoRepository.save(producto);

        return movimientoRepository.save(movimiento);
    }

    @Override
    public List<Movimiento> listarTodos() {
        return movimientoRepository.findAll();
    }

}
