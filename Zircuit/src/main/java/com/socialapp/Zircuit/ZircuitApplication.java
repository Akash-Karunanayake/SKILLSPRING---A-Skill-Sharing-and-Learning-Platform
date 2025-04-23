package com.socialapp.Zircuit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

//import jakarta.persistence.Entity;

import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableCaching
@EnableConfigurationProperties // Remove if not needed
@EntityScan(basePackages = "com.socialapp.Zircuit.model.entity") // Adjust the package name as needed

	// This annotation is used to specify the base packages to scan for JPA entities.
	// It is useful when your entity classes are in a different package than the main application class.

	// The @EnableConfigurationProperties annotation is used to enable support for @ConfigurationProperties
	// annotated beans. It allows you to bind external configuration properties to Java objects.

	// The @EnableAsync annotation is used to enable Spring's asynchronous method execution capability.
	// It allows you to run methods asynchronously in a separate thread.

	// The @EnableScheduling annotation is used to enable Spring's scheduled task execution capability.
	// It allows you to schedule tasks to be executed at fixed intervals or at specific times.
	
public class ZircuitApplication {
	public static void main(String[] args) {
		SpringApplication.run(ZircuitApplication.class, args);
	}

}
