package com.proyectospring.gestionbodega.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.proyectospring.gestionbodega.entities.Bodega;
import com.proyectospring.gestionbodega.entities.Movimiento;
import com.proyectospring.gestionbodega.entities.Producto;
import com.proyectospring.gestionbodega.repositories.BodegaRepository;
import com.proyectospring.gestionbodega.repositories.MovimientoRepository;
import com.proyectospring.gestionbodega.repositories.ProductoRepository;

import jakarta.transaction.Transactional;

@Service

public class MovimientoServiceImpl implements MovimientoService {

    
    private final MovimientoRepository movimientoRepository;
    private final ProductoRepository productoRepository;
    private final BodegaRepository bodegaRepository;

   

    public MovimientoServiceImpl(MovimientoRepository movimientoRepository, ProductoRepository productoRepository,
          BodegaRepository bodegaRepository
    ) {
        this.movimientoRepository = movimientoRepository;
        this.productoRepository = productoRepository;
        this.bodegaRepository = bodegaRepository;
    }


  
    @Override
    @Transactional
    public Movimiento registrarMovimiento(Movimiento movimiento) {


        if (movimiento.getBodegaDestino() != null && movimiento.getBodegaDestino().getId() != null) {
            Bodega bodegaDestino = bodegaRepository.findById(movimiento.getBodegaDestino().getId())
                    .orElseThrow(() -> new RuntimeException("La bodega destino no existe"));
            movimiento.setBodegaDestino(bodegaDestino);
        }

        // 3. ➕ NUEVO: Cargar los datos de la bodega origen si viene en el JSON
        if (movimiento.getBodegaOrigen() != null && movimiento.getBodegaOrigen().getId() != null) {
            Bodega bodegaOrigen = bodegaRepository.findById(movimiento.getBodegaOrigen().getId())
                    .orElseThrow(() -> new RuntimeException("La bodega origen no existe"));
            movimiento.setBodegaOrigen(bodegaOrigen);
        }
        
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
        movimiento.setProducto(producto);

        return movimientoRepository.save(movimiento);
    }

    @Override
    public List<Movimiento> listarTodos() {
        return movimientoRepository.findAll();
    }

}
