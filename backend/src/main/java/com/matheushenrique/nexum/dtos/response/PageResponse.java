package com.matheushenrique.nexum.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;
import java.util.List;

public record PageResponse<T>(
        @Schema(description = "Lista de itens contidos na página atual")
        List<T> content,
        @Schema(description = "Número da página atual (iniciando em 0)", example = "0")
        int page,
        @Schema(description = "Quantidade de itens por página", example = "10")
        int size,
        @Schema(description = "Total de registros encontrados no banco", example = "150")
        long totalElements,
        @Schema(description = "Total de páginas disponíveis", example = "15")
        int totalPages,
        @Schema(description = "Indica se esta é a última página", example = "false")
        boolean last
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}