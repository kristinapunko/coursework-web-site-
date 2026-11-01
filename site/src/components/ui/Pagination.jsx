const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 my-8" aria-label="Пагінація турів">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg border border-[#543c52]/40 px-3 py-2 text-[#543c52] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Назад
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          aria-label={`Сторінка ${page}`}
          className={`h-10 min-w-10 rounded-lg px-3 ${
            page === currentPage
              ? 'bg-[#543c52] text-white'
              : 'border border-[#543c52]/40 text-[#543c52]'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-lg border border-[#543c52]/40 px-3 py-2 text-[#543c52] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Далі
      </button>
      <span className="ml-2 text-sm text-[#543c52]">
        Сторінка {currentPage} з {totalPages}
      </span>
    </nav>
  );
};

export default Pagination;
