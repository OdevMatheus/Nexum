package com.matheushenrique.nexum.config;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@ApiResponses({
        @ApiResponse(responseCode = "400", description = "Erro de validação nos dados de entrada",
                content = @Content(mediaType = "application/json", examples = @ExampleObject(
                        value = "{\"status\":400,\"error\":\"Bad Request\",\"message\":\"O campo email é obrigatório\"}"
                ))),
        @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)",
                content = @Content(mediaType = "application/json", examples = @ExampleObject(
                        value = "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}"
                ))),
        @ApiResponse(responseCode = "403", description = "Acesso negado para este recurso",
                content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "500", description = "Erro interno do servidor",
                content = @Content(mediaType = "application/json"))
})
public @interface ApiGlobalErrors {
}