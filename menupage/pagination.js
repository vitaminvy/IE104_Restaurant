import i18nService from '../assets/script/i18n-service.js';

export function initPagination(totalPages, currentPage, onPageChange) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';

    const createPageLink = (pageNumber, text, isDisabled = false, isCurrent = false) => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = text;
        link.className = 'page-numbers';
        if (isCurrent) {
            link.classList.add('current');
        }
        if (isDisabled) {
            link.classList.add('disabled');
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.6';
        } else {
            link.onclick = (e) => {
                e.preventDefault();
                if (onPageChange) {
                    onPageChange(pageNumber);
                }
            };
        }
        return link;
    };

    const addEllipsis = () => {
        const span = document.createElement('span');
        span.className = 'ellipsis';
        span.textContent = '...';
        return span;
    };

    // Previous Button
    const prev = createPageLink(currentPage - 1, i18nService.t('blog_page.pagination.previous'), currentPage === 1);
    prev.classList.add('prev');
    pagination.appendChild(prev);

    const pageContainer = document.createElement('div');
    pageContainer.className = 'page-numbers-container';

    if (totalPages <= 6) {
        for (let i = 1; i <= totalPages; i++) {
            pageContainer.appendChild(createPageLink(i, i, false, i === currentPage));
        }
    } else {
        let start = Math.max(currentPage - 1, 2);
        let end = Math.min(currentPage + 1, totalPages - 1);

        pageContainer.appendChild(createPageLink(1, 1, false, 1 === currentPage));

        if (start > 2) {
            pageContainer.appendChild(addEllipsis());
        }

        for (let i = start; i <= end; i++) {
            pageContainer.appendChild(createPageLink(i, i, false, i === currentPage));
        }

        if (end < totalPages - 1) {
            pageContainer.appendChild(addEllipsis());
        }

        pageContainer.appendChild(createPageLink(totalPages, totalPages, false, totalPages === currentPage));
    }

    pagination.appendChild(pageContainer);

    // Next Button
    const next = createPageLink(currentPage + 1, i18nService.t('blog_page.pagination.next'), currentPage === totalPages);
    next.classList.add('next');
    pagination.appendChild(next);
}