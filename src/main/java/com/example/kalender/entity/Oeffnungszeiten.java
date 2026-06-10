package com.example.kalender.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
public class Oeffnungszeiten {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private DayOfWeek wochentag;

    private LocalTime startUhrzeit;
    private LocalTime endUhrzeit;

    @ManyToOne
    @JoinColumn(name = "master_id")
    private Master master;

    public Oeffnungszeiten() {}

    public Oeffnungszeiten(DayOfWeek wochentag, LocalTime startUhrzeit, LocalTime endUhrzeit) {
        this.wochentag = wochentag;
        this.startUhrzeit = startUhrzeit;
        this.endUhrzeit = endUhrzeit;
    }

    public DayOfWeek getWochentag() {
        return wochentag;
    }

    public void setWochentag(DayOfWeek wochentag) {
        this.wochentag = wochentag;
    }

    public LocalTime getStartUhrzeit() {
        return startUhrzeit;
    }

    public void setStartUhrzeit(LocalTime startUhrzeit) {
        this.startUhrzeit = startUhrzeit;
    }

    public LocalTime getEndUhrzeit() {
        return endUhrzeit;
    }

    public void setEndUhrzeit(LocalTime endUhrzeit) {
        this.endUhrzeit = endUhrzeit;
    }

    public Master getMaster() {
        return master;
    }

    public void setMaster(Master master) {
        this.master = master;
    }
}
