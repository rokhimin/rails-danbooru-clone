// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

document.addEventListener('DOMContentLoaded', () => {
  let tagsData = [];
  let isLoading = false;
  let tagsLoaded = false;
  let debounceTimer;
  
  const searchInput = document.getElementById('tag-search');
  const autocompleteResults = document.getElementById('autocomplete-results');
  
  // Fungsi untuk memuat tags hanya jika dibutuhkan (lazy loading)
  const loadTagsIfNeeded = () => {
    if (!tagsLoaded && !isLoading) {
      isLoading = true;
      
      // Tampilkan indikator loading pada searchInput
      searchInput.classList.add('is-loading');
      
      fetch('/assets/all_tags.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          tagsData = data;
          tagsLoaded = true;
          isLoading = false;
          searchInput.classList.remove('is-loading');
          
          // Jika sudah ada input, jalankan pencarian
          if (searchInput.value.trim().length >= 2) {
            performSearch();
          }
        })
        .catch(error => {
          console.error('Error loading tags:', error);
          isLoading = false;
          searchInput.classList.remove('is-loading');
        });
    }
  };
  
  // Fungsi untuk debounce pencarian
  const debounceSearch = (func, delay) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
  };
  
  // Fungsi pencarian yang dioptimalkan
  const performSearch = () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Clear previous results
    autocompleteResults.innerHTML = '';
    
    if (searchTerm.length < 2) {
      autocompleteResults.style.display = 'none';
      return;
    }
    
    // Jika data belum dimuat, muat terlebih dahulu
    if (!tagsLoaded) {
      loadTagsIfNeeded();
      return;
    }
    
    // Optimasi pencarian dengan exact match didahulukan
    const exactMatches = [];
    const startsWith = [];
    const includes = [];
    
    // Batasi jumlah iterasi untuk kinerja yang lebih baik
    const maxIterations = Math.min(tagsData.length, 1000);
    
    for (let i = 0; i < maxIterations; i++) {
      const tag = tagsData[i];
      const lowerTag = tag.toLowerCase();
      
      if (lowerTag === searchTerm) {
        exactMatches.push(tag);
      } else if (lowerTag.startsWith(searchTerm)) {
        startsWith.push(tag);
      } else if (lowerTag.includes(searchTerm)) {
        includes.push(tag);
      }
      
      // Jika sudah cukup banyak hasil, hentikan pencarian
      if (exactMatches.length + startsWith.length + includes.length >= 10) {
        break;
      }
    }
    
    // Gabungkan hasil dengan prioritas
    const matchingTags = [
      ...exactMatches,
      ...startsWith,
      ...includes
    ].slice(0, 10);
    
    if (matchingTags.length === 0) {
      autocompleteResults.style.display = 'none';
      return;
    }
    
    // Gunakan DocumentFragment untuk meminimalkan repaint
    const fragment = document.createDocumentFragment();
    
    // Display matching tags
    matchingTags.forEach(tag => {
      const resultItem = document.createElement('div');
      resultItem.className = 'autocomplete-item';
      
      // Optimasi: Highlight bagian yang cocok untuk UX yang lebih baik
      const highlightedText = tag.replace(
        new RegExp(searchTerm, 'gi'),
        match => `<strong>${match}</strong>`
      );
      
      resultItem.innerHTML = highlightedText;
      resultItem.addEventListener('click', () => {
        searchInput.value = tag;
        autocompleteResults.style.display = 'none';
        window.location.href = '/' + encodeURIComponent(tag);
      });
      
      fragment.appendChild(resultItem);
    });
    
    autocompleteResults.appendChild(fragment);
    autocompleteResults.style.display = 'block';
  };
  
  // Handle search form submission
  window.handleSearch = function() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      window.location.href = '/' + encodeURIComponent(searchTerm);
      return false; // Prevent form submission
    }
    return false;
  };
  
  // Keyboard navigation untuk autocomplete
  searchInput.addEventListener('keydown', (e) => {
    const items = autocompleteResults.getElementsByClassName('autocomplete-item');
    const activeItem = autocompleteResults.querySelector('.autocomplete-item.is-active');
    
    if (items.length > 0) {
      // Down arrow
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!activeItem) {
          items[0].classList.add('is-active');
        } else {
          const nextItem = activeItem.nextElementSibling;
          if (nextItem) {
            activeItem.classList.remove('is-active');
            nextItem.classList.add('is-active');
          }
        }
      }
      
      // Up arrow
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeItem) {
          const prevItem = activeItem.previousElementSibling;
          if (prevItem) {
            activeItem.classList.remove('is-active');
            prevItem.classList.add('is-active');
          }
        }
      }
      
      // Enter key
      else if (e.key === 'Enter' && activeItem) {
        e.preventDefault();
        searchInput.value = activeItem.textContent;
        autocompleteResults.style.display = 'none';
        window.location.href = '/' + encodeURIComponent(activeItem.textContent);
      }
    }
  });
  
  // Trigger search when user types
  searchInput.addEventListener('input', () => {
    // Mulai memuat tags jika pengguna mengetik
    if (!tagsLoaded) {
      loadTagsIfNeeded();
    }
    
    // Gunakan debounce untuk mengurangi jumlah operasi pencarian
    debounceSearch(performSearch, 200);
  });
  
  // Focus pada input, muat tags jika belum dimuat
  searchInput.addEventListener('focus', () => {
    if (!tagsLoaded) {
      loadTagsIfNeeded();
    }
    
    // Tampilkan hasil jika sudah ada input
    if (searchInput.value.trim().length >= 2) {
      performSearch();
    }
  });
  
  // Hide autocomplete when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput) {
      autocompleteResults.style.display = 'none';
    }
  });
});