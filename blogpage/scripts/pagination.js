export function initPagination(totalPages = 9) {
    const pagination = document.getElementById('pagination');
    let currentPage = 1;

    const createPage = (num) => {
        const page = document.createElement('a');
        page.href = '#';
        page.className = 'page-numbers';
        if (num === currentPage) page.classList.add('current');
        page.textContent = num;
        page.onclick = () => { currentPage = num; renderPagination(); };
        return page;
    };

    const addEllipsis = () => {
        const span = document.createElement('span');
        span.className = 'ellipsis';
        span.textContent = '...';
        return span;
    };

    function renderPagination() {
        if (!pagination) return;
        pagination.innerHTML = '';

        // Prev
        const prev = document.createElement('a');
        prev.href = '#';
        prev.className = 'prev';
        prev.textContent = '← Previous';
        prev.onclick = () => { if (currentPage > 1) { currentPage--; renderPagination(); } };
        pagination.appendChild(prev);

        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-numbers-container';

        if (totalPages <= 6) {
            for (let i = 1; i <= totalPages; i++) pageContainer.appendChild(createPage(i));
        } else {
            let start = Math.max(currentPage - 1, 2);
            let end = Math.min(currentPage + 1, totalPages - 1);

            pageContainer.appendChild(createPage(1));

            if (start > 2) pageContainer.appendChild(addEllipsis());

            for (let i = start; i <= end; i++) pageContainer.appendChild(createPage(i));

            if (end < totalPages - 1) pageContainer.appendChild(addEllipsis());

            pageContainer.appendChild(createPage(totalPages));
        }

        pagination.appendChild(pageContainer);

        // Next
        const next = document.createElement('a');
        next.href = '#';
        next.className = 'next';
        next.textContent = 'Next →';
        next.onclick = () => { if (currentPage < totalPages) { currentPage++; renderPagination(); } };
        pagination.appendChild(next);
    }

    renderPagination();
}
