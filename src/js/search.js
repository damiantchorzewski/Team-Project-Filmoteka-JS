import refs from './refs';
import { setPagination } from './pagination';
import Api from './api';
import { renderMovieCard } from './renderMovieCards.js';
import Loader from './loader';
import scrollTop from './scrollTop';

let paginationSearch;

refs.errorMessage.style.display = 'none';

const searchMovie = async (e, currentPage = 1) => {
  e.preventDefault();

  refs.errorMessage.style.display = 'none';
  refs.moviesGallery.innerHTML = '';

  const searchValue = refs.input.value.trim();
  Loader.show(refs.loader);

  refs.pagination.style.display = 'none';
  refs.footer.style.display = 'none';

  try {
    const data = await Api.getMoviesByQuery(searchValue, currentPage);
  const pagination = setPagination(data.total_results, refs.pagination);
    if (data.results.length === 0) {
      refs.errorMessage.style.display = 'block';
      refs.pagination.style.display = 'none';
    } else {
      refs.errorMessage.style.display = 'none';
      refs.pagination.style.display = 'block';
      refs.footer.style.display = 'block';

      renderMovieCard(data.results);
      scrollTop();

      if (!paginationSearch) {
        paginationSearch = setPagination(
          data.total_results,
          currentPage,
          refs.pagination
        );

        paginationSearch.on('beforeMove', ({ page }) => {
          paginationSearch.currentPage = page;
          searchMovie(e, page);
        });

        paginationSearch.on('afterMove', () => {
          const paginationContainer = refs.pagination.parentNode;
          const movieCards = document.querySelectorAll('.movie-card');
          const lastMovieCard = movieCards[movieCards.length - 1];
          if (lastMovieCard) {
            paginationContainer.insertBefore(
              refs.pagination,
              lastMovieCard.nextSibling
            );
          }
        });
      } else {
        paginationSearch.reset(data.total_results);
      }
    }
  } catch (error) {
    console.error(error);
    refs.errorMessage.style.display = 'block';
    refs.pagination.style.display = 'none';
  } finally {
    Loader.hide(refs.loader);
  }
};

refs.searchBtn.addEventListener('click', (e) => searchMovie(e, 1));