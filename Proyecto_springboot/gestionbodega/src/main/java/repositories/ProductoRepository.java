package repositories;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import entities.Producto;


public interface ProductoRepository extends JpaRepository<Producto, Long> {


    List<Producto> findByStockLessThan(Integer limite);
    
}

