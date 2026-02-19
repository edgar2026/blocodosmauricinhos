/**
 * Utilitário para paginação de listas
 * Implementa a lógica de cálculo de páginas e fatiamento de dados
 */

export interface PaginationResult<T> {
    paginatedItems: T[];
    totalPages: number;
    currentPage: number;
    startIndex: number;
    endIndex: number;
}

/**
 * Calcula os itens da página atual e metadados de paginação
 */
export function paginate<T>(
    items: T[],
    currentPage: number,
    itemsPerPage: number = 10
): PaginationResult<T> {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / Math.max(1, itemsPerPage));

    // Garante que a página atual está dentro dos limites
    const sanitizedPage = Math.max(1, Math.min(currentPage, totalPages || 1));

    const startIndex = (sanitizedPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
        paginatedItems,
        totalPages,
        currentPage: sanitizedPage,
        startIndex,
        endIndex
    };
}

/**
 * Gera o array de números de páginas a serem exibidos (ex: [1, 2, 3, 4, 5])
 * Centraliza a visualização em torno da página atual
 */
export function getPaginationRange(
    currentPage: number,
    totalPages: number,
    maxVisible: number = 5
): number[] {
    const pages: number[] = [];

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= totalPages) {
            pages.push(i);
        }
    }

    return pages;
}
