package com.example.kalender;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KalenderApplication {

	public static void main(String[] args) {
		SpringApplication.run(KalenderApplication.class, args);
	}

}
//start der dockerconteiner mit datenbank
//docker run --name mysql-root -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=kalenderdb -p 3306:3306 -d mysql:8.0
