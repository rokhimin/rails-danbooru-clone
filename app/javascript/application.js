// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

document.addEventListener('DOMContentLoaded', () => {
  let tagsData = [];
  
  // Fetch tags data from local Rails assets instead of GitHub
  fetch('/assets/all_tags.json')
    .then(response => response.json())
    .then(data => {
      tagsData = data;
    })
    .catch(error => console.error('Error loading tags:', error));
  
  const searchInput = document.getElementById('tag-search');
  const autocompleteResults = document.getElementById('autocomplete-results');
  
  // Handle search form submission
  window.handleSearch = function() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      window.location.href = '/' + encodeURIComponent(searchTerm);
      return false; // Prevent form submission
    }
    return false;
  };
  
  // Show autocomplete results as user types
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Clear previous results
    autocompleteResults.innerHTML = '';
    
    if (searchTerm.length < 2) {
      autocompleteResults.style.display = 'none';
      return;
    }
    
    // Filter tags that match the search term
    const matchingTags = tagsData
      .filter(tag => tag.toLowerCase().includes(searchTerm))
      .slice(0, 10); // Limit to 10 results
    
    if (matchingTags.length === 0) {
      autocompleteResults.style.display = 'none';
      return;
    }
    
    // Display matching tags
    matchingTags.forEach(tag => {
      const resultItem = document.createElement('div');
      resultItem.className = 'autocomplete-item';
      resultItem.textContent = tag;
      resultItem.addEventListener('click', () => {
        searchInput.value = tag;
        autocompleteResults.style.display = 'none';
        window.location.href = '/' + encodeURIComponent(tag);
      });
      autocompleteResults.appendChild(resultItem);
    });
    
    autocompleteResults.style.display = 'block';
  });
  
  // Hide autocomplete when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput) {
      autocompleteResults.style.display = 'none';
    }
  });
});