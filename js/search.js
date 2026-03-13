function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const propertyCards = document.querySelectorAll('.property-card');
            const noResults = document.getElementById('no-results');
            let visibleCount = 0;
            
            propertyCards.forEach(card => {
                const title = card.dataset.title ? card.dataset.title.toLowerCase() : '';
                const location = card.dataset.location ? card.dataset.location.toLowerCase() : '';
                const type = card.dataset.type ? card.dataset.type.toLowerCase() : '';
                
                if (title.includes(query) || location.includes(query) || type.includes(query) || query === '') {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            if (visibleCount === 0 && query !== '') {
                noResults.style.display = 'block';
            } else {
                noResults.style.display = 'none';
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', initSearch);