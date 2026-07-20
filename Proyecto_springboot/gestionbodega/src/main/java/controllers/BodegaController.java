package controllers;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import entities.Bodega;
import lombok.RequiredArgsConstructor;
import services.BodegaService;

@RestController
@RequestMapping("/api/bodegas")
@RequiredArgsConstructor
public class BodegaController {

     private final BodegaService service;

    @GetMapping
    public List<Bodega> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public CiudadResponse buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<CiudadResponse> crear(@Valid @RequestBody CiudadRequest request) {
        var response = service.crear(request);
        return ResponseEntity.created(URI.create("/api/ciudades/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    public CiudadResponse actualizar(@PathVariable Long id,
                                      @Valid @RequestBody CiudadRequest request) {
        return service.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

}
