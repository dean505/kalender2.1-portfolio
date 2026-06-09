package com.example.kalender.service;

import com.example.kalender.entity.Master;
import com.example.kalender.repository.MasterRepository;
import org.springframework.stereotype.Service;

@Service
public class MasterService {

    private static final String DEFAULT_MASTER_NAME = "Default Master";

    private final MasterRepository masterRepository;

    public MasterService(MasterRepository masterRepository) {
        this.masterRepository = masterRepository;
    }

    public Master getDefaultMaster() {
        return masterRepository.findFirstByDefaultMasterTrue()
                .orElseGet(this::createDefaultMaster);
    }

    public Master resolveMaster(Long masterId) {
        if (masterId == null) {
            return getDefaultMaster();
        }

        return masterRepository.findById(masterId)
                .orElseThrow(() -> new IllegalStateException("Master nicht gefunden: " + masterId));
    }

    private Master createDefaultMaster() {
        Master master = new Master();
        master.setName(DEFAULT_MASTER_NAME);
        master.setDescription("Initialer Kalenderinhaber");
        master.setDefaultMaster(true);
        master.setActive(true);
        return masterRepository.save(master);
    }
}
