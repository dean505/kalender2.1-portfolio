package com.example.kalender.repository;

import com.example.kalender.entity.Master;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface MasterRepository extends JpaRepository<Master, Long> {

    Optional<Master> findFirstByDefaultMasterTrue();

    List<Master> findByActiveTrueOrderByNameAsc();

    List<Master> findAllByOrderByNameAsc();
}
