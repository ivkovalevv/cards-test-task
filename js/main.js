document.addEventListener('DOMContentLoaded', function() {
    const cardsContainer = document.getElementById('cardsContainer');
    const filterButtonsContainer = document.querySelector('.filter-buttons');
    const searchInput = document.querySelector('.search-input');
    
    let courses = [];
    let currentCategory = 'All';
    let searchQuery = '';

    async function loadCourses() {
        try {
            const response = await fetch('../data/cardsData.json');
            if (!response.ok) throw new Error('Network response was not ok');
            courses = await response.json();
            console.log(courses)
            initApp();
        } catch (error) {
            console.error('Error loading courses:', error);
            cardsContainer.innerHTML = `
                <div class="error">
                    <p>Failed to load courses. Please try again later.</p>
                </div>
            `;
        }
    }
    
    function createFilterButtons() {
        const categoryCounts = {};
        courses.forEach(course => {
            categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1;
        });
        
        const categories = ['All', ...new Set(courses.map(course => course.category))];
        
        const filterButtonsContainer = document.querySelector('.filter-buttons');
        filterButtonsContainer.innerHTML = '';
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = `filter-button ${category === 'All' ? 'filter-button--active' : ''}`;
            button.dataset.category = category;
            
            if (category === 'All') {
                const count = courses.length || 0;
                button.innerHTML = `All <span class="filter-button__count">${count}</span>`;
            } else {
                const count = categoryCounts[category] || 0;
                button.innerHTML = `${category} <span class="filter-button__count">${count}</span>`;
            }
            
            button.addEventListener('click', () => {
                // Убираем активный класс у всех кнопок
                document.querySelectorAll('.filter-button').forEach(btn => {
                    btn.classList.remove('filter-button--active');
                });
                // Добавляем активный класс текущей кнопке
                button.classList.add('filter-button--active');
                
                // Обновляем фильтр и перерисовываем карточки
                currentCategory = category;
                renderCards();
            });
            
            filterButtonsContainer.appendChild(button);
        });
    }
    
    function createCardElement(course) {
        const categoryClass = course.category
            .toLowerCase()
            .replace(/[&]/g, 'and')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-');

        return `
            <article class="card" data-category="${course.category}" data-id="${course.id}">
                <div class="card__image-container">
                    <img src="${course.image}" alt="${course.alt}" class="card__image">
                </div>
                <div class="card__content">
                    <span class="card__category card__category--${categoryClass}">${course.category}
                    </span>
                    <h3 class="card__title">${course.title}</h3>
                    <div class="card__info">
                        <span class="card__price">$${course.price}</span>
                        <span class="card__instructor">by ${course.instructor}</span>
                    </div>
                </div>
            </article>
        `;
    }
    
    function filterCourses() {
        return courses.filter(course => {
            const matchesCategory = currentCategory === 'All' || course.category === currentCategory;
            const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }
    
    function renderCards() {
        const filteredCourses = filterCourses();
        
        if (filteredCourses.length === 0) {
            cardsContainer.innerHTML = `
                <div class="no-results">
                    <p>No courses found. Try another search or filter.</p>
                </div>
            `;
            return;
        }

        const categoryCounts = {};
        filteredCourses.forEach(course => {
            categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1;
        });
        
        cardsContainer.innerHTML = filteredCourses
            .map(course => createCardElement(course))
            .join('');
    }
    
    function initApp() {
        createFilterButtons();
        renderCards();
        
        searchInput.addEventListener('input', function() {
            searchQuery = this.value.trim();
            renderCards();
        });
    }
    
    loadCourses();
});