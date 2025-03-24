package com.socialapp.Zircuit.config;

import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global handler for shaping API responses
 */
@ControllerAdvice
public class ResponseHandler implements ResponseBodyAdvice<Object> {
    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // Only apply to responses that are not already wrapped and not error responses
        return !returnType.getParameterType().equals(Map.class);
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                 Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                 ServerHttpRequest request, ServerHttpResponse response) {
        
        // Skip wrapping for certain types
        if (body == null || body instanceof byte[] || body instanceof String) {
            return body;
        }
        
        // Skip wrapping for error responses from ExceptionHandler
        if (body instanceof HashMap && ((HashMap<?, ?>) body).containsKey("status") && 
                ((HashMap<?, ?>) body).containsKey("message")) {
            return body;
        }
        
        Map<String, Object> wrapper = new HashMap<>();
        wrapper.put("success", true);
        wrapper.put("data", body);
        return wrapper;
    }
}
