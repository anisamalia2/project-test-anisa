const API_URL = 'https://proxy.cors.sh/https://suitmedia-backend.suitdev.com/api/ideas';

let page = 1 ;
let size = 10;
let sort = '-published_at';

const header = document.getElementById('header');
const navLinks = document.querySelectorAll('.nav-link');
const postContainer = document.getElementById('postContainer');
const pagination = document.getElementById('pagination');
const sortSelect = document.getElementById('sort');
const perPageSelect = document.getElementById('perPage');
const showingText = document.getElementById('showingText');

let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    if (window.scrollY > lastScrollY) {
        header.classList.add('hidden');
        header.classList.remove('transparent');
    } else {
        header.classList.remove('hidden');
        if (window.scrollY > 50) {
            header.classList.add('transparent');
        } else {
            header.classList.remove('transparent');
        }
    }
    lastScrollY = window.scrollY;
});

navLinks.forEach(link => {
    link.classList.remove('active');
});
document.querySelector('.nav-link.ideas').classList.add('active');

function loadState() {
    const saved =JSON.parse(localStorage.getItem('postState'));
    if (saved) {
        page = saved.page;
        size = saved.size;
        sort = saved.sort;
        sortSelect.value = (sort === '-published_at') ? 'Newest' : 'Oldest';
        perPageSelect.value = size;
    }
}

function saveState() {
    localStorage.setItem('postState', JSON.stringify({page, size, sort}));
}

function formDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

sortSelect.addEventListener('change', () => {
    sort = sortSelect.value === 'Oldest' ? 'published_at' : '-published_at';
    page = 1;
    saveState();
    fetchPosts();
});

perPageSelect.addEventListener('change', () => {
    size = parseInt(perPageSelect.value);
    page = 1;
    saveState();
    fetchPosts();
});

function fetchPosts() {
    const url = `${API_URL}?page[number]=${page}&page[size]=${size}&append[]=small_image&append[]=medium_image&sort=${sort}`;

    fetch (url, { headers: API_HEADERS })
    .then(res => res.json())
.then(data => {
    renderPosts(data.data);
    renderPagination(data.meta.totalPages);
    updateShowingText(data.meta.total);
})
.catch(err => console.error("Gagal mengambil data:", err));
}
window.addEventListener('scroll', () => {
    const bannerImg = document.querySelector('.banner-image');
    const scrolled = window.scrollY;
    bannerImg.style.transform = `translateY(${scrolled * 0.3}px)`;
});

function renderPosts(posts) {
    postContainer.innerHTML = '';
    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.innerHTML = `
        <img src="${post.small_image}" alt="${post.title}" loading="lazy" />
        <div class="post-content">
            <div class="post-date">${formDate(post.published_at)}</div>
            <div class="post-title">${post.title}</div>
        </div>
        `;
        postContainer.appendChild(card);
    });
}

function renderPagination(totalPages) {
    pagination.innerHTML = '';

    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage -startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (page > 1) {
        const prev = document.createElement('button');
        prev.innerHTML = '&laquo;';
        prev.className ='page-btn';
        prev.addEventListener('click', () => {
            page--;
            saveState();
            fetchPosts();
    });
    pagination.appendChild(prev);
}

for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = 'page-btn';
    if (i == page) btn.classList.add('active');
    btn.addEventListener('click', () => {
        page = i;
        saveState();
        fetchPosts();
    });
    pagination.appendChild(btn);
}

if (page < totalPages) {
    const next = document.createElement('button');
    next.innerHTML ='&raquo;';
    next.className ='page-btn';
    next.addEventListener('click', () => {
        page++;
        saveState();
        fetchPosts();
    });
    pagination.appendChild(next);
  }
}

function updateShowingText(totalItems) {
    const start = (page - 1) * size + 1;
    const end = Math.min(page * size, totalItems);
    showingText.textContent = 'Showing ${start}-${end} of ${totalItems}';
}

loadState();
fetchPosts();