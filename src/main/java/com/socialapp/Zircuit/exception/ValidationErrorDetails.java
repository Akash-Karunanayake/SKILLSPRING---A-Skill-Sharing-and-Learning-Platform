package com.socialapp.Zircuit.exception;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.Map;

@Getter
@Setter
public class ValidationErrorDetails extends ErrorDetails {
    private Map<String, String> errors;
    
    public ValidationErrorDetails(Date timestamp, String message, String details, int status, Map<String, String> errors) {
        super(timestamp, message, details, status);
        this.errors = errors;
    }
}
