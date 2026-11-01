// Функція для форматування дати
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();
    return `${day} ${month}${year !== currentYear ? ` ${year}` : ''}`;
  };
  
  // Функція для розрахунку днів і ночей
  export const calculateDaysAndNights = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end - start;
    const nightsDifference = Math.max(0, Math.round(timeDifference / (1000 * 60 * 60 * 24)));
    const daysDifference = nightsDifference + 1;
    return `${daysDifference} днів + ${nightsDifference} ночей`;
  };
  
  // Функція для форматування ціни
  export const formatPrice = (price) => {
    return new Intl.NumberFormat('uk-UA', { style: 'decimal' }).format(price);
  };

  export const normalizeStringList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [];
  };

  export const averageRating = (reviews = []) => {
    if (!reviews.length) return null;
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  // Лайкання турів
  
